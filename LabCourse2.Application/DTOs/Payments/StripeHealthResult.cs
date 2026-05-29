namespace LabCourse2.Application.DTOs.Payments
{
    public class StripeHealthResult
    {
        public bool Connected { get; set; }

        public bool LiveMode { get; set; }

        public string Mode => LiveMode ? "live" : "test";

        public string? Error { get; set; }
    }
}
