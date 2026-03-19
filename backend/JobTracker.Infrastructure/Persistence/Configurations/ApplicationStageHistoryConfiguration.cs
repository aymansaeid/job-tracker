using JobTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Infrastructure.Persistence.Configurations;

public class ApplicationStageHistoryConfiguration : IEntityTypeConfiguration<ApplicationStageHistory>
{
    public void Configure(EntityTypeBuilder<ApplicationStageHistory> builder)
    {
        builder.ToTable("ApplicationStageHistories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Stage)
            .IsRequired();

        builder.Property(x => x.Comment)
            .HasMaxLength(500);

        builder.Property(x => x.ChangedAt)
            .IsRequired();
    }
}