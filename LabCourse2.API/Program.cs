using FluentValidation;
using LabCourse2.API.Hubs;
using LabCourse2.API.Middleware;
using LabCourse2.Application.Interfaces.AI;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Categories;
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
using LabCourse2.Application.Interfaces.Categories;
using LabCourse2.Application.Interfaces.Contracts;
using LabCourse2.Application.Interfaces.Deliverables;
using LabCourse2.Application.Interfaces.Emails;
using LabCourse2.Application.Interfaces.Files;
using LabCourse2.Application.Interfaces.Messages;
using LabCourse2.Application.Interfaces.Milestones;
using LabCourse2.Application.Interfaces.Notifications;
using LabCourse2.Application.Interfaces.Payments;
using LabCourse2.Application.Interfaces.Projects;
using LabCourse2.Application.Interfaces.Proposals;
using LabCourse2.Application.Interfaces.ProtectedViews;
using LabCourse2.Application.Interfaces.Reports;
using LabCourse2.Application.Interfaces.Reviews;
using LabCourse2.Application.Interfaces.Skills;
using LabCourse2.Application.Interfaces.Users;
using LabCourse2.Application.Services;
using LabCourse2.Application.Services.Categories;
using LabCourse2.Application.Services.Contracts;
using LabCourse2.Application.Services.Deliverables;
using LabCourse2.Application.Services.Files;
using LabCourse2.Application.Services.Messages;
using LabCourse2.Application.Services.Milestones;
using LabCourse2.Application.Services.Notifications;
using LabCourse2.Application.Services.Payments;
using LabCourse2.Application.Services.Projects;
using LabCourse2.Application.Services.Proposals;
using LabCourse2.Application.Services.ProtectedViews;
using LabCourse2.Application.Services.Reports;
using LabCourse2.Application.Services.Reviews;
using LabCourse2.Application.Services.Skills;
using LabCourse2.Application.Services.User;
using LabCourse2.Application.Validators;
using LabCourse2.Application.Validators.Categories;
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
using LabCourse2.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Text;
using System.Text.Json;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Add Redis Caching
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    options.InstanceName = builder.Configuration["Redis:InstanceName"] ?? "LabCourse2_";
});


builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var connection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    return ConnectionMultiplexer.Connect(connection);
});

builder.Services.AddScoped<ICacheService, CacheService>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();


builder.Services.AddHttpClient<IAIMatchingPredictionService, AIMatchingPredictionService>(client =>
{
    client.BaseAddress = new Uri("http://127.0.0.1:8000/");
});

builder.Services.AddScoped<IAIRecommendationService, AIRecommendationService>();


builder.Services.AddScoped<IAIMatchingExportService, AIMatchingExportService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<LabCourse2.Infrastructure.Services.IAuthorizationService, LabCourse2.Infrastructure.Services.AuthorizationService>();
builder.Services.AddScoped<LabCourse2.Infrastructure.Services.IRoleManagementService, LabCourse2.Infrastructure.Services.RoleManagementService>();

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
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = ClaimTypes.Role,
        
        NameClaimType = JwtRegisteredClaimNames.UniqueName
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var path = context.HttpContext.Request.Path;
            if (path.StartsWithSegments("/hubs/chat") &&
                context.Request.Query.TryGetValue("access_token", out var accessToken))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:3000", "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(allowedOrigins)
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

builder.Services.AddScoped<IDashboardService, DashboardService>();

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

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection(EmailSettings.SectionName));
builder.Services.AddSingleton<IEmailQueue, EmailQueue>();
builder.Services.AddSingleton<IEmailService, EmailService>();
builder.Services.AddHostedService<EmailBackgroundService>();

builder.Services.Configure<StripeSettings>(
    builder.Configuration.GetSection(StripeSettings.SectionName));
Stripe.StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"] ?? string.Empty;
builder.Services.AddScoped<IStripeService, StripeService>();
builder.Services.AddScoped<IStripeConnectService, StripeConnectService>();
builder.Services.AddScoped<IStripeWebhookService, StripeWebhookService>();

builder.Services.AddScoped<IFreelancerService, FreelancerService>();

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IValidator<CreateCategoryRequest>, CreateCategoryRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateCategoryRequest>, UpdateCategoryRequestValidator>();

builder.Services.AddScoped<IProtectedViewService, ProtectedViewService>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
        options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);
builder.Services.AddSingleton<IUserIdProvider, NameIdentifierUserIdProvider>();

builder.Services.AddScoped<IAuditLogService, AuditLogService>();

var app = builder.Build();

try
{
    await DbSeeder.SeedAsync(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogWarning(ex, "Database seeding failed. The API will continue running, but the database may not be initialized.");
}

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.UseStaticFiles();

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

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30)
};

foreach (var origin in allowedOrigins)
{
    webSocketOptions.AllowedOrigins.Add(origin);
}

app.UseWebSockets(webSocketOptions);

app.MapHub<ChatHub>("/hubs/chat");

app.MapControllers();

app.Run();