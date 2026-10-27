-- Add Mother Box date columns to Orders table (Packing Material Order + Packing Material Receive Schedule sections)
ALTER TABLE [dbo].[Orders]
ADD [MotherBoxSupplyVendorApprovalDate] DATETIME NULL,
    [ProductionMotherBox]               DATETIME NULL;
