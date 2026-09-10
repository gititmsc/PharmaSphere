-- Make the overdue/due-soon deadlines (currently hardcoded per status) configurable.
-- WarningDays / OverdueDays are days from Order.CreatedDate (UTC). NULL means no
-- rule is defined for that status yet.
ALTER TABLE [dbo].[OrderStatuses]
ADD [WarningDays] INT NULL,
    [OverdueDays]  INT NULL;
GO

-- Seed the existing PIS Pending rule (5-day warning, 7-day overdue) so behavior
-- is unchanged after this migration. Adjust these values directly here in future
-- to change the deadline — no code change or deploy needed.
UPDATE [dbo].[OrderStatuses]
SET [WarningDays] = 5,
    [OverdueDays]  = 7
WHERE [StatusName] = 'PIS Pending';
