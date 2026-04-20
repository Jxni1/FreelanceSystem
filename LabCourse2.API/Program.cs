using FluentValidation;
using LabCourse2.API.Middleware;
using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Projects;
using LabCourse2.Application.Interfaces.Users;
using LabCourse2.Application.Services.Projects;
using LabCourse2.Application.Services.User;
using LabCourse2.Application.Validators;
using LabCourse2.Application.Validators.Projects;
using LabCourse2.Infrastructure.Persistence;
using LabCourse2.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

builder.Services.AddScoped<IProjectService, ProjectService>();

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IUserService>(sp => sp.GetRequiredService<UserService>());
builder.Services.AddScoped<ICurrentUserService>(sp => sp.GetRequiredService<UserService>());

builder.Services.AddScoped<IValidator<CreateProjectRequest>, CreateProjectRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateProjectRequest>, UpdateProjectRequestValidator>();

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

await DbSeeder.SeedAsync(app.Services);

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.UseAuthentication();

app.UseActiveUserCheck();

app.UseAuthorization();
app.MapControllers();
app.Run();