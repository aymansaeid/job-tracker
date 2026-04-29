using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace JobTracker.Application.Interfaces;

public interface IDocumentService
{
    Task<List<UserDocument>> GetUserDocumentsAsync(int userId);
    Task<UserDocument> UploadDocumentAsync(int userId, IFormFile file, DocumentCategory category, bool isPrimary = false);
    Task<bool> SetPrimaryResumeAsync(int userId, int documentId);
    Task<bool> DeleteDocumentAsync(int userId, int documentId);
}