using System;
using System.Collections.Generic;
using System.Text;

namespace JobTracker.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;

        public string? GoogleRefreshToken { get; set; }

        public List<JobApplication> JobApplications { get; set; } = new();

        public List<UserDocument> Documents { get; set; } = new();

        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordTokenExpiry { get; set; }

        public DateTime? LastSyncAt { get; set; }

    }
}
