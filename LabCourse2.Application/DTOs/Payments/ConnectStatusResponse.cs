namespace LabCourse2.Application.DTOs.Payments
{
    public class ConnectStatusResponse
    {
        public bool HasAccount { get; set; }

        public bool PayoutsEnabled { get; set; }

        public bool ChargesEnabled { get; set; }

        public bool DetailsSubmitted { get; set; }

        public bool TransfersEnabled { get; set; }

        public string? DisabledReason { get; set; }

        public List<string> CurrentlyDue { get; set; } = new();
    }
}
