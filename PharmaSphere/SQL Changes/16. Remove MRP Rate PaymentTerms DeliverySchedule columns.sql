
-- =============================================================================
-- 16. PERMANENTLY REMOVE MRP, Rate, PaymentTerms, DeliverySchedule
--     These columns are no longer used in the application.
--     Amount was already converted to a regular column in script 11, so
--     Rate has no computed-column dependency and can be dropped safely.
-- =============================================================================

ALTER TABLE Orders
DROP COLUMN MRP, Rate, PaymentTerms, DeliverySchedule;

PRINT 'Columns MRP, Rate, PaymentTerms, DeliverySchedule dropped from Orders.';
GO

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT c.name AS ColumnName, t.name AS DataType
FROM   sys.columns c
JOIN   sys.types   t ON t.user_type_id = c.user_type_id
WHERE  c.object_id = OBJECT_ID(N'dbo.Orders')
ORDER  BY c.column_id;
GO
