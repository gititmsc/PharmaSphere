-- Convert ProductionMonoBox, ProductionLabel, ProductionInsert, ProductionTray, ProductionShipper
-- from NVARCHAR to DATETIME to support date picker input in the Packing Material Receive section.
-- Run once against the live database before deploying the updated backend.

update Orders set ProductionMonoBox = null,
					ProductionLabel   = null,
					ProductionInsert  = null,
					ProductionTray    = null,
					ProductionShipper = null;


ALTER TABLE Orders ALTER COLUMN ProductionMonoBox DATETIME NULL;
ALTER TABLE Orders ALTER COLUMN ProductionLabel   DATETIME NULL;
ALTER TABLE Orders ALTER COLUMN ProductionInsert  DATETIME NULL;
ALTER TABLE Orders ALTER COLUMN ProductionTray    DATETIME NULL;
ALTER TABLE Orders ALTER COLUMN ProductionShipper DATETIME NULL;
