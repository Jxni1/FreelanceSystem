using AutoMapper;
using LabCourse2.Application.DTOs.Projects;
using LabCourse2.Domain.Entities;

namespace LabCourse2.Application.Mappings
{
    public class ProjectMappingProfile : Profile
    {
        public ProjectMappingProfile()
        {
            CreateMap<Project, ProjectResponse>()
                .ForMember(dest => dest.ClientName, 
                    opt => opt.MapFrom(src => src.Client != null && src.Client.User != null 
                        ? $"{src.Client.User.Name} {src.Client.User.Surname}" 
                        : null))
                .ForMember(dest => dest.CategoryName, 
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));

            CreateMap<CreateProjectRequest, Project>()
                .ForMember(dest => dest.ProjectID, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Client, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.ProtetectedViews, opt => opt.Ignore())
                .ForMember(dest => dest.Contracts, opt => opt.Ignore());
        }
    }
}
