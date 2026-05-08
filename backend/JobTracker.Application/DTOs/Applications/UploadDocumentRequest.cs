using JobTracker.Domain.Enums;
using Microsoft.AspNetCore.Http;

public class UploadDocumentRequest
{
    public IFormFile File { get; set; }
    public DocumentCategory Category { get; set; }
    public bool IsPrimary { get; set; }
}