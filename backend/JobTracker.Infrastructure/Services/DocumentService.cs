using JobTracker.Application.Exceptions;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;
using JobTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Amazon.S3;
using Amazon.S3.Model;

namespace JobTracker.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly ApplicationDbContext _context;
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _publicUrl;

    // 5MB limit
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    public DocumentService(ApplicationDbContext context, IAmazonS3 s3Client, IConfiguration config)
    {
        _context = context;
        _s3Client = s3Client;

        // Pull config values directly
        _bucketName = config["CloudflareR2:BucketName"];
        _publicUrl = config["CloudflareR2:PublicUrl"].TrimEnd('/');
    }

    public async Task<List<UserDocument>> GetUserDocumentsAsync(int userId)
    {
        return await _context.UserDocuments
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    public async Task<UserDocument> UploadDocumentAsync(int userId, IFormFile file, DocumentCategory category, bool isPrimary = false)
    {
        // 1. Basic Validations
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty.");

        if (file.Length > MaxFileSizeBytes)
            throw new ArgumentException("File size exceeds the 5MB limit.");

        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("Invalid file type. Only PDF, Word, and Images are allowed.");

        // 2. Enforce Hard Limits
        var currentCount = await _context.UserDocuments
            .CountAsync(d => d.UserId == userId && d.Category == category);

        int maxAllowed = category switch
        {
            DocumentCategory.Resume => 3,
            DocumentCategory.Certificate => 4,
            DocumentCategory.ImportantDocument => 3,
            _ => throw new ArgumentException("Invalid document category.")
        };

        if (currentCount >= maxAllowed)
            throw new ArgumentException($"You have reached the maximum limit of {maxAllowed} for {category}s.");

        // 3. Handle Primary Resume Logic
        if (category == DocumentCategory.Resume && isPrimary)
        {
            var existingPrimary = await _context.UserDocuments
                .Where(d => d.UserId == userId && d.Category == DocumentCategory.Resume && d.IsPrimary)
                .ToListAsync();

            foreach (var doc in existingPrimary)
            {
                doc.IsPrimary = false;
            }
        }

        // 4. STREAM TO CLOUDFLARE R2 ☁️
        var secureFileName = $"{Guid.NewGuid()}{extension}";
        var s3ObjectKey = $"uploads/user_{userId}/{secureFileName}"; // Organizes buckets into neat folders

        using (var stream = file.OpenReadStream())
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = s3ObjectKey,
                InputStream = stream,
                ContentType = file.ContentType,
                DisablePayloadSigning = true // R2 optimization
            };

            await _s3Client.PutObjectAsync(putRequest);
        }

        // 5. Save metadata to Database
        // We save the full public Cloudflare URL so the React app can just drop it into an <a href> tag
        var fullFileUrl = $"{_publicUrl}/{s3ObjectKey}";

        var newDocument = new UserDocument
        {
            UserId = userId,
            FileName = file.FileName,
            FilePath = fullFileUrl, // Now stores the cloud URL, not local path
            ContentType = file.ContentType,
            FileSizeBytes = file.Length,
            Category = category,
            IsPrimary = category == DocumentCategory.Resume && isPrimary,
            UploadedAt = DateTime.UtcNow
        };

        _context.UserDocuments.Add(newDocument);
        await _context.SaveChangesAsync();

        return newDocument;
    }

    public async Task<bool> SetPrimaryResumeAsync(int userId, int documentId)
    {
        var targetDoc = await _context.UserDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == userId && d.Category == DocumentCategory.Resume);

        if (targetDoc == null) return false;

        var allResumes = await _context.UserDocuments
            .Where(d => d.UserId == userId && d.Category == DocumentCategory.Resume)
            .ToListAsync();

        foreach (var doc in allResumes)
        {
            doc.IsPrimary = (doc.Id == documentId);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteDocumentAsync(int userId, int documentId)
    {
        var doc = await _context.UserDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == userId);

        if (doc == null) return false;

        // Extract the exact S3 key from the full URL
        var s3ObjectKey = doc.FilePath.Replace($"{_publicUrl}/", "");

        // DELETE FROM CLOUDFLARE R2 🗑️
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = s3ObjectKey
        };
        await _s3Client.DeleteObjectAsync(deleteRequest);

        // Delete from database
        _context.UserDocuments.Remove(doc);
        await _context.SaveChangesAsync();

        return true;
    }
}