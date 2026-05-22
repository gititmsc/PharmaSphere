-- ============================================================
-- Sync Parties and BrandNames lookup tables from existing
-- Orders records.  Safe to run multiple times — only inserts
-- values that are not already present.
-- ============================================================

-- ── Parties ──────────────────────────────────────────────────
INSERT INTO Parties (PartyName)
SELECT DISTINCT LTRIM(RTRIM(o.Party))
FROM   Orders o
WHERE  o.Party IS NOT NULL
  AND  LTRIM(RTRIM(o.Party)) <> ''
  AND  NOT EXISTS (
           SELECT 1
           FROM   Parties p
           WHERE  p.PartyName = LTRIM(RTRIM(o.Party))
       );
GO

-- ── BrandNames ───────────────────────────────────────────────
INSERT INTO BrandNames (BrandName)
SELECT DISTINCT LTRIM(RTRIM(o.BrandName))
FROM   Orders o
WHERE  o.BrandName IS NOT NULL
  AND  LTRIM(RTRIM(o.BrandName)) <> ''
  AND  NOT EXISTS (
           SELECT 1
           FROM   BrandNames b
           WHERE  b.BrandName = LTRIM(RTRIM(o.BrandName))
       );
GO

-- ── Verification ─────────────────────────────────────────────
SELECT 'Parties'   AS [Table], COUNT(*) AS [Total] FROM Parties
UNION ALL
SELECT 'BrandNames',            COUNT(*)            FROM BrandNames;
GO
