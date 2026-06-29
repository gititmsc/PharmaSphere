using PharmaSphere.Core.DTOs;

namespace PharmaSphere.Services.Interfaces
{
    public interface ILookupService
    {
        Task<IReadOnlyList<string>> GetPartiesAsync(CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetProductMasterBrandsAsync(CancellationToken ct = default);
        Task<ProductMasterDetailDto?> GetProductMasterByBrandAsync(string brandName, CancellationToken ct = default);
    }
}
