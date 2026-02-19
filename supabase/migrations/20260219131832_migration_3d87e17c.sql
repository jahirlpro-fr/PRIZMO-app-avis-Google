-- Create establishments table
CREATE TABLE IF NOT EXISTS establishments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  google_maps_url TEXT NOT NULL,
  instagram_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#8b5cf6',
  secondary_color TEXT NOT NULL DEFAULT '#d946ef',
  enable_instagram_wheel BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create segments table
CREATE TABLE IF NOT EXISTS segments (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('prize', 'no-prize')),
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
  "order" INTEGER NOT NULL,
  UNIQUE(establishment_id, "order")
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  prize1 TEXT,
  prize2 TEXT,
  has_spun_wheel2 BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_segments_establishment ON segments(establishment_id);
CREATE INDEX IF NOT EXISTS idx_participants_establishment ON participants(establishment_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(establishment_id, email);
CREATE INDEX IF NOT EXISTS idx_establishments_slug ON establishments(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, will be restricted with auth later)
CREATE POLICY "Allow all access to establishments" ON establishments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to segments" ON segments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to participants" ON participants FOR ALL USING (true) WITH CHECK (true);