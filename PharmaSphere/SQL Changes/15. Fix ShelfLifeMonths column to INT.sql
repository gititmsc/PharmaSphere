
-- =============================================================================
-- 15. FIX ShelfLifeMonths COLUMN
--     The column may have been created as NVARCHAR instead of INT, allowing
--     free-text entry.  This script:
--       1. NULLs out any values that cannot be cast to an integer (e.g. text)
--       2. Converts decimal-looking values (e.g. '24.5') to their integer part
--       3. ALTERs the column to INT NULL
-- =============================================================================

-- ── Step 1: NULL out non-numeric / non-integer-castable values ───────────────
UPDATE Orders
SET    ShelfLifeMonths = NULL
WHERE  ShelfLifeMonths IS NOT NULL
  AND  TRY_CAST(ShelfLifeMonths AS INT) IS NULL;

PRINT CAST(@@ROWCOUNT AS VARCHAR) + ' row(s) with invalid text nulled out.';
GO

-- ── Step 2: Change column type to INT NULL ───────────────────────────────────
--     SQL Server will implicitly convert any remaining numeric strings to INT.
ALTER TABLE Orders
ALTER COLUMN ShelfLifeMonths INT NULL;

PRINT 'ShelfLifeMonths column altered to INT NULL.';
GO

-- ── Step 3: Verification ─────────────────────────────────────────────────────
SELECT
    OrderId,
    OrderNo,
    ShelfLifeMonths
FROM  Orders
ORDER BY OrderId;
GO
