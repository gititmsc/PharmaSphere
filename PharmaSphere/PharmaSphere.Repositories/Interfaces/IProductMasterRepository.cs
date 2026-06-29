using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    public interface IProductMasterRepository
    {
        Task<PagedResultDto<ProductMasterListItemDto>> GetPagedAsync(ProductMasterListQueryDto query, CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetAllBrandNamesAsync(CancellationToken ct = default);
        Task<ProductMaster?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ProductMaster?> GetByBrandNameAsync(string brandName, CancellationToken ct = default);
        Task AddAsync(ProductMaster product, CancellationToken ct = default);
        Task<bool> DeleteAsync(int id, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
