using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Api.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    [Produces("application/json")]
    public sealed class OrdersController : ControllerBase
    {
        private readonly IOrderService _orders;

        public OrdersController(IOrderService orders) => _orders = orders;

        private int CurrentUserId =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private string CurrentUserName =>
            User.FindFirstValue(ClaimTypes.Name) ??
            User.FindFirstValue("email") ??
            "Unknown";

        private string CurrentUserRole =>
            User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        // GET /api/orders/seal-colors
        [HttpGet("seal-colors")]
        [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSealColors(CancellationToken ct)
        {
            var colors = await _orders.GetSealColorsAsync(ct);
            return Ok(colors);
        }

        // GET /api/orders
        [HttpGet]
        [ProducesResponseType(typeof(PagedResultDto<OrderListItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOrders(
            [FromQuery] OrderListQueryDto query, CancellationToken ct)
        {
            var result = await _orders.GetOrdersAsync(query, ct);
            return Ok(result);
        }

        // GET /api/orders/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrder(int id, CancellationToken ct)
        {
            var order = await _orders.GetOrderByIdAsync(id, ct);
            if (order is null) return NotFound(new { message = "Order not found." });
            return Ok(order);
        }

        // POST /api/orders
        [HttpPost]
        [ProducesResponseType(typeof(OrderListItemDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrder(
            [FromBody] CreateOrderRequestDto request, CancellationToken ct)
        {
            try
            {
                var result = await _orders.CreateOrderAsync(request, CurrentUserId, CurrentUserName, ct);
                return CreatedAtAction(nameof(GetOrder), new { id = result.OrderId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/orders/{id}
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(OrderListItemDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrder(
            int id, [FromBody] UpdateOrderRequestDto request, CancellationToken ct)
        {
            try
            {
                var result = await _orders.UpdateOrderAsync(id, request, CurrentUserId, CurrentUserName, ct);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/orders/{id}  (soft delete)
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOrder(int id, CancellationToken ct)
        {
            try
            {
                await _orders.DeleteOrderAsync(id, CurrentUserId, CurrentUserName, ct);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/orders/{id}/restore  (Admin only)
        [HttpPost("{id:int}/restore")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RestoreOrder(int id, CancellationToken ct)
        {
            try
            {
                await _orders.RestoreOrderAsync(id, CurrentUserId, CurrentUserName, ct);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/orders/{id}/status
        [HttpPost("{id:int}/status")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangeStatus(
            int id, [FromBody] ChangeStatusRequestDto request, CancellationToken ct)
        {
            try
            {
                await _orders.ChangeStatusAsync(id, request, CurrentUserId, CurrentUserName, ct);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
