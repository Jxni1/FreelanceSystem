namespace LabCourse2.Infrastructure.Configuration
{
    public class EmailSettings
    {
        public const string SectionName = "Email";

        public string Host { get; set; } = string.Empty;

        public int Port { get; set; } = 587;

        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string FromAddress { get; set; } = string.Empty;

        public string FromName { get; set; } = "LabCourse2";

        public bool UseStartTls { get; set; } = true;

        public int TimeoutSeconds { get; set; } = 15;
    }
}
