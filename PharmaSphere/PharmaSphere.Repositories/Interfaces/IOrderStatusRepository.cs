using PharmaSphere.Core.Models;

namespace PharmaSphere.Repositories.Interfaces
{
    public interface IOrderStatusRepository
    {
        Task<IReadOnlyList<OrderStatusConfig>> GetAllActiveAsync(CancellationToken ct = default);
        Task<IReadOnlyList<OrderStatusTransition>> GetAllTransitionsAsync(CancellationToken ct = default);
        Task<string?> GetInitialStatusNameAsync(CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetAllowedNextAsync(string fromStatus, CancellationToken ct = default);
    }
}
