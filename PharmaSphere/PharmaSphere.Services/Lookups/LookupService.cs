using PharmaSphere.Core.DTOs;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Lookups
{
    public sealed class LookupService : ILookupService
    {
        private readonly ILookupRepository _lookups;
        private readonly IProductMasterRepository _pmRepo;

        public LookupService(ILookupRepository lookups, IProductMasterRepository pmRepo)
        {
            _lookups = lookups;
            _pmRepo  = pmRepo;
        }

        public Task<IReadOnlyList<string>> GetPartiesAsync(CancellationToken ct = default)
            => _lookups.GetPartiesAsync(ct);

        public Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default)
            => _lookups.GetBrandNamesAsync(ct);

        public Task<IReadOnlyList<string>> GetProductMasterBrandsAsync(CancellationToken ct = default)
            => _pmRepo.GetAllBrandNamesAsync(ct);

        public async Task<ProductMasterDetailDto?> GetProductMasterByBrandAsync(
            string brandName, CancellationToken ct = default)
        {
            var p = await _pmRepo.GetByBrandNameAsync(brandName, ct);
            if (p is null) return null;
            return new ProductMasterDetailDto(
                p.Id, p.BrandName, p.GenericName, p.Vial, p.SealColor, p.WFI,
                p.Label, p.MonoBox, p.MonthBox, p.Tray, p.Leaflet, p.SyringeNeedle,
                p.Shrink, p.Shipper, p.Hologram,
                p.CreatedBy, p.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
                p.UpdatedBy, p.UpdatedDate?.ToString("yyyy-MM-dd HH:mm"));
        }
    }
}
