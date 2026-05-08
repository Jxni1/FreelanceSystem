using Microsoft.AspNetCore.Http;

public class UpdateFileRequest
{
    public IFormFile File { get; set; } = null!;
}