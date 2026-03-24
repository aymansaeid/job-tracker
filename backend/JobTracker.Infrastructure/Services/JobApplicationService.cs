using JobTracker.Application.DTOs.Applications;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly ApplicationDbContext _context;

    public JobApplicationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<JobApplicationResponse> CreateAsync(CreateJobApplicationRequest request)
    {
        var userExists = await _context.Users.AnyAsync(x => x.Id == request.UserId);

        if (!userExists)
            throw new Exception("User not found.");

        var application = new JobApplication
        {
            UserId = request.UserId,
            CompanyName = request.CompanyName,
            JobTitle = request.JobTitle,
            JobUrl = request.JobUrl,
            Location = request.Location,
            EmploymentType = request.EmploymentType,
            CurrentStage = ApplicationStage.Applied,
            AppliedAt = request.AppliedAt,
            LastUpdatedAt = DateTime.UtcNow,
            Notes = request.Notes,
            IsArchived = false
        };

        _context.JobApplications.Add(application);
        await _context.SaveChangesAsync();

        var stageHistory = new ApplicationStageHistory
        {
            JobApplicationId = application.Id,
            Stage = ApplicationStage.Applied,
            Comment = "Application created",
            ChangedAt = DateTime.UtcNow
        };

        _context.ApplicationStageHistories.Add(stageHistory);
        await _context.SaveChangesAsync();

        return MapToResponse(application);
    }

    public async Task<List<JobApplicationResponse>> GetByUserIdAsync(int userId)
    {
        return await _context.JobApplications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.AppliedAt)
            .Select(x => new JobApplicationResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                CompanyName = x.CompanyName,
                JobTitle = x.JobTitle,
                JobUrl = x.JobUrl,
                Location = x.Location,
                EmploymentType = x.EmploymentType,
                CurrentStage = x.CurrentStage,
                AppliedAt = x.AppliedAt,
                LastUpdatedAt = x.LastUpdatedAt,
                Notes = x.Notes,
                IsArchived = x.IsArchived
            })
            .ToListAsync();
    }

    public async Task<JobApplicationResponse?> GetByIdAsync(int id)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        return application is null ? null : MapToResponse(application);
    }

    public async Task<JobApplicationResponse?> UpdateAsync(int id, UpdateJobApplicationRequest request)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application is null)
            return null;

        application.CompanyName = request.CompanyName;
        application.JobTitle = request.JobTitle;
        application.JobUrl = request.JobUrl;
        application.Location = request.Location;
        application.EmploymentType = request.EmploymentType;
        application.AppliedAt = request.AppliedAt;
        application.Notes = request.Notes;
        application.LastUpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToResponse(application);
    }

    public async Task<JobApplicationResponse?> ChangeStageAsync(int id, ChangeApplicationStageRequest request)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application is null)
            return null;

        if (application.CurrentStage != request.Stage)
        {
            application.CurrentStage = request.Stage;
            application.LastUpdatedAt = DateTime.UtcNow;

            var stageHistory = new ApplicationStageHistory
            {
                JobApplicationId = application.Id,
                Stage = request.Stage,
                Comment = request.Comment,
                ChangedAt = DateTime.UtcNow
            };

            _context.ApplicationStageHistories.Add(stageHistory);
            await _context.SaveChangesAsync();
        }

        return MapToResponse(application);
    }

    public async Task<bool> ArchiveAsync(int id)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application is null)
            return false;

        application.IsArchived = true;
        application.LastUpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ApplicationStageHistoryResponse>> GetStageHistoryAsync(int applicationId)
    {
        return await _context.ApplicationStageHistories
            .Where(x => x.JobApplicationId == applicationId)
            .OrderByDescending(x => x.ChangedAt)
            .Select(x => new ApplicationStageHistoryResponse
            {
                Id = x.Id,
                JobApplicationId = x.JobApplicationId,
                Stage = x.Stage,
                Comment = x.Comment,
                ChangedAt = x.ChangedAt
            })
            .ToListAsync();
    }

    private static JobApplicationResponse MapToResponse(JobApplication application)
    {
        return new JobApplicationResponse
        {
            Id = application.Id,
            UserId = application.UserId,
            CompanyName = application.CompanyName,
            JobTitle = application.JobTitle,
            JobUrl = application.JobUrl,
            Location = application.Location,
            EmploymentType = application.EmploymentType,
            CurrentStage = application.CurrentStage,
            AppliedAt = application.AppliedAt,
            LastUpdatedAt = application.LastUpdatedAt,
            Notes = application.Notes,
            IsArchived = application.IsArchived
        };
    }
}