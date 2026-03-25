using Microsoft.EntityFrameworkCore;
using LabCourse2.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer("Server=127.0.0.1,1433;Database=UserDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;"));

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();