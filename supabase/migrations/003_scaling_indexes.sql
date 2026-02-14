-- Scaling: composite indexes for 1000+ users
-- Use these for common query patterns to keep queries fast under load.

-- Saved items: "my saved items for this wedding" (e.g. Saved page filter by wedding)
CREATE INDEX IF NOT EXISTS idx_saved_items_user_wedding
  ON saved_items(user_id, wedding_id);

-- Listings: filtered by status + type (Explore/Chatbot by venue/caterer/etc.)
CREATE INDEX IF NOT EXISTS idx_listings_status_type
  ON listings(status, type)
  WHERE status = 'published';

-- Enquiries: "enquiries for this listing" (for future vendor dashboard)
CREATE INDEX IF NOT EXISTS idx_enquiries_listing_status
  ON enquiries(listing_id, status);
