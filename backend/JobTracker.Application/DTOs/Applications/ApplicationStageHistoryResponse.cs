using JobTracker.Domain.Enums;

namespace JobTracker.Application.DTOs.Applications;

public class ApplicationStageHistoryResponse
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public ApplicationStage Stage { get; set; }
    public string? Comment { get; set; }
    public DateTime ChangedAt { get; set; }
}