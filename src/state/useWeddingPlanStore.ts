import { create } from 'zustand';
import { WeddingPlan, SavedItem, ChecklistItem } from '../domain/types';
import { storage } from '../services/storage';
import { generateChecklist } from '../domain/checklist';

interface WeddingPlanState {
  wedding: WeddingPlan | null;
  savedItems: SavedItem[];
  checklistItems: ChecklistItem[];
  
  // Actions
  setWedding: (wedding: WeddingPlan) => void;
  addSavedItem: (item: SavedItem) => void;
  updateSavedItem: (id: string, updates: Partial<SavedItem>) => void;
  removeSavedItem: (id: string) => void;
  setChecklistItems: (items: ChecklistItem[]) => void;
  toggleChecklistItem: (id: string) => void;
  toggleReminder: (id: string) => void;
  initializeChecklist: () => void;
  loadFromStorage: () => void;
}

const defaultWedding: WeddingPlan = {
  weddingDate: null,
  guestCountRange: null,
  totalBudget: null,
  budgetPreset: null,
  location: '',
  locationLat: null,
  locationLng: null,
  radiusKm: 50,
  themePrimary: '',
  themeSecondary: null,
  themeTags: [],
  themeColors: [],
  priorities: [],
};

export const useWeddingPlanStore = create<WeddingPlanState>((set, get) => ({
  wedding: null,
  savedItems: [],
  checklistItems: [],

  setWedding: (wedding) => {
    set({ wedding });
    storage.saveWeddingPlan(wedding);
    // Regenerate checklist if wedding date or priorities changed
    const currentChecklist = get().checklistItems;
    if (currentChecklist.length === 0 || wedding.weddingDate || wedding.priorities.length > 0) {
      get().initializeChecklist();
    }
  },

  addSavedItem: (item) => {
    const items = [...get().savedItems, item];
    set({ savedItems: items });
    storage.saveSavedItems(items);
  },

  updateSavedItem: (id, updates) => {
    const items = get().savedItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    set({ savedItems: items });
    storage.saveSavedItems(items);
  },

  removeSavedItem: (id) => {
    const items = get().savedItems.filter((item) => item.id !== id);
    set({ savedItems: items });
    storage.saveSavedItems(items);
  },

  setChecklistItems: (items) => {
    set({ checklistItems: items });
    storage.saveChecklistItems(items);
  },

  toggleChecklistItem: (id) => {
    const items = get().checklistItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    set({ checklistItems: items });
    storage.saveChecklistItems(items);
  },

  toggleReminder: (id) => {
    const items = get().checklistItems.map((item) =>
      item.id === id ? { ...item, reminder_enabled: !item.reminder_enabled } : item
    );
    set({ checklistItems: items });
    storage.saveChecklistItems(items);
  },

  initializeChecklist: () => {
    const wedding = get().wedding;
    if (!wedding) return;
    
    const existingItems = get().checklistItems;
    const newItems = generateChecklist(wedding);
    
    // Preserve completion state from existing items
    const mergedItems = newItems.map((newItem) => {
      const existing = existingItems.find(
        (item) => item.task_key === newItem.task_key
      );
      if (existing) {
        return {
          ...newItem,
          id: existing.id,
          completed: existing.completed,
          reminder_enabled: existing.reminder_enabled,
        };
      }
      return newItem;
    });
    
    set({ checklistItems: mergedItems });
    storage.saveChecklistItems(mergedItems);
  },

  loadFromStorage: () => {
    const wedding = storage.getWeddingPlan();
    const savedItems = storage.getSavedItems();
    const checklistItems = storage.getChecklistItems();
    
    set({
      wedding: wedding || defaultWedding,
      savedItems,
      checklistItems,
    });
    
    // If we have a wedding but no checklist, generate it
    if (wedding && checklistItems.length === 0) {
      get().initializeChecklist();
    }
  },
}));
