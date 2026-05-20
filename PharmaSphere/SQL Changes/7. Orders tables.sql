-- ============================================================
-- Sales Order Module: Table Definitions
-- ============================================================

CREATE TABLE Orders
(
    OrderId INT IDENTITY(1,1) PRIMARY KEY,

    -- ==============================
    -- ADMIN FIELDS
    -- ==============================
    OrderNo                         NVARCHAR(50)    NOT NULL,
    OrderDate                       DATE            NOT NULL,
    BrandName                       NVARCHAR(200)   NULL,
    Composition                     NVARCHAR(500)   NULL,
    Qty                             INT             NULL,
    ShelfLifeMonths                 INT             NULL,
    MRP                             DECIMAL(18,2)   NULL,
    Party                           NVARCHAR(200)   NULL,
    Make                            NVARCHAR(200)   NULL,
    AdminRemarks                    NVARCHAR(1000)  NULL,
    Rate                            DECIMAL(18,2)   NULL,
    Amount                          AS (CAST(ISNULL(Qty,0) AS DECIMAL(18,2)) * ISNULL(Rate,0)) PERSISTED,
    PaymentTerms                    NVARCHAR(500)   NULL,
    Vial                            NVARCHAR(100)   NULL,
    SealColour                      NVARCHAR(100)   NULL,
    WFI                             NVARCHAR(100)   NULL,
    Label                           NVARCHAR(100)   NULL,
    MonoBox                         NVARCHAR(100)   NULL,
    Tray                            NVARCHAR(100)   NULL,
    Leaflet                         NVARCHAR(100)   NULL,
    SyringeAndNeedle                NVARCHAR(100)   NULL,
    Shrink                          NVARCHAR(100)   NULL,
    Shipper                         NVARCHAR(100)   NULL,
    DeliverySchedule                DATE            NULL,
    OtherRemarks                    NVARCHAR(1000)  NULL,

    -- ==============================
    -- QA FIELDS
    -- ==============================
    PISApprovalDate                 DATE            NULL,
    SanoletPartyArtworkApprovalDate DATE            NULL,
    QARemarks                       NVARCHAR(1000)  NULL,
    MonoBoxSupplyVendorApprovalDate DATE            NULL,
    LabelSupplyVendorApprovalDate   DATE            NULL,
    InsertSupplyVendorApprovalDate  DATE            NULL,
    TraySupplyVendorApprovalDate    DATE            NULL,
    ShipperSupplyVendorApprovalDate DATE            NULL,

    -- ==============================
    -- PRODUCTION FIELDS
    -- ==============================
    ProductionMonoBox               NVARCHAR(100)   NULL,
    ProductionLabel                 NVARCHAR(100)   NULL,
    ProductionInsert                NVARCHAR(100)   NULL,
    ProductionTray                  NVARCHAR(100)   NULL,
    ProductionShipper               NVARCHAR(100)   NULL,
    FillingPlan                     DATE            NULL,
    PackingPlan                     DATE            NULL,
    Sterility14DaysDate             DATE            NULL,
    DispatchDate                    DATE            NULL,

    -- ==============================
    -- STATUS
    -- ==============================
    CurrentStatus                   NVARCHAR(50)    NOT NULL DEFAULT 'Created',

    -- ==============================
    -- AUDIT FIELDS
    -- ==============================
    CreatedBy                       NVARCHAR(100)   NULL,
    CreatedByUserId                 INT             NULL,
    CreatedDate                     DATETIME        NOT NULL DEFAULT GETDATE(),
    UpdatedBy                       NVARCHAR(100)   NULL,
    UpdatedByUserId                 INT             NULL,
    UpdatedDate                     DATETIME        NULL,
    IsActive                        BIT             NOT NULL DEFAULT 1,

    -- Constraints
    CONSTRAINT CK_Orders_CurrentStatus CHECK (CurrentStatus IN (
        'Created', 'Artwork Pending', 'QA Pending',
        'Production Pending', 'Dispatched', 'Cancelled'
    )),
    CONSTRAINT FK_Orders_CreatedByUser FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Orders_UpdatedByUser FOREIGN KEY (UpdatedByUserId) REFERENCES Users(UserId)
);
GO

CREATE UNIQUE INDEX UX_Orders_OrderNo   ON Orders(OrderNo)   WHERE IsActive = 1;
CREATE        INDEX IX_Orders_IsActive  ON Orders(IsActive);
CREATE        INDEX IX_Orders_Status    ON Orders(CurrentStatus);
CREATE        INDEX IX_Orders_OrderDate ON Orders(OrderDate DESC);
CREATE        INDEX IX_Orders_Party     ON Orders(Party);
GO

-- ============================================================
-- Order Status History
-- ============================================================
CREATE TABLE OrderStatusHistory
(
    HistoryId       INT IDENTITY(1,1) PRIMARY KEY,
    OrderId         INT             NOT NULL,
    FromStatus      NVARCHAR(50)    NULL,
    ToStatus        NVARCHAR(50)    NOT NULL,
    Remarks         NVARCHAR(500)   NULL,
    ChangedBy       NVARCHAR(100)   NULL,
    ChangedByUserId INT             NULL,
    ChangedDate     DATETIME        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_OrderStatusHistory_Order FOREIGN KEY (OrderId)
        REFERENCES Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_OrderStatusHistory_User FOREIGN KEY (ChangedByUserId)
        REFERENCES Users(UserId)
);
GO

CREATE INDEX IX_OrderStatusHistory_OrderId ON OrderStatusHistory(OrderId);
GO

-- ============================================================
-- Order Audit Logs
-- ============================================================
CREATE TABLE OrderAuditLogs
(
    AuditLogId      INT IDENTITY(1,1) PRIMARY KEY,
    OrderId         INT             NOT NULL,
    Action          NVARCHAR(50)    NOT NULL,   -- Created | Updated | Deleted | Restored | StatusChanged
    FieldName       NVARCHAR(100)   NULL,
    OldValue        NVARCHAR(MAX)   NULL,
    NewValue        NVARCHAR(MAX)   NULL,
    ChangedBy       NVARCHAR(100)   NULL,
    ChangedByUserId INT             NULL,
    ChangedDate     DATETIME        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_OrderAuditLogs_Order FOREIGN KEY (OrderId)
        REFERENCES Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_OrderAuditLogs_User FOREIGN KEY (ChangedByUserId)
        REFERENCES Users(UserId)
);
GO

CREATE INDEX IX_OrderAuditLogs_OrderId ON OrderAuditLogs(OrderId);
GO
