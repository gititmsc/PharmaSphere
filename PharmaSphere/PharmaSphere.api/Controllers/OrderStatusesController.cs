using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Api.Controllers
{
    [ApiController]
    [Route("api/order-statuses")]
    [Authorize]
    public sealed class OrderStatusesController : ControllerBase
    {
        private readonly IOrderStatusService _service;

        public OrderStatusesController(IOrderStatusService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var statuses = await _service.GetAllAsync(ct);
            return Ok(statuses);
        }
    }
}
