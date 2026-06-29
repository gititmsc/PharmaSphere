using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.ProductMasters
{
    public sealed class ProductMasterService : IProductMasterService
    {
        private readonly IProductMasterRepository _repo;

        public ProductMasterService(IProductMasterRepository repo) => _repo = repo;

        public Task<PagedResultDto<ProductMasterListItemDto>> GetProductsAsync(
            ProductMasterListQueryDto query, CancellationToken ct = default) =>
            _repo.GetPagedAsync(query, ct);

        public Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default) =>
            _repo.GetAllBrandNamesAsync(ct);

        public async Task<ProductMasterDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default)
        {
            var p = await _repo.GetByIdAsync(id, ct);
            if (p is null) return null;
            return ToDetail(p);
        }

        public async Task<ProductMasterListItemDto> CreateProductAsync(
            CreateProductMasterRequestDto request, string createdBy, CancellationToken ct = default)
        {
            var product = new ProductMaster
            {
                BrandName     = request.BrandName.Trim(),
                GenericName   = request.GenericName.Trim(),
                Vial          = request.Vial.Trim(),
                SealColor     = request.SealColor.Trim(),
                WFI           = request.WFI.Trim(),
                Label         = request.Label.Trim(),
                MonoBox       = request.MonoBox.Trim(),
                MonthBox      = request.MonthBox.Trim(),
                Tray          = request.Tray.Trim(),
                Leaflet       = request.Leaflet.Trim(),
                SyringeNeedle = request.SyringeNeedle.Trim(),
                Shrink        = request.Shrink.Trim(),
                Shipper       = request.Shipper.Trim(),
                Hologram      = request.Hologram.Trim(),
                CreatedBy     = createdBy,
                CreatedDate   = DateTime.UtcNow,
            };

            await _repo.AddAsync(product, ct);
            return new ProductMasterListItemDto(
                product.Id, product.BrandName, product.GenericName,
                product.Vial, product.SealColor, product.MonoBox);
        }

        public async Task<ProductMasterListItemDto> UpdateProductAsync(
            int id, UpdateProductMasterRequestDto request, string updatedBy, CancellationToken ct = default)
        {
            var product = await _repo.GetByIdAsync(id, ct)
                ?? throw new KeyNotFoundException($"Product {id} not found.");

            product.BrandName     = request.BrandName.Trim();
            product.GenericName   = request.GenericName.Trim();
            product.Vial          = request.Vial.Trim();
            product.SealColor     = request.SealColor.Trim();
            product.WFI           = request.WFI.Trim();
            product.Label         = request.Label.Trim();
            product.MonoBox       = request.MonoBox.Trim();
            product.MonthBox      = request.MonthBox.Trim();
            product.Tray          = request.Tray.Trim();
            product.Leaflet       = request.Leaflet.Trim();
            product.SyringeNeedle = request.SyringeNeedle.Trim();
            product.Shrink        = request.Shrink.Trim();
            product.Shipper       = request.Shipper.Trim();
            product.Hologram      = request.Hologram.Trim();
            product.UpdatedBy     = updatedBy;
            product.UpdatedDate   = DateTime.UtcNow;

            await _repo.SaveChangesAsync(ct);
            return new ProductMasterListItemDto(
                product.Id, product.BrandName, product.GenericName,
                product.Vial, product.SealColor, product.MonoBox);
        }

        public async Task DeleteProductAsync(int id, CancellationToken ct = default)
        {
            var deleted = await _repo.DeleteAsync(id, ct);
            if (!deleted) throw new KeyNotFoundException($"Product {id} not found.");
        }

        private static ProductMasterDetailDto ToDetail(ProductMaster p) => new(
            p.Id,
            p.BrandName,
            p.GenericName,
            p.Vial,
            p.SealColor,
            p.WFI,
            p.Label,
            p.MonoBox,
            p.MonthBox,
            p.Tray,
            p.Leaflet,
            p.SyringeNeedle,
            p.Shrink,
            p.Shipper,
            p.Hologram,
            p.CreatedBy,
            p.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
            p.UpdatedBy,
            p.UpdatedDate?.ToString("yyyy-MM-dd HH:mm"));
    }
}
