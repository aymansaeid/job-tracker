using JobTracker.Domain.Enums;

namespace JobTracker.Application.DTOs.Integrations;

public class ParsedEmailResult
{
    // If the AI determines this is just a newsletter or spam, this will be false
    public bool IsJobRelated { get; set; }

    // The extracted data
    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public ApplicationStage? SuggestedStage { get; set; }
    public DateTime? SuggestedInterviewDate { get; set; }

    // A short reasoning from the AI on why it chose this stage
    public string? AiReasoning { get; set; }

    public string? ActionUrl { get; set; }
}