using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Api.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    [Produces("application/json")]
    public sealed class DashboardController : ControllerBase
    {
        private readonly IOrderService _orders;

        public DashboardController(IOrderService orders) => _orders = orders;

        private string CurrentUserRole =>
            User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        // GET /api/dashboard
        [HttpGet]
        public async Task<IActionResult> GetDashboard(CancellationToken ct)
        {
            if (CurrentUserRole == "Admin")
            {
                var data = await _orders.GetAdminDashboardAsync(ct);
                return Ok(new { role = "Admin", admin = data });
            }

            var roleStatus = CurrentUserRole switch
            {
                "QA"         => "PIS Pending",
                "Designer"   => "Artwork Pending",
                "PPMC"       => "PM Supply Pending",
                "Production" => "Production Pending",
                "Packing"    => "Packing Pending",
                "Dispatch"   => "Dispatch Pending",
                _            => (string?)null
            };

            if (roleStatus is null)
                return Ok(new { role = CurrentUserRole, admin = (object?)null, role_data = (object?)null });

            var roleData = await _orders.GetRoleDashboardAsync(roleStatus, ct);
            return Ok(new { role = CurrentUserRole, role_data = roleData });
        }
    }
}
