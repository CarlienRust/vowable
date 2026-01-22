-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weddings table
CREATE TABLE weddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wedding_date DATE,
  guest_count_range TEXT,
  total_budget NUMERIC,
  budget_preset TEXT,
  location TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  radius_km INTEGER DEFAULT 50,
  theme_primary TEXT,
  theme_secondary TEXT,
  theme_tags TEXT[],
  theme_colors TEXT[],
  priorities TEXT[],
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('venue', 'caterer', 'florist', 'boutique', 'accommodation')),
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  price_band TEXT CHECK (price_band IN ('low', 'mid', 'high')),
  price_type TEXT CHECK (price_type IN ('from', 'per_person', 'package', 'quote_only')),
  price_min NUMERIC,
  price_max NUMERIC,
  pricing_notes TEXT,
  last_verified_at DATE,
  currency TEXT DEFAULT 'ZAR',
  tags TEXT[],
  capacity_min INTEGER,
  capacity_max INTEGER,
  contact_url TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved items table
CREATE TABLE saved_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'booked', 'rejected')),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  priority_score INTEGER DEFAULT 0,
  notes TEXT,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  category TEXT,
  dependencies TEXT[],
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wedding_id, task_key)
);

-- Enquiries table
CREATE TABLE enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'replied', 'booked', 'not_interested')),
  message TEXT,
  contact_method TEXT CHECK (contact_method IN ('email', 'whatsapp', 'website', 'phone')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_weddings_user_id ON weddings(user_id);
CREATE INDEX idx_weddings_user_current ON weddings(user_id, is_current) WHERE is_current = TRUE;
CREATE INDEX idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX idx_saved_items_wedding_id ON saved_items(wedding_id);
CREATE INDEX idx_checklist_items_user_wedding ON checklist_items(user_id, wedding_id);
CREATE INDEX idx_enquiries_user_id ON enquiries(user_id);
CREATE INDEX idx_enquiries_listing_id ON enquiries(listing_id);
CREATE INDEX idx_listings_status ON listings(status) WHERE status = 'published';
CREATE INDEX idx_listings_type ON listings(type);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Weddings policies
CREATE POLICY "Users can view own weddings"
  ON weddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weddings"
  ON weddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weddings"
  ON weddings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weddings"
  ON weddings FOR DELETE
  USING (auth.uid() = user_id);

-- Listings policies
CREATE POLICY "Anyone can view published listings"
  ON listings FOR SELECT
  USING (status = 'published' OR auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  ));

CREATE POLICY "Admins can insert listings"
  ON listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update listings"
  ON listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete listings"
  ON listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Saved items policies
CREATE POLICY "Users can view own saved items"
  ON saved_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved items"
  ON saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved items"
  ON saved_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items"
  ON saved_items FOR DELETE
  USING (auth.uid() = user_id);

-- Checklist items policies
CREATE POLICY "Users can view own checklist items"
  ON checklist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist items"
  ON checklist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist items"
  ON checklist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist items"
  ON checklist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Enquiries policies
CREATE POLICY "Users can view own enquiries"
  ON enquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enquiries"
  ON enquiries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own enquiries"
  ON enquiries FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_items_updated_at BEFORE UPDATE ON saved_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
