-- PM Supply Pending is a compound status with two sequential sub-rules:
--   1. Packing Material Order (5 vendor-approval dates) — measured from the Artwork
--      Approval date (when the order entered this status), using WarningDays/OverdueDays.
--   2. Packing Material Receive Schedule (5 production-receive dates) — measured from
--      the Packing Material Order Date, using SecondaryWarningDays/SecondaryOverdueDays.
-- Add the secondary pair for statuses that need a second sub-rule.
ALTER TABLE [dbo].[OrderStatuses]
ADD [SecondaryWarningDays] INT NULL,
    [SecondaryOverdueDays]  INT NULL;
GO

-- Packing Material Order: must be completed within 2 days of entering PM Supply
-- Pending (warn after 1 day). Packing Material Receive Schedule: must be completed
-- within 15 days of the Packing Material Order Date (warn after 11 days).
UPDATE [dbo].[OrderStatuses]
SET [WarningDays]          = 1,
    [OverdueDays]           = 2,
    [SecondaryWarningDays] = 11,
    [SecondaryOverdueDays]  = 15
WHERE [StatusName] = 'PM Supply Pending';
