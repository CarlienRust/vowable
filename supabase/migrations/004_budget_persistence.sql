-- Budget persistence: move expenses and allocation overrides from localStorage to Supabase

-- Budget expense entries per wedding (replaces localStorage budget_expenses)
CREATE TABLE budget_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_entries_user_wedding ON budget_entries(user_id, wedding_id);

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget entries"
  ON budget_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget entries"
  ON budget_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget entries"
  ON budget_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget entries"
  ON budget_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Allocation overrides and manual category spend on weddings (replaces localStorage)
ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS allocation_overrides JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS manual_category_spend JSONB DEFAULT '{}';
