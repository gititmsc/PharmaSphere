-- Create OrderStatuses table
CREATE TABLE OrderStatuses (
    StatusId     INT IDENTITY(1,1) PRIMARY KEY,
    StatusName   NVARCHAR(100) NOT NULL,
    DisplayOrder INT NOT NULL,
    Color        NVARCHAR(50)  NOT NULL DEFAULT 'default',
    IsInitial    BIT NOT NULL DEFAULT 0,
    IsTerminal   BIT NOT NULL DEFAULT 0,
    ShowInFlow   BIT NOT NULL DEFAULT 1,
    IsActive     BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_OrderStatuses_StatusName UNIQUE (StatusName)
);

-- Create OrderStatusTransitions table
CREATE TABLE OrderStatusTransitions (
    TransitionId INT IDENTITY(1,1) PRIMARY KEY,
    FromStatus   NVARCHAR(100) NOT NULL,
    ToStatus     NVARCHAR(100) NOT NULL,
    CONSTRAINT FK_Transitions_From FOREIGN KEY (FromStatus) REFERENCES OrderStatuses(StatusName),
    CONSTRAINT FK_Transitions_To   FOREIGN KEY (ToStatus)   REFERENCES OrderStatuses(StatusName),
    CONSTRAINT UQ_OrderStatusTransitions UNIQUE (FromStatus, ToStatus)
);

-- Seed statuses
INSERT INTO OrderStatuses (StatusName, DisplayOrder, Color, IsInitial, IsTerminal, ShowInFlow) VALUES
('PIS Pending',        1, 'default',   1, 0, 1),
('Artwork Pending',    2, 'info',       0, 0, 1),
('PM Supply Pending',  3, 'warning',    0, 0, 1),
('Production Pending', 4, 'secondary',  0, 0, 1),
('Packing Pending',    5, 'primary',    0, 0, 1),
('Dispatch Pending',   6, 'warning',    0, 0, 1),
('Dispatched',         7, 'success',    0, 1, 1),
('Cancelled',          8, 'error',      0, 1, 0);

-- Seed transitions
INSERT INTO OrderStatusTransitions (FromStatus, ToStatus) VALUES
('PIS Pending',        'Artwork Pending'),
('PIS Pending',        'Cancelled'),
('Artwork Pending',    'PM Supply Pending'),
('Artwork Pending',    'Cancelled'),
('PM Supply Pending',  'Production Pending'),
('PM Supply Pending',  'Cancelled'),
('Production Pending', 'Packing Pending'),
('Production Pending', 'Cancelled'),
('Packing Pending',    'Dispatch Pending'),
('Packing Pending',    'Cancelled'),
('Dispatch Pending',   'Dispatched'),
('Dispatch Pending',   'Cancelled');
