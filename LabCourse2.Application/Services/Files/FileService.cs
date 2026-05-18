using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Files;
using LabCourse2.Application.Interfaces.Files;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Files
{
    public class FileService : IFileService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public FileService(IAppDbContext context, ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Result<PagedResult<FileResponse>>> GetAllAsync(FileQueryParams query)
        {
            var q = _context.Files
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Entity))
            {
                var normalizedEntity = NormalizeEntity(query.Entity);
                if (normalizedEntity is null)
                    return Result<PagedResult<FileResponse>>.Failure("Invalid entity.");

                q = q.Where(f => f.Entity == normalizedEntity);
            }

            if (query.EntityID.HasValue && query.EntityID.Value != Guid.Empty)
                q = q.Where(f => f.EntityID == query.EntityID.Value);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(f => f.Created_at)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(f => new FileResponse
                {
                    FilesID = f.FilesID,
                    Entity = f.Entity,
                    EntityID = f.EntityID,
                    Filename = f.Filename,
                    File_Path = f.File_Path,
                    File_Size = f.File_Size,
                    Uploaded_by = f.Uploaded_by,
                    Created_at = f.Created_at
                })
                .ToListAsync();

            return Result<PagedResult<FileResponse>>.Success(new PagedResult<FileResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<FileResponse>> GetByIdAsync(Guid fileId)
        {
            var file = await _context.Files
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.FilesID == fileId);

            if (file is null)
                return Result<FileResponse>.NotFound($"File with ID {fileId} was not found.");

            return Result<FileResponse>.Success(ToResponse(file));
        }

        public async Task<Result<FileResponse>> UploadAsync(UploadFileRequest request)
        {
            if (request.File is null || request.File.Length == 0)
                return Result<FileResponse>.Failure("File is required.");

            if (string.IsNullOrWhiteSpace(request.Entity))
                return Result<FileResponse>.Failure("Entity is required.");

            if (request.EntityID == Guid.Empty)
                return Result<FileResponse>.Failure("EntityID is required.");

            var normalizedEntity = NormalizeEntity(request.Entity);
            if (normalizedEntity is null)
                return Result<FileResponse>.Failure("Invalid entity.");

            var entityExists = await EntityExistsAsync(normalizedEntity, request.EntityID);
            if (!entityExists)
                return Result<FileResponse>.NotFound("Target entity was not found.");

            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", normalizedEntity.ToLower());
            
            // For User entity, create a profiles subdirectory
            if (normalizedEntity.Equals("User", StringComparison.OrdinalIgnoreCase))
            {
                uploadsRoot = Path.Combine(uploadsRoot, "profiles");
            }
            
            Directory.CreateDirectory(uploadsRoot);

            var extension = Path.GetExtension(request.File.FileName);
            var storedFileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(uploadsRoot, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            var relativePath = normalizedEntity.Equals("User", StringComparison.OrdinalIgnoreCase)
                ? Path.Combine("uploads", normalizedEntity.ToLower(), "profiles", storedFileName).Replace("\\", "/")
                : Path.Combine("uploads", normalizedEntity.ToLower(), storedFileName).Replace("\\", "/");

            var file = new Domain.Entities.Files
            {
                FilesID = Guid.NewGuid(),
                Entity = normalizedEntity,
                EntityID = request.EntityID,
                Filename = storedFileName,
                File_Path = relativePath,
                File_Size = request.File.Length,
                Uploaded_by = _currentUser.Username ?? "system",
                Created_at = DateTime.UtcNow
            };

            await _context.Files.AddAsync(file);
            await _context.SaveChangesAsync();

            return Result<FileResponse>.Created(ToResponse(file));
        }

        public async Task<Result<FileResponse>> UpdateAsync(Guid fileId, UpdateFileRequest request)
        {
            if (request.File is null || request.File.Length == 0)
                return Result<FileResponse>.Failure("New file is required.");

            var file = await _context.Files
                .FirstOrDefaultAsync(f => f.FilesID == fileId);

            if (file is null)
                return Result<FileResponse>.NotFound($"File with ID {fileId} was not found.");

            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var oldFullPath = Path.Combine(
                uploadsRoot,
                file.File_Path.Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (System.IO.File.Exists(oldFullPath))
            {
                System.IO.File.Delete(oldFullPath);
            }

            var entityFolder = Path.Combine(uploadsRoot, "uploads", file.Entity.ToLower());
            
            // For User entity, create a profiles subdirectory
            if (file.Entity.Equals("User", StringComparison.OrdinalIgnoreCase))
            {
                entityFolder = Path.Combine(entityFolder, "profiles");
            }
            
            Directory.CreateDirectory(entityFolder);

            var extension = Path.GetExtension(request.File.FileName);
            var storedFileName = $"{Guid.NewGuid()}{extension}";
            var newFullPath = Path.Combine(entityFolder, storedFileName);

            using (var stream = new FileStream(newFullPath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            file.Filename = storedFileName;
            file.File_Path = file.Entity.Equals("User", StringComparison.OrdinalIgnoreCase)
                ? Path.Combine("uploads", file.Entity.ToLower(), "profiles", storedFileName).Replace("\\", "/")
                : Path.Combine("uploads", file.Entity.ToLower(), storedFileName).Replace("\\", "/");
            file.File_Size = request.File.Length;
            file.Uploaded_by = _currentUser.Username ?? file.Uploaded_by;

            await _context.SaveChangesAsync();

            return Result<FileResponse>.Success(ToResponse(file));
        }

        public async Task<Result<bool>> DeleteAsync(Guid fileId)
        {
            var file = await _context.Files
                .FirstOrDefaultAsync(f => f.FilesID == fileId);

            if (file is null)
                return Result<bool>.NotFound($"File with ID {fileId} was not found.");

            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var fullPath = Path.Combine(
                uploadsRoot,
                file.File_Path.Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            _context.Files.Remove(file);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        private async Task<bool> EntityExistsAsync(string entity, Guid entityId)
        {
            return entity switch
            {
                "Project" => await _context.Projects.AnyAsync(x => x.ProjectID == entityId),
                "Contract" => await _context.Contracts.AnyAsync(x => x.ContractID == entityId),
                "Report" => await _context.Reports.AnyAsync(x => x.ReportsID == entityId),
                "User" => await _context.Users.AnyAsync(x => x.UserID == entityId),
                _ => false
            };
        }

        private static string? NormalizeEntity(string entity)
        {
            var allowed = new[] { "Project", "Contract", "Report", "User" };

            return allowed.FirstOrDefault(x =>
                x.Equals(entity, StringComparison.OrdinalIgnoreCase));
        }

        private static FileResponse ToResponse(Domain.Entities.Files file)
        {
            return new FileResponse
            {
                FilesID = file.FilesID,
                Entity = file.Entity,
                EntityID = file.EntityID,
                Filename = file.Filename,
                File_Path = file.File_Path,
                File_Size = file.File_Size,
                Uploaded_by = file.Uploaded_by,
                Created_at = file.Created_at
            };
        }
    }
}