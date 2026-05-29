using LabCourse2.Application.Common;
using LabCourse2.Application.Interfaces.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LabCourse2.API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/stripe/webhook")]
    public class StripeWebhookController : ControllerBase
    {
        private readonly IStripeService _stripe;
        private readonly IStripeWebhookService _webhook;

        public StripeWebhookController(IStripeService stripe, IStripeWebhookService webhook)
        {
            _stripe = stripe;
            _webhook = webhook;
        }

        [HttpPost]
        public async Task<IActionResult> Handle(CancellationToken cancellationToken)
        {
            using var reader = new StreamReader(Request.Body);
            var json = await reader.ReadToEndAsync(cancellationToken);

            var signature = Request.Headers["Stripe-Signature"].FirstOrDefault();
            if (string.IsNullOrEmpty(signature))
                return BadRequest();

            try
            {
                var webhookEvent = _stripe.ConstructWebhookEvent(json, signature);
                if (webhookEvent is null)
                    return Ok();

                await _webhook.HandleAsync(webhookEvent, cancellationToken);
                return Ok();
            }
            catch (PaymentProviderException)
            {
                return BadRequest();
            }
        }
    }
}
