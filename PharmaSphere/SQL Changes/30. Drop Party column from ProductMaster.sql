-- ── Drop Party column from ProductMaster (run only if script 29 was executed) ─
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.ProductMaster') AND name = N'Party'
)
BEGIN
    ALTER TABLE [dbo].[ProductMaster] DROP COLUMN [Party];
    PRINT 'Party column dropped from ProductMaster.';
END
ELSE
    PRINT 'Party column does not exist — skipped.';
GO
