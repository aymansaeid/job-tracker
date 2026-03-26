namespace JobTracker.Domain.Entities
{
    public class JobEmail
    {
        public int Id { get; set; }
        public int JobApplicationId { get; set; }
        public string MessageId { get; set; } = default!;
        public string Subject { get; set; } = default!;
        public DateTime DateReceived { get; set; }

        public JobApplication? JobApplication { get; set; }
    }
}