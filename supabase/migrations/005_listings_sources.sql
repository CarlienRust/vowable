-- Listings: source tracking for external ingestion (e.g. Google Places)

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT;

-- Allow dedupe/upsert per external source record
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_source_source_id
  ON listings(source, source_id);

