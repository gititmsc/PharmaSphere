namespace PharmaSphere.Core.Models
{
    /// <summary>
    /// Pure overdue/due-soon math, driven by the per-status <see cref="OrderStatusConfig.WarningDays"/>
    /// and <see cref="OrderStatusConfig.OverdueDays"/> columns (configurable in the OrderStatuses
    /// table) rather than hardcoded here — callers look up a status's day thresholds and pass them in.
    /// A status with no rule configured (both null) is never due-soon or overdue.
    /// </summary>
    public static class OrderOverdueRules
    {
        public static bool IsOverdue(int? overdueDays, DateTime createdDateUtc, DateTime nowUtc) =>
            overdueDays.HasValue && createdDateUtc.AddDays(overdueDays.Value) < nowUtc;

        /// <summary>
        /// True once the warning threshold has passed but the order isn't overdue yet —
        /// a heads-up so the user can act before the deadline is actually missed.
        /// </summary>
        public static bool IsDueSoon(int? warningDays, int? overdueDays, DateTime createdDateUtc, DateTime nowUtc) =>
            warningDays.HasValue
                && createdDateUtc.AddDays(warningDays.Value) < nowUtc
                && !IsOverdue(overdueDays, createdDateUtc, nowUtc);
    }
}
