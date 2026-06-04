namespace LabCourse2.Application.DTOs.Emails
{
    public record EmailMessage(string ToEmail, string Subject, string HtmlBody);
}
