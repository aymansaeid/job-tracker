using System;
using System.Collections.Generic;
using System.Text;

namespace JobTracker.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;

        public List<JobApplication> JobApplications { get; set; } = new();
    }
}
