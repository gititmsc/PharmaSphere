-- Artwork Pending overdue rule: Designer must enter the Artwork Approval Date
-- (advancing the order to PM Supply Pending) within 7 days of Sales Order
-- creation, with a due-soon warning after 5 days.
UPDATE [dbo].[OrderStatuses]
SET [WarningDays] = 5,
    [OverdueDays]  = 7
WHERE [StatusName] = 'Artwork Pending';
