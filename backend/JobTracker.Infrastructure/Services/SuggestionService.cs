using JobTracker.Application.DTOs.Integrations;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Services;

public class SuggestionService : ISuggestionService
{
    private readonly ApplicationDbContext _context;
    private readonly IGmailService _gmailService;
    private readonly IEmailParserService _parserService;

    public SuggestionService(
        ApplicationDbContext context,
        IGmailService gmailService,
        IEmailParserService parserService)
    {
        _context = context;
        _gmailService = gmailService;
        _parserService = parserService;
    }

    public async Task<int> ProcessRecentEmailsAsync(int userId)
    {
        // 1. Get recent emails from Gmail
        var recentEmails = await _gmailService.GetRecentJobEmailsAsync(userId, 10);
        int newSuggestionsCount = 0;

        foreach (var email in recentEmails)
        {
            // 2. Skip if we already parsed this email
            bool alreadyProcessed = await _context.JobUpdateSuggestions
                .AnyAsync(x => x.MessageId == email.MessageId);

            if (alreadyProcessed) continue;

            // 3. Fetch the full body for the AI to read
            var fullEmail = await _gmailService.GetEmailBodyAsync(userId, email.MessageId);
            if (fullEmail == null) continue;

            // 4. Ask the AI to parse it
            var aiResult = await _parserService.ParseEmailAsync(fullEmail.Subject, fullEmail.PlainTextBody);

            // 5. If it's a real job email, save it as a Pending Suggestion
            if (aiResult.IsJobRelated && !string.IsNullOrWhiteSpace(aiResult.CompanyName))
            {
                var suggestion = new JobUpdateSuggestion
                {
                    UserId = userId,
                    MessageId = email.MessageId,
                    EmailSubject = email.Subject,
                    CompanyName = aiResult.CompanyName,
                    JobTitle = aiResult.JobTitle,
                    SuggestedStage = aiResult.SuggestedStage,
                    SuggestedInterviewDate = aiResult.SuggestedInterviewDate,
                    Status = SuggestionStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                _context.JobUpdateSuggestions.Add(suggestion);
                newSuggestionsCount++;
            }
        }

        if (newSuggestionsCount > 0)
        {
            await _context.SaveChangesAsync();
        }

        return newSuggestionsCount;
    }

    public async Task<List<JobUpdateSuggestionResponse>> GetPendingSuggestionsAsync(int userId)
    {
        return await _context.JobUpdateSuggestions
            .Where(x => x.UserId == userId && x.Status == SuggestionStatus.Pending)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new JobUpdateSuggestionResponse
            {
                Id = x.Id,
                MessageId = x.MessageId,
                EmailSubject = x.EmailSubject,
                CompanyName = x.CompanyName,
                JobTitle = x.JobTitle,
                SuggestedStage = x.SuggestedStage,
                SuggestedInterviewDate = x.SuggestedInterviewDate,
                Status = x.Status,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<bool> ApproveSuggestionAsync(int userId, int suggestionId)
    {
        var suggestion = await _context.JobUpdateSuggestions
            .FirstOrDefaultAsync(x => x.Id == suggestionId && x.UserId == userId);

        if (suggestion == null || suggestion.Status != SuggestionStatus.Pending)
            return false;

        // 1. Mark as Approved
        suggestion.Status = SuggestionStatus.Approved;

        // 2. Try to find an existing Job Application for this company
        var jobApp = await _context.JobApplications
            .FirstOrDefaultAsync(x => x.UserId == userId && x.CompanyName.ToLower() == suggestion.CompanyName.ToLower());

        if (jobApp != null)
        {
            // UPDATE EXISTING JOB
            if (suggestion.SuggestedStage.HasValue && jobApp.CurrentStage != suggestion.SuggestedStage.Value)
            {
                jobApp.CurrentStage = suggestion.SuggestedStage.Value;
                jobApp.LastUpdatedAt = DateTime.UtcNow;

                // Add History log
                _context.ApplicationStageHistories.Add(new ApplicationStageHistory
                {
                    JobApplicationId = jobApp.Id,
                    Stage = suggestion.SuggestedStage.Value,
                    Comment = "AI automatically updated stage from Gmail approval.",
                    ChangedAt = DateTime.UtcNow
                });
            }
        }
        else
        {
            // CREATE NEW JOB APPLICATION
            jobApp = new JobApplication
            {
                UserId = userId,
                CompanyName = suggestion.CompanyName,
                JobTitle = string.IsNullOrWhiteSpace(suggestion.JobTitle) ? "Unknown Role" : suggestion.JobTitle,
                CurrentStage = suggestion.SuggestedStage ?? ApplicationStage.Applied,
                AppliedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };
            _context.JobApplications.Add(jobApp);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectSuggestionAsync(int userId, int suggestionId)
    {
        var suggestion = await _context.JobUpdateSuggestions
            .FirstOrDefaultAsync(x => x.Id == suggestionId && x.UserId == userId);

        if (suggestion == null) return false;

        suggestion.Status = SuggestionStatus.Rejected;
        await _context.SaveChangesAsync();
        return true;
    }
}