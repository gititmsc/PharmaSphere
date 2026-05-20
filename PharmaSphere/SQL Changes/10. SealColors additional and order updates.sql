-- ============================================================
-- Add standard pharma seal colors + update existing orders
-- ============================================================

-- Step 1: Add additional standard colors
INSERT INTO SealColors (ColorName)
VALUES
('Amber'),
('Bronze'),
('Crimson'),
('Dark Blue'),
('Dark Green'),
('Dark Red'),
('Indigo'),
('Ivory'),
('Light Blue'),
('Light Green'),
('Magenta'),
('Olive'),
('Turquoise');
GO

-- Step 2: Update existing order seal colours to use a variety from the full list
UPDATE Orders SET SealColour = 'Red'         WHERE OrderId = 1;
UPDATE Orders SET SealColour = 'Blue'        WHERE OrderId = 2;
UPDATE Orders SET SealColour = 'Green'       WHERE OrderId = 3;
UPDATE Orders SET SealColour = 'Yellow'      WHERE OrderId = 4;
UPDATE Orders SET SealColour = 'Silver'      WHERE OrderId = 5;
UPDATE Orders SET SealColour = 'White'       WHERE OrderId = 6;
UPDATE Orders SET SealColour = 'Orange'      WHERE OrderId = 7;
UPDATE Orders SET SealColour = 'Purple'      WHERE OrderId = 8;
UPDATE Orders SET SealColour = 'Teal'        WHERE OrderId = 9;
UPDATE Orders SET SealColour = 'Dark Blue'   WHERE OrderId = 10;
UPDATE Orders SET SealColour = 'Brown'       WHERE OrderId = 11;
UPDATE Orders SET SealColour = 'Gold'        WHERE OrderId = 12;
UPDATE Orders SET SealColour = 'Navy Blue'   WHERE OrderId = 13;
UPDATE Orders SET SealColour = 'Black'       WHERE OrderId = 14;
UPDATE Orders SET SealColour = 'Maroon'      WHERE OrderId = 15;
UPDATE Orders SET SealColour = 'Light Blue'  WHERE OrderId = 16;
UPDATE Orders SET SealColour = 'Violet'      WHERE OrderId = 17;
UPDATE Orders SET SealColour = 'Cyan'        WHERE OrderId = 18;
UPDATE Orders SET SealColour = 'Rose'        WHERE OrderId = 19;
UPDATE Orders SET SealColour = 'Indigo'      WHERE OrderId = 20;
UPDATE Orders SET SealColour = 'Lime'        WHERE OrderId = 21;
UPDATE Orders SET SealColour = 'Coral'       WHERE OrderId = 22;
UPDATE Orders SET SealColour = 'Peach'       WHERE OrderId = 23;
UPDATE Orders SET SealColour = 'Ivory'       WHERE OrderId = 24;
UPDATE Orders SET SealColour = 'Sky Blue'    WHERE OrderId = 25;
GO
