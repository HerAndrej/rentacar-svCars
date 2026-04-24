-- Row Level Security Policies for SV Cars

-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Vehicles: public read, admin write
CREATE POLICY "Vehicles are viewable by everyone"
  ON vehicles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Vehicles are editable by authenticated users"
  ON vehicles FOR ALL
  USING (auth.role() = 'authenticated');

-- Reservations: anyone can insert, only admin can read/update
CREATE POLICY "Anyone can create a reservation"
  ON reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Reservations are viewable by authenticated users"
  ON reservations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Reservations are editable by authenticated users"
  ON reservations FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Contact messages: anyone can insert, only admin can read
CREATE POLICY "Anyone can send a contact message"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Contact messages are viewable by authenticated users"
  ON contact_messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Contact messages are editable by authenticated users"
  ON contact_messages FOR UPDATE
  USING (auth.role() = 'authenticated');
