-- Add Rate column to Orders table
ALTER TABLE [dbo].[Orders]
ADD [Rate] DECIMAL(18, 2) NULL;
