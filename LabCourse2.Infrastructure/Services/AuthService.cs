using FluentValidation;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly ITokenService _tokenService;
        private readonly IValidator<RegisterRequest> _validator;

        public AuthService(AppDbContext db, ITokenService tokenService, IValidator<RegisterRequest> validator)
        {
            _db = db;
            _tokenService = tokenService;
            _validator = validator;
        }

        public Task<AuthResult> RegisterAsync(RegisterRequest request)
        {
            if (!RoleConstants.PublicRoles.Contains(request.Role))
                return Task.FromResult(AuthResult.Fail(
                    $"Role '{request.Role}' cannot self-register. Allowed roles: {string.Join(", ", RoleConstants.PublicRoles)}."));

            return RegisterCoreAsync(request);
        }

        public Task<AuthResult> RegisterAdminAsync(RegisterRequest request)
        {
            request.Role = RoleConstants.Admin;
            return RegisterCoreAsync(request);
        }

        private async Task<AuthResult> RegisterCoreAsync(RegisterRequest request)
        {
            var validation = await _validator.ValidateAsync(request);
            if (!validation.IsValid)
                return AuthResult.Fail(validation.Errors.Select(e => e.ErrorMessage).ToArray());

            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                return AuthResult.Fail("An account with this email already exists.");

            if (await _db.Users.AnyAsync(u => u.Username == request.Username))
                return AuthResult.Fail("This username is already taken.");

            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);
            if (role is null)
                return AuthResult.Fail(
                    $"Role '{request.Role}' is not configured in the system. Please contact an administrator.");

            await using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    UserID = Guid.NewGuid(),
                    Name = request.Name,
                    Surname = request.Surname,
                    Username = request.Username,
                    Email = request.Email,
                    Password_Hash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Is_Active = true,
                    Created_At = DateTime.UtcNow,
                    Updated_At = DateTime.UtcNow
                };

                _db.Users.Add(user);

                _db.UserRoles.Add(new UserRole
                {
                    UserRolesID = Guid.NewGuid(),
                    UserID = user.UserID,
                    RoleID = role.RoleID,
                    Assigned_At = DateTime.UtcNow
                });

                if (request.Role == RoleConstants.Freelancer)
                {
                    _db.FreelancerProfiles.Add(new FreelancerProfile
                    {
                        FreelancerID = Guid.NewGuid(),
                        UserID = user.UserID,
                        Experience_Level = request.ExperienceLevel!,
                        Hourly_Rate = request.HourlyRate!.Value
                    });
                }
                else if (request.Role == RoleConstants.Client)
                {
                    _db.ClientProfiles.Add(new ClientProfile
                    {
                        ClientID = Guid.NewGuid(),
                        UserID = user.UserID,
                        Bio = request.Bio!,
                        Industry = request.Industry!,
                        Budget = request.Budget!.Value
                    });
                }

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                var accessToken = _tokenService.GenerateAccessToken(user, request.Role);
                var refreshToken = _tokenService.GenerateRefreshToken();

                _db.RefreshTokens.Add(new RefreshToken
                {
                    TokenID = Guid.NewGuid(),
                    UserID = user.UserID,
                    Token_Hash = BCrypt.Net.BCrypt.HashPassword(refreshToken),
                    Expires_At = DateTime.UtcNow.AddDays(7),
                    Created_At = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();

                return AuthResult.Ok(accessToken, refreshToken, user.UserID, request.Role);
            }
            catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
            {
                await tx.RollbackAsync();
                return AuthResult.Fail("A user with this email or username already exists (concurrent request).");
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        private static bool IsUniqueConstraintViolation(DbUpdateException ex)
        {
            var inner = ex.InnerException?.Message ?? string.Empty;
            return inner.Contains("2601") || inner.Contains("2627") ||
                   inner.Contains("UNIQUE") || inner.Contains("duplicate");
        }
    }
}
