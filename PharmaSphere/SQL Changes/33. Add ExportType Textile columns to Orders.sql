-- Add ExportType, Textile columns to Orders table
ALTER TABLE [dbo].[Orders]
ADD [ExportType] NVARCHAR(20)  NULL,
    [Textile]    NVARCHAR(200) NULL;
