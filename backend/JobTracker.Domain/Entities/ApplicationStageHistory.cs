using JobTracker.Domain.Enums;

namespace JobTracker.Domain.Entities
{
    public class ApplicationStageHistory
    {
        public Guid Id { get; set; }
        public Guid JobApplicationId { get; set; }
        public ApplicationStage Stage { get; set; }
        public string? Comment { get; set; }
        public DateTime ChangedAt { get; set; }

        public JobApplication? JobApplication { get; set; }
    }
}