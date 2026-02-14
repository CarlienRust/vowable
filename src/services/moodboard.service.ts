import { supabase } from './supabaseClient';

export interface MoodboardItemRow {
  id: string;
  user_id: string;
  type: 'image' | 'pinterest' | 'link';
  url: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  preview_images: string[];
  created_at: string;
  updated_at: string;
}

export interface MoodboardItem {
  id: string;
  type: 'image' | 'pinterest' | 'link';
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  previewImages?: string[];
}

function rowToItem(row: MoodboardItemRow): MoodboardItem {
  return {
    id: row.id,
    type: row.type,
    url: row.url,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    previewImages: Array.isArray(row.preview_images) ? row.preview_images : undefined,
  };
}

export const moodboardService = {
  async getMoodboardItems(userId: string): Promise<MoodboardItem[]> {
    const { data, error } = await supabase
      .from('moodboard_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching moodboard items:', error);
      return [];
    }

    return (data ?? []).map((row: MoodboardItemRow) => rowToItem(row));
  },

  async addMoodboardItem(
    userId: string,
    item: Omit<MoodboardItem, 'id'>
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('moodboard_items')
      .insert({
        user_id: userId,
        type: item.type,
        url: item.url,
        title: item.title ?? null,
        description: item.description ?? null,
        thumbnail: item.thumbnail ?? null,
        preview_images: item.previewImages ?? [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding moodboard item:', error);
      return null;
    }

    return data.id;
  },

  async removeMoodboardItem(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('moodboard_items')
      .delete()
      .eq('id', itemId);

    return !error;
  },
};
