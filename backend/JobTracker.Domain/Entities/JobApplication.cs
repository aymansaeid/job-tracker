using JobTracker.Domain.Enums;

namespace JobTracker.Domain.Entities
{
    public class JobApplication
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string CompanyName { get; set; } = default!;
        public string JobTitle { get; set; } = default!;
        public string? JobUrl { get; set; }
        public string? Location { get; set; }
        public EmploymentType EmploymentType { get; set; }
        public ApplicationStage CurrentStage { get; set; }
        public DateTime AppliedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public string? Notes { get; set; }
        public bool IsArchived { get; set; }

        public User? User { get; set; }
        public List<ApplicationStageHistory> StageHistories { get; set; } = new();
    }
}