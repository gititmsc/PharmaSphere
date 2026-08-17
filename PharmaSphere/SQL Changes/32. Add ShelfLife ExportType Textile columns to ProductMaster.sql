-- Add ShelfLife, ExportType, Textile columns to ProductMaster table
ALTER TABLE [dbo].[ProductMaster]
ADD [ShelfLife]  NVARCHAR(200) NULL,
    [ExportType] NVARCHAR(20)  NULL,
    [Textile]    NVARCHAR(200) NULL;
