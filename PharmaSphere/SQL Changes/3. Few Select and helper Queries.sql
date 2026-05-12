


-- =============================================================================
-- 7. VERIFICATION QUERIES
-- =============================================================================

PRINT '';
PRINT '── Roles ──────────────────────────────────────────────────────────────';
SELECT
    RoleId,
    RoleName
FROM dbo.Role
ORDER BY RoleId;

PRINT '';
PRINT '── Users (with role name) ──────────────────────────────────────────────';
SELECT
    u.UserId,
    u.EmailAddress,
    LEFT(u.Password, 16) + '...'   AS PasswordHash_Preview,
    LEN(u.Password)                AS HashLength,       -- must be 64
    CASE u.isActive
        WHEN 1 THEN 'Active'
        ELSE        'Disabled'
    END                            AS Status,
    r.RoleName
FROM       dbo.Users u
INNER JOIN dbo.Role  r ON r.RoleId = u.RoleId
ORDER BY u.UserId;

PRINT '';
PRINT '── Hash length check (all must be 64) ──────────────────────────────────';
SELECT
    EmailAddress,
    LEN(Password) AS HashLength,
    CASE WHEN LEN(Password) = 64 THEN '✓ OK' ELSE '✗ WRONG LENGTH' END AS Check
FROM dbo.Users;
GO


-- =============================================================================
-- 8. HELPER QUERIES
-- =============================================================================

-- ── Simulate what the API does on login ──────────────────────────────────────
--    Replace the string literals with the values the React login form sends.
/*
DECLARE @Email    VARCHAR(500) = 'admin@pharmasphere.com';
DECLARE @Password VARCHAR(100) = 'Admin@123';

SELECT
    u.UserId,
    u.EmailAddress,
    u.isActive,
    r.RoleName,
    CASE
        WHEN u.Password = LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @Password), 2))
        THEN 'Password MATCH ✓'
        ELSE 'Password MISMATCH ✗'
    END AS PasswordCheck
FROM       dbo.Users u
INNER JOIN dbo.Role  r ON r.RoleId = u.RoleId
WHERE      u.EmailAddress = @Email;
*/


-- ── List all active (non-revoked, non-expired) refresh token sessions ─────────
/*
SELECT
    rt.RefreshTokenId,
    u.EmailAddress,
    LEFT(rt.Token, 20) + '...' AS TokenPreview,
    rt.CreatedAt,
    rt.ExpiresAt,
    rt.IsRevoked,
    CASE
        WHEN rt.IsRevoked = 1           THEN 'Revoked'
        WHEN rt.ExpiresAt < GETUTCDATE() THEN 'Expired'
        ELSE                                  'Active'
    END AS SessionStatus
FROM       dbo.RefreshTokens rt
INNER JOIN dbo.Users         u  ON u.UserId = rt.UserId
ORDER BY rt.CreatedAt DESC;
*/


-- ── Force-logout a specific user (revoke all their tokens) ────────────────────
/*
DECLARE @UserId INT = 1;

UPDATE dbo.RefreshTokens
SET    IsRevoked = 1
WHERE  UserId   = @UserId
  AND  IsRevoked = 0;

PRINT CAST(@@ROWCOUNT AS VARCHAR) + ' token(s) revoked for UserId ' + CAST(@UserId AS VARCHAR);
*/


-- ── Reset a user's password (run Sha256PasswordHasher.Hash() in C# first,
--    or use the T-SQL inline hash below) ────────────────────────────────────────
/*
DECLARE @UserId      INT          = 1;
DECLARE @NewPassword VARCHAR(100) = 'NewSecurePassword!99';

UPDATE dbo.Users
SET    Password = LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', @NewPassword), 2))
WHERE  UserId   = @UserId;

PRINT 'Password updated for UserId ' + CAST(@UserId AS VARCHAR);
*/


-- ── Disable / re-enable a user account ───────────────────────────────────────
/*
-- Disable:
UPDATE dbo.Users SET isActive = 0 WHERE UserId = 7;

-- Re-enable:
UPDATE dbo.Users SET isActive = 1 WHERE UserId = 7;
*/


-- ── Add a new user manually ──────────────────────────────────────────────────
/*
INSERT INTO dbo.Users (EmailAddress, Password, isActive, RoleId)
VALUES (
    'newuser@pharmasphere.com',
    LOWER(CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', 'TempPassword@1'), 2)),
    1,
    2   -- Pharmacist
);
PRINT 'New user inserted with UserId = ' + CAST(SCOPE_IDENTITY() AS VARCHAR);
*/
GO