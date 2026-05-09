namespace LabCourse2.Application.DTOs.Auth
{
    public class UpdateFreelancerSkillsRequest
    {
        public List<Guid> SkillIds { get; set; } = new();
    }
}
