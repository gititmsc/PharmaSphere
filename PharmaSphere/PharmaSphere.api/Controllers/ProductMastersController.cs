using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Services.Interfaces;
using System.Security.Claims;

namespace PharmaSphere.Api.Controllers
{
    [ApiController]
    [Route("api/product-masters")]
    [Authorize(Roles = "Admin")]
    public sealed class ProductMastersController : ControllerBase
    {
        private readonly IProductMasterService _svc;

        public ProductMastersController(IProductMasterService svc) => _svc = svc;

        // GET /api/product-masters?search=&brandName=&sortBy=&sortDir=&page=1&pageSize=10
        [HttpGet]
        public async Task<ActionResult<PagedResultDto<ProductMasterListItemDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? brandName,
            [FromQuery] string? sortBy,
            [FromQuery] string? sortDir,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default)
        {
            var query = new ProductMasterListQueryDto(search, brandName, sortBy, sortDir, page, pageSize);
            var result = await _svc.GetProductsAsync(query, ct);
            return Ok(result);
        }

        // GET /api/product-masters/brand-names
        [HttpGet("brand-names")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetBrandNames(CancellationToken ct = default)
        {
            var names = await _svc.GetBrandNamesAsync(ct);
            return Ok(names);
        }

        // GET /api/product-masters/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductMasterDetailDto>> GetById(int id, CancellationToken ct = default)
        {
            var product = await _svc.GetProductByIdAsync(id, ct);
            if (product is null) return NotFound();
            return Ok(product);
        }

        // POST /api/product-masters
        [HttpPost]
        public async Task<ActionResult<ProductMasterListItemDto>> Create(
            [FromBody] CreateProductMasterRequestDto request, CancellationToken ct = default)
        {
            var actor = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
            var created = await _svc.CreateProductAsync(request, actor, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT /api/product-masters/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ProductMasterListItemDto>> Update(
            int id, [FromBody] UpdateProductMasterRequestDto request, CancellationToken ct = default)
        {
            try
            {
                var actor = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
                var updated = await _svc.UpdateProductAsync(id, request, actor, ct);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // DELETE /api/product-masters/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
        {
            try
            {
                await _svc.DeleteProductAsync(id, ct);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
