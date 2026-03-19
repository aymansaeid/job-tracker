using JobTracker.Domain.Enums;

namespace JobTracker.Domain.Entities
{
    public class ApplicationStageHistory
    {
        public int Id { get; set; }
        public int JobApplicationId { get; set; }
        public ApplicationStage Stage { get; set; }
        public string? Comment { get; set; }
        public DateTime ChangedAt { get; set; }

        public JobApplication? JobApplication { get; set; }
    }
}