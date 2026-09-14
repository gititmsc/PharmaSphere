-- Production Pending is a compound status with two sequential sub-rules:
--   1. Filling Date — must be entered within 3 days of the order entering this status
--      (approximated as the latest of the 5 Packing Material Receive dates, since all 5
--      must be filled to reach here), using WarningDays/OverdueDays.
--   2. Sterility Date — must not be more than 16 days after the Filling Date, using
--      SecondaryWarningDays/SecondaryOverdueDays.
UPDATE [dbo].[OrderStatuses]
SET [WarningDays]           = 2,
    [OverdueDays]            = 3,
    [SecondaryWarningDays]  = 11,
    [SecondaryOverdueDays]   = 16
WHERE [StatusName] = 'Production Pending';
