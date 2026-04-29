using JobTracker.Application.Exceptions;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;
using JobTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Services;
// i am gona change it to aws3 later
public class DocumentService : IDocumentService
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    // 5MB limit
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    public DocumentService(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
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

        // 2. ENFORCE YOUR HARD LIMITS
        var currentCount = await _context.UserDocuments
            .CountAsync(d => d.UserId == userId && d.Category == category);

        int maxAllowed = category switch
        {
            DocumentCategory.Resume => 5,
            DocumentCategory.Certificate => 10,
            DocumentCategory.ImportantDocument => 5,
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
                doc.IsPrimary = false; // Remove primary from older resumes
            }
        }

        // 4. Save the file to the Server (wwwroot/uploads)
        var uploadFolder = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "uploads", userId.ToString());
        if (!Directory.Exists(uploadFolder))
            Directory.CreateDirectory(uploadFolder);

        // Security: Never trust user filenames. Generate a unique GUID.
        var secureFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadFolder, secureFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 5. Save metadata to Database
        // We store the relative path so the frontend can easily download it like: https://localhost:5001/uploads/1/uuid.pdf
        var relativePath = $"/uploads/{userId}/{secureFileName}";

        var newDocument = new UserDocument
        {
            UserId = userId,
            FileName = file.FileName, // Keep the original name for the UI
            FilePath = relativePath,
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

        // Unmark all other resumes
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

        // Delete physical file from server
        var fullPath = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, doc.FilePath.TrimStart('/'));
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        // Delete from database
        _context.UserDocuments.Remove(doc);
        await _context.SaveChangesAsync();
        return true;
    }
}