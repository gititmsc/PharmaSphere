using PharmaSphere.Core.DTOs;

namespace PharmaSphere.Services.Interfaces
{
    public interface IOrderStatusService
    {
        Task<IReadOnlyList<OrderStatusDto>> GetAllAsync(CancellationToken ct = default);
    }
}
