using JobTracker.Domain.Enums;

namespace JobTracker.Application.DTOs.Applications;

public class ChangeApplicationStageRequest
{
    public ApplicationStage Stage { get; set; }
    public string? Comment { get; set; }
}