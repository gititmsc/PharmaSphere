-- Dispatch Pending: the Dispatch Date must not be more than 16 days after the
-- Filling Date, using WarningDays/OverdueDays (this status only needs one rule,
-- so the Secondary columns are left unused).
UPDATE [dbo].[OrderStatuses]
SET [WarningDays] = 11,
    [OverdueDays]  = 16
WHERE [StatusName] = 'Dispatch Pending';
