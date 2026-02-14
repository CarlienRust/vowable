import { supabase } from './supabaseClient';
import { Listing, ListingType, PriceBand } from '../domain/types';

/** Default page size for listing discovery (scale-friendly). */
export const LISTINGS_PAGE_SIZE = 200;

/** Short-lived cache for published listings (optional scaling). */
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
let listingsCache: { data: Listing[]; expiresAt: number } | null = null;

export interface GetListingsOptions {
  offset?: number;
  limit?: number;
  type?: ListingType;
}

export interface GetListingsResult {
  data: Listing[];
  hasMore: boolean;
}

export interface ListingRow {
  id: string;
  type: ListingType;
  name: string;
  description: string | null;
  location_name: string;
  lat: number | null;
  lng: number | null;
  price_band: PriceBand;
  price_type: 'from' | 'per_person' | 'package' | 'quote_only' | null;
  price_min: number | null;
  price_max: number | null;
  pricing_notes: string | null;
  last_verified_at: string | null;
  currency: string;
  tags: string[];
  capacity_min: number | null;
  capacity_max: number | null;
  contact_url: string | null;
  phone: string | null;
  email: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export const listingsService = {
  /**
   * Fetch one page of published listings (pagination/limit for scale).
   */
  async getListings(options: GetListingsOptions = {}): Promise<GetListingsResult> {
    const { offset = 0, limit = LISTINGS_PAGE_SIZE, type } = options;
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('name')
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error || !data) {
      return { data: [], hasMore: false };
    }

    const listings = data.map((row) => this.mapRowToListing(row));
    const hasMore = (count ?? 0) > offset + listings.length;
    return { data: listings, hasMore };
  },

  /**
   * Fetch all published listings (e.g. for Chatbot matching). Uses pagination under the hood.
   */
  async getAllListings(type?: ListingType): Promise<Listing[]> {
    const all: Listing[] = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const { data, hasMore: more } = await this.getListings({
        offset,
        limit: LISTINGS_PAGE_SIZE,
        type,
      });
      all.push(...data);
      hasMore = more && data.length === LISTINGS_PAGE_SIZE;
      offset += data.length;
    }
    return all;
  },

  /**
   * Fetch published listings with optional short-lived cache (reduces load at scale).
   */
  async getListingsCached(options: GetListingsOptions = {}): Promise<GetListingsResult> {
    // Cache only for "first page, no type filter" to keep cache key simple
    const isFirstPage = (options.offset ?? 0) === 0 && !options.type;
    if (isFirstPage && listingsCache && Date.now() < listingsCache.expiresAt) {
      const cached = listingsCache.data;
      const limit = options.limit ?? LISTINGS_PAGE_SIZE;
      return {
        data: cached.slice(0, limit),
        hasMore: cached.length >= limit,
      };
    }
    const result = await this.getListings(options);
    if (isFirstPage && result.data.length > 0) {
      listingsCache = { data: result.data, expiresAt: Date.now() + CACHE_TTL_MS };
    }
    return result;
  },

  async getListingById(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToListing(data);
  },

  async createListing(listing: Partial<ListingRow>): Promise<string | null> {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return null;
    }

    return data.id;
  },

  async updateListing(id: string, updates: Partial<ListingRow>): Promise<boolean> {
    const { error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id);

    return !error;
  },

  mapRowToListing(row: ListingRow): Listing & {
    price_type?: 'from' | 'per_person' | 'package' | 'quote_only';
    price_min?: number | null;
    price_max?: number | null;
    pricing_notes?: string | null;
    last_verified_at?: string | null;
  } {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      description: row.description || undefined,
      location_name: row.location_name,
      lat: row.lat || 0,
      lng: row.lng || 0,
      price_band: row.price_band,
      tags: row.tags || [],
      capacity_min: row.capacity_min || undefined,
      capacity_max: row.capacity_max || undefined,
      contact_url: row.contact_url || '',
      price_type: row.price_type || undefined,
      price_min: row.price_min || undefined,
      price_max: row.price_max || undefined,
      pricing_notes: row.pricing_notes || undefined,
      last_verified_at: row.last_verified_at || undefined,
    };
  },
};
