
-- =============================================================================
-- 15. CHANGE ShelfLifeMonths TO NVARCHAR(200)
--     The column was originally created as INT but the actual data is free-text
--     (e.g. "Advait medicare"), so it must be a varchar column.
--     This script safely converts INT → NVARCHAR(200) (existing numeric values
--     are preserved as their string representations) or leaves the column
--     unchanged if it is already a compatible string type.
-- =============================================================================

ALTER TABLE Orders
ALTER COLUMN ShelfLifeMonths NVARCHAR(200) NULL;

PRINT 'ShelfLifeMonths column changed to NVARCHAR(200) NULL.';
GO

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT
    c.name              AS ColumnName,
    t.name              AS DataType,
    c.max_length        AS MaxLength,
    c.is_nullable       AS IsNullable
FROM  sys.columns c
JOIN  sys.types   t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID(N'dbo.Orders')
  AND c.name      = N'ShelfLifeMonths';
GO
