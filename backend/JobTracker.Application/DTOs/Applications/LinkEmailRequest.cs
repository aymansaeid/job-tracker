namespace JobTracker.Application.DTOs.Applications;

public class LinkEmailRequest
{
    public string MessageId { get; set; } = default!;
    public string Subject { get; set; } = default!;
    public DateTime DateReceived { get; set; }
}