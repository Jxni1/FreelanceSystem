using FluentValidation;
using LabCourse2.API.Middleware;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Deliverables;
using LabCourse2.Application.DTOs.Files;
using LabCourse2.Application.DTOs.Milestones;
using LabCourse2.Application.DTOs.Notifications;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.DTOs.Proposals;
using LabCourse2.Application.DTOs.Reports;
using LabCourse2.Application.DTOs.Reviews;
using LabCourse2.Application.DTOs.Skills;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Contracts;
using LabCourse2.Application.Interfaces.Deliverables;
using LabCourse2.Application.Interfaces.Files;
using LabCourse2.Application.Interfaces.Milestones;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Interfaces.Payments;
using LabCourse2.Application.Interfaces.Projects;
using LabCourse2.Application.Interfaces.Proposals;
using LabCourse2.Application.Interfaces.Reports;
using LabCourse2.Application.Interfaces.Reviews;
using LabCourse2.Application.Interfaces.Skills;
using LabCourse2.Application.Interfaces.Users;
using LabCourse2.Application.Services;
using LabCourse2.Application.Services.Contracts;
using LabCourse2.Application.Services.Deliverables;
using LabCourse2.Application.Services.Files;
using LabCourse2.Application.Services.Milestones;
using LabCourse2.Application.Services.Notifications;
using LabCourse2.Application.Services.Payments;
using LabCourse2.Application.Services.Projects;
using LabCourse2.Application.Services.Proposals;
using LabCourse2.Application.Services.Reports;
using LabCourse2.Application.Services.Reviews;
using LabCourse2.Application.Services.Skills;
using LabCourse2.Application.Services.User;
using LabCourse2.Application.Validators;
using LabCourse2.Application.Validators.Deliverables;
using LabCourse2.Application.Validators.Files;
using LabCourse2.Application.Validators.Milestones;
using LabCourse2.Application.Validators.Notifications;
using LabCourse2.Application.Validators.Projects;
using LabCourse2.Application.Validators.Proposals;
using LabCourse2.Application.Validators.Reports;
using LabCourse2.Application.Validators.Reviews;
using LabCourse2.Application.Validators.Skills;
using LabCourse2.Application.Validators.Users;
using LabCourse2.Infrastructure.Persistence;
using LabCourse2.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.IO;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(
                builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:3000", "http://localhost:5173"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddScoped<IAppDbContext>(sp =>
    sp.GetRequiredService<AppDbContext>());

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IUserService>(sp => sp.GetRequiredService<UserService>());
builder.Services.AddScoped<ICurrentUserService>(sp => sp.GetRequiredService<UserService>());
builder.Services.AddValidatorsFromAssemblyContaining<UpdateUserRequestValidator>();

builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IValidator<CreateProjectRequest>, CreateProjectRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateProjectRequest>, UpdateProjectRequestValidator>();

builder.Services.AddScoped<ISkillService, SkillService>();
builder.Services.AddScoped<IValidator<CreateSkillRequest>, CreateSkillRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateSkillRequest>, UpdateSkillRequestValidator>();

builder.Services.AddScoped<IContractService, ContractService>();

builder.Services.AddScoped<ISettingService, SettingService>();

builder.Services.AddScoped<IProposalService, ProposalService>();
builder.Services.AddScoped<IValidator<CreateProposalRequest>, CreateProposalRequestValidator>();

builder.Services.AddScoped<IMilestoneService, MilestoneService>();
builder.Services.AddScoped<IValidator<CreateMilestoneRequest>, CreateMilestoneRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateMilestoneRequest>, UpdateMilestoneRequestValidator>();
builder.Services.AddScoped<IValidator<FundMilestoneRequest>, FundMilestoneRequestValidator>();
builder.Services.AddScoped<IValidator<SubmitMilestoneRequest>, SubmitMilestoneRequestValidator>();

builder.Services.AddScoped<IDeliverableService, DeliverableService>();
builder.Services.AddScoped<IValidator<CreateDeliverableRequest>, CreateDeliverableRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateDeliverableRequest>, UpdateDeliverableRequestValidator>();

builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IValidator<CreateReportRequest>, CreateReportRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateReportStatusRequest>, UpdateReportStatusRequestValidator>();


builder.Services.AddScoped<IClientService, ClientService>();

builder.Services.AddScoped<IFavoriteFreelancerService, FavoriteFreelancerService>();


builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IValidator<UploadFileRequest>, UploadFileRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateFileRequest>, UpdateFileRequestValidator>();

builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IValidator<CreateReviewRequest>, CreateReviewRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateReviewRequest>, UpdateReviewRequestValidator>();

builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IValidator<CreateNotificationRequest>, CreateNotificationRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateNotificationRequest>, UpdateNotificationRequestValidator>();
builder.Services.AddScoped<INotificationCreator, NotificationCreator>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

builder.Services.AddScoped<IFreelancerService, FreelancerService>();

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

await DbSeeder.SeedAsync(app.Services);

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();

// Serve files from wwwroot if you use it
app.UseStaticFiles();

// Serve files from /uploads on disk
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();

app.UseActiveUserCheck();

app.UseAuthorization();
app.MapControllers();
app.Run();