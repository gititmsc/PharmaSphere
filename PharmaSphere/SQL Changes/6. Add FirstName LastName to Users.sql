-- ============================================================
-- Migration: Add FirstName and LastName columns to Users table
-- ============================================================

ALTER TABLE Users
    ADD FirstName VARCHAR(100) NULL,
        LastName  VARCHAR(100) NULL;
GO

-- Optional: update existing rows with placeholder values if needed
-- UPDATE Users SET FirstName = 'User', LastName = CAST(UserId AS VARCHAR) WHERE FirstName IS NULL;
