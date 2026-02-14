-- Moodboard items: per-user (no wedding_id) so moodboard persists across app reloads
CREATE TABLE moodboard_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'pinterest', 'link')),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail TEXT,
  preview_images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moodboard_items_user_id ON moodboard_items(user_id);

ALTER TABLE moodboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own moodboard items"
  ON moodboard_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moodboard items"
  ON moodboard_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moodboard items"
  ON moodboard_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moodboard items"
  ON moodboard_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_moodboard_items_updated_at BEFORE UPDATE ON moodboard_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
