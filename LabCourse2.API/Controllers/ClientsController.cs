using LabCourse2.Application.DTOs.ClientProfiles;
using LabCourse2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class ClientsController : BaseApiController
    {
        private readonly IClientService _clientService;

        public ClientsController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ClientQueryParams query)
        {
            var result = await _clientService.GetAllAsync(query);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _clientService.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}/projects")]
        public async Task<IActionResult> GetProjectsByClientId(Guid id)
        {
            var result = await _clientService.GetProjectsByClientIdAsync(id);
            return ToActionResult(result);
        }
    }
}