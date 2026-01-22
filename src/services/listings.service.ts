import { supabase } from './supabaseClient';
import { Listing, ListingType, PriceBand } from '../domain/types';

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
  async getAllListings(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'published')
      .order('name');

    if (error || !data) {
      return [];
    }

    return data.map((row) => this.mapRowToListing(row));
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
