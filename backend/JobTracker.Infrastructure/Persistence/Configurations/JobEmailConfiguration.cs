using JobTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Infrastructure.Persistence.Configurations;

public class JobEmailConfiguration : IEntityTypeConfiguration<JobEmail>
{
    public void Configure(EntityTypeBuilder<JobEmail> builder)
    {
        builder.ToTable("JobEmails");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.MessageId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Subject).IsRequired().HasMaxLength(500);

        builder.HasIndex(x => x.MessageId).IsUnique(); // Prevent linking the exact same email twice
    }
}