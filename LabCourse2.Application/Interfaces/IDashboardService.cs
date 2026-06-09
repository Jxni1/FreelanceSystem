using LabCourse2.Application.DTOs.Dashboard;
using System.Threading.Tasks;

namespace LabCourse2.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}