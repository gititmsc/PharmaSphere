-- Remove QARemarks column from Orders table as it is no longer needed.
-- Run once against the live database before deploying the updated backend.

ALTER TABLE Orders DROP COLUMN QARemarks;
