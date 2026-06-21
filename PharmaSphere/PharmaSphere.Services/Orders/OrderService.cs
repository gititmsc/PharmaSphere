using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;
using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Orders
{
    public sealed class OrderService : IOrderService
    {
        private readonly IOrderRepository        _orders;
        private readonly ILookupRepository       _lookups;
        private readonly IOrderStatusRepository  _statuses;

        public OrderService(IOrderRepository orders, ILookupRepository lookups, IOrderStatusRepository statuses)
        {
            _orders   = orders;
            _lookups  = lookups;
            _statuses = statuses;
        }

        public Task<PagedResultDto<OrderListItemDto>> GetOrdersAsync(
            OrderListQueryDto query, CancellationToken ct = default)
            => _orders.GetPagedAsync(query, ct);

        public async Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, CancellationToken ct = default)
        {
            var o = await _orders.GetByIdAsync(orderId, ct);
            if (o is null) return null;
            return ToDetail(o);
        }

        public async Task<OrderDetailDto?> GetLatestByBrandNameAsync(string brandName, CancellationToken ct = default)
        {
            var o = await _orders.GetLatestByBrandNameAsync(brandName, ct);
            if (o is null) return null;
            return ToDetail(o);
        }

        public async Task<OrderListItemDto> CreateOrderAsync(
            CreateOrderRequestDto req, int userId, string userName, CancellationToken ct = default)
        {
            if (await _orders.OrderNoExistsAsync(req.OrderNo, null, ct))
                throw new InvalidOperationException($"Order number '{req.OrderNo}' already exists.");

            var initialStatus = await _statuses.GetInitialStatusNameAsync(ct) ?? "PIS Pending";
            var order = MapCreate(req, userId, userName, initialStatus);
            await _orders.AddAsync(order, ct);

            // Auto-add new party / brand name to lookup tables
            if (!string.IsNullOrWhiteSpace(req.Party))
                await _lookups.EnsurePartyExistsAsync(req.Party, ct);
            if (!string.IsNullOrWhiteSpace(req.BrandName))
                await _lookups.EnsureBrandNameExistsAsync(req.BrandName, ct);

            await _orders.AddStatusHistoryAsync(new OrderStatusHistory
            {
                OrderId         = order.OrderId,
                FromStatus      = null,
                ToStatus        = initialStatus,
                Remarks         = "Order created",
                ChangedBy       = userName,
                ChangedByUserId = userId,
                ChangedDate     = order.CreatedDate,
            }, ct);

            await _orders.AddAuditLogAsync(new OrderAuditLog
            {
                OrderId         = order.OrderId,
                Action          = AuditAction.Created,
                NewValue        = $"Order {order.OrderNo} created",
                ChangedBy       = userName,
                ChangedByUserId = userId,
                ChangedDate     = order.CreatedDate,
            }, ct);

            return ToListItem(order);
        }

        public async Task<OrderListItemDto> UpdateOrderAsync(
            int orderId, UpdateOrderRequestDto req, int userId, string userName, CancellationToken ct = default)
        {
            var order = await _orders.GetByIdAsync(orderId, ct)
                ?? throw new KeyNotFoundException($"Order {orderId} not found.");

            if (!order.IsActive)
                throw new InvalidOperationException("Cannot edit an inactive (deleted) order.");

            if (!string.Equals(order.OrderNo, req.OrderNo, StringComparison.OrdinalIgnoreCase))
                if (await _orders.OrderNoExistsAsync(req.OrderNo, orderId, ct))
                    throw new InvalidOperationException($"Order number '{req.OrderNo}' already exists.");

            var now = DateTime.UtcNow;

            void Track<T>(string field, T? oldVal, T? newVal)
            {
                if (Equals(oldVal, newVal)) return;
                _orders.AddAuditLogAsync(new OrderAuditLog
                {
                    OrderId         = orderId,
                    Action          = AuditAction.Updated,
                    FieldName       = field,
                    OldValue        = oldVal?.ToString(),
                    NewValue        = newVal?.ToString(),
                    ChangedBy       = userName,
                    ChangedByUserId = userId,
                    ChangedDate     = now,
                }, ct).GetAwaiter().GetResult();
            }

            // ── General Info ─────────────────────────────────────────────────────
            Track("Order No",          order.OrderNo,                          req.OrderNo);
            Track("Order Date",        order.OrderDate.ToString("yyyy-MM-dd"), req.OrderDate);
            Track("Party",             order.Party,                            req.Party);
            Track("Brand Name",        order.BrandName,                        req.BrandName);
            Track("Composition",       order.Composition,                      req.Composition);
            Track("Qty",               order.Qty,                              req.Qty);
            Track("Shelf Life (Mths)", order.ShelfLifeMonths,                  req.ShelfLifeMonths);
            Track("MRP",               order.MRP,                              req.MRP);
            Track("Rate",              order.Rate,                             req.Rate);
            Track("Amount",            order.Amount,                           req.Amount);
            Track("Make",              order.Make,                             req.Make);
            Track("Neutral Code",      order.NeutralCode,                      req.NeutralCode);
            Track("Admin Remarks",     order.AdminRemarks,                     req.AdminRemarks);
            Track("Other Remarks",     order.OtherRemarks,                     req.OtherRemarks);

            // ── Packaging Material ────────────────────────────────────────────────
            Track("Vial",              order.Vial,             req.Vial);
            Track("Seal Colour",       order.SealColour,       req.SealColour);
            Track("WFI",               order.WFI,              req.WFI);
            Track("Label",             order.Label,            req.Label);
            Track("Mono Box",          order.MonoBox,          req.MonoBox);
            Track("Month Box",         order.MonthBox,         req.MonthBox);
            Track("Tray",              order.Tray,             req.Tray);
            Track("Leaflet",           order.Leaflet,          req.Leaflet);
            Track("Syringe & Needle",  order.SyringeAndNeedle, req.SyringeAndNeedle);
            Track("Shrink",            order.Shrink,           req.Shrink);
            Track("Shipper",           order.Shipper,          req.Shipper);
            Track("Hologram",          order.Hologram,         req.Hologram);

            // ── QA Information ────────────────────────────────────────────────────
            Track("PIS Approval Date",              order.PISApprovalDate?.ToString("yyyy-MM-dd"),                 req.PISApprovalDate);
            Track("Artwork Approval Date",           order.SanoletPartyArtworkApprovalDate?.ToString("yyyy-MM-dd"), req.SanoletPartyArtworkApprovalDate);
            Track("MonoBox Vendor Approval",        order.MonoBoxSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"), req.MonoBoxSupplyVendorApprovalDate);
            Track("Label Vendor Approval",          order.LabelSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),   req.LabelSupplyVendorApprovalDate);
            Track("Insert Vendor Approval",         order.InsertSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),  req.InsertSupplyVendorApprovalDate);
            Track("Tray Vendor Approval",           order.TraySupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),    req.TraySupplyVendorApprovalDate);
            Track("Shipper Vendor Approval",        order.ShipperSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"), req.ShipperSupplyVendorApprovalDate);

            // ── Production Info ───────────────────────────────────────────────────
            Track("Production Mono Box", order.ProductionMonoBox?.ToString("yyyy-MM-dd"), req.ProductionMonoBox);
            Track("Production Label",    order.ProductionLabel?.ToString("yyyy-MM-dd"),   req.ProductionLabel);
            Track("Production Insert",   order.ProductionInsert?.ToString("yyyy-MM-dd"),  req.ProductionInsert);
            Track("Production Tray",     order.ProductionTray?.ToString("yyyy-MM-dd"),    req.ProductionTray);
            Track("Production Shipper",  order.ProductionShipper?.ToString("yyyy-MM-dd"), req.ProductionShipper);
            Track("Filling Plan",        order.FillingPlan?.ToString("yyyy-MM-dd"),   req.FillingPlan);
            Track("Packing Plan",        order.PackingPlan?.ToString("yyyy-MM-dd"),   req.PackingPlan);
            Track("Sterility 14 Days",   order.Sterility14DaysDate?.ToString("yyyy-MM-dd"), req.Sterility14DaysDate);
            Track("Dispatch Date",       order.DispatchDate?.ToString("yyyy-MM-dd"),  req.DispatchDate);

            MapUpdate(order, req);
            order.UpdatedBy       = userName;
            order.UpdatedByUserId = userId;
            order.UpdatedDate     = now;

            // Auto-advance status based on completed fields (only forward, never touch Cancelled)
            var statusBeforeUpdate = order.CurrentStatus;
            string? autoAdvancedTo = null;
            if (order.CurrentStatus != OrderStatus.Cancelled)
            {
                var targetStatus = ComputeTargetStatus(order);
                if (WorkflowIndex(targetStatus) > WorkflowIndex(order.CurrentStatus))
                {
                    autoAdvancedTo      = targetStatus;
                    order.CurrentStatus = targetStatus;
                }
            }

            await _orders.SaveChangesAsync(ct);

            // Auto-add new party / brand name to lookup tables
            if (!string.IsNullOrWhiteSpace(req.Party))
                await _lookups.EnsurePartyExistsAsync(req.Party, ct);
            if (!string.IsNullOrWhiteSpace(req.BrandName))
                await _lookups.EnsureBrandNameExistsAsync(req.BrandName, ct);

            // Record the auto-status advance in history + audit log
            if (autoAdvancedTo != null)
            {
                await _orders.AddStatusHistoryAsync(new OrderStatusHistory
                {
                    OrderId         = orderId,
                    FromStatus      = statusBeforeUpdate,
                    ToStatus        = autoAdvancedTo,
                    Remarks         = "Status auto-updated by system",
                    ChangedBy       = userName,
                    ChangedByUserId = userId,
                    ChangedDate     = now,
                }, ct);
                await _orders.AddAuditLogAsync(new OrderAuditLog
                {
                    OrderId         = orderId,
                    Action          = AuditAction.StatusChanged,
                    FieldName       = "CurrentStatus",
                    OldValue        = statusBeforeUpdate,
                    NewValue        = autoAdvancedTo,
                    ChangedBy       = userName,
                    ChangedByUserId = userId,
                    ChangedDate     = now,
                }, ct);
            }

            return ToListItem(order);
        }

        public async Task DeleteOrderAsync(
            int orderId, int userId, string userName, CancellationToken ct = default)
        {
            var order = await _orders.GetByIdAsync(orderId, ct)
                ?? throw new KeyNotFoundException($"Order {orderId} not found.");

            if (!order.IsActive)
                throw new InvalidOperationException("Order is already deleted.");

            order.IsActive        = false;
            order.UpdatedBy       = userName;
            order.UpdatedByUserId = userId;
            order.UpdatedDate     = DateTime.UtcNow;

            await _orders.SaveChangesAsync(ct);

            await _orders.AddAuditLogAsync(new OrderAuditLog
            {
                OrderId         = orderId,
                Action          = AuditAction.Deleted,
                NewValue        = "Order soft-deleted (IsActive=0)",
                ChangedBy       = userName,
                ChangedByUserId = userId,
                ChangedDate     = order.UpdatedDate.Value,
            }, ct);
        }

        public async Task RestoreOrderAsync(
            int orderId, int userId, string userName, CancellationToken ct = default)
        {
            var order = await _orders.GetByIdAsync(orderId, ct)
                ?? throw new KeyNotFoundException($"Order {orderId} not found.");

            if (order.IsActive)
                throw new InvalidOperationException("Order is already active.");

            order.IsActive        = true;
            order.UpdatedBy       = userName;
            order.UpdatedByUserId = userId;
            order.UpdatedDate     = DateTime.UtcNow;

            await _orders.SaveChangesAsync(ct);

            await _orders.AddAuditLogAsync(new OrderAuditLog
            {
                OrderId         = orderId,
                Action          = AuditAction.Restored,
                NewValue        = "Order restored (IsActive=1)",
                ChangedBy       = userName,
                ChangedByUserId = userId,
                ChangedDate     = order.UpdatedDate.Value,
            }, ct);
        }

        public async Task ChangeStatusAsync(
            int orderId, ChangeStatusRequestDto req, int userId, string userName, CancellationToken ct = default)
        {
            var order = await _orders.GetByIdAsync(orderId, ct)
                ?? throw new KeyNotFoundException($"Order {orderId} not found.");

            if (!order.IsActive)
                throw new InvalidOperationException("Cannot change status of an inactive order.");

            var allowed = await _statuses.GetAllowedNextAsync(order.CurrentStatus, ct);
            if (!allowed.Contains(req.NewStatus))
                throw new InvalidOperationException(
                    $"Transition from '{order.CurrentStatus}' to '{req.NewStatus}' is not allowed.");

            var oldStatus         = order.CurrentStatus;
            order.CurrentStatus   = req.NewStatus;
            order.UpdatedBy       = userName;
            order.UpdatedByUserId = userId;
            order.UpdatedDate     = DateTime.UtcNow;

            if (req.NewStatus == OrderStatus.Dispatched && order.DispatchDate is null)
                order.DispatchDate = DateOnly.FromDateTime(DateTime.UtcNow).ToDateTime(TimeOnly.MinValue);

            await _orders.SaveChangesAsync(ct);

            await _orders.AddStatusHistoryAsync(new OrderStatusHistory
            {
                OrderId         = orderId,
                FromStatus      = oldStatus,
                ToStatus        = req.NewStatus,
                Remarks         = req.Remarks,
                ChangedBy       = userName,
                ChangedByUserId = userId,
                ChangedDate     = order.UpdatedDate.Value,
            }, ct);

            await _orders.AddAuditLogAsync(new OrderAuditLog
            {
                OrderId         = orderId,
                Action          = AuditAction.StatusChanged,
                FieldName       = "CurrentStatus",
                OldValue        = oldStatus,
                NewValue        = req.NewStatus,
                ChangedBy       = userName,
                ChangedByUserId = userId,
                ChangedDate     = order.UpdatedDate.Value,
            }, ct);
        }

        public Task<IReadOnlyList<string>> GetSealColorsAsync(CancellationToken ct = default)
            => _orders.GetSealColorsAsync(ct);

        public async Task<AdminDashboardDto> GetAdminDashboardAsync(CancellationToken ct = default)
        {
            var statusConfigs = await _statuses.GetAllActiveAsync(ct);
            var counts        = await _orders.GetStatusCountsAsync(ct);
            var recent        = await _orders.GetRecentOrdersAsync(10, ct);

            var pipeline = statusConfigs
                .Where(s => s.ShowInFlow)
                .OrderBy(s => s.DisplayOrder)
                .Select(s => new DashboardStatusCountDto(
                    s.StatusName,
                    counts.TryGetValue(s.StatusName, out var c) ? c : 0,
                    s.Color))
                .ToList();

            var totalDispatched = counts.TryGetValue(OrderStatus.Dispatched, out var d) ? d : 0;
            var totalCancelled  = counts.TryGetValue(OrderStatus.Cancelled,  out var cc) ? cc : 0;
            var totalActive     = counts.Values.Sum() - totalDispatched - totalCancelled;
            var totalOrders     = counts.Values.Sum();

            return new AdminDashboardDto(totalOrders, totalActive, totalDispatched, totalCancelled, pipeline, recent);
        }

        public async Task<RoleDashboardDto> GetRoleDashboardAsync(string status, CancellationToken ct = default)
        {
            var orders  = await _orders.GetOrdersByStatusAsync(status, 50, ct);
            var pending = orders.Count;
            return new RoleDashboardDto(status, pending, orders);
        }

        // ── Mapping helpers ───────────────────────────────────────────────────────

        private static Order MapCreate(CreateOrderRequestDto r, int userId, string userName, string initialStatus)
        {
            var now = DateTime.UtcNow;
            return new Order
            {
                OrderNo               = r.OrderNo.Trim(),
                OrderDate             = ParseDate(r.OrderDate),
                Party                 = Blank(r.Party),
                BrandName             = Blank(r.BrandName),
                Composition           = Blank(r.Composition),
                Qty                   = r.Qty,
                ShelfLifeMonths       = Blank(r.ShelfLifeMonths),
                MRP                   = r.MRP,
                Rate                  = r.Rate,
                Amount                = r.Amount,
                Make                  = Blank(r.Make),
                NeutralCode           = Blank(r.NeutralCode),
                AdminRemarks          = Blank(r.AdminRemarks),
                Vial                  = Blank(r.Vial),
                SealColour            = Blank(r.SealColour),
                WFI                   = Blank(r.WFI),
                Label                 = Blank(r.Label),
                MonoBox               = Blank(r.MonoBox),
                MonthBox              = Blank(r.MonthBox),
                Tray                  = Blank(r.Tray),
                Leaflet               = Blank(r.Leaflet),
                SyringeAndNeedle      = Blank(r.SyringeAndNeedle),
                Shrink                = Blank(r.Shrink),
                Shipper               = Blank(r.Shipper),
                Hologram              = Blank(r.Hologram),
                OtherRemarks          = Blank(r.OtherRemarks),
                PISApprovalDate                 = ParseDateOpt(r.PISApprovalDate),
                SanoletPartyArtworkApprovalDate = ParseDateOpt(r.SanoletPartyArtworkApprovalDate),
                MonoBoxSupplyVendorApprovalDate = ParseDateOpt(r.MonoBoxSupplyVendorApprovalDate),
                LabelSupplyVendorApprovalDate   = ParseDateOpt(r.LabelSupplyVendorApprovalDate),
                InsertSupplyVendorApprovalDate  = ParseDateOpt(r.InsertSupplyVendorApprovalDate),
                TraySupplyVendorApprovalDate    = ParseDateOpt(r.TraySupplyVendorApprovalDate),
                ShipperSupplyVendorApprovalDate = ParseDateOpt(r.ShipperSupplyVendorApprovalDate),
                ProductionMonoBox     = ParseDateOpt(r.ProductionMonoBox),
                ProductionLabel       = ParseDateOpt(r.ProductionLabel),
                ProductionInsert      = ParseDateOpt(r.ProductionInsert),
                ProductionTray        = ParseDateOpt(r.ProductionTray),
                ProductionShipper     = ParseDateOpt(r.ProductionShipper),
                FillingPlan           = ParseDateOpt(r.FillingPlan),
                PackingPlan           = ParseDateOpt(r.PackingPlan),
                Sterility14DaysDate   = ParseDateOpt(r.Sterility14DaysDate),
                DispatchDate          = ParseDateOpt(r.DispatchDate),
                CurrentStatus         = initialStatus,
                CreatedBy             = userName,
                CreatedByUserId       = userId,
                CreatedDate           = now,
                IsActive              = true,
            };
        }

        private static void MapUpdate(Order o, UpdateOrderRequestDto r)
        {
            o.OrderNo               = r.OrderNo.Trim();
            o.OrderDate             = ParseDate(r.OrderDate);
            o.Party                 = Blank(r.Party);
            o.BrandName             = Blank(r.BrandName);
            o.Composition           = Blank(r.Composition);
            o.Qty                   = r.Qty;
            o.ShelfLifeMonths       = Blank(r.ShelfLifeMonths);
            o.MRP                   = r.MRP;
            o.Rate                  = r.Rate;
            o.Amount                = r.Amount;
            o.Make                  = Blank(r.Make);
            o.NeutralCode           = Blank(r.NeutralCode);
            o.AdminRemarks          = Blank(r.AdminRemarks);
            o.Vial                  = Blank(r.Vial);
            o.SealColour            = Blank(r.SealColour);
            o.WFI                   = Blank(r.WFI);
            o.Label                 = Blank(r.Label);
            o.MonoBox               = Blank(r.MonoBox);
            o.MonthBox              = Blank(r.MonthBox);
            o.Tray                  = Blank(r.Tray);
            o.Leaflet               = Blank(r.Leaflet);
            o.SyringeAndNeedle      = Blank(r.SyringeAndNeedle);
            o.Shrink                = Blank(r.Shrink);
            o.Shipper               = Blank(r.Shipper);
            o.Hologram              = Blank(r.Hologram);
            o.OtherRemarks          = Blank(r.OtherRemarks);
            o.PISApprovalDate                 = ParseDateOpt(r.PISApprovalDate);
            o.SanoletPartyArtworkApprovalDate = ParseDateOpt(r.SanoletPartyArtworkApprovalDate);
            o.MonoBoxSupplyVendorApprovalDate = ParseDateOpt(r.MonoBoxSupplyVendorApprovalDate);
            o.LabelSupplyVendorApprovalDate   = ParseDateOpt(r.LabelSupplyVendorApprovalDate);
            o.InsertSupplyVendorApprovalDate  = ParseDateOpt(r.InsertSupplyVendorApprovalDate);
            o.TraySupplyVendorApprovalDate    = ParseDateOpt(r.TraySupplyVendorApprovalDate);
            o.ShipperSupplyVendorApprovalDate = ParseDateOpt(r.ShipperSupplyVendorApprovalDate);
            o.ProductionMonoBox     = ParseDateOpt(r.ProductionMonoBox);
            o.ProductionLabel       = ParseDateOpt(r.ProductionLabel);
            o.ProductionInsert      = ParseDateOpt(r.ProductionInsert);
            o.ProductionTray        = ParseDateOpt(r.ProductionTray);
            o.ProductionShipper     = ParseDateOpt(r.ProductionShipper);
            o.FillingPlan           = ParseDateOpt(r.FillingPlan);
            o.PackingPlan           = ParseDateOpt(r.PackingPlan);
            o.Sterility14DaysDate   = ParseDateOpt(r.Sterility14DaysDate);
            o.DispatchDate          = ParseDateOpt(r.DispatchDate);
        }

        private static OrderDetailDto ToDetail(Order o) => new(
            o.OrderId,
            o.OrderNo,
            o.OrderDate.ToString("yyyy-MM-dd"),
            o.Party,
            o.BrandName,
            o.Composition,
            o.Qty,
            o.ShelfLifeMonths,
            o.MRP,
            o.Rate,
            o.Amount,
            o.Make,
            o.NeutralCode,
            o.AdminRemarks,
            o.Vial,
            o.SealColour,
            o.WFI,
            o.Label,
            o.MonoBox,
            o.MonthBox,
            o.Tray,
            o.Leaflet,
            o.SyringeAndNeedle,
            o.Shrink,
            o.Shipper,
            o.Hologram,
            o.OtherRemarks,
            o.PISApprovalDate?.ToString("yyyy-MM-dd"),
            o.SanoletPartyArtworkApprovalDate?.ToString("yyyy-MM-dd"),
            o.MonoBoxSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),
            o.LabelSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),
            o.InsertSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),
            o.TraySupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),
            o.ShipperSupplyVendorApprovalDate?.ToString("yyyy-MM-dd"),
            o.ProductionMonoBox?.ToString("yyyy-MM-dd"),
            o.ProductionLabel?.ToString("yyyy-MM-dd"),
            o.ProductionInsert?.ToString("yyyy-MM-dd"),
            o.ProductionTray?.ToString("yyyy-MM-dd"),
            o.ProductionShipper?.ToString("yyyy-MM-dd"),
            o.FillingPlan?.ToString("yyyy-MM-dd"),
            o.PackingPlan?.ToString("yyyy-MM-dd"),
            o.Sterility14DaysDate?.ToString("yyyy-MM-dd"),
            o.DispatchDate?.ToString("yyyy-MM-dd"),
            o.CurrentStatus,
            o.CreatedBy,
            o.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
            o.UpdatedBy,
            o.UpdatedDate?.ToString("yyyy-MM-dd HH:mm"),
            o.IsActive,
            o.StatusHistory.OrderByDescending(h => h.ChangedDate)
                .Select(h => new OrderStatusHistoryDto(
                    h.HistoryId, h.FromStatus, h.ToStatus, h.Remarks,
                    h.ChangedBy, h.ChangedDate.ToString("yyyy-MM-dd HH:mm")))
                .ToList(),
            o.AuditLogs.OrderByDescending(a => a.ChangedDate)
                .Select(a => new OrderAuditLogDto(
                    a.AuditLogId, a.Action, a.FieldName, a.OldValue, a.NewValue,
                    a.ChangedBy, a.ChangedDate.ToString("yyyy-MM-dd HH:mm")))
                .ToList());

        private static OrderListItemDto ToListItem(Order o) => new(
            o.OrderId,
            o.OrderNo,
            o.OrderDate.ToString("yyyy-MM-dd"),
            o.Party,
            o.BrandName,
            o.Qty,
            o.Amount,
            o.CurrentStatus,
            o.CreatedBy,
            o.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
            o.UpdatedDate?.ToString("yyyy-MM-dd HH:mm"),
            o.IsActive);

        private static DateTime ParseDate(string? s) =>
            DateTime.TryParse(s, out var d) ? d : DateTime.UtcNow;

        private static DateTime? ParseDateOpt(string? s) =>
            string.IsNullOrWhiteSpace(s) ? null :
            DateTime.TryParse(s, out var d) ? d : null;

        private static string? Blank(string? s) =>
            string.IsNullOrWhiteSpace(s) ? null : s.Trim();

        // ── Auto-status workflow ──────────────────────────────────────────────────

        private static readonly string[] WorkflowOrder =
        {
            "PIS Pending", "Artwork Pending", "PM Supply Pending",
            "Production Pending", "Packing Pending", "Dispatch Pending",
            OrderStatus.Dispatched,
        };

        private static int WorkflowIndex(string status) => Array.IndexOf(WorkflowOrder, status);

        private static string ComputeTargetStatus(Order o)
        {
            var pisApproved     = o.PISApprovalDate.HasValue;
            var artworkApproved = o.SanoletPartyArtworkApprovalDate.HasValue;
            var allPMFilled     = o.MonoBoxSupplyVendorApprovalDate.HasValue
                               && o.LabelSupplyVendorApprovalDate.HasValue
                               && o.InsertSupplyVendorApprovalDate.HasValue
                               && o.TraySupplyVendorApprovalDate.HasValue
                               && o.ShipperSupplyVendorApprovalDate.HasValue
                               && o.ProductionMonoBox.HasValue
                               && o.ProductionLabel.HasValue
                               && o.ProductionInsert.HasValue
                               && o.ProductionTray.HasValue
                               && o.ProductionShipper.HasValue;
            var fillingDone  = o.FillingPlan.HasValue;
            var packingDone  = o.PackingPlan.HasValue;
            var dispatchDone = o.DispatchDate.HasValue;

            if (dispatchDone && packingDone && fillingDone && allPMFilled && artworkApproved && pisApproved)
                return OrderStatus.Dispatched;
            if (packingDone  && fillingDone && allPMFilled && artworkApproved && pisApproved)
                return "Dispatch Pending";
            if (fillingDone  && allPMFilled && artworkApproved && pisApproved)
                return "Packing Pending";
            if (allPMFilled  && artworkApproved && pisApproved)
                return "Production Pending";
            if (artworkApproved && pisApproved)
                return "PM Supply Pending";
            if (pisApproved)
                return "Artwork Pending";
            return "PIS Pending";
        }
    }
}
