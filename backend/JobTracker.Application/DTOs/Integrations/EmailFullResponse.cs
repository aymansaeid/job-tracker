namespace JobTracker.Application.DTOs.Integrations;

public class EmailFullResponse
{
    public string MessageId { get; set; } = default!;
    public string Subject { get; set; } = default!;
    public string Sender { get; set; } = default!;
    public DateTime DateReceived { get; set; }
    public string HtmlBody { get; set; } = default!;
    public string PlainTextBody { get; set; } = default!;
}