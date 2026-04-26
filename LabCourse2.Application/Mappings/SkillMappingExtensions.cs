using LabCourse2.Application.DTOs.Skills;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public static class SkillMappingExtensions
    {
        public static SkillResponse ToResponse(this Skills skill) =>
            new()
            {
                SkillsID = skill.SkillsID,
                Name = skill.Name
            };

        public static Skills ToEntity(this CreateSkillRequest request) =>
            new()
            {
                SkillsID = Guid.NewGuid(),
                Name = request.Name
            };

        public static void ApplyUpdate(this Skills skill, UpdateSkillRequest request)
        {
            skill.Name = request.Name;
        }
    }
}