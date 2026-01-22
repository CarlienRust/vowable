import { supabase } from './supabaseClient';
import { WeddingPlan } from '../domain/types';

export interface WeddingRow {
  id: string;
  user_id: string;
  wedding_date: string | null;
  guest_count_range: string | null;
  total_budget: number | null;
  budget_preset: string | null;
  location: string;
  location_lat: number | null;
  location_lng: number | null;
  radius_km: number;
  theme_primary: string;
  theme_secondary: string | null;
  theme_tags: string[];
  theme_colors: string[];
  priorities: string[];
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export const weddingService = {
  async getCurrentWedding(userId: string): Promise<WeddingPlan | null> {
    const result = await this.getCurrentWeddingWithId(userId);
    return result?.plan || null;
  },

  async getCurrentWeddingWithId(userId: string): Promise<{ id: string; plan: WeddingPlan } | null> {
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_current', true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      plan: this.mapRowToPlan(data),
    };
  },

  async createWedding(userId: string, plan: WeddingPlan): Promise<string | null> {
    // Mark existing weddings as not current
    await supabase
      .from('weddings')
      .update({ is_current: false })
      .eq('user_id', userId)
      .eq('is_current', true);

    const { data, error } = await supabase
      .from('weddings')
      .insert({
        user_id: userId,
        wedding_date: plan.weddingDate,
        guest_count_range: plan.guestCountRange,
        total_budget: plan.totalBudget,
        budget_preset: plan.budgetPreset,
        location: plan.location,
        location_lat: plan.locationLat,
        location_lng: plan.locationLng,
        radius_km: plan.radiusKm,
        theme_primary: plan.themePrimary,
        theme_secondary: plan.themeSecondary,
        theme_tags: plan.themeTags,
        theme_colors: plan.themeColors,
        priorities: plan.priorities,
        is_current: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating wedding:', error);
      return null;
    }

    return data.id;
  },

  async updateWedding(weddingId: string, plan: WeddingPlan): Promise<boolean> {
    const { error } = await supabase
      .from('weddings')
      .update({
        wedding_date: plan.weddingDate,
        guest_count_range: plan.guestCountRange,
        total_budget: plan.totalBudget,
        budget_preset: plan.budgetPreset,
        location: plan.location,
        location_lat: plan.locationLat,
        location_lng: plan.locationLng,
        radius_km: plan.radiusKm,
        theme_primary: plan.themePrimary,
        theme_secondary: plan.themeSecondary,
        theme_tags: plan.themeTags,
        theme_colors: plan.themeColors,
        priorities: plan.priorities,
      })
      .eq('id', weddingId);

    return !error;
  },

  mapRowToPlan(row: WeddingRow): WeddingPlan {
    return {
      weddingDate: row.wedding_date,
      guestCountRange: row.guest_count_range as any,
      totalBudget: row.total_budget,
      budgetPreset: row.budget_preset as any,
      location: row.location,
      locationLat: row.location_lat,
      locationLng: row.location_lng,
      radiusKm: row.radius_km,
      themePrimary: row.theme_primary,
      themeSecondary: row.theme_secondary,
      themeTags: row.theme_tags,
      themeColors: row.theme_colors,
      priorities: row.priorities as any[],
    };
  },
};
