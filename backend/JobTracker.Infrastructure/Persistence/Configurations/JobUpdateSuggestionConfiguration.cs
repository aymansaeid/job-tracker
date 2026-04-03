using JobTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Infrastructure.Persistence.Configurations;

public class JobUpdateSuggestionConfiguration : IEntityTypeConfiguration<JobUpdateSuggestion>
{
    public void Configure(EntityTypeBuilder<JobUpdateSuggestion> builder)
    {
        builder.ToTable("JobUpdateSuggestions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.MessageId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.EmailSubject).IsRequired().HasMaxLength(500);
        builder.Property(x => x.CompanyName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.JobTitle).HasMaxLength(200);

        // Prevent the AI from making multiple suggestions for the exact same email
        builder.HasIndex(x => x.MessageId).IsUnique();

        // Standard relationship setup
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}