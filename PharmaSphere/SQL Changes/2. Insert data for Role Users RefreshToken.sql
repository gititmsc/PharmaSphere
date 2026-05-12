
-- =============================================================================
-- 5. SAMPLE DATA — Role
--    Four standard pharmacy application roles.
-- =============================================================================

SET IDENTITY_INSERT dbo.Role ON;

MERGE dbo.Role AS target
USING (VALUES
    (1, 'Administrator'),
    (2, 'Pharmacist'),
    (3, 'Technician'),
    (4, 'Viewer')
) AS source (RoleId, RoleName)
ON target.RoleId = source.RoleId
WHEN NOT MATCHED THEN
    INSERT (RoleId, RoleName) VALUES (source.RoleId, source.RoleName);

SET IDENTITY_INSERT dbo.Role OFF;

PRINT '4 roles inserted / verified.';
GO


-- =============================================================================
-- 6. SAMPLE DATA — Users
--
-- Passwords are SHA-256 hex hashes (64 lowercase chars), matching what
-- Sha256PasswordHasher.Hash() produces in PharmaSphere.Services.
--
-- To compute a hash yourself in T-SQL:
--   SELECT LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'YourPassword'), 2))
--
-- Plain-text → Hash mapping used below:
-- ┌─────────────────────────────┬──────────────┐
-- │ Plain-text Password         │ Used by      │
-- ├─────────────────────────────┼──────────────┤
-- │ Admin@123                   │ admin        │
-- │ Pharma@123                  │ pharmacists  │
-- │ Tech@123                    │ technicians  │
-- │ View@123                    │ viewer       │
-- └─────────────────────────────┴──────────────┘
-- =============================================================================

SET IDENTITY_INSERT dbo.Users ON;

MERGE dbo.Users AS target
USING (VALUES

    -- ── Administrators ────────────────────────────────────────────────────────
    (
        1,
        'admin@pharmasphere.com',
        -- SHA-256('Admin@123')
        LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'Admin@123'), 2)),
        1,      -- isActive = true
        1       -- RoleId  = Administrator
    ),

    -- ── Pharmacists ───────────────────────────────────────────────────────────
    (
        2,
        'sarah.jones@pharmasphere.com',
        LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'Pharma@123'), 2)),
        1,
        2       -- RoleId = Pharmacist
    ),
    (
        3,
        'james.wilson@pharmasphere.com',
        LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'Pharma@123'), 2)),
        1,
        2
    ),

    -- ── Technicians ───────────────────────────────────────────────────────────
    (
        4,
        'emily.clark@pharmasphere.com',
        LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'Tech@123'), 2)),
        1,
        3       -- RoleId = Technician
    ),
    (
        5,
        'david.brown@pharmasphere.com',
        LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'Tech@123'), 2)),
        1,
        3
    ),

    -- ── Viewer (read-only) ────────────────────────────────────────────────────
    (
        6,
        'viewer@pharmasphere.com',
        LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'View@123'), 2)),
        1,
        4       -- RoleId = Viewer
    ),

    -- ── Inactive user (disabled account — login will be rejected by API) ──────
    (
        7,
        'inactive.user@pharmasphere.com',
        LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'Inactive@123'), 2)),
        0,      -- isActive = false
        3
    )

) AS source (UserId, EmailAddress, Password, isActive, RoleId)
ON target.UserId = source.UserId
WHEN NOT MATCHED THEN
    INSERT (UserId, EmailAddress, Password, isActive, RoleId)
    VALUES (source.UserId, source.EmailAddress, source.Password, source.isActive, source.RoleId);

SET IDENTITY_INSERT dbo.Users OFF;

PRINT '7 users inserted / verified.';
GO