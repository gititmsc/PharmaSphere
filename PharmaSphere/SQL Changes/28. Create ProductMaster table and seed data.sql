-- ── Create ProductMaster table ───────────────────────────────────────────────
IF OBJECT_ID(N'dbo.ProductMaster', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ProductMaster] (
        [Id]          INT            IDENTITY(1,1) NOT NULL,
        [BrandName]   NVARCHAR(200)  NOT NULL,
        [GenericName] NVARCHAR(500)  NOT NULL,
        [Vial]        NVARCHAR(200)  NOT NULL,
        [SealColor]   NVARCHAR(100)  NOT NULL,
        [WFI]         NVARCHAR(100)  NOT NULL,
        [Label]       NVARCHAR(200)  NOT NULL,
        [MonoBox]     NVARCHAR(200)  NOT NULL,
        [MonthBox]    NVARCHAR(200)  NOT NULL,
        [Tray]        NVARCHAR(200)  NOT NULL,
        [Leaflet]     NVARCHAR(200)  NOT NULL,
        [SyringeNeedle] NVARCHAR(200) NOT NULL,
        [Shrink]      NVARCHAR(200)  NOT NULL,
        [Shipper]     NVARCHAR(200)  NOT NULL,
        [Hologram]    NVARCHAR(200)  NOT NULL,
        [CreatedBy]   NVARCHAR(100)  NULL,
        [CreatedDate] DATETIME       NOT NULL CONSTRAINT [DF_ProductMaster_CreatedDate] DEFAULT (GETUTCDATE()),
        [UpdatedBy]   NVARCHAR(100)  NULL,
        [UpdatedDate] DATETIME       NULL,
        [IsDeleted]   BIT            NOT NULL CONSTRAINT [DF_ProductMaster_IsDeleted]   DEFAULT (0),
        CONSTRAINT [PK_ProductMaster] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    CREATE INDEX [IX_ProductMaster_BrandName]  ON [dbo].[ProductMaster] ([BrandName]);
    CREATE INDEX [IX_ProductMaster_IsDeleted]  ON [dbo].[ProductMaster] ([IsDeleted]);

    PRINT 'ProductMaster table created.';
END
ELSE
    PRINT 'ProductMaster table already exists — skipped.';
GO

-- ── Seed 20 sample records ────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM [dbo].[ProductMaster])
BEGIN
    INSERT INTO [dbo].[ProductMaster]
        ([BrandName], [GenericName], [Vial], [SealColor], [WFI], [Label],
         [MonoBox], [MonthBox], [Tray], [Leaflet], [SyringeNeedle], [Shrink],
         [Shipper], [Hologram], [CreatedBy], [CreatedDate])
    VALUES
        ('Amoxicare 500',    'Amoxicillin 500mg',        '10ml Clear Glass',    'Red',    'WFI 10ml',  'Label A1',  'MonoBox A1',  'MonthBox A1',  'Tray A1',  'Leaflet A1',  'Syringe 5ml',  'Shrink A1',  'Shipper 20s',  'Hologram A1',  'Admin', GETUTCDATE()),
        ('Paracef 650',      'Paracetamol 650mg',        '5ml Amber Glass',     'Blue',   'WFI 5ml',   'Label A2',  'MonoBox A2',  'MonthBox A2',  'Tray A2',  'Leaflet A2',  'Syringe 2ml',  'Shrink A2',  'Shipper 10s',  'Hologram A2',  'Admin', GETUTCDATE()),
        ('Metforin 500',     'Metformin 500mg',          '20ml Clear Glass',    'Green',  'WFI 20ml',  'Label A3',  'MonoBox A3',  'MonthBox A3',  'Tray A3',  'Leaflet A3',  'Syringe 10ml', 'Shrink A3',  'Shipper 30s',  'Hologram A3',  'Admin', GETUTCDATE()),
        ('Amlodin 5',        'Amlodipine 5mg',           '2ml Clear Vial',      'Yellow', 'WFI 2ml',   'Label A4',  'MonoBox A4',  'MonthBox A4',  'Tray A4',  'Leaflet A4',  'Syringe 1ml',  'Shrink A4',  'Shipper 20s',  'Hologram A4',  'Admin', GETUTCDATE()),
        ('Atorval 10',       'Atorvastatin 10mg',        '10ml Amber Vial',     'Orange', 'WFI 10ml',  'Label A5',  'MonoBox A5',  'MonthBox A5',  'Tray A5',  'Leaflet A5',  'Syringe 5ml',  'Shrink A5',  'Shipper 24s',  'Hologram A5',  'Admin', GETUTCDATE()),
        ('Omecure 20',       'Omeprazole 20mg',          '10ml Clear Glass',    'Purple', 'WFI 10ml',  'Label A6',  'MonoBox A6',  'MonthBox A6',  'Tray A6',  'Leaflet A6',  'Syringe 5ml',  'Shrink A6',  'Shipper 12s',  'Hologram A6',  'Admin', GETUTCDATE()),
        ('Ciprogen 500',     'Ciprofloxacin 500mg',      '5ml Clear Vial',      'White',  'WFI 5ml',   'Label A7',  'MonoBox A7',  'MonthBox A7',  'Tray A7',  'Leaflet A7',  'Syringe 2ml',  'Shrink A7',  'Shipper 20s',  'Hologram A7',  'Admin', GETUTCDATE()),
        ('Azithromax 500',   'Azithromycin 500mg',       '10ml Amber Glass',    'Silver', 'WFI 10ml',  'Label A8',  'MonoBox A8',  'MonthBox A8',  'Tray A8',  'Leaflet A8',  'Syringe 5ml',  'Shrink A8',  'Shipper 10s',  'Hologram A8',  'Admin', GETUTCDATE()),
        ('Ceftrix 1g',       'Ceftriaxone 1g',           '20ml Clear Glass',    'Gold',   'WFI 20ml',  'Label A9',  'MonoBox A9',  'MonthBox A9',  'Tray A9',  'Leaflet A9',  'Syringe 10ml', 'Shrink A9',  'Shipper 30s',  'Hologram A9',  'Admin', GETUTCDATE()),
        ('Dexasol 4',        'Dexamethasone 4mg/ml',     '5ml Amber Vial',      'Red',    'WFI 5ml',   'Label A10', 'MonoBox A10', 'MonthBox A10', 'Tray A10', 'Leaflet A10', 'Syringe 2ml',  'Shrink A10', 'Shipper 20s',  'Hologram A10', 'Admin', GETUTCDATE()),
        ('Ondacare 4',       'Ondansetron 4mg/2ml',      '2ml Clear Vial',      'Blue',   'WFI 2ml',   'Label A11', 'MonoBox A11', 'MonthBox A11', 'Tray A11', 'Leaflet A11', 'Syringe 1ml',  'Shrink A11', 'Shipper 10s',  'Hologram A11', 'Admin', GETUTCDATE()),
        ('Pantocure 40',     'Pantoprazole 40mg',        '10ml Clear Glass',    'Green',  'WFI 10ml',  'Label A12', 'MonoBox A12', 'MonthBox A12', 'Tray A12', 'Leaflet A12', 'Syringe 5ml',  'Shrink A12', 'Shipper 24s',  'Hologram A12', 'Admin', GETUTCDATE()),
        ('Atenol 50',        'Atenolol 50mg',            '10ml Amber Glass',    'Orange', 'WFI 10ml',  'Label A13', 'MonoBox A13', 'MonthBox A13', 'Tray A13', 'Leaflet A13', 'Syringe 5ml',  'Shrink A13', 'Shipper 20s',  'Hologram A13', 'Admin', GETUTCDATE()),
        ('Losarcare 50',     'Losartan Potassium 50mg',  '10ml Clear Vial',     'Yellow', 'WFI 10ml',  'Label A14', 'MonoBox A14', 'MonthBox A14', 'Tray A14', 'Leaflet A14', 'Syringe 5ml',  'Shrink A14', 'Shipper 30s',  'Hologram A14', 'Admin', GETUTCDATE()),
        ('Gabanex 300',      'Gabapentin 300mg',         '5ml Amber Vial',      'Purple', 'WFI 5ml',   'Label A15', 'MonoBox A15', 'MonthBox A15', 'Tray A15', 'Leaflet A15', 'Syringe 2ml',  'Shrink A15', 'Shipper 20s',  'Hologram A15', 'Admin', GETUTCDATE()),
        ('Sertrex 50',       'Sertraline Hydrochloride 50mg', '5ml Clear Glass', 'White', 'WFI 5ml',   'Label A16', 'MonoBox A16', 'MonthBox A16', 'Tray A16', 'Leaflet A16', 'Syringe 2ml',  'Shrink A16', 'Shipper 12s',  'Hologram A16', 'Admin', GETUTCDATE()),
        ('Lisofar 10',       'Lisinopril 10mg',          '10ml Clear Vial',     'Silver', 'WFI 10ml',  'Label A17', 'MonoBox A17', 'MonthBox A17', 'Tray A17', 'Leaflet A17', 'Syringe 5ml',  'Shrink A17', 'Shipper 20s',  'Hologram A17', 'Admin', GETUTCDATE()),
        ('Furosem 40',       'Furosemide 40mg/4ml',      '5ml Amber Glass',     'Gold',   'WFI 5ml',   'Label A18', 'MonoBox A18', 'MonthBox A18', 'Tray A18', 'Leaflet A18', 'Syringe 2ml',  'Shrink A18', 'Shipper 24s',  'Hologram A18', 'Admin', GETUTCDATE()),
        ('Diclocare 50',     'Diclofenac Sodium 50mg',   '5ml Clear Vial',      'Red',    'WFI 5ml',   'Label A19', 'MonoBox A19', 'MonthBox A19', 'Tray A19', 'Leaflet A19', 'Syringe 2ml',  'Shrink A19', 'Shipper 30s',  'Hologram A19', 'Admin', GETUTCDATE()),
        ('Vitacomplex B',    'Vitamin B Complex',        '10ml Amber Vial',     'Blue',   'WFI 10ml',  'Label A20', 'MonoBox A20', 'MonthBox A20', 'Tray A20', 'Leaflet A20', 'Syringe 5ml',  'Shrink A20', 'Shipper 10s',  'Hologram A20', 'Admin', GETUTCDATE());

    PRINT '20 ProductMaster seed records inserted.';
END
ELSE
    PRINT 'ProductMaster already has data — seed skipped.';
GO
