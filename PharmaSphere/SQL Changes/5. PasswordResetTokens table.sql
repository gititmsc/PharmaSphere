-- =============================================================================
-- Script 5: PasswordResetTokens table
-- Purpose : Stores single-use password reset tokens emailed to users.
--           Each token is a GUID, expires in 1 hour, and is marked used
--           once the password has been successfully changed.
-- =============================================================================

USE PharmaSphereDev;
GO

-- ─── Create table ─────────────────────────────────────────────────────────────
CREATE TABLE PasswordResetTokens (
    PasswordResetTokenId INT           IDENTITY(1,1)  NOT NULL,
    UserId               INT                          NOT NULL,
    Token                VARCHAR(36)                  NOT NULL,   -- GUID e.g. "a1b2c3d4-..."
    ExpiresAt            DATETIME2(7)                 NOT NULL,
    IsUsed               BIT           NOT NULL DEFAULT 0,
    CreatedAt            DATETIME2(7)  NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT PK_PasswordResetTokens      PRIMARY KEY (PasswordResetTokenId),
    CONSTRAINT UQ_PasswordResetTokens_Token UNIQUE (Token),
    CONSTRAINT FK_PasswordResetTokens_Users
        FOREIGN KEY (UserId) REFERENCES Users (UserId)
        ON DELETE CASCADE
);
GO

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE NONCLUSTERED INDEX IX_PasswordResetTokens_Token
    ON PasswordResetTokens (Token)
    INCLUDE (UserId, ExpiresAt, IsUsed);

CREATE NONCLUSTERED INDEX IX_PasswordResetTokens_UserId
    ON PasswordResetTokens (UserId);
GO

-- ─── Verification query ───────────────────────────────────────────────────────
SELECT
    prt.PasswordResetTokenId,
    u.EmailAddress,
    prt.Token,
    prt.ExpiresAt,
    prt.IsUsed,
    prt.CreatedAt,
    CASE
        WHEN prt.IsUsed = 1               THEN 'Used'
        WHEN prt.ExpiresAt < GETUTCDATE() THEN 'Expired'
        ELSE 'Active'
    END AS [Status]
FROM PasswordResetTokens prt
JOIN Users u ON u.UserId = prt.UserId
ORDER BY prt.CreatedAt DESC;
GO
