-- Add new columns to Orders table
ALTER TABLE [dbo].[Orders]
ADD [NeutralCode] NVARCHAR(500) NULL,
    [MRP]         DECIMAL(18, 2) NULL,
    [MonthBox]    NVARCHAR(200)  NULL,
    [Hologram]    NVARCHAR(200)  NULL;
