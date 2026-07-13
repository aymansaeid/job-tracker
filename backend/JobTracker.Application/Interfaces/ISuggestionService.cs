using JobTracker.Application.DTOs.Integrations;

namespace JobTracker.Application.Interfaces;

public interface ISuggestionService
{
    // Scans inbox, runs AI, creates pending suggestions. Returns how many new ones were found.
    Task<SyncResult> ProcessRecentEmailsAsync(int userId);

    // Gets the list of pending suggestions for the dashboard widget
    Task<List<JobUpdateSuggestionResponse>> GetPendingSuggestionsAsync(int userId);

    // User clicks "Approve" -> Actually updates the Job Application database
    Task<bool> ApproveSuggestionAsync(int userId, int suggestionId);

    // User clicks "Ignore" -> Hides the suggestion
    Task<bool> RejectSuggestionAsync(int userId, int suggestionId);

}