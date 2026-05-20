-- ============================================================
-- Convert Amount from computed/persisted column to regular column
-- so it can be set independently from Qty * Rate.
-- ============================================================

-- Drop the computed column
ALTER TABLE Orders DROP COLUMN Amount;
GO

-- Re-add as a regular nullable decimal column
ALTER TABLE Orders ADD Amount DECIMAL(18,2) NULL;
GO

-- Backfill existing rows with Qty * Rate
UPDATE Orders
SET Amount = CAST(ISNULL(Qty, 0) AS DECIMAL(18,2)) * ISNULL(Rate, 0)
WHERE Qty IS NOT NULL OR Rate IS NOT NULL;
GO
