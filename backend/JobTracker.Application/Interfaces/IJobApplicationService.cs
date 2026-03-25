using JobTracker.Application.DTOs.Applications;

namespace JobTracker.Application.Interfaces;

public interface IJobApplicationService
{
    Task<JobApplicationResponse> CreateAsync(int userId, CreateJobApplicationRequest request);
    Task<List<JobApplicationResponse>> GetByUserIdAsync(int userId);
    Task<JobApplicationResponse?> GetByIdAsync(int id);

    Task<JobApplicationResponse?> UpdateAsync(int id, UpdateJobApplicationRequest request);
    Task<JobApplicationResponse?> ChangeStageAsync(int id, ChangeApplicationStageRequest request);
    Task<bool> ArchiveAsync(int id);
    Task<List<ApplicationStageHistoryResponse>> GetStageHistoryAsync(int applicationId);
}