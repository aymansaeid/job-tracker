using JobTracker.Application.DTOs.Applications;

namespace JobTracker.Application.Interfaces;

public interface IJobApplicationService
{
    Task<JobApplicationResponse> CreateAsync(CreateJobApplicationRequest request);
    Task<List<JobApplicationResponse>> GetByUserIdAsync(int userId);
    Task<JobApplicationResponse?> GetByIdAsync(int id);
}