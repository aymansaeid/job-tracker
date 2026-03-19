using JobTracker.Domain.Enums;

namespace JobTracker.Application.DTOs.Applications;

public class CreateJobApplicationRequest
{
    public int UserId { get; set; }
    public string CompanyName { get; set; } = default!;
    public string JobTitle { get; set; } = default!;
    public string? JobUrl { get; set; }
    public string? Location { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public DateTime AppliedAt { get; set; }
    public string? Notes { get; set; }
}