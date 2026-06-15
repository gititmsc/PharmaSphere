-- Replace old sales order statuses with the new status set.
-- Run once against the live database before deploying the updated backend.

-- ── Orders table ─────────────────────────────────────────────────────────────
UPDATE Orders SET CurrentStatus = 'PIS Pending'        WHERE CurrentStatus = 'Created';
UPDATE Orders SET CurrentStatus = 'PM Supply Pending'  WHERE CurrentStatus = 'QA Pending';
-- 'Artwork Pending', 'Production Pending', 'Dispatched', 'Cancelled' are unchanged.

-- ── OrderStatusHistory table ──────────────────────────────────────────────────
UPDATE OrderStatusHistory SET FromStatus = 'PIS Pending'       WHERE FromStatus = 'Created';
UPDATE OrderStatusHistory SET ToStatus   = 'PIS Pending'       WHERE ToStatus   = 'Created';
UPDATE OrderStatusHistory SET FromStatus = 'PM Supply Pending' WHERE FromStatus = 'QA Pending';
UPDATE OrderStatusHistory SET ToStatus   = 'PM Supply Pending' WHERE ToStatus   = 'QA Pending';

-- ── OrderAuditLogs table ──────────────────────────────────────────────────────
UPDATE OrderAuditLogs SET OldValue = 'PIS Pending'       WHERE FieldName = 'CurrentStatus' AND OldValue = 'Created';
UPDATE OrderAuditLogs SET NewValue = 'PIS Pending'       WHERE FieldName = 'CurrentStatus' AND NewValue = 'Created';
UPDATE OrderAuditLogs SET OldValue = 'PM Supply Pending' WHERE FieldName = 'CurrentStatus' AND OldValue = 'QA Pending';
UPDATE OrderAuditLogs SET NewValue = 'PM Supply Pending' WHERE FieldName = 'CurrentStatus' AND NewValue = 'QA Pending';
