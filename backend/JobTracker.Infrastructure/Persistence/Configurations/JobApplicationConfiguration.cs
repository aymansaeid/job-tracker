using JobTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Infrastructure.Persistence.Configurations;

public class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplication>
{
    public void Configure(EntityTypeBuilder<JobApplication> builder)
    {
        builder.ToTable("JobApplications");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyName)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(x => x.JobTitle)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(x => x.JobUrl)
            .HasMaxLength(500);

        builder.Property(x => x.Location)
            .HasMaxLength(120);

        builder.Property(x => x.EmploymentType)
            .IsRequired();

        builder.Property(x => x.CurrentStage)
            .IsRequired();

        builder.Property(x => x.AppliedAt)
            .IsRequired();

        builder.Property(x => x.LastUpdatedAt)
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.Property(x => x.IsArchived)
            .IsRequired();

        builder.HasMany(x => x.StageHistories)
            .WithOne(x => x.JobApplication)
            .HasForeignKey(x => x.JobApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}