import { create } from 'zustand';
import { WeddingPlan, SavedItem, ChecklistItem, Listing } from '../domain/types';
import { weddingService } from '../services/wedding.service';
import { savedItemsService } from '../services/savedItems.service';
import { checklistService } from '../services/checklist.service';
import { generateChecklist } from '../domain/checklist';

interface WeddingPlanState {
  userId: string | null;
  weddingId: string | null;
  wedding: WeddingPlan | null;
  savedItems: SavedItem[];
  checklistItems: ChecklistItem[];
  
  // Actions
  setUserId: (userId: string | null) => void;
  setWedding: (wedding: WeddingPlan) => Promise<void>;
  addSavedItem: (listing: Listing, notes?: string, estimatedCost?: number) => Promise<void>;
  updateSavedItem: (id: string, updates: Partial<SavedItem>) => Promise<void>;
  removeSavedItem: (id: string) => Promise<void>;
  setChecklistItems: (items: ChecklistItem[]) => Promise<void>;
  toggleChecklistItem: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  initializeChecklist: () => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
  clearAll: () => void;
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
  userId: null,
  weddingId: null,
  wedding: null,
  savedItems: [],
  checklistItems: [],

  setUserId: (userId) => {
    set({ userId });
  },

  setWedding: async (wedding) => {
    const userId = get().userId;
    if (!userId) return;

    set({ wedding });

    // Create or update wedding in Supabase
    const currentWeddingId = get().weddingId;
    if (currentWeddingId) {
      await weddingService.updateWedding(currentWeddingId, wedding);
    } else {
      const weddingId = await weddingService.createWedding(userId, wedding);
      if (weddingId) {
        set({ weddingId });
      }
    }

    // Regenerate checklist if wedding date or priorities changed
    const currentChecklist = get().checklistItems;
    if (currentChecklist.length === 0 || wedding.weddingDate || wedding.priorities.length > 0) {
      await get().initializeChecklist();
    }
  },

  addSavedItem: async (listing, notes = '', estimatedCost = 0) => {
    const userId = get().userId;
    const weddingId = get().weddingId;
    if (!userId) return;

    const itemId = await savedItemsService.addSavedItem(
      userId,
      weddingId,
      listing,
      notes,
      estimatedCost
    );

    if (itemId) {
      // Reload saved items
      const items = await savedItemsService.getSavedItems(userId);
      set({ savedItems: items });
    }
  },

  updateSavedItem: async (id, updates) => {
    const success = await savedItemsService.updateSavedItem(id, updates);
    if (success) {
      const userId = get().userId;
      if (userId) {
        const items = await savedItemsService.getSavedItems(userId);
        set({ savedItems: items });
      }
    }
  },

  removeSavedItem: async (id) => {
    const success = await savedItemsService.removeSavedItem(id);
    if (success) {
      const userId = get().userId;
      if (userId) {
        const items = await savedItemsService.getSavedItems(userId);
        set({ savedItems: items });
      }
    }
  },

  setChecklistItems: async (items) => {
    const userId = get().userId;
    const weddingId = get().weddingId;
    if (!userId || !weddingId) return;

    set({ checklistItems: items });
    await checklistService.saveChecklistItems(userId, weddingId, items);
  },

  toggleChecklistItem: async (id) => {
    const item = get().checklistItems.find((i) => i.id === id);
    if (!item) return;

    const success = await checklistService.toggleChecklistItem(id, !item.completed);
    if (success) {
      set({
        checklistItems: get().checklistItems.map((i) =>
          i.id === id ? { ...i, completed: !i.completed } : i
        ),
      });
    }
  },

  toggleReminder: async (id) => {
    const item = get().checklistItems.find((i) => i.id === id);
    if (!item) return;

    const success = await checklistService.toggleReminder(id, !item.reminder_enabled);
    if (success) {
      set({
        checklistItems: get().checklistItems.map((i) =>
          i.id === id ? { ...i, reminder_enabled: !i.reminder_enabled } : i
        ),
      });
    }
  },

  initializeChecklist: async () => {
    const wedding = get().wedding;
    const userId = get().userId;
    const weddingId = get().weddingId;
    if (!wedding || !userId || !weddingId) return;

    const existingItems = await checklistService.getChecklistItems(userId, weddingId);
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
    await checklistService.saveChecklistItems(userId, weddingId, mergedItems);
  },

  loadFromSupabase: async (userId) => {
    set({ userId });

    // Load wedding with ID
    const weddingData = await weddingService.getCurrentWeddingWithId(userId);
    if (weddingData) {
      set({ wedding: weddingData.plan, weddingId: weddingData.id });
    }

    // Load saved items
    const savedItems = await savedItemsService.getSavedItems(userId);
    set({ savedItems });

    // Load checklist
    const weddingId = weddingData?.id;
    if (weddingId) {
      const checklistItems = await checklistService.getChecklistItems(userId, weddingId);
      set({ checklistItems });
    }
  },

  clearAll: () => {
    set({
      userId: null,
      weddingId: null,
      wedding: null,
      savedItems: [],
      checklistItems: [],
    });
  },
}));
