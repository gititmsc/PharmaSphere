
-- =============================================================================
-- 2. TABLE: Role
--    Columns: RoleId (PK, identity), RoleName
-- =============================================================================

IF OBJECT_ID(N'dbo.Role', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Role
    (
        RoleId   INT          NOT NULL IDENTITY(1,1),
        RoleName VARCHAR(100) NOT NULL,

        CONSTRAINT PK_Role PRIMARY KEY CLUSTERED (RoleId),
        CONSTRAINT UQ_Role_RoleName UNIQUE (RoleName)
    );

    PRINT 'Table dbo.Role created.';
END
ELSE
    PRINT 'Table dbo.Role already exists — skipped.';
GO


-- =============================================================================
-- 3. TABLE: Users
--    Columns: UserId (PK, identity), EmailAddress, Password, isActive, RoleId (FK)
--
--    Password column: VARCHAR(100)
--    Stores a SHA-256 hex hash — exactly 64 lowercase characters.
--    Produced by Sha256PasswordHasher in PharmaSphere.Services.
-- =============================================================================

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        UserId       INT          NOT NULL IDENTITY(1,1),
        EmailAddress VARCHAR(500) NOT NULL,
        Password     VARCHAR(100) NOT NULL,   -- SHA-256 hex, always 64 chars
        isActive     BIT          NOT NULL CONSTRAINT DF_Users_isActive DEFAULT (1),
        RoleId       INT          NOT NULL,

        CONSTRAINT PK_Users          PRIMARY KEY CLUSTERED (UserId),
        CONSTRAINT FK_Users_Role     FOREIGN KEY (RoleId)
                                     REFERENCES dbo.Role (RoleId)
                                     ON DELETE NO ACTION
                                     ON UPDATE NO ACTION,
        CONSTRAINT UQ_Users_Email    UNIQUE (EmailAddress)
    );

    -- Index used by UserRepository.GetByEmailAsync  (login lookup)
    CREATE UNIQUE NONCLUSTERED INDEX IX_Users_EmailAddress
        ON dbo.Users (EmailAddress);

    PRINT 'Table dbo.Users created.';
END
ELSE
    PRINT 'Table dbo.Users already exists — skipped.';
GO


-- =============================================================================
-- 4. TABLE: RefreshTokens
--    Managed by EF Core / PharmaSphere.Repositories.
--    Stores active JWT refresh tokens for server-side revocation.
-- =============================================================================

IF OBJECT_ID(N'dbo.RefreshTokens', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RefreshTokens
    (
        RefreshTokenId  INT           NOT NULL IDENTITY(1,1),
        Token           VARCHAR(512)  NOT NULL,
        UserId          INT           NOT NULL,
        ExpiresAt       DATETIME2(7)  NOT NULL,
        IsRevoked       BIT           NOT NULL CONSTRAINT DF_RefreshTokens_IsRevoked  DEFAULT (0),
        CreatedAt       DATETIME2(7)  NOT NULL CONSTRAINT DF_RefreshTokens_CreatedAt  DEFAULT (GETUTCDATE()),
        ReplacedByToken VARCHAR(512)  NULL,

        CONSTRAINT PK_RefreshTokens       PRIMARY KEY CLUSTERED (RefreshTokenId),
        CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId)
                                          REFERENCES dbo.Users (UserId)
                                          ON DELETE CASCADE    -- revoking a user cascades tokens
                                          ON UPDATE NO ACTION,
        CONSTRAINT UQ_RefreshTokens_Token UNIQUE (Token)
    );

    -- Index used by RefreshTokenRepository.GetByTokenAsync
    CREATE UNIQUE NONCLUSTERED INDEX IX_RefreshTokens_Token
        ON dbo.RefreshTokens (Token);

    -- Helpful for listing all sessions for a user
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserId
        ON dbo.RefreshTokens (UserId);

    PRINT 'Table dbo.RefreshTokens created.';
END
ELSE
    PRINT 'Table dbo.RefreshTokens already exists — skipped.';
GO

