using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.Orders
{
    public sealed class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _db;
        private readonly IOrderStatusRepository _statuses;

        public OrderRepository(AppDbContext db, IOrderStatusRepository statuses)
        {
            _db = db;
            _statuses = statuses;
        }

        /// <summary>
        /// Per-status overdue/due-soon day thresholds, configured in the OrderStatuses
        /// table (WarningDays/OverdueDays columns) rather than hardcoded.
        /// </summary>
        private async Task<Dictionary<string, (int? WarningDays, int? OverdueDays)>> GetOverdueRuleLookupAsync(
            CancellationToken ct)
        {
            var configs = await _statuses.GetAllActiveAsync(ct);
            return configs.ToDictionary(s => s.StatusName, s => (s.WarningDays, s.OverdueDays));
        }

        public async Task<PagedResultDto<OrderListItemDto>> GetPagedAsync(
            OrderListQueryDto query, CancellationToken ct = default)
        {
            var q = _db.Orders.AsNoTracking().Where(o => o.IsActive);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim().ToLower();
                q = q.Where(o =>
                    o.OrderNo.ToLower().Contains(s) ||
                    (o.Party != null && o.Party.ToLower().Contains(s)) ||
                    (o.BrandName != null && o.BrandName.ToLower().Contains(s)));
            }

            if (query.ProductionRoleView)
                q = q.Where(o => o.CurrentStatus == "Production Pending" || o.ProductionLabel != null);
            else if (!string.IsNullOrWhiteSpace(query.Status))
                q = q.Where(o => o.CurrentStatus == query.Status);

            if (!string.IsNullOrWhiteSpace(query.GenericName))
            {
                var brandsForGeneric = _db.ProductMasters.AsNoTracking()
                    .Where(p => !p.IsDeleted && p.GenericName == query.GenericName)
                    .Select(p => p.BrandName);
                q = q.Where(o => o.BrandName != null && brandsForGeneric.Contains(o.BrandName));
            }

            if (!string.IsNullOrWhiteSpace(query.DateFrom) &&
                DateTime.TryParse(query.DateFrom, out var from))
                q = q.Where(o => o.OrderDate >= from);

            if (!string.IsNullOrWhiteSpace(query.DateTo) &&
                DateTime.TryParse(query.DateTo, out var to))
                q = q.Where(o => o.OrderDate <= to);

            q = (query.SortBy?.ToLower(), query.SortDir?.ToLower()) switch
            {
                ("orderno",   "desc") => q.OrderByDescending(o => o.OrderNo),
                ("orderno",   _)      => q.OrderBy(o => o.OrderNo),
                ("orderdate", "desc") => q.OrderByDescending(o => o.OrderDate),
                ("orderdate", _)      => q.OrderBy(o => o.OrderDate),
                ("party",     "desc") => q.OrderByDescending(o => o.Party),
                ("party",     _)      => q.OrderBy(o => o.Party),
                ("brandname", "desc") => q.OrderByDescending(o => o.BrandName),
                ("brandname", _)      => q.OrderBy(o => o.BrandName),
                ("qty",       "desc") => q.OrderByDescending(o => o.Qty),
                ("qty",       _)      => q.OrderBy(o => o.Qty),
                ("status",    "desc") => q.OrderByDescending(o => o.CurrentStatus),
                ("status",    _)      => q.OrderBy(o => o.CurrentStatus),
                ("updateddate","desc") => q.OrderByDescending(o => o.UpdatedDate),
                ("updateddate",_)      => q.OrderBy(o => o.UpdatedDate),
                _                     => q.OrderByDescending(o => o.CreatedDate),
            };

            var totalCount = await q.CountAsync(ct);

            var rows = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(o => new
                {
                    Dto = new OrderListItemDto(
                        o.OrderId,
                        o.OrderNo,
                        o.OrderDate.ToString("yyyy-MM-dd"),
                        o.Party,
                        o.BrandName,
                        _db.ProductMasters.AsNoTracking()
                            .Where(p => !p.IsDeleted && p.BrandName == o.BrandName)
                            .OrderBy(p => p.Id)
                            .Select(p => p.GenericName)
                            .FirstOrDefault(),
                        o.Qty,
                        o.Rate,
                        o.Amount,
                        o.CurrentStatus,
                        false,
                        false,
                        o.CreatedBy,
                        o.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
                        o.UpdatedDate != null ? o.UpdatedDate.Value.ToString("yyyy-MM-dd HH:mm") : null,
                        o.IsActive),
                    o.CreatedDate,
                })
                .ToListAsync(ct);

            var now    = DateTime.UtcNow;
            var rules  = await GetOverdueRuleLookupAsync(ct);
            var items = rows
                .Select(r =>
                {
                    var (warningDays, overdueDays) = rules.TryGetValue(r.Dto.CurrentStatus, out var rule) ? rule : default;
                    return r.Dto with
                    {
                        IsOverdue = OrderOverdueRules.IsOverdue(overdueDays, r.CreatedDate, now),
                        IsDueSoon = OrderOverdueRules.IsDueSoon(warningDays, overdueDays, r.CreatedDate, now),
                    };
                })
                .ToList();

            return new PagedResultDto<OrderListItemDto>(items, totalCount, query.Page, query.PageSize);
        }

        public async Task<Order?> GetByIdAsync(int orderId, CancellationToken ct = default)
        {
            return await _db.Orders
                .Include(o => o.StatusHistory.OrderByDescending(h => h.ChangedDate))
                .Include(o => o.AuditLogs.OrderByDescending(a => a.ChangedDate))
                .FirstOrDefaultAsync(o => o.OrderId == orderId, ct);
        }

        public async Task<Order?> GetLatestByBrandNameAsync(string brandName, CancellationToken ct = default)
        {
            return await _db.Orders
                .AsNoTracking()
                .Where(o => o.IsActive && o.BrandName == brandName.Trim())
                .OrderByDescending(o => o.CreatedDate)
                .FirstOrDefaultAsync(ct);
        }

        public async Task<bool> OrderNoExistsAsync(
            string orderNo, int? excludeOrderId = null, CancellationToken ct = default)
        {
            var q = _db.Orders.Where(o => o.OrderNo == orderNo && o.IsActive);
            if (excludeOrderId.HasValue)
                q = q.Where(o => o.OrderId != excludeOrderId.Value);
            return await q.AnyAsync(ct);
        }

        public async Task AddAsync(Order order, CancellationToken ct = default)
        {
            _db.Orders.Add(order);
            await _db.SaveChangesAsync(ct);
        }

        public async Task AddStatusHistoryAsync(OrderStatusHistory history, CancellationToken ct = default)
        {
            _db.OrderStatusHistory.Add(history);
            await _db.SaveChangesAsync(ct);
        }

        public async Task AddAuditLogAsync(OrderAuditLog log, CancellationToken ct = default)
        {
            _db.OrderAuditLogs.Add(log);
            await _db.SaveChangesAsync(ct);
        }

        public async Task<IReadOnlyList<string>> GetSealColorsAsync(CancellationToken ct = default)
        {
            return await _db.SealColors
                .Where(s => s.IsActive)
                .OrderBy(s => s.ColorName)
                .Select(s => s.ColorName)
                .ToListAsync(ct);
        }

        public async Task SaveChangesAsync(CancellationToken ct = default)
            => await _db.SaveChangesAsync(ct);

        public async Task<Dictionary<string, int>> GetStatusCountsAsync(CancellationToken ct = default)
        {
            return await _db.Orders
                .AsNoTracking()
                .Where(o => o.IsActive)
                .GroupBy(o => o.CurrentStatus)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count, ct);
        }

        public async Task<Dictionary<string, int>> GetOverdueCountsAsync(CancellationToken ct = default)
        {
            var rows = await _db.Orders
                .AsNoTracking()
                .Where(o => o.IsActive)
                .Select(o => new { o.CurrentStatus, o.CreatedDate })
                .ToListAsync(ct);

            var now   = DateTime.UtcNow;
            var rules = await GetOverdueRuleLookupAsync(ct);
            return rows
                .Where(r => OrderOverdueRules.IsOverdue(
                    rules.TryGetValue(r.CurrentStatus, out var rule) ? rule.OverdueDays : null, r.CreatedDate, now))
                .GroupBy(r => r.CurrentStatus)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        public async Task<IReadOnlyList<DashboardOrderItemDto>> GetRecentOrdersAsync(
            int count, CancellationToken ct = default)
        {
            var rows = await _db.Orders
                .AsNoTracking()
                .Where(o => o.IsActive)
                .OrderByDescending(o => o.CreatedDate)
                .Take(count)
                .Select(o => new
                {
                    Dto = new DashboardOrderItemDto(
                        o.OrderId, o.OrderNo, o.Party, o.BrandName, o.Qty,
                        o.CurrentStatus, false, false,
                        o.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
                        o.UpdatedDate != null ? o.UpdatedDate.Value.ToString("yyyy-MM-dd HH:mm") : null),
                    o.CreatedDate,
                })
                .ToListAsync(ct);

            return await ApplyOverdueAsync(rows.Select(r => (r.Dto, r.CreatedDate)), ct);
        }

        public async Task<IReadOnlyList<DashboardOrderItemDto>> GetOrdersByStatusAsync(
            string status, int count, CancellationToken ct = default)
        {
            var rows = await _db.Orders
                .AsNoTracking()
                .Where(o => o.IsActive && o.CurrentStatus == status)
                .OrderByDescending(o => o.CreatedDate)
                .Take(count)
                .Select(o => new
                {
                    Dto = new DashboardOrderItemDto(
                        o.OrderId, o.OrderNo, o.Party, o.BrandName, o.Qty,
                        o.CurrentStatus, false, false,
                        o.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
                        o.UpdatedDate != null ? o.UpdatedDate.Value.ToString("yyyy-MM-dd HH:mm") : null),
                    o.CreatedDate,
                })
                .ToListAsync(ct);

            return await ApplyOverdueAsync(rows.Select(r => (r.Dto, r.CreatedDate)), ct);
        }

        public async Task<IReadOnlyList<DashboardOrderItemDto>> GetProductionRoleOrdersAsync(
            int count, CancellationToken ct = default)
        {
            // Same visibility rule as the Production role's Sales Order list:
            // 'Production Pending' orders, plus any order where PPMC has already
            // entered the Production Label Date even before status reaches that stage.
            var rows = await _db.Orders
                .AsNoTracking()
                .Where(o => o.IsActive
                         && (o.CurrentStatus == "Production Pending" || o.ProductionLabel != null))
                .OrderByDescending(o => o.CreatedDate)
                .Take(count)
                .Select(o => new
                {
                    Dto = new DashboardOrderItemDto(
                        o.OrderId, o.OrderNo, o.Party, o.BrandName, o.Qty,
                        o.CurrentStatus, false, false,
                        o.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
                        o.UpdatedDate != null ? o.UpdatedDate.Value.ToString("yyyy-MM-dd HH:mm") : null),
                    o.CreatedDate,
                })
                .ToListAsync(ct);

            return await ApplyOverdueAsync(rows.Select(r => (r.Dto, r.CreatedDate)), ct);
        }

        private async Task<IReadOnlyList<DashboardOrderItemDto>> ApplyOverdueAsync(
            IEnumerable<(DashboardOrderItemDto Dto, DateTime CreatedDate)> rows, CancellationToken ct)
        {
            var now   = DateTime.UtcNow;
            var rules = await GetOverdueRuleLookupAsync(ct);
            return rows
                .Select(r =>
                {
                    var (warningDays, overdueDays) = rules.TryGetValue(r.Dto.CurrentStatus, out var rule) ? rule : default;
                    return r.Dto with
                    {
                        IsOverdue = OrderOverdueRules.IsOverdue(overdueDays, r.CreatedDate, now),
                        IsDueSoon = OrderOverdueRules.IsDueSoon(warningDays, overdueDays, r.CreatedDate, now),
                    };
                })
                .ToList();
        }

        public async Task<DashboardPeriodQtyDto> GetPeriodQtyAsync(
            int month, int year, CancellationToken ct = default)
        {
            var periodOrders = _db.Orders
                .AsNoTracking()
                .Where(o => o.IsActive
                         && o.OrderDate.Month == month
                         && o.OrderDate.Year == year);

            var dispatchedQty = await periodOrders
                .Where(o => o.CurrentStatus == OrderStatus.Dispatched)
                .SumAsync(o => o.Qty ?? 0, ct);

            var activeQty = await periodOrders
                .Where(o => o.CurrentStatus != OrderStatus.Dispatched)
                .SumAsync(o => o.Qty ?? 0, ct);

            return new DashboardPeriodQtyDto(month, year, dispatchedQty, activeQty);
        }
    }
}
