using FluentValidation;
using LabCourse2.Application.DTOs.Auth;
using LabCourse2.Application.Interfaces;
using LabCourse2.Domain.Constants;
using LabCourse2.Domain.Entities;
using LabCourse2.Infrastructure.Persistence;
using LabCourse2.Infrastructure.Utilities;
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



        public Task<AuthResult> RegisterAsync(RegisterRequest request, string? userAgent = null, string? ip = null)
        {
            if (!RoleConstants.PublicRoles.Contains(request.Role))
                return Task.FromResult(AuthResult.Fail(
                    $"Role '{request.Role}' cannot self-register. " +
                    $"Allowed: {string.Join(", ", RoleConstants.PublicRoles)}."));

            return RegisterCoreAsync(request, userAgent, ip);
        }

        public Task<AuthResult> RegisterAdminAsync(RegisterRequest request, string? userAgent = null, string? ip = null)
        {
            request.Role = RoleConstants.Admin;
            return RegisterCoreAsync(request, userAgent, ip);
        }

        private async Task<AuthResult> RegisterCoreAsync(RegisterRequest request, string? userAgent, string? ip)
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
                    $"Role '{request.Role}' is not configured. Please contact an administrator.");

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
                    var freelancerProfile = new FreelancerProfile
                    {
                        FreelancerID = Guid.NewGuid(),
                        UserID = user.UserID,
                        Experience_Level = request.ExperienceLevel!,
                        Hourly_Rate = request.HourlyRate!.Value
                    };
                    _db.FreelancerProfiles.Add(freelancerProfile);

                    if (request.SkillIds != null && request.SkillIds.Count > 0)
                    {
                        var validSkillIds = await _db.Skills
                            .Where(s => request.SkillIds.Contains(s.SkillsID))
                            .Select(s => s.SkillsID)
                            .ToListAsync();

                        foreach (var sid in validSkillIds)
                            _db.FreelancerSkills.Add(new FreelancerSkills
                            {
                                FreelancerSkillsID = Guid.NewGuid(),
                                FreelancerID = freelancerProfile.FreelancerID,
                                SkillID = sid,
                                Level = "General"
                            });
                    }
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


                var roles = new[] { request.Role };
                var profileType = ResolveProfileType(request.Role);
                var accessToken = _tokenService.GenerateAccessToken(user, roles, profileType);
                var rawRefresh = _tokenService.GenerateRefreshToken();
                var familyId = Guid.NewGuid();

                _db.RefreshTokens.Add(new RefreshToken
                {
                    TokenID = Guid.NewGuid(),
                    UserID = user.UserID,
                    Token_Hash = TokenHasher.Hash(rawRefresh),
                    FamilyId = familyId,
                    Expires_At = DateTime.UtcNow.AddDays(7),
                    Created_At = DateTime.UtcNow,
                    UserAgent = userAgent,
                    CreatedFromIp = ip
                });

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return AuthResult.Ok(accessToken, rawRefresh, user.UserID, roles, profileType);
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
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



        public async Task<AuthResult> LoginAsync(LoginRequest request, string? userAgent = null, string? ip = null)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.FreelancerProfile)
                .Include(u => u.ClientProfile)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password_Hash))
                return AuthResult.Fail("Invalid email or password.");

            if (!user.Is_Active)
                return AuthResult.Fail("This account has been deactivated.");

            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
            var profileType = ResolveProfileType(user);
            var accessToken = _tokenService.GenerateAccessToken(user, roles, profileType);
            var rawRefresh = _tokenService.GenerateRefreshToken();
            var familyId = Guid.NewGuid();

            _db.RefreshTokens.Add(new RefreshToken
            {
                TokenID = Guid.NewGuid(),
                UserID = user.UserID,
                Token_Hash = TokenHasher.Hash(rawRefresh),
                FamilyId = familyId,
                Expires_At = DateTime.UtcNow.AddDays(7),
                Created_At = DateTime.UtcNow,
                UserAgent = userAgent,
                CreatedFromIp = ip
            });
            await _db.SaveChangesAsync();

            return AuthResult.Ok(accessToken, rawRefresh, user.UserID, roles, profileType);
        }


        public async Task<AuthResult> RefreshTokenAsync(string rawRefreshToken, string? userAgent = null, string? ip = null)
        {
            var hash = TokenHasher.Hash(rawRefreshToken);

            var stored = await _db.RefreshTokens
                .Include(t => t.User)
                    .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(t => t.User.FreelancerProfile)
                .Include(t => t.User.ClientProfile)
                .FirstOrDefaultAsync(t => t.Token_Hash == hash);

            if (stored is null)
                return AuthResult.Fail("Invalid refresh token.");

            if (stored.IsConsumed || stored.IsRevoked)
            {
                await RevokeFamilyAsync(stored.FamilyId);
                return AuthResult.TheftDetected();
            }

            if (stored.IsExpired)
                return AuthResult.Fail("Refresh token has expired. Please log in again.");

            var user = stored.User;

            if (!user.Is_Active)
                return AuthResult.Fail("This account has been deactivated.");

            var newTokenId = Guid.NewGuid();
            var rawRefresh = _tokenService.GenerateRefreshToken();

            stored.ReplacedByTokenId = newTokenId;   
            _db.RefreshTokens.Add(new RefreshToken
            {
                TokenID = newTokenId,
                UserID = user.UserID,
                Token_Hash = TokenHasher.Hash(rawRefresh),
                FamilyId = stored.FamilyId,    
                Expires_At = DateTime.UtcNow.AddDays(7),
                Created_At = DateTime.UtcNow,
                UserAgent = userAgent,
                CreatedFromIp = ip
            });

            await _db.SaveChangesAsync();

            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
            var profileType = ResolveProfileType(user);
            var accessToken = _tokenService.GenerateAccessToken(user, roles, profileType);

            return AuthResult.Ok(accessToken, rawRefresh, user.UserID, roles, profileType);
        }


        public async Task<AuthResult> RevokeTokenAsync(string rawRefreshToken)
        {
            var hash = TokenHasher.Hash(rawRefreshToken);
            var stored = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.Token_Hash == hash);

            if (stored is null || !stored.IsActive)
                return AuthResult.Fail("Token not found or already inactive.");

            stored.Revoked_At = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return AuthResult.Fail(); 
        }


        public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.FreelancerProfile)
                .Include(u => u.ClientProfile)
                .FirstOrDefaultAsync(u => u.UserID == userId && u.Is_Active);

            if (user is null) return null;

            return new UserProfileDto
            {
                UserId = user.UserID,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
                FreelancerProfile = user.FreelancerProfile is null ? null : new FreelancerProfileDto
                {
                    ExperienceLevel = user.FreelancerProfile.Experience_Level,
                    HourlyRate = user.FreelancerProfile.Hourly_Rate
                },
                ClientProfile = user.ClientProfile is null ? null : new ClientProfileDto
                {
                    Bio = user.ClientProfile.Bio,
                    Industry = user.ClientProfile.Industry,
                    Budget = user.ClientProfile.Budget
                }
            };
        }

        private async Task RevokeFamilyAsync(Guid familyId)
        {
            var family = await _db.RefreshTokens
                .Where(t => t.FamilyId == familyId && t.Revoked_At == null)
                .ToListAsync();

            foreach (var t in family)
                t.Revoked_At = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        private static string ResolveProfileType(User user)
        {
            if (user.FreelancerProfile is not null) return "freelancer";
            if (user.ClientProfile is not null) return "client";
            return "none";
        }

        private static string ResolveProfileType(string roleName) =>
            roleName switch
            {
                RoleConstants.Freelancer => "freelancer",
                RoleConstants.Client => "client",
                _ => "none"
            };

        private static bool IsUniqueViolation(DbUpdateException ex)
        {
            var msg = ex.InnerException?.Message ?? string.Empty;
            return msg.Contains("2601") || msg.Contains("2627") ||
                   msg.Contains("UNIQUE") || msg.Contains("duplicate");
        }
    }
}