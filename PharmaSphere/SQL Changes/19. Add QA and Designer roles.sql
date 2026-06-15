-- Add QA and Designer roles.
-- Run once against the live database.

SET IDENTITY_INSERT dbo.Role ON;

IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RoleId = 6)
    INSERT INTO dbo.Role (RoleId, RoleName) VALUES (6, 'QA');

IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RoleId = 7)
    INSERT INTO dbo.Role (RoleId, RoleName) VALUES (7, 'Designer');

SET IDENTITY_INSERT dbo.Role OFF;
