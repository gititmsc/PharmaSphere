-- =============================================================================
-- Script 4: TwoFactorCodes table
-- Purpose : Stores 6-digit OTP codes used for email-based 2FA.
--           Each code is tied to a user, has a 10-minute expiry, and is
--           marked used once successfully verified (or invalidated on resend).
-- =============================================================================

USE PharmaSphereDev;
GO

-- ─── Create table ─────────────────────────────────────────────────────────────
CREATE TABLE TwoFactorCodes (
    TwoFactorCodeId INT           IDENTITY(1,1)  NOT NULL,
    UserId          INT                          NOT NULL,
    Code            CHAR(6)                      NOT NULL,   -- 6-digit numeric OTP
    ExpiresAt       DATETIME2(7)                 NOT NULL,
    IsUsed          BIT           NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2(7)  NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT PK_TwoFactorCodes PRIMARY KEY (TwoFactorCodeId),
    CONSTRAINT FK_TwoFactorCodes_Users
        FOREIGN KEY (UserId) REFERENCES Users (UserId)
        ON DELETE CASCADE
);
GO

-- ─── Index for fast lookup by user (latest active code) ───────────────────────
CREATE NONCLUSTERED INDEX IX_TwoFactorCodes_UserId
    ON TwoFactorCodes (UserId)
    INCLUDE (Code, ExpiresAt, IsUsed);
GO

-- ─── Verification queries ─────────────────────────────────────────────────────

-- List all codes (newest first)
SELECT
    tfc.TwoFactorCodeId,
    u.EmailAddress,
    tfc.Code,
    tfc.ExpiresAt,
    tfc.IsUsed,
    tfc.CreatedAt,
    CASE
        WHEN tfc.IsUsed = 1            THEN 'Used'
        WHEN tfc.ExpiresAt < GETUTCDATE() THEN 'Expired'
        ELSE 'Active'
    END AS [Status]
FROM TwoFactorCodes tfc
JOIN Users u ON u.UserId = tfc.UserId
ORDER BY tfc.CreatedAt DESC;
GO
