using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;

namespace PharmaSphere.Services.Interfaces
{
    public interface IOrderService
    {
        Task<PagedResultDto<OrderListItemDto>> GetOrdersAsync(OrderListQueryDto query, CancellationToken ct = default);
        Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, CancellationToken ct = default);
        Task<OrderDetailDto?> GetLatestByBrandNameAsync(string brandName, CancellationToken ct = default);
        Task<OrderListItemDto> CreateOrderAsync(CreateOrderRequestDto request, int userId, string userName, CancellationToken ct = default);
        Task<OrderListItemDto> UpdateOrderAsync(int orderId, UpdateOrderRequestDto request, int userId, string userName, CancellationToken ct = default);
        Task DeleteOrderAsync(int orderId, int userId, string userName, CancellationToken ct = default);
        Task RestoreOrderAsync(int orderId, int userId, string userName, CancellationToken ct = default);
        Task ChangeStatusAsync(int orderId, ChangeStatusRequestDto request, int userId, string userName, CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetSealColorsAsync(CancellationToken ct = default);
        Task<AdminDashboardDto> GetAdminDashboardAsync(CancellationToken ct = default);
        Task<RoleDashboardDto> GetRoleDashboardAsync(string status, CancellationToken ct = default);
    }
}
