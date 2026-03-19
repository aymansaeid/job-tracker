using System;
using System.Collections.Generic;
using System.Text;

namespace JobTracker.Domain.Enums
{
    public enum ApplicationStage
    {
        Applied = 0,
        InReview = 1,
        Interview = 2,
        Offer = 3,
        Rejected = 4,
        Ghosted = 5
    }
}
