-- Remove unique index on OrderNo to allow duplicate order numbers
DROP INDEX IF EXISTS [UX_Orders_OrderNo] ON [dbo].[Orders];
