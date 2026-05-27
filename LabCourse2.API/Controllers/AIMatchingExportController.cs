using LabCourse2.Application.Interfaces.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/ai-export")]
    [Authorize]
    public class AIMatchingExportController : ControllerBase
    {
        private readonly IAIMatchingExportService _service;

        public AIMatchingExportController(IAIMatchingExportService service)
        {
            _service = service;
        }

        [HttpGet("freelancers")]
        public async Task<IActionResult> ExportFreelancers()
        {
            var file = await _service.ExportFreelancersCsvAsync();
            return File(file, "text/csv", "freelancers_export.csv");
        }

        [HttpGet("projects")]
        public async Task<IActionResult> ExportProjects()
        {
            var file = await _service.ExportProjectsCsvAsync();
            return File(file, "text/csv", "projects_export.csv");
        }

        [HttpGet("positive-pairs")]
        public async Task<IActionResult> ExportPositivePairs()
        {
            var file = await _service.ExportPositivePairsCsvAsync();
            return File(file, "text/csv", "positive_pairs.csv");
        }

        [HttpGet("training")]
        public async Task<IActionResult> ExportTraining()
        {
            var file = await _service.ExportMatchingTrainingCsvAsync();
            return File(file, "text/csv", "matching_training_data.csv");
        }
    }
}