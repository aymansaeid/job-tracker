using JobTracker.Application.DTOs.Integrations;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Enums;

namespace JobTracker.Infrastructure.Services;

public class MockEmailParserService : IEmailParserService
{
    public Task<ParsedEmailResult> ParseEmailAsync(string subject, string plainTextBody)
    {
        var content = (subject + " " + plainTextBody).ToLower();

        var result = new ParsedEmailResult
        {
            IsJobRelated = false
        };

        // Fake AI Logic: Just looking for keywords
        if (content.Contains("interview") || content.Contains("schedule"))
        {
            result.IsJobRelated = true;
            result.CompanyName = "Mock API Corp"; // Hardcoded for testing
            result.SuggestedStage = ApplicationStage.Interview;
            result.AiReasoning = "Found the word 'interview' in the email.";

            // Guessing the interview is in 3 days
            result.SuggestedInterviewDate = DateTime.UtcNow.AddDays(3);
        }
        else if (content.Contains("offer"))
        {
            result.IsJobRelated = true;
            result.CompanyName = "Mock API Corp";
            result.SuggestedStage = ApplicationStage.Offer;
            result.AiReasoning = "Found the word 'offer'. Congratulations!";
        }

        // Simulate network delay to make it feel like a real AI call
        Thread.Sleep(1000);

        return Task.FromResult(result);
    }
}