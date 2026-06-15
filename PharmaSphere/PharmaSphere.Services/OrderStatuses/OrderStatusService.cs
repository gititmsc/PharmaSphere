using PharmaSphere.Core.DTOs;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.OrderStatuses
{
    public sealed class OrderStatusService : IOrderStatusService
    {
        private readonly IOrderStatusRepository _repo;

        public OrderStatusService(IOrderStatusRepository repo) => _repo = repo;

        public async Task<IReadOnlyList<OrderStatusDto>> GetAllAsync(CancellationToken ct = default)
        {
            var statuses    = await _repo.GetAllActiveAsync(ct);
            var transitions = await _repo.GetAllTransitionsAsync(ct);

            var transitionMap = transitions
                .GroupBy(t => t.FromStatus)
                .ToDictionary(g => g.Key, g => g.Select(t => t.ToStatus).ToList());

            return statuses.Select(s => new OrderStatusDto(
                s.StatusName,
                s.DisplayOrder,
                s.Color,
                s.IsInitial,
                s.IsTerminal,
                s.ShowInFlow,
                transitionMap.TryGetValue(s.StatusName, out var allowed)
                    ? (IReadOnlyList<string>)allowed.AsReadOnly()
                    : Array.Empty<string>()
            )).ToList();
        }
    }
}
