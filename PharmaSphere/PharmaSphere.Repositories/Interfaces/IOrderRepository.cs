using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<PagedResultDto<OrderListItemDto>> GetPagedAsync(OrderListQueryDto query, CancellationToken ct = default);
        Task<Order?> GetByIdAsync(int orderId, CancellationToken ct = default);
        Task<bool> OrderNoExistsAsync(string orderNo, int? excludeOrderId = null, CancellationToken ct = default);
        Task AddAsync(Order order, CancellationToken ct = default);
        Task AddStatusHistoryAsync(OrderStatusHistory history, CancellationToken ct = default);
        Task AddAuditLogAsync(OrderAuditLog log, CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetSealColorsAsync(CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
