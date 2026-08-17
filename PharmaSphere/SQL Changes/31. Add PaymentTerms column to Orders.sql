-- Add PaymentTerms column to Orders table
ALTER TABLE [dbo].[Orders]
ADD [PaymentTerms] NVARCHAR(500) NULL;
