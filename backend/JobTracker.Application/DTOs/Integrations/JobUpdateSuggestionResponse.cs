using JobTracker.Domain.Enums;

namespace JobTracker.Application.DTOs.Integrations;

public class JobUpdateSuggestionResponse
{
    public int Id { get; set; }
    public string MessageId { get; set; } = default!;
    public string EmailSubject { get; set; } = default!;

    public string CompanyName { get; set; } = default!;
    public string? JobTitle { get; set; }
    public ApplicationStage? SuggestedStage { get; set; }
    public DateTime? SuggestedInterviewDate { get; set; }
    public SuggestionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? AiReasoning { get; set; }
    public string? ActionUrl { get; set; }
}