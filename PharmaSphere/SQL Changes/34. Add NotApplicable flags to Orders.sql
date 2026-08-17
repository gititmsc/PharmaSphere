-- Add Not Applicable toggle columns to Orders table (Product Permission / Combipack Product Permission / COPP / FSC)
ALTER TABLE [dbo].[Orders]
ADD [PPNotApplicable]   BIT NOT NULL CONSTRAINT [DF_Orders_PPNotApplicable]   DEFAULT (0),
    [CPPNotApplicable]  BIT NOT NULL CONSTRAINT [DF_Orders_CPPNotApplicable]  DEFAULT (0),
    [COPPNotApplicable] BIT NOT NULL CONSTRAINT [DF_Orders_COPPNotApplicable] DEFAULT (0),
    [FSCNotApplicable]  BIT NOT NULL CONSTRAINT [DF_Orders_FSCNotApplicable]  DEFAULT (0);
