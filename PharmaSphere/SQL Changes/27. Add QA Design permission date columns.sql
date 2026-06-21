-- Add QA/Design permission date columns to Orders table
ALTER TABLE [dbo].[Orders]
ADD
    -- Product Permission
    [PPApplyDate]     DATETIME NULL,
    [PPDraftDate]     DATETIME NULL,
    [PPApprovalDate]  DATETIME NULL,
    [PPReceivedDate]  DATETIME NULL,
    -- Combipack Product Permission
    [CPPApplyDate]    DATETIME NULL,
    [CPPDraftDate]    DATETIME NULL,
    [CPPApprovalDate] DATETIME NULL,
    [CPPReceivedDate] DATETIME NULL,
    -- COPP
    [COPPApplyDate]     DATETIME NULL,
    [COPPDraftDate]     DATETIME NULL,
    [COPPApprovalDate]  DATETIME NULL,
    [COPPReceivedDate]  DATETIME NULL,
    -- FSC
    [FSCApplyDate]    DATETIME NULL,
    [FSCDraftDate]    DATETIME NULL,
    [FSCApprovalDate] DATETIME NULL,
    [FSCReceivedDate] DATETIME NULL;
