using System;
using System.Collections.Generic;

namespace LabCourse2.Application.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public KpiCardDto KpiCards { get; set; } = new();
        public List<ModerationQueueDto> ModerationQueue { get; set; } = new();
        public MarketplaceHealthDto MarketplaceHealth { get; set; } = new();
    }

    public class KpiCardDto
    {
        public decimal GrossMarketplaceVolume { get; set; }
        public int ActiveUsersCount { get; set; }
        public int OpenDisputesCount { get; set; } // Do ta mbushim me Open Reports
        public int JobsPostedCount { get; set; }
    }

    public class MarketplaceHealthDto
    {
        public decimal DisputeRate { get; set; }
    }
}