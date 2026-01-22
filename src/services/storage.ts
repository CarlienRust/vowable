import { WeddingPlan, SavedItem, ChecklistItem } from '../domain/types';

const STORAGE_KEYS = {
  WEDDING_PLAN: 'weddingPlan',
  SAVED_ITEMS: 'savedItems',
  CHECKLIST_ITEMS: 'checklistItems',
} as const;

export const storage = {
  getWeddingPlan(): WeddingPlan | null {
    const data = localStorage.getItem(STORAGE_KEYS.WEDDING_PLAN);
    return data ? JSON.parse(data) : null;
  },

  saveWeddingPlan(plan: WeddingPlan): void {
    localStorage.setItem(STORAGE_KEYS.WEDDING_PLAN, JSON.stringify(plan));
  },

  getSavedItems(): SavedItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    return data ? JSON.parse(data) : [];
  },

  saveSavedItems(items: SavedItem[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(items));
  },

  getChecklistItems(): ChecklistItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS);
    return data ? JSON.parse(data) : [];
  },

  saveChecklistItems(items: ChecklistItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify(items));
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.WEDDING_PLAN);
    localStorage.removeItem(STORAGE_KEYS.SAVED_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.CHECKLIST_ITEMS);
  },
};
