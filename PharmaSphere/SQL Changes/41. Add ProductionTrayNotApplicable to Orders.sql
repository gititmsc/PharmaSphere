-- Add Not Applicable toggle column to Orders table for Production Tray Date (Packaging Material tab)
ALTER TABLE [dbo].[Orders]
ADD [ProductionTrayNotApplicable] BIT NOT NULL CONSTRAINT [DF_Orders_ProductionTrayNotApplicable] DEFAULT (0);
