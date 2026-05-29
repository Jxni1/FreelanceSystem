using LabCourse2.Application.Interfaces.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    public class StripeController : BaseApiController
    {
        private readonly IStripeService _stripeService;
        private readonly IStripeConnectService _connectService;

        public StripeController(IStripeService stripeService, IStripeConnectService connectService)
        {
            _stripeService = stripeService;
            _connectService = connectService;
        }

        [AllowAnonymous]
        [HttpGet("health")]
        public async Task<IActionResult> Health(CancellationToken cancellationToken)
        {
            var result = await _stripeService.CheckConnectivityAsync(cancellationToken);

            return Ok(new
            {
                result.Connected,
                result.Mode,
                PublishableKeyConfigured = !string.IsNullOrWhiteSpace(_stripeService.PublishableKey),
                result.Error
            });
        }

        [Authorize]
        [HttpPost("connect/onboard")]
        public async Task<IActionResult> StartConnectOnboarding()
        {
            var result = await _connectService.StartOnboardingAsync();
            return ToActionResult(result);
        }

        [Authorize]
        [HttpGet("connect/status")]
        public async Task<IActionResult> GetConnectStatus()
        {
            var result = await _connectService.GetStatusAsync();
            return ToActionResult(result);
        }
    }
}
