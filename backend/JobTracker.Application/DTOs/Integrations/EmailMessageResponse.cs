namespace JobTracker.Application.DTOs.Integrations;

public class EmailMessageResponse
{
    public string MessageId { get; set; } = default!;
    public string Subject { get; set; } = default!;
    public string Sender { get; set; } = default!;
    public string Snippet { get; set; } = default!;
    public DateTime DateReceived { get; set; }
}