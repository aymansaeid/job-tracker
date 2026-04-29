using JobTracker.Domain.Enums;

namespace JobTracker.Domain.Entities;

public class UserDocument
{
    public int Id { get; set; }
    public int UserId { get; set; }

    public string FileName { get; set; } = default!;

    public string FilePath { get; set; } = default!;

    public string ContentType { get; set; } = default!; 
    public long FileSizeBytes { get; set; }

    public DocumentCategory Category { get; set; }

    public bool IsPrimary { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}