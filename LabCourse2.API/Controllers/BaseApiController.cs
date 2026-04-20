using LabCourse2.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        protected IActionResult ToActionResult<T>(Result<T> result)
        {
            if (result.IsSuccess)
                return StatusCode(result.StatusCode, result.Data);

            return StatusCode(result.StatusCode, new { error = result.Error });
        }
    }
}