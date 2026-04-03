using JobTracker.Domain.Enums;

namespace JobTracker.Domain.Entities
{
    public class JobUpdateSuggestion
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        // Gmail Context
        public string MessageId { get; set; } = default!;
        public string EmailSubject { get; set; } = default!;

        // The AI's Guesses
        public string CompanyName { get; set; } = default!;
        public string? JobTitle { get; set; }
        public ApplicationStage? SuggestedStage { get; set; }
        public DateTime? SuggestedInterviewDate { get; set; }

        // State
        public SuggestionStatus Status { get; set; } = SuggestionStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
    }
}