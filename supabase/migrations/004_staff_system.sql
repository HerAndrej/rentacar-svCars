-- Staff system: worker roles + reservation tracking
-- Workers authenticate via Supabase Auth with generated emails (username@staff.internal)

-- Staff profiles table (mirrors auth.users for display/management)
CREATE TABLE staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'radnik' CHECK (role IN ('admin', 'radnik')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track which staff member created each reservation
ALTER TABLE reservations ADD COLUMN created_by_staff UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_reservations_created_by ON reservations(created_by_staff);

-- RLS for staff_profiles
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff profiles"
  ON staff_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert staff profiles"
  ON staff_profiles FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IS DISTINCT FROM 'radnik'
    )
  );

CREATE POLICY "Only admins can update staff profiles"
  ON staff_profiles FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IS DISTINCT FROM 'radnik'
    )
  );

CREATE POLICY "Only admins can delete staff profiles"
  ON staff_profiles FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IS DISTINCT FROM 'radnik'
    )
  );

-- Update reservations RLS: replace the broad SELECT policy
-- Workers can only see reservations they created; admins see all
DROP POLICY IF EXISTS "Reservations are viewable by authenticated users" ON reservations;

CREATE POLICY "Staff reservation access"
  ON reservations FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      (auth.jwt() -> 'user_metadata' ->> 'role') IS DISTINCT FROM 'radnik'
      OR created_by_staff = auth.uid()
    )
  );
