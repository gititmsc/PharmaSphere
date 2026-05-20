-- ============================================================
-- Seal Colors lookup table
-- ============================================================

CREATE TABLE SealColors
(
    SealColorId INT          IDENTITY(1,1) PRIMARY KEY,
    ColorName   NVARCHAR(100) NOT NULL,
    IsActive    BIT           NOT NULL DEFAULT 1,
    CONSTRAINT UQ_SealColors_ColorName UNIQUE (ColorName)
);
GO

INSERT INTO SealColors (ColorName) VALUES
('Black'),
('Blue'),
('Brown'),
('Coral'),
('Cyan'),
('Gold'),
('Green'),
('Lime'),
('Maroon'),
('Navy Blue'),
('Orange'),
('Peach'),
('Pink'),
('Purple'),
('Red'),
('Rose'),
('Silver'),
('Sky Blue'),
('Teal'),
('Violet'),
('White'),
('Yellow');
GO
