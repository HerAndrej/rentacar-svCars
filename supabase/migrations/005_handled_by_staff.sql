-- Track which staff member handled/processed each reservation
-- (separate from created_by_staff which tracks manual creation)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS handled_by_staff UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_handled_by ON reservations(handled_by_staff);
