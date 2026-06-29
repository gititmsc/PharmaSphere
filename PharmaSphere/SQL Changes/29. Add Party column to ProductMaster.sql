-- ── Add Party column to ProductMaster ────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.ProductMaster') AND name = N'Party'
)
BEGIN
    ALTER TABLE [dbo].[ProductMaster]
        ADD [Party] NVARCHAR(200) NULL;

    PRINT 'Party column added to ProductMaster.';
END
ELSE
    PRINT 'Party column already exists — skipped.';
GO
