-- ============================================================
-- Sales Order Module: Sample Data (25 records for pagination testing)
-- Assumes Users with UserId 1 exist from seed data.
-- ============================================================

SET IDENTITY_INSERT Orders ON;
GO

INSERT INTO Orders (
    OrderId, OrderNo, OrderDate, Party, BrandName, Composition,
    Qty, ShelfLifeMonths, MRP, Rate, PaymentTerms, Make,
    Vial, SealColour, WFI, Label, MonoBox, Tray,
    Leaflet, SyringeAndNeedle, Shrink, Shipper,
    DeliverySchedule, AdminRemarks, OtherRemarks,
    PISApprovalDate, SanoletPartyArtworkApprovalDate, QARemarks,
    MonoBoxSupplyVendorApprovalDate, LabelSupplyVendorApprovalDate,
    InsertSupplyVendorApprovalDate, TraySupplyVendorApprovalDate,
    ShipperSupplyVendorApprovalDate,
    ProductionMonoBox, ProductionLabel, ProductionInsert,
    ProductionTray, ProductionShipper,
    FillingPlan, PackingPlan, Sterility14DaysDate, DispatchDate,
    CurrentStatus, CreatedBy, CreatedByUserId, CreatedDate,
    UpdatedBy, UpdatedByUserId, UpdatedDate, IsActive
)
VALUES
-- 1. Created
(1, 'ORD-2025-001', '2025-01-05', 'MedLife Pharma', 'Mediject',
 'Amikacin 500mg/2ml', 5000, 24, 280.00, 210.00, 'Net 30', 'ABC Pharma',
 'Type I 2ml Vial', 'Red', 'WFI Grade A', 'Foil Label', 'White Mono Box', '10x1',
 'English Leaflet', '2ml Syringe', 'PVC Shrink', 'Master Shipper',
 '2025-03-01', 'Urgent requirement', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-01-05 09:00:00', NULL, NULL, NULL, 1),

-- 2. Artwork Pending
(2, 'ORD-2025-002', '2025-01-10', 'Sunrise Healthcare', 'Sunsert',
 'Ceftriaxone 1g', 10000, 36, 450.00, 320.00, 'Net 45', 'XYZ Labs',
 'Type I 10ml Vial', 'Blue', 'WFI Grade A', 'Paper Label', 'Blue Mono Box', '5x1',
 'Hindi/English Leaflet', NULL, 'Polypropylene Shrink', 'Double Wall Shipper',
 '2025-04-15', 'Standard batch', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Artwork Pending', 'Admin', 1, '2025-01-10 10:30:00', 'Admin', 1, '2025-01-12 14:00:00', 1),

-- 3. QA Pending
(3, 'ORD-2025-003', '2025-01-15', 'Global Medicare', 'Globecef',
 'Cefotaxime 500mg', 8000, 24, 320.00, 240.00, 'Net 30', 'Global Labs',
 'Type I 5ml Vial', 'Green', 'WFI Grade B', 'Self-Adhesive Label', 'Green Mono Box', '10x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Standard Shipper',
 '2025-05-01', 'QA review in progress', NULL,
 '2025-01-25', '2025-01-28', 'Artwork verified by QA team',
 '2025-01-30', '2025-01-30', '2025-01-30', '2025-01-30', '2025-01-30',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'QA Pending', 'Admin', 1, '2025-01-15 11:00:00', 'Admin', 1, '2025-01-28 16:00:00', 1),

-- 4. Production Pending
(4, 'ORD-2025-004', '2025-02-01', 'Premier Drugs', 'Premicin',
 'Gentamicin 80mg/2ml', 15000, 24, 95.00, 68.00, 'Net 60', 'Premier Pharma',
 'Type I 2ml Vial', 'Yellow', 'WFI Grade A', 'Foil Label', 'Yellow Mono Box', '10x2',
 'Trilingual Leaflet', '2ml Auto Syringe', 'PVC Shrink', 'Master Shipper',
 '2025-06-01', 'High volume order', NULL,
 '2025-02-10', '2025-02-12', 'All approvals cleared',
 '2025-02-15', '2025-02-15', '2025-02-15', '2025-02-15', '2025-02-15',
 NULL, NULL, NULL, NULL, NULL, '2025-03-01', NULL, NULL, NULL,
 'Production Pending', 'Admin', 1, '2025-02-01 09:30:00', 'Admin', 1, '2025-02-15 17:00:00', 1),

-- 5. Dispatched
(5, 'ORD-2025-005', '2025-02-10', 'Apex Pharmaceuticals', 'Apexin',
 'Linezolid 600mg/300ml', 3000, 18, 1200.00, 900.00, 'Net 30', 'Apex Mfg',
 'Type II 300ml Bottle', 'Silver', 'WFI Grade A', 'Printed Label', 'White Mono Box', '6x1',
 'English Leaflet', NULL, 'Polypropylene Shrink', 'Double Wall Shipper',
 '2025-03-15', 'Express dispatch', NULL,
 '2025-02-18', '2025-02-20', 'QA approved — all tests passed',
 '2025-02-22', '2025-02-22', '2025-02-22', '2025-02-22', '2025-02-22',
 'Lot M-2025-05A', 'Lot L-2025-05A', 'Lot I-2025-05A', 'Lot T-2025-05A', 'Lot S-2025-05A',
 '2025-03-01', '2025-03-05', '2025-03-19', '2025-03-20',
 'Dispatched', 'Admin', 1, '2025-02-10 08:00:00', 'Admin', 1, '2025-03-20 10:00:00', 1),

-- 6. Cancelled (soft-deleted)
(6, 'ORD-2025-006', '2025-02-15', 'Nova Lifesciences', 'Novamox',
 'Amoxicillin 500mg', 6000, 24, 85.00, 60.00, 'Advance', 'Nova Labs',
 'HDPE Bottle', 'White', NULL, 'Paper Label', 'White Mono Box', '10x1',
 'English Leaflet', NULL, NULL, 'Standard Shipper',
 NULL, 'Client cancelled', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Cancelled', 'Admin', 1, '2025-02-15 14:00:00', 'Admin', 1, '2025-02-16 09:00:00', 0),

-- 7. Created
(7, 'ORD-2025-007', '2025-03-01', 'Lifeline Medicals', 'Lifeline-Z',
 'Azithromycin 500mg/10ml', 4000, 30, 350.00, 260.00, 'Net 30', 'Lifeline Pharma',
 'Type I 10ml Vial', 'Orange', 'WFI Grade A', 'Self-Adhesive Label', 'Orange Mono Box', '5x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Standard Shipper',
 '2025-05-30', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-03-01 09:00:00', NULL, NULL, NULL, 1),

-- 8. Artwork Pending
(8, 'ORD-2025-008', '2025-03-10', 'BioMed Solutions', 'BioTaz',
 'Piperacillin/Tazobactam 4.5g', 2000, 24, 780.00, 580.00, 'Net 45', 'BioMed Mfg',
 'Type I 20ml Vial', 'Purple', 'WFI Grade A', 'Foil Label', 'Purple Mono Box', '5x1',
 'English Leaflet', NULL, 'Polypropylene Shrink', 'Double Wall Shipper',
 '2025-06-15', 'Awaiting artwork', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Artwork Pending', 'Admin', 1, '2025-03-10 11:00:00', 'Admin', 1, '2025-03-11 14:00:00', 1),

-- 9. Created
(9, 'ORD-2025-009', '2025-03-18', 'Helix Biotech', 'Helicef',
 'Cefuroxime 750mg', 7500, 24, 420.00, 310.00, 'Net 30', 'Helix Pharma',
 'Type I 10ml Vial', 'Teal', 'WFI Grade A', 'Foil Label', 'White Mono Box', '10x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Master Shipper',
 '2025-07-01', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-03-18 10:00:00', NULL, NULL, NULL, 1),

-- 10. QA Pending
(10, 'ORD-2025-010', '2025-03-22', 'Delta Pharma', 'Deltaject',
 'Metronidazole 500mg/100ml', 5000, 18, 180.00, 130.00, 'Net 30', 'Delta Labs',
 'PP Bottle 100ml', 'White', NULL, 'Printed Label', 'White Mono Box', '10x1',
 'English Leaflet', NULL, 'Polypropylene Shrink', 'Standard Shipper',
 '2025-06-30', 'QA ongoing', NULL,
 '2025-04-01', '2025-04-03', 'Artwork checked',
 '2025-04-05', '2025-04-05', '2025-04-05', '2025-04-05', '2025-04-05',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'QA Pending', 'Admin', 1, '2025-03-22 14:00:00', 'Admin', 1, '2025-04-05 11:00:00', 1),

-- 11. Production Pending
(11, 'ORD-2025-011', '2025-04-02', 'Zeta Lifesciences', 'Zetamox',
 'Amoxicillin/Clavulanate 1.2g', 6000, 24, 550.00, 400.00, 'Net 45', 'Zeta Mfg',
 'Type I 20ml Vial', 'Brown', 'WFI Grade A', 'Foil Label', 'Brown Mono Box', '5x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Double Wall Shipper',
 '2025-07-15', 'Production scheduled', NULL,
 '2025-04-10', '2025-04-12', 'QA cleared',
 '2025-04-15', '2025-04-15', '2025-04-15', '2025-04-15', '2025-04-15',
 NULL, NULL, NULL, NULL, NULL, '2025-05-10', '2025-05-15', NULL, NULL,
 'Production Pending', 'Admin', 1, '2025-04-02 09:00:00', 'Admin', 1, '2025-04-15 16:00:00', 1),

-- 12. Dispatched
(12, 'ORD-2025-012', '2025-04-08', 'Omega Healthcare', 'Omegapen',
 'Benzylpenicillin 5MU', 4000, 36, 220.00, 160.00, 'Net 60', 'Omega Pharma',
 'Type I 10ml Vial', 'Gold', 'WFI Grade A', 'Paper Label', 'Gold Mono Box', '10x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Master Shipper',
 '2025-06-01', NULL, NULL,
 '2025-04-18', '2025-04-20', 'QA approved',
 '2025-04-22', '2025-04-22', '2025-04-22', '2025-04-22', '2025-04-22',
 'Lot M-2025-12A', 'Lot L-2025-12A', 'Lot I-2025-12A', 'Lot T-2025-12A', 'Lot S-2025-12A',
 '2025-05-01', '2025-05-05', '2025-05-19', '2025-05-20',
 'Dispatched', 'Admin', 1, '2025-04-08 08:30:00', 'Admin', 1, '2025-05-20 09:00:00', 1),

-- 13. Created
(13, 'ORD-2025-013', '2025-04-14', 'Sigma Drugs', 'Sigmacef',
 'Cefepime 1g', 3500, 24, 680.00, 500.00, 'Net 30', 'Sigma Labs',
 'Type I 10ml Vial', 'Navy Blue', 'WFI Grade A', 'Foil Label', 'Blue Mono Box', '5x1',
 'English Leaflet', NULL, 'Polypropylene Shrink', 'Standard Shipper',
 '2025-08-01', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-04-14 10:30:00', NULL, NULL, NULL, 1),

-- 14. Artwork Pending
(14, 'ORD-2025-014', '2025-04-20', 'Alpha Biocare', 'Alphamero',
 'Meropenem 1g', 2500, 24, 950.00, 720.00, 'Net 30', 'Alpha Mfg',
 'Type I 20ml Vial', 'Black', 'WFI Grade A', 'Foil Label', 'Black Mono Box', '5x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Double Wall Shipper',
 '2025-08-15', 'High value order', NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Artwork Pending', 'Admin', 1, '2025-04-20 11:00:00', 'Admin', 1, '2025-04-22 09:00:00', 1),

-- 15. QA Pending
(15, 'ORD-2025-015', '2025-04-28', 'Pharmax India', 'Pharmaxin',
 'Vancomycin 500mg', 1800, 24, 1100.00, 820.00, 'Advance', 'Pharmax Mfg',
 'Type I 10ml Vial', 'Maroon', 'WFI Grade A', 'Foil Label', 'White Mono Box', '5x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Master Shipper',
 '2025-09-01', NULL, NULL,
 '2025-05-08', '2025-05-10', 'Artwork approved',
 '2025-05-12', '2025-05-12', '2025-05-12', '2025-05-12', '2025-05-12',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'QA Pending', 'Admin', 1, '2025-04-28 14:00:00', 'Admin', 1, '2025-05-12 13:00:00', 1),

-- 16. Created
(16, 'ORD-2025-016', '2025-05-05', 'Nexus Pharma', 'Nexuclav',
 'Amoxicillin/Clavulanate 625mg', 9000, 30, 145.00, 105.00, 'Net 30', 'Nexus Labs',
 'HDPE Bottle 60ml', 'White', NULL, 'Printed Label', 'White Mono Box', '10x1',
 'English Leaflet', NULL, NULL, 'Standard Shipper',
 '2025-09-15', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-05-05 09:30:00', NULL, NULL, NULL, 1),

-- 17. Production Pending
(17, 'ORD-2025-017', '2025-05-10', 'Vertex Healthcare', 'Vertimab',
 'Imipenem/Cilastatin 500mg', 2200, 24, 1350.00, 1000.00, 'Net 45', 'Vertex Mfg',
 'Type I 20ml Vial', 'Violet', 'WFI Grade A', 'Foil Label', 'Violet Mono Box', '5x1',
 'English Leaflet', NULL, 'Polypropylene Shrink', 'Double Wall Shipper',
 '2025-10-01', NULL, NULL,
 '2025-05-20', '2025-05-22', 'All QA approved',
 '2025-05-25', '2025-05-25', '2025-05-25', '2025-05-25', '2025-05-25',
 NULL, NULL, NULL, NULL, NULL, '2025-06-20', '2025-06-25', NULL, NULL,
 'Production Pending', 'Admin', 1, '2025-05-10 10:00:00', 'Admin', 1, '2025-05-25 15:00:00', 1),

-- 18. Artwork Pending
(18, 'ORD-2025-018', '2025-05-15', 'Crystal Biotech', 'Crystapen',
 'Benzathine Penicillin 1.2MU', 5500, 36, 190.00, 140.00, 'Net 30', 'Crystal Mfg',
 'Type I 5ml Vial', 'Cyan', 'WFI Grade A', 'Paper Label', 'White Mono Box', '10x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Standard Shipper',
 '2025-10-15', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Artwork Pending', 'Admin', 1, '2025-05-15 11:30:00', 'Admin', 1, '2025-05-17 10:00:00', 1),

-- 19. Dispatched
(19, 'ORD-2025-019', '2025-05-20', 'Pioneer Drugs', 'Pioneercef',
 'Ceftazidime 1g', 4500, 24, 560.00, 420.00, 'Net 30', 'Pioneer Pharma',
 'Type I 10ml Vial', 'Rose', 'WFI Grade A', 'Foil Label', 'White Mono Box', '5x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Master Shipper',
 '2025-08-01', NULL, NULL,
 '2025-06-01', '2025-06-03', 'QA cleared all checks',
 '2025-06-05', '2025-06-05', '2025-06-05', '2025-06-05', '2025-06-05',
 'Lot M-2025-19A', 'Lot L-2025-19A', 'Lot I-2025-19A', 'Lot T-2025-19A', 'Lot S-2025-19A',
 '2025-06-15', '2025-06-20', '2025-07-04', '2025-07-05',
 'Dispatched', 'Admin', 1, '2025-05-20 09:00:00', 'Admin', 1, '2025-07-05 11:00:00', 1),

-- 20. Created
(20, 'ORD-2025-020', '2025-06-01', 'Zenith Pharma', 'Zenithpip',
 'Piperacillin 2g', 3800, 24, 480.00, 360.00, 'Net 45', 'Zenith Labs',
 'Type I 20ml Vial', 'Indigo', 'WFI Grade A', 'Foil Label', 'Blue Mono Box', '5x1',
 'English Leaflet', NULL, 'Polypropylene Shrink', 'Double Wall Shipper',
 '2025-11-01', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-06-01 10:00:00', NULL, NULL, NULL, 1),

-- 21. QA Pending
(21, 'ORD-2025-021', '2025-06-08', 'Radiant Healthcare', 'Radiantox',
 'Doxycycline 100mg', 12000, 24, 75.00, 55.00, 'Net 30', 'Radiant Mfg',
 'Glass Vial 5ml', 'Lime', 'WFI Grade B', 'Paper Label', 'Green Mono Box', '10x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Standard Shipper',
 '2025-11-15', NULL, NULL,
 '2025-06-18', '2025-06-20', 'Artwork reviewed',
 '2025-06-22', '2025-06-22', '2025-06-22', '2025-06-22', '2025-06-22',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'QA Pending', 'Admin', 1, '2025-06-08 11:00:00', 'Admin', 1, '2025-06-22 14:00:00', 1),

-- 22. Created
(22, 'ORD-2025-022', '2025-06-15', 'Stellar Drugs', 'Stellarsef',
 'Cefoperazone/Sulbactam 1g', 2800, 24, 720.00, 540.00, 'Net 30', 'Stellar Labs',
 'Type I 10ml Vial', 'Coral', 'WFI Grade A', 'Foil Label', 'White Mono Box', '5x1',
 'English Leaflet', NULL, 'PVC Shrink', 'Master Shipper',
 '2025-12-01', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-06-15 09:30:00', NULL, NULL, NULL, 1),

-- 23. Artwork Pending
(23, 'ORD-2025-023', '2025-06-22', 'Matrix Biocare', 'Matrixpen',
 'Ampicillin/Sulbactam 1.5g', 7000, 24, 310.00, 230.00, 'Net 45', 'Matrix Pharma',
 'Type I 10ml Vial', 'Peach', 'WFI Grade A', 'Paper Label', 'White Mono Box', '10x1',
 'English Leaflet', NULL, 'Polypropylene Shrink', 'Double Wall Shipper',
 '2025-12-15', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Artwork Pending', 'Admin', 1, '2025-06-22 10:00:00', 'Admin', 1, '2025-06-24 11:00:00', 1),

-- 24. Production Pending
(24, 'ORD-2025-024', '2025-07-01', 'Luminary Pharma', 'Luminaref',
 'Cefdinir 300mg', 6500, 24, 390.00, 290.00, 'Net 30', 'Luminary Mfg',
 'HDPE Bottle 100ml', 'White', NULL, 'Printed Label', 'White Mono Box', '10x1',
 'English Leaflet', NULL, NULL, 'Standard Shipper',
 '2026-01-15', NULL, NULL,
 '2025-07-12', '2025-07-14', 'QA approved all materials',
 '2025-07-16', '2025-07-16', '2025-07-16', '2025-07-16', '2025-07-16',
 NULL, NULL, NULL, NULL, NULL, '2025-08-10', '2025-08-15', NULL, NULL,
 'Production Pending', 'Admin', 1, '2025-07-01 09:00:00', 'Admin', 1, '2025-07-16 16:00:00', 1),

-- 25. Created
(25, 'ORD-2025-025', '2025-07-10', 'Pinnacle Healthcare', 'Pinnacin',
 'Tobramycin 80mg/2ml', 4200, 24, 265.00, 195.00, 'Net 30', 'Pinnacle Labs',
 'Type I 2ml Vial', 'Sky Blue', 'WFI Grade A', 'Foil Label', 'White Mono Box', '10x1',
 'English Leaflet', '2ml Syringe', 'PVC Shrink', 'Master Shipper',
 '2026-02-01', NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Created', 'Admin', 1, '2025-07-10 10:30:00', NULL, NULL, NULL, 1);

SET IDENTITY_INSERT Orders OFF;
GO

-- ============================================================
-- Status History (one entry per order minimum)
-- ============================================================
SET IDENTITY_INSERT OrderStatusHistory ON;
GO

INSERT INTO OrderStatusHistory
    (HistoryId, OrderId, FromStatus, ToStatus, Remarks, ChangedBy, ChangedByUserId, ChangedDate)
VALUES
(1,  1, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-01-05 09:00:00'),
(2,  2, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-01-10 10:30:00'),
(3,  2, 'Created',          'Artwork Pending',    'Artwork design initiated',            'Admin', 1, '2025-01-12 14:00:00'),
(4,  3, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-01-15 11:00:00'),
(5,  3, 'Created',          'Artwork Pending',    'Sent for artwork approval',           'Admin', 1, '2025-01-20 10:00:00'),
(6,  3, 'Artwork Pending',  'QA Pending',         'Artwork approved, QA started',        'Admin', 1, '2025-01-28 16:00:00'),
(7,  4, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-02-01 09:30:00'),
(8,  4, 'Created',          'Artwork Pending',    'Artwork initiated',                   'Admin', 1, '2025-02-05 09:00:00'),
(9,  4, 'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-02-10 11:00:00'),
(10, 4, 'QA Pending',       'Production Pending', 'QA cleared, production scheduled',   'Admin', 1, '2025-02-15 17:00:00'),
(11, 5, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-02-10 08:00:00'),
(12, 5, 'Created',          'Artwork Pending',    'Artwork started',                     'Admin', 1, '2025-02-15 09:00:00'),
(13, 5, 'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-02-20 10:00:00'),
(14, 5, 'QA Pending',       'Production Pending', 'QA approved',                         'Admin', 1, '2025-02-25 11:00:00'),
(15, 5, 'Production Pending','Dispatched',        'Dispatched via DHL Express',          'Admin', 1, '2025-03-20 10:00:00'),
(16, 6, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-02-15 14:00:00'),
(17, 6, 'Created',          'Cancelled',          'Client cancelled the order',          'Admin', 1, '2025-02-16 09:00:00'),
(18, 7, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-03-01 09:00:00'),
(19, 8, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-03-10 11:00:00'),
(20, 8, 'Created',          'Artwork Pending',    'Sent to design team',                 'Admin', 1, '2025-03-11 14:00:00'),
(21, 9, NULL,               'Created',            'Order created',                       'Admin', 1, '2025-03-18 10:00:00'),
(22, 10,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-03-22 14:00:00'),
(23, 10,'Created',          'Artwork Pending',    'Artwork initiated',                   'Admin', 1, '2025-03-28 10:00:00'),
(24, 10,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-04-05 11:00:00'),
(25, 11,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-04-02 09:00:00'),
(26, 11,'Created',          'Artwork Pending',    'Artwork started',                     'Admin', 1, '2025-04-06 10:00:00'),
(27, 11,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-04-12 11:00:00'),
(28, 11,'QA Pending',       'Production Pending', 'QA cleared',                          'Admin', 1, '2025-04-15 16:00:00'),
(29, 12,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-04-08 08:30:00'),
(30, 12,'Created',          'Artwork Pending',    'Artwork started',                     'Admin', 1, '2025-04-12 09:00:00'),
(31, 12,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-04-18 10:00:00'),
(32, 12,'QA Pending',       'Production Pending', 'QA approved',                         'Admin', 1, '2025-04-22 11:00:00'),
(33, 12,'Production Pending','Dispatched',        'Dispatched on schedule',              'Admin', 1, '2025-05-20 09:00:00'),
(34, 13,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-04-14 10:30:00'),
(35, 14,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-04-20 11:00:00'),
(36, 14,'Created',          'Artwork Pending',    'Artwork in progress',                 'Admin', 1, '2025-04-22 09:00:00'),
(37, 15,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-04-28 14:00:00'),
(38, 15,'Created',          'Artwork Pending',    'Artwork initiated',                   'Admin', 1, '2025-05-05 10:00:00'),
(39, 15,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-05-12 13:00:00'),
(40, 16,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-05-05 09:30:00'),
(41, 17,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-05-10 10:00:00'),
(42, 17,'Created',          'Artwork Pending',    'Artwork started',                     'Admin', 1, '2025-05-14 10:00:00'),
(43, 17,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-05-20 11:00:00'),
(44, 17,'QA Pending',       'Production Pending', 'QA cleared',                          'Admin', 1, '2025-05-25 15:00:00'),
(45, 18,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-05-15 11:30:00'),
(46, 18,'Created',          'Artwork Pending',    'Artwork in progress',                 'Admin', 1, '2025-05-17 10:00:00'),
(47, 19,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-05-20 09:00:00'),
(48, 19,'Created',          'Artwork Pending',    'Artwork started',                     'Admin', 1, '2025-05-25 10:00:00'),
(49, 19,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-06-01 11:00:00'),
(50, 19,'QA Pending',       'Production Pending', 'QA approved',                         'Admin', 1, '2025-06-05 12:00:00'),
(51, 19,'Production Pending','Dispatched',        'Dispatched on time',                  'Admin', 1, '2025-07-05 11:00:00'),
(52, 20,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-06-01 10:00:00'),
(53, 21,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-06-08 11:00:00'),
(54, 21,'Created',          'Artwork Pending',    'Artwork initiated',                   'Admin', 1, '2025-06-14 10:00:00'),
(55, 21,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-06-22 14:00:00'),
(56, 22,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-06-15 09:30:00'),
(57, 23,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-06-22 10:00:00'),
(58, 23,'Created',          'Artwork Pending',    'Artwork in progress',                 'Admin', 1, '2025-06-24 11:00:00'),
(59, 24,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-07-01 09:00:00'),
(60, 24,'Created',          'Artwork Pending',    'Artwork initiated',                   'Admin', 1, '2025-07-06 10:00:00'),
(61, 24,'Artwork Pending',  'QA Pending',         'Artwork approved',                    'Admin', 1, '2025-07-12 11:00:00'),
(62, 24,'QA Pending',       'Production Pending', 'QA cleared',                          'Admin', 1, '2025-07-16 16:00:00'),
(63, 25,NULL,               'Created',            'Order created',                       'Admin', 1, '2025-07-10 10:30:00');

SET IDENTITY_INSERT OrderStatusHistory OFF;
GO

-- ============================================================
-- Audit Logs (Created entry for each order)
-- ============================================================
SET IDENTITY_INSERT OrderAuditLogs ON;
GO

INSERT INTO OrderAuditLogs
    (AuditLogId, OrderId, Action, FieldName, OldValue, NewValue, ChangedBy, ChangedByUserId, ChangedDate)
VALUES
(1,  1,  'Created',       NULL, NULL, 'Order ORD-2025-001 created',  'Admin', 1, '2025-01-05 09:00:00'),
(2,  2,  'Created',       NULL, NULL, 'Order ORD-2025-002 created',  'Admin', 1, '2025-01-10 10:30:00'),
(3,  2,  'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-01-12 14:00:00'),
(4,  3,  'Created',       NULL, NULL, 'Order ORD-2025-003 created',  'Admin', 1, '2025-01-15 11:00:00'),
(5,  3,  'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-01-20 10:00:00'),
(6,  3,  'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-01-28 16:00:00'),
(7,  4,  'Created',       NULL, NULL, 'Order ORD-2025-004 created',  'Admin', 1, '2025-02-01 09:30:00'),
(8,  4,  'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-02-05 09:00:00'),
(9,  4,  'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-02-10 11:00:00'),
(10, 4,  'StatusChanged', 'CurrentStatus', 'QA Pending', 'Production Pending', 'Admin', 1, '2025-02-15 17:00:00'),
(11, 5,  'Created',       NULL, NULL, 'Order ORD-2025-005 created',  'Admin', 1, '2025-02-10 08:00:00'),
(12, 5,  'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-02-15 09:00:00'),
(13, 5,  'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-02-20 10:00:00'),
(14, 5,  'StatusChanged', 'CurrentStatus', 'QA Pending', 'Production Pending', 'Admin', 1, '2025-02-25 11:00:00'),
(15, 5,  'StatusChanged', 'CurrentStatus', 'Production Pending', 'Dispatched', 'Admin', 1, '2025-03-20 10:00:00'),
(16, 6,  'Created',       NULL, NULL, 'Order ORD-2025-006 created',  'Admin', 1, '2025-02-15 14:00:00'),
(17, 6,  'StatusChanged', 'CurrentStatus', 'Created', 'Cancelled', 'Admin', 1, '2025-02-16 09:00:00'),
(18, 6,  'Deleted',       NULL, NULL, 'Order soft-deleted (IsActive=0)', 'Admin', 1, '2025-02-16 09:01:00'),
(19, 7,  'Created',       NULL, NULL, 'Order ORD-2025-007 created',  'Admin', 1, '2025-03-01 09:00:00'),
(20, 8,  'Created',       NULL, NULL, 'Order ORD-2025-008 created',  'Admin', 1, '2025-03-10 11:00:00'),
(21, 8,  'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-03-11 14:00:00'),
(22, 9,  'Created',       NULL, NULL, 'Order ORD-2025-009 created',  'Admin', 1, '2025-03-18 10:00:00'),
(23, 10, 'Created',       NULL, NULL, 'Order ORD-2025-010 created',  'Admin', 1, '2025-03-22 14:00:00'),
(24, 10, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-03-28 10:00:00'),
(25, 10, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-04-05 11:00:00'),
(26, 11, 'Created',       NULL, NULL, 'Order ORD-2025-011 created',  'Admin', 1, '2025-04-02 09:00:00'),
(27, 11, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-04-06 10:00:00'),
(28, 11, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-04-12 11:00:00'),
(29, 11, 'StatusChanged', 'CurrentStatus', 'QA Pending', 'Production Pending', 'Admin', 1, '2025-04-15 16:00:00'),
(30, 12, 'Created',       NULL, NULL, 'Order ORD-2025-012 created',  'Admin', 1, '2025-04-08 08:30:00'),
(31, 12, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-04-12 09:00:00'),
(32, 12, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-04-18 10:00:00'),
(33, 12, 'StatusChanged', 'CurrentStatus', 'QA Pending', 'Production Pending', 'Admin', 1, '2025-04-22 11:00:00'),
(34, 12, 'StatusChanged', 'CurrentStatus', 'Production Pending', 'Dispatched', 'Admin', 1, '2025-05-20 09:00:00'),
(35, 13, 'Created',       NULL, NULL, 'Order ORD-2025-013 created',  'Admin', 1, '2025-04-14 10:30:00'),
(36, 14, 'Created',       NULL, NULL, 'Order ORD-2025-014 created',  'Admin', 1, '2025-04-20 11:00:00'),
(37, 14, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-04-22 09:00:00'),
(38, 15, 'Created',       NULL, NULL, 'Order ORD-2025-015 created',  'Admin', 1, '2025-04-28 14:00:00'),
(39, 15, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-05-05 10:00:00'),
(40, 15, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-05-12 13:00:00'),
(41, 16, 'Created',       NULL, NULL, 'Order ORD-2025-016 created',  'Admin', 1, '2025-05-05 09:30:00'),
(42, 17, 'Created',       NULL, NULL, 'Order ORD-2025-017 created',  'Admin', 1, '2025-05-10 10:00:00'),
(43, 17, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-05-14 10:00:00'),
(44, 17, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-05-20 11:00:00'),
(45, 17, 'StatusChanged', 'CurrentStatus', 'QA Pending', 'Production Pending', 'Admin', 1, '2025-05-25 15:00:00'),
(46, 18, 'Created',       NULL, NULL, 'Order ORD-2025-018 created',  'Admin', 1, '2025-05-15 11:30:00'),
(47, 18, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-05-17 10:00:00'),
(48, 19, 'Created',       NULL, NULL, 'Order ORD-2025-019 created',  'Admin', 1, '2025-05-20 09:00:00'),
(49, 19, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-05-25 10:00:00'),
(50, 19, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-06-01 11:00:00'),
(51, 19, 'StatusChanged', 'CurrentStatus', 'QA Pending', 'Production Pending', 'Admin', 1, '2025-06-05 12:00:00'),
(52, 19, 'StatusChanged', 'CurrentStatus', 'Production Pending', 'Dispatched', 'Admin', 1, '2025-07-05 11:00:00'),
(53, 20, 'Created',       NULL, NULL, 'Order ORD-2025-020 created',  'Admin', 1, '2025-06-01 10:00:00'),
(54, 21, 'Created',       NULL, NULL, 'Order ORD-2025-021 created',  'Admin', 1, '2025-06-08 11:00:00'),
(55, 21, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-06-14 10:00:00'),
(56, 21, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-06-22 14:00:00'),
(57, 22, 'Created',       NULL, NULL, 'Order ORD-2025-022 created',  'Admin', 1, '2025-06-15 09:30:00'),
(58, 23, 'Created',       NULL, NULL, 'Order ORD-2025-023 created',  'Admin', 1, '2025-06-22 10:00:00'),
(59, 23, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-06-24 11:00:00'),
(60, 24, 'Created',       NULL, NULL, 'Order ORD-2025-024 created',  'Admin', 1, '2025-07-01 09:00:00'),
(61, 24, 'StatusChanged', 'CurrentStatus', 'Created', 'Artwork Pending', 'Admin', 1, '2025-07-06 10:00:00'),
(62, 24, 'StatusChanged', 'CurrentStatus', 'Artwork Pending', 'QA Pending', 'Admin', 1, '2025-07-12 11:00:00'),
(63, 24, 'StatusChanged', 'CurrentStatus', 'QA Pending', 'Production Pending', 'Admin', 1, '2025-07-16 16:00:00'),
(64, 25, 'Created',       NULL, NULL, 'Order ORD-2025-025 created',  'Admin', 1, '2025-07-10 10:30:00');

SET IDENTITY_INSERT OrderAuditLogs OFF;
GO
