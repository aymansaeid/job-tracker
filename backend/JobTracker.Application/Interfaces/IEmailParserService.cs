using JobTracker.Application.DTOs.Integrations;

namespace JobTracker.Application.Interfaces;

public interface IEmailParserService
{
    /// <summary>
    /// Sends the email content to an LLM and asks it to extract job application updates.
    /// </summary>
    Task<ParsedEmailResult> ParseEmailAsync(string subject, string plainTextBody);
}