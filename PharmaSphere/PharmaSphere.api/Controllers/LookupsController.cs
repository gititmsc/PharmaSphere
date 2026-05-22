using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Api.Controllers
{
    [ApiController]
    [Route("api/lookups")]
    [Authorize]
    [Produces("application/json")]
    public sealed class LookupsController : ControllerBase
    {
        private readonly ILookupService _lookups;

        public LookupsController(ILookupService lookups) => _lookups = lookups;

        // GET /api/lookups/parties
        [HttpGet("parties")]
        [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetParties(CancellationToken ct)
        {
            var parties = await _lookups.GetPartiesAsync(ct);
            return Ok(parties);
        }

        // GET /api/lookups/brand-names
        [HttpGet("brand-names")]
        [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetBrandNames(CancellationToken ct)
        {
            var brandNames = await _lookups.GetBrandNamesAsync(ct);
            return Ok(brandNames);
        }
    }
}
