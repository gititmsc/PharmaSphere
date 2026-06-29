using PharmaSphere.Core.DTOs;

namespace PharmaSphere.Services.Interfaces
{
    public interface IProductMasterService
    {
        Task<PagedResultDto<ProductMasterListItemDto>> GetProductsAsync(ProductMasterListQueryDto query, CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default);
        Task<ProductMasterDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default);
        Task<ProductMasterListItemDto> CreateProductAsync(CreateProductMasterRequestDto request, string createdBy, CancellationToken ct = default);
        Task<ProductMasterListItemDto> UpdateProductAsync(int id, UpdateProductMasterRequestDto request, string updatedBy, CancellationToken ct = default);
        Task DeleteProductAsync(int id, CancellationToken ct = default);
    }
}
