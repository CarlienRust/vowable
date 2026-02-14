import { supabase } from './supabaseClient';
import { BudgetExpense } from '../domain/types';

export interface BudgetSettings {
  allocationOverrides: Record<string, number>;
  manualCategorySpend: Record<string, number>;
}

export const budgetService = {
  async getBudgetEntries(userId: string, weddingId: string): Promise<BudgetExpense[]> {
    const { data, error } = await supabase
      .from('budget_entries')
      .select('id, category, amount, description, created_at')
      .eq('user_id', userId)
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      category: row.category,
      amount: Number(row.amount),
      description: row.description ?? '',
    }));
  },

  async addBudgetEntry(
    userId: string,
    weddingId: string,
    entry: Omit<BudgetExpense, 'id'>
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('budget_entries')
      .insert({
        user_id: userId,
        wedding_id: weddingId,
        category: entry.category,
        amount: entry.amount,
        description: entry.description || '',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding budget entry:', error);
      return null;
    }
    return data.id;
  },

  async removeBudgetEntry(entryId: string): Promise<boolean> {
    const { error } = await supabase.from('budget_entries').delete().eq('id', entryId);
    return !error;
  },

  async getBudgetSettings(userId: string, weddingId: string): Promise<BudgetSettings | null> {
    const { data, error } = await supabase
      .from('weddings')
      .select('allocation_overrides, manual_category_spend')
      .eq('id', weddingId)
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    const allocationOverrides = (data.allocation_overrides as Record<string, number>) ?? {};
    const manualCategorySpend = (data.manual_category_spend as Record<string, number>) ?? {};
    return {
      allocationOverrides:
        typeof allocationOverrides === 'object' && allocationOverrides !== null
          ? allocationOverrides
          : {},
      manualCategorySpend:
        typeof manualCategorySpend === 'object' && manualCategorySpend !== null
          ? manualCategorySpend
          : {},
    };
  },

  async updateBudgetSettings(
    userId: string,
    weddingId: string,
    settings: Partial<BudgetSettings>
  ): Promise<boolean> {
    const updates: Record<string, unknown> = {};
    if (settings.allocationOverrides !== undefined) {
      updates.allocation_overrides = settings.allocationOverrides;
    }
    if (settings.manualCategorySpend !== undefined) {
      updates.manual_category_spend = settings.manualCategorySpend;
    }
    if (Object.keys(updates).length === 0) return true;

    const { error } = await supabase
      .from('weddings')
      .update(updates)
      .eq('id', weddingId)
      .eq('user_id', userId);

    return !error;
  },
};
