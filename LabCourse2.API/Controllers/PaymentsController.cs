using LabCourse2.Application.Interfaces.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [Authorize]
    public class PaymentsController : BaseApiController
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("contract/{contractId:guid}")]
        public async Task<IActionResult> GetByContract(
            Guid contractId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _paymentService.GetByContractAsync(contractId, page, pageSize);
            return ToActionResult(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _paymentService.GetByIdAsync(id);
            return ToActionResult(result);
        }
    }
}
