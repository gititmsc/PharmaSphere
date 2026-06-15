using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.OrderStatuses
{
    public sealed class OrderStatusRepository : IOrderStatusRepository
    {
        private readonly AppDbContext _db;

        public OrderStatusRepository(AppDbContext db) => _db = db;

        public async Task<IReadOnlyList<OrderStatusConfig>> GetAllActiveAsync(CancellationToken ct = default)
            => await _db.OrderStatuses
                .Where(s => s.IsActive)
                .OrderBy(s => s.DisplayOrder)
                .ToListAsync(ct);

        public async Task<IReadOnlyList<OrderStatusTransition>> GetAllTransitionsAsync(CancellationToken ct = default)
            => await _db.OrderStatusTransitions.ToListAsync(ct);

        public async Task<string?> GetInitialStatusNameAsync(CancellationToken ct = default)
            => await _db.OrderStatuses
                .Where(s => s.IsActive && s.IsInitial)
                .OrderBy(s => s.DisplayOrder)
                .Select(s => s.StatusName)
                .FirstOrDefaultAsync(ct);

        public async Task<IReadOnlyList<string>> GetAllowedNextAsync(string fromStatus, CancellationToken ct = default)
            => await _db.OrderStatusTransitions
                .Where(t => t.FromStatus == fromStatus)
                .Select(t => t.ToStatus)
                .ToListAsync(ct);
    }
}
