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

                    // 🚨 NEW V3 FIELDS: Assumes you added Location and ExtraNotes to your JobUpdateSuggestion entity!
                    Location = aiResult.Location,
                    ExtraNotes = aiResult.ExtraNotes,

                    SuggestedStage = aiResult.SuggestedStage,
                    SuggestedInterviewDate = aiResult.SuggestedInterviewDate,
                    Status = SuggestionStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    AiReasoning = aiResult.AiReasoning,
                    ActionUrl = aiResult.ActionUrl
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
                CreatedAt = x.CreatedAt,
                AiReasoning = x.AiReasoning,
                ActionUrl = x.ActionUrl
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

        // 2. SMART MATCHING V3: Title Protection & Hardcore Normalization
        var userApps = await _context.JobApplications
            .Where(x => x.UserId == userId && !x.IsArchived)
            .ToListAsync();

        var normalizedSuggestionCompany = NormalizeCompanyName(suggestion.CompanyName);
        var normalizedSuggestionTitle = suggestion.JobTitle?.ToLower()?.Trim() ?? "";

        // Compare normalized strings instead of raw database strings
        var companyMatches = userApps
            .Where(a =>
            {
                var dbCompany = NormalizeCompanyName(a.CompanyName);
                return dbCompany == normalizedSuggestionCompany ||
                       dbCompany.Contains(normalizedSuggestionCompany) ||
                       normalizedSuggestionCompany.Contains(dbCompany);
            })
            .ToList();

        JobApplication jobApp = null;

        if (companyMatches.Any())
        {
            // 🚨 THE FIX: Only attach to an existing app IF the job title matches, 
            // OR if the existing app has no title ("Unknown Role").
            jobApp = companyMatches.FirstOrDefault(a =>
                string.IsNullOrWhiteSpace(a.JobTitle) ||
                a.JobTitle == "Unknown Role" ||
                (!string.IsNullOrWhiteSpace(normalizedSuggestionTitle) &&
                 (a.JobTitle.ToLower().Contains(normalizedSuggestionTitle) || normalizedSuggestionTitle.Contains(a.JobTitle.ToLower())))
            );
        }

        bool isNew = false;

        if (jobApp != null)
        {
            // UPDATE EXISTING JOB
            if ((jobApp.JobTitle == "Unknown Role" || string.IsNullOrWhiteSpace(jobApp.JobTitle)) && !string.IsNullOrWhiteSpace(suggestion.JobTitle))
            {
                jobApp.JobTitle = suggestion.JobTitle;
            }

            // Update location if it's currently missing
            if (!string.IsNullOrWhiteSpace(suggestion.Location) && string.IsNullOrWhiteSpace(jobApp.Location))
            {
                jobApp.Location = suggestion.Location;
            }

            if (suggestion.SuggestedStage.HasValue && jobApp.CurrentStage != suggestion.SuggestedStage.Value)
            {
                jobApp.CurrentStage = suggestion.SuggestedStage.Value;
                jobApp.LastUpdatedAt = DateTime.UtcNow;

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
            isNew = true;
            jobApp = new JobApplication
            {
                UserId = userId,
                CompanyName = suggestion.CompanyName, // Keeps the original exact spelling for the UI
                JobTitle = string.IsNullOrWhiteSpace(suggestion.JobTitle) ? "Unknown Role" : suggestion.JobTitle,
                Location = suggestion.Location ?? "", // Uses extracted Location!
                CurrentStage = suggestion.SuggestedStage ?? ApplicationStage.Applied,
                AppliedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow,
                Notes = ""
            };
            _context.JobApplications.Add(jobApp);
        }

        // ── INJECT AI NOTES & URL INTO THE KANBAN CARD ──
        var newNotes = "";
        if (!string.IsNullOrWhiteSpace(suggestion.ActionUrl))
            newNotes += $"[AI Extracted Link]: {suggestion.ActionUrl}\n";

        if (!string.IsNullOrWhiteSpace(suggestion.ExtraNotes))
            newNotes += $"[AI Notes]: {suggestion.ExtraNotes}\n";

        if (!string.IsNullOrWhiteSpace(newNotes))
        {
            jobApp.Notes = string.IsNullOrWhiteSpace(jobApp.Notes)
                ? newNotes.Trim()
                : jobApp.Notes + "\n\n" + newNotes.Trim();
        }

        if (isNew) await _context.SaveChangesAsync();

        // Link Email
        bool emailAlreadyLinked = await _context.JobEmails.AnyAsync(e => e.MessageId == suggestion.MessageId);
        if (!emailAlreadyLinked)
        {
            _context.JobEmails.Add(new JobEmail
            {
                JobApplicationId = jobApp.Id,
                MessageId = suggestion.MessageId,
                Subject = suggestion.EmailSubject,
                DateReceived = suggestion.CreatedAt
            });
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

    private string NormalizeCompanyName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "";

        var normalized = name.ToLower().Trim();

        // Strip out punctuation
        normalized = normalized.Replace(".", "").Replace(",", "").Replace("-", "");

        // Strip out common corporate suffixes
        var suffixes = new[] { " inc", " llc", " ltd", " corp", " corporation", " limited" };
        foreach (var suffix in suffixes)
        {
            if (normalized.EndsWith(suffix))
            {
                normalized = normalized.Substring(0, normalized.Length - suffix.Length);
            }
        }

        return normalized.Trim();
    }
}