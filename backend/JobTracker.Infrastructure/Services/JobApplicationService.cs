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
        return await _context.JobApplications
            .Where(x => x.Id == id)
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
            .FirstOrDefaultAsync();
    }
}