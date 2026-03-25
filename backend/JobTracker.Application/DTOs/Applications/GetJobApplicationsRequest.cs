using JobTracker.Domain.Enums;

namespace JobTracker.Application.DTOs.Applications;

public class GetJobApplicationsRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    // Optional Search Term (for Company Name or Job Title)
    public string? SearchTerm { get; set; }

    // Optional Filter by Stage
    public ApplicationStage? Stage { get; set; }

    // Optional flag to include archived items (default is false)
    public bool IncludeArchived { get; set; } = false;
}