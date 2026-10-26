using System.Linq;

namespace PharmaSphere.Core.Models
{
    /// <summary>
    /// Per-status overdue/due-soon day thresholds, configured in the OrderStatuses table
    /// (WarningDays/OverdueDays, plus SecondaryWarningDays/SecondaryOverdueDays for statuses
    /// with two sequential sub-rules) rather than hardcoded here.
    /// </summary>
    public readonly record struct StatusOverdueRule(
        int? WarningDays, int? OverdueDays, int? SecondaryWarningDays, int? SecondaryOverdueDays);

    /// <summary>
    /// The order fields needed to evaluate any status's overdue/due-soon rule — including the
    /// compound PM Supply Pending and Production Pending cases, which need more than CreatedDate.
    /// </summary>
    public sealed record OrderOverdueContext(
        string CurrentStatus,
        DateTime CreatedDateUtc,
        DateTime? ArtworkApprovalDate,
        bool PackingMaterialOrderComplete,
        DateTime? PackingMaterialOrderDate,
        bool PackingMaterialReceiveComplete,
        DateTime? ProductionMonoBoxDate,
        DateTime? ProductionLabelDate,
        DateTime? ProductionInsertDate,
        bool ProductionTrayNotApplicable,
        DateTime? ProductionTrayDate,
        DateTime? ProductionShipperDate,
        DateTime? FillingDate,
        bool SterilityDone);

    /// <summary>
    /// Pure overdue/due-soon math. A status with no rule configured (WarningDays/OverdueDays
    /// both null) is never due-soon or overdue.
    /// </summary>
    public static class OrderOverdueRules
    {
        public const string PMSupplyPendingStatus   = "PM Supply Pending";
        public const string ProductionPendingStatus = "Production Pending";
        public const string DispatchPendingStatus   = "Dispatch Pending";

        public static bool IsOverdue(int? overdueDays, DateTime referenceDateUtc, DateTime nowUtc) =>
            overdueDays.HasValue && referenceDateUtc.AddDays(overdueDays.Value) < nowUtc;

        /// <summary>
        /// True once the warning threshold has passed but the order isn't overdue yet —
        /// a heads-up so the user can act before the deadline is actually missed.
        /// </summary>
        public static bool IsDueSoon(int? warningDays, int? overdueDays, DateTime referenceDateUtc, DateTime nowUtc) =>
            warningDays.HasValue
                && referenceDateUtc.AddDays(warningDays.Value) < nowUtc
                && !IsOverdue(overdueDays, referenceDateUtc, nowUtc);

        private static (bool IsOverdue, bool IsDueSoon) EvaluateSingle(
            int? warningDays, int? overdueDays, DateTime referenceDateUtc, DateTime nowUtc)
        {
            var overdue = IsOverdue(overdueDays, referenceDateUtc, nowUtc);
            var dueSoon = !overdue && IsDueSoon(warningDays, overdueDays, referenceDateUtc, nowUtc);
            return (overdue, dueSoon);
        }

        /// <summary>
        /// Evaluates a status's rule against an order. Most statuses are a single deadline
        /// measured from Order.CreatedDate. Two statuses are compound, with two sequential
        /// sub-rules — only the sub-rule for the section that's still incomplete applies;
        /// once both sections are done the order should already have advanced past that status.
        ///
        /// PM Supply Pending:
        ///   1. Packing Material Order (the 5 vendor-approval dates) — measured from the
        ///      Artwork Approval date (when the order entered this status), using the
        ///      primary WarningDays/OverdueDays.
        ///   2. Packing Material Receive Schedule (the 5 production-receive dates) — measured
        ///      from the Packing Material Order Date, using SecondaryWarningDays/OverdueDays.
        ///
        /// Production Pending:
        ///   1. Filling Date — measured from when the order entered this status (approximated
        ///      as the latest of the 5 Packing Material Receive dates, since all 5 must be
        ///      filled to reach here), using the primary WarningDays/OverdueDays.
        ///   2. Sterility Date — measured from the Filling Date, using
        ///      SecondaryWarningDays/OverdueDays.
        ///
        /// Dispatch Pending (single rule):
        ///   Dispatch Date — measured from the Filling Date, using the primary
        ///   WarningDays/OverdueDays.
        /// </summary>
        public static (bool IsOverdue, bool IsDueSoon) Evaluate(
            OrderOverdueContext ctx, StatusOverdueRule? rule, DateTime nowUtc)
        {
            if (rule is not { } r) return (false, false);

            if (ctx.CurrentStatus == PMSupplyPendingStatus)
            {
                if (!ctx.PackingMaterialOrderComplete)
                    return ctx.ArtworkApprovalDate is { } artworkDate
                        ? EvaluateSingle(r.WarningDays, r.OverdueDays, artworkDate, nowUtc)
                        : (false, false);

                if (!ctx.PackingMaterialReceiveComplete)
                    return ctx.PackingMaterialOrderDate is { } orderDate
                        ? EvaluateSingle(r.SecondaryWarningDays, r.SecondaryOverdueDays, orderDate, nowUtc)
                        : (false, false);

                return (false, false);
            }

            if (ctx.CurrentStatus == ProductionPendingStatus)
            {
                if (ctx.FillingDate is null)
                {
                    DateTime?[] receiveDates =
                        { ctx.ProductionMonoBoxDate, ctx.ProductionLabelDate, ctx.ProductionInsertDate,
                          ctx.ProductionShipperDate };
                    if (receiveDates.Any(d => d is null)) return (false, false);
                    if (!ctx.ProductionTrayNotApplicable && ctx.ProductionTrayDate is null) return (false, false);
                    receiveDates = ctx.ProductionTrayNotApplicable
                        ? receiveDates
                        : receiveDates.Append(ctx.ProductionTrayDate).ToArray();
                    var enteredDate = receiveDates.Max()!.Value;
                    return EvaluateSingle(r.WarningDays, r.OverdueDays, enteredDate, nowUtc);
                }

                if (!ctx.SterilityDone)
                    return EvaluateSingle(r.SecondaryWarningDays, r.SecondaryOverdueDays, ctx.FillingDate.Value, nowUtc);

                return (false, false);
            }

            if (ctx.CurrentStatus == DispatchPendingStatus)
                return ctx.FillingDate is { } dispatchRefDate
                    ? EvaluateSingle(r.WarningDays, r.OverdueDays, dispatchRefDate, nowUtc)
                    : (false, false);

            return EvaluateSingle(r.WarningDays, r.OverdueDays, ctx.CreatedDateUtc, nowUtc);
        }
    }
}
