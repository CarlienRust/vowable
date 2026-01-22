import { supabase } from './supabaseClient';
import { SavedItem, Listing } from '../domain/types';

export interface SavedItemRow {
  id: string;
  user_id: string;
  wedding_id: string | null;
  listing_id: string;
  notes: string;
  estimated_cost: number;
  status: string;
  saved_at: string;
  created_at: string;
  updated_at: string;
}

export const savedItemsService = {
  async getSavedItems(userId: string): Promise<SavedItem[]> {
    const { data, error } = await supabase
      .from('saved_items')
      .select('*, listing:listings(*)')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      listingId: row.listing_id,
      listing: row.listing as Listing,
      notes: row.notes || '',
      estimated_cost: row.estimated_cost || 0,
      status: row.status as any,
      savedAt: row.saved_at,
    }));
  },

  async addSavedItem(
    userId: string,
    weddingId: string | null,
    listing: Listing,
    notes: string = '',
    estimatedCost: number = 0
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('saved_items')
      .insert({
        user_id: userId,
        wedding_id: weddingId,
        listing_id: listing.id,
        notes,
        estimated_cost: estimatedCost,
        status: 'shortlisted',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding saved item:', error);
      return null;
    }

    return data.id;
  },

  async updateSavedItem(
    itemId: string,
    updates: Partial<Pick<SavedItem, 'notes' | 'estimated_cost' | 'status'>>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('saved_items')
      .update(updates)
      .eq('id', itemId);

    return !error;
  },

  async removeSavedItem(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId);

    return !error;
  },
};
