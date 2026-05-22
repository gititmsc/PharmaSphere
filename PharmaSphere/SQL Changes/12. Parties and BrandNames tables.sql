-- ============================================================
-- Parties and BrandNames lookup tables
-- Used as autocomplete data sources on the Sales Order form.
-- New values are auto-added when orders are created / updated.
-- ============================================================

CREATE TABLE Parties
(
    PartyId   INT           IDENTITY(1,1) PRIMARY KEY,
    PartyName NVARCHAR(200) NOT NULL,
    IsActive  BIT           NOT NULL DEFAULT 1,
    CONSTRAINT UQ_Parties_PartyName UNIQUE (PartyName)
);
GO

CREATE TABLE BrandNames
(
    BrandNameId INT           IDENTITY(1,1) PRIMARY KEY,
    BrandName   NVARCHAR(200) NOT NULL,
    IsActive    BIT           NOT NULL DEFAULT 1,
    CONSTRAINT UQ_BrandNames_BrandName UNIQUE (BrandName)
);
GO

-- Seed from existing orders (distinct, non-blank values)
INSERT INTO Parties (PartyName)
SELECT DISTINCT LTRIM(RTRIM(Party))
FROM   Orders
WHERE  Party IS NOT NULL
  AND  LTRIM(RTRIM(Party)) <> '';
GO

INSERT INTO BrandNames (BrandName)
SELECT DISTINCT LTRIM(RTRIM(BrandName))
FROM   Orders
WHERE  BrandName IS NOT NULL
  AND  LTRIM(RTRIM(BrandName)) <> '';
GO
