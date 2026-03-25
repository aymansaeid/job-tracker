namespace JobTracker.Application.DTOs.Applications;

public class DashboardStatsResponse
{
    public int TotalApplications { get; set; }
    public int ActiveApplications { get; set; } // Total minus Rejected & Ghosted
    public int AppliedCount { get; set; }
    public int InReviewCount { get; set; }
    public int InterviewCount { get; set; }
    public int OfferCount { get; set; } // The Accepted state
    public int RejectedCount { get; set; }
    public int GhostedCount { get; set; }
}