# Architecture and Supabase scaling (1000+ users)

## Overview

- **Frontend:** React + Vite, Zustand (single store), React Router.
- **Backend:** Supabase (Postgres + Auth). No separate API server; client talks to Supabase via JS client with RLS.
- **Data flow:** App boot → auth check → `loadFromSupabase(userId)` loads wedding, saved items, checklist, and budget from Supabase (moodboard too). Listings are fetched per page (Explore) or paginated (Chatbot).

---

## Supabase schema (current)

| Table | Purpose | Key indexes |
|-------|--------|-------------|
| `profiles` | User profile (email, full_name, is_admin) | PK on id |
| `weddings` | One per user “current” wedding; allocation_overrides, manual_category_spend (JSONB) | user_id, (user_id, is_current) partial |
| `listings` | Vendors (venues, caterers, etc.); shared, read-mostly | status partial, (status, type) |
| `saved_items` | User’s shortlisted listings per wedding | user_id, wedding_id |
| `checklist_items` | Tasks per wedding; UNIQUE(user_id, wedding_id, task_key) | (user_id, wedding_id) |
| `budget_entries` | Budget expense rows per wedding | (user_id, wedding_id) |
| `moodboard_items` | User moodboard (images, links, Pinterest) | user_id |
| `enquiries` | Enquiries to vendors | user_id, listing_id, (listing_id, status) |

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

### High impact (done)

- **Listings pagination / limit**  
  - Implemented: `getListings({ offset, limit, type })` with default limit 200; Explore uses it with “Load more”. Chatbot uses `getAllListings()` which pages under the hood. Composite index `(status, type)` is used for filtered requests.

- **Budget data persistence**  
  - Implemented: `budget_entries` table and `weddings.allocation_overrides` / `weddings.manual_category_spend` (JSONB). Migration `004_budget_persistence.sql`; `budget.service.ts` and store use Supabase instead of localStorage.

### Medium impact (done)

- **Checklist save strategy**  
  - Implemented: `saveChecklistItems` upserts by `(user_id, wedding_id, task_key)`, then deletes rows whose `task_key` is no longer in the list. Returns persisted items with DB ids so the store stays in sync.

- **Profiles sync**  
  - Implemented: `auth.service.updateProfile(userId, { full_name })` so profile edits go through Supabase. Use from any future “Account details” or profile-edit UI.

- **Enquiries**  
  - Index `enquiries(listing_id, status)` added in migration 003 for listing-centric queries (e.g. vendor dashboard).

### Optional (implemented where noted)

- **Read replicas**  
  - Supabase can add read replicas; use for heavy read paths (e.g. listing discovery) if needed later. No code change required—configure in Supabase project settings.

- **Caching**  
  - Implemented: short-lived client-side cache (2 min TTL) for the first page of published listings in `listings.service.ts` (`getListingsCached`). Explore uses it for the initial load; “Load more” fetches uncached.

- **Rate limiting**  
  - Supabase has built-in rate limiting. Implemented: app-side throttle for `loadFromSupabase` (2 s) to avoid rapid repeated full loads (e.g. on auth flicker). For stricter limits on sensitive or expensive operations, consider Supabase Edge or API-level rate limits.

---

## Data that still lives only in the client

- **Budget:** Now in Supabase (`budget_entries`, `weddings.allocation_overrides`, `weddings.manual_category_spend`).

- **Chatbot:** Pinterest themes from moodboard may still be read from localStorage in one code path; with moodboard in Supabase, that path could be updated to use moodboard API or pass moodboard themes from the app state.

---

## Summary

- **Architecture** is clear and fits a 1000+ user product: single store, Supabase-only backend, RLS, sensible indexes.
- **Schema** covers core functions (wedding, saved, checklist, moodboard, enquiries, listings) and is ready to scale with the added composite indexes and parallel load.
- **Next steps** with highest impact: add listing pagination/limits when the catalogue grows, and move budget data into Supabase for consistency and reliability.
