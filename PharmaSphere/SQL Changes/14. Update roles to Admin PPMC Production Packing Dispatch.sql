
-- =============================================================================
-- 14. UPDATE ROLES
--     Replace the four original roles with the five production roles:
--       1  Administrator → Admin
--       2  Pharmacist    → PPMC
--       3  Technician    → Production
--       4  Viewer        → Packing
--       5  (new)         → Dispatch
--
--     All existing users keep their RoleId FK, so no changes to the Users table
--     are required.  Assign users to the correct new roles via the application.
--
--     The [Authorize(Roles = "Admin")] attribute on the restore endpoint already
--     expects the name "Admin" — renaming from "Administrator" activates it.
-- =============================================================================

-- ── 1. Rename existing roles ─────────────────────────────────────────────────

UPDATE dbo.Role SET RoleName = 'Admin'      WHERE RoleId = 1;
UPDATE dbo.Role SET RoleName = 'PPMC'       WHERE RoleId = 2;
UPDATE dbo.Role SET RoleName = 'Production' WHERE RoleId = 3;
UPDATE dbo.Role SET RoleName = 'Packing'    WHERE RoleId = 4;

PRINT 'Roles 1–4 renamed.';
GO

-- ── 2. Insert Dispatch role (idempotent) ─────────────────────────────────────

SET IDENTITY_INSERT dbo.Role ON;

IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RoleId = 5)
BEGIN
    INSERT INTO dbo.Role (RoleId, RoleName) VALUES (5, 'Dispatch');
    PRINT 'Role 5 (Dispatch) inserted.';
END
ELSE
BEGIN
    UPDATE dbo.Role SET RoleName = 'Dispatch' WHERE RoleId = 5;
    PRINT 'Role 5 already exists — name set to Dispatch.';
END

SET IDENTITY_INSERT dbo.Role OFF;
GO

-- ── 3. Verification ──────────────────────────────────────────────────────────

SELECT RoleId, RoleName
FROM   dbo.Role
ORDER  BY RoleId;
GO
