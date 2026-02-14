# Architecture and Supabase scaling (1000+ users)

## Overview

- **Frontend:** React + Vite, Zustand (single store), React Router.
- **Backend:** Supabase (Postgres + Auth). No separate API server; client talks to Supabase via JS client with RLS.
- **Data flow:** App boot → auth check → `loadFromSupabase(userId)` loads wedding, saved items, checklist (and local budget/moodboard where applicable). Listings are fetched per page (Explore, Chatbot).

---

## Supabase schema (current)

| Table | Purpose | Key indexes |
|-------|--------|-------------|
| `profiles` | User profile (email, full_name, is_admin) | PK on id |
| `weddings` | One per user “current” wedding; supports multiple later | user_id, (user_id, is_current) partial |
| `listings` | Vendors (venues, caterers, etc.); shared, read-mostly | status partial, type |
| `saved_items` | User’s shortlisted listings per wedding | user_id, wedding_id |
| `checklist_items` | Tasks per wedding | (user_id, wedding_id) |
| `moodboard_items` | User moodboard (images, links, Pinterest) | user_id |
| `enquiries` | Enquiries to vendors | user_id, listing_id |

All tables use RLS with user-scoped (or admin) policies. No cross-user data leakage.

---

## What’s in good shape for scaling

1. **RLS everywhere** – Enforced at DB; safe for multi-tenant at 1000+ users.
2. **Indexes on foreign keys and filters** – user_id, wedding_id, listing_id, status, type are indexed.
3. **Single source of truth** – Wedding, saved items, checklist, moodboard in Supabase; one canonical load on login.
4. **Listings read path** – Single query with `status = 'published'` and index; no N+1.
5. **Saved items** – One query with join to `listings`; indexed on user_id and wedding_id (after 003).
6. **Moodboard** – In Supabase; survives reload and works across devices.

---

## Improvements made for 1000+ users

1. **Composite indexes (migration 003)**  
   - `saved_items(user_id, wedding_id)` – “my saved items for this wedding.”  
   - `listings(status, type)` – filtered listing pages (Explore by type).  
   - `checklist_items` already has a UNIQUE (user_id, wedding_id, task_key) which supports lookups.

2. **Faster initial load**  
   - `loadFromSupabase` now runs **wedding** first, then **saved items** and **checklist** in parallel (checklist needs weddingId from first step). Reduces perceived latency for returning users.

3. **Listings query**  
   - Already uses `eq('status', 'published')` and `order('name')`. Composite index (status, type) added for type-filtered views. For very large listing tables (e.g. 10k+ rows), consider pagination or cursor-based load next.

---

## Recommendations going forward

### High impact

- **Listings pagination / limit**  
  - `getAllListings()` currently loads all published listings. When the catalogue grows (e.g. 1k+ listings), add either a limit (e.g. 200) + “Load more” or proper pagination (offset/limit or keyset) and use the (status, type) index for filters.

- **Budget data persistence**  
  - Budget expenses, manual category spend, and allocation overrides live in **localStorage** only. They don’t sync across devices and are lost if the user clears storage. For consistency and scale, move these into Supabase (e.g. a `budget_entries` table and an `allocation_overrides` JSONB column on `weddings` or a small `user_budget_settings` table).

### Medium impact

- **Checklist save strategy**  
  - `saveChecklistItems` currently deletes all items for the wedding then re-inserts. For 100–200 items this is acceptable. If checklist size or update frequency grows, consider upserting by `task_key` and only inserting/updating/deleting changed rows.

- **Profiles sync**  
  - Profile (e.g. email, full_name) is created on signup via trigger. If you need profile edits from the app, ensure updates go through Supabase so all clients see the same data.

- **Enquiries**  
  - If you add a “vendor dashboard” (enquiries per listing), add an index on `enquiries(listing_id, status)` for listing-centric queries.

### Optional

- **Read replicas**  
  - Supabase can add read replicas; use for heavy read paths (e.g. listing discovery) if needed later.

- **Caching**  
  - Listings are fetched on Explore and Chatbot. For 1000+ concurrent users, consider short-lived client-side cache (e.g. 1–5 min) or a thin edge cache for the published-listings query.

- **Rate limiting**  
  - Supabase has built-in rate limiting. For sensitive or expensive operations, consider additional app-side or Supabase Edge rate limits.

---

## Data that still lives only in the client

- **Budget:** `budgetExpenses`, `manualCategorySpend`, `budgetAllocationOverrides` (localStorage keyed by weddingId).  
  → Prefer moving to Supabase for durability and multi-device.

- **Chatbot:** Pinterest themes from moodboard are still read from localStorage in one code path; with moodboard in Supabase, that path could be updated to use moodboard API or pass moodboard themes from the app state.

---

## Summary

- **Architecture** is clear and fits a 1000+ user product: single store, Supabase-only backend, RLS, sensible indexes.
- **Schema** covers core functions (wedding, saved, checklist, moodboard, enquiries, listings) and is ready to scale with the added composite indexes and parallel load.
- **Next steps** with highest impact: add listing pagination/limits when the catalogue grows, and move budget data into Supabase for consistency and reliability.
