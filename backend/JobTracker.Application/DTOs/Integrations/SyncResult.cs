namespace JobTracker.Application.DTOs.Integrations;

public class SyncResult
{
    public bool Success { get; set; }
    public bool RateLimited { get; set; }
    public int RetryAfterMinutes { get; set; }
    public int NewSuggestionsCount { get; set; }
    public string Message { get; set; } = "";
}