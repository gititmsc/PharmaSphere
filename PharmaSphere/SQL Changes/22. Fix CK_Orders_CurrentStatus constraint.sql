-- Drop the old constraint that only knew about the original status values
ALTER TABLE Orders DROP CONSTRAINT CK_Orders_CurrentStatus;

update Orders SET CurrentStatus = 'PIS Pending' where CurrentStatus = 'Created'
update Orders SET CurrentStatus = 'PIS Pending' where CurrentStatus = 'QA Pending'


-- Recreate with all current status values
ALTER TABLE Orders ADD CONSTRAINT CK_Orders_CurrentStatus CHECK (CurrentStatus IN (
    'PIS Pending',
    'Artwork Pending',
    'PM Supply Pending',
    'Production Pending',
    'Packing Pending',
    'Dispatch Pending',
    'Dispatched',
    'Cancelled'
));
