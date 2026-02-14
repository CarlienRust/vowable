import { supabase } from './supabaseClient';
import { ChecklistItem } from '../domain/types';

export interface ChecklistItemRow {
  id: string;
  user_id: string;
  wedding_id: string;
  task_key: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority_score: number;
  notes: string | null;
  reminder_enabled: boolean;
  category: string | null;
  dependencies: string[] | null;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
}

export const checklistService = {
  async getChecklistItems(userId: string, weddingId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', userId)
      .eq('wedding_id', weddingId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      task_key: row.task_key,
      title: row.title,
      due_date: row.due_date,
      completed: row.completed,
      priority_score: row.priority_score,
      notes: row.notes || undefined,
      reminder_enabled: row.reminder_enabled,
      category: row.category || undefined,
      dependencies: row.dependencies || [],
      is_optional: row.is_optional,
    }));
  },

  async saveChecklistItems(
    userId: string,
    weddingId: string,
    items: ChecklistItem[]
  ): Promise<ChecklistItem[] | null> {
    const rows = items.map((item) => ({
      user_id: userId,
      wedding_id: weddingId,
      task_key: item.task_key,
      title: item.title,
      due_date: item.due_date,
      completed: item.completed,
      priority_score: item.priority_score,
      notes: item.notes || null,
      reminder_enabled: item.reminder_enabled,
      category: item.category || null,
      dependencies: item.dependencies || [],
      is_optional: item.is_optional || false,
    }));

    const { data: upserted, error: upsertError } = await supabase
      .from('checklist_items')
      .upsert(rows, {
        onConflict: 'user_id,wedding_id,task_key',
        ignoreDuplicates: false,
      })
      .select('id, task_key, title, due_date, completed, priority_score, notes, reminder_enabled, category, dependencies, is_optional');

    if (upsertError) {
      console.error('Checklist upsert error:', upsertError);
      return null;
    }

    // Remove items that are no longer in the list (fetch then delete by id to avoid not.in quirks)
    const taskKeySet = new Set(items.map((i) => i.task_key));
    const { data: existing } = await supabase
      .from('checklist_items')
      .select('id, task_key')
      .eq('user_id', userId)
      .eq('wedding_id', weddingId);
    const idsToDelete = (existing ?? []).filter((r) => !taskKeySet.has(r.task_key)).map((r) => r.id);
    if (idsToDelete.length > 0) {
      await supabase.from('checklist_items').delete().in('id', idsToDelete);
    }

    const result: ChecklistItem[] = (upserted ?? []).map((row) => ({
      id: row.id,
      task_key: row.task_key,
      title: row.title,
      due_date: row.due_date,
      completed: row.completed,
      priority_score: row.priority_score,
      notes: row.notes ?? undefined,
      reminder_enabled: row.reminder_enabled,
      category: row.category ?? undefined,
      dependencies: row.dependencies ?? [],
      is_optional: row.is_optional,
    }));
    return result;
  },

  async toggleChecklistItem(itemId: string, completed: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('checklist_items')
      .update({ completed })
      .eq('id', itemId);

    return !error;
  },

  async toggleReminder(itemId: string, enabled: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('checklist_items')
      .update({ reminder_enabled: enabled })
      .eq('id', itemId);

    return !error;
  },
};
