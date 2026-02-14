import { create } from 'zustand';
import { WeddingPlan, SavedItem, ChecklistItem, Listing, BudgetExpense } from '../domain/types';
import { weddingService } from '../services/wedding.service';
import { savedItemsService } from '../services/savedItems.service';
import { checklistService } from '../services/checklist.service';
import { budgetService } from '../services/budget.service';
import { generateChecklist } from '../domain/checklist';

const LOAD_THROTTLE_MS = 2000;
let lastLoadAt = 0;
let lastLoadUserId: string | null = null;

interface WeddingPlanState {
  userId: string | null;
  weddingId: string | null;
  wedding: WeddingPlan | null;
  savedItems: SavedItem[];
  checklistItems: ChecklistItem[];
  /** Manual amount spent per budget category (legacy). */
  manualCategorySpend: Record<string, number>;
  /** Expense entries (amount, type, description) for budget tracking. */
  budgetExpenses: BudgetExpense[];
  /** User-adjusted allocation % per category (category -> percent). Merged with suggested and normalized to 100%. */
  budgetAllocationOverrides: Record<string, number>;

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
  addManualCategorySpend: (category: string, amount: number) => Promise<void>;
  addBudgetExpense: (expense: Omit<BudgetExpense, 'id'>) => Promise<void>;
  removeBudgetExpense: (id: string) => Promise<void>;
  updateAllocationOverrides: (updates: Record<string, number>) => Promise<void>;
}

export const useWeddingPlanStore = create<WeddingPlanState>((set, get) => ({
  userId: null,
  weddingId: null,
  wedding: null,
  savedItems: [],
  checklistItems: [],
  manualCategorySpend: {},
  budgetExpenses: [],
  budgetAllocationOverrides: {},

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
      const [entries, settings] = await Promise.all([
        budgetService.getBudgetEntries(userId, currentWeddingId),
        budgetService.getBudgetSettings(userId, currentWeddingId),
      ]);
      set({
        manualCategorySpend: settings?.manualCategorySpend ?? {},
        budgetExpenses: entries,
        budgetAllocationOverrides: settings?.allocationOverrides ?? {},
      });
    } else {
      const weddingId = await weddingService.createWedding(userId, wedding);
      if (weddingId) {
        set({ weddingId });
        const [entries, settings] = await Promise.all([
          budgetService.getBudgetEntries(userId, weddingId),
          budgetService.getBudgetSettings(userId, weddingId),
        ]);
        set({
          manualCategorySpend: settings?.manualCategorySpend ?? {},
          budgetExpenses: entries,
          budgetAllocationOverrides: settings?.allocationOverrides ?? {},
        });
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
    const saved = await checklistService.saveChecklistItems(userId, weddingId, items);
    if (saved) set({ checklistItems: saved });
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

    const saved = await checklistService.saveChecklistItems(userId, weddingId, mergedItems);
    set({ checklistItems: saved ?? mergedItems });
  },

  loadFromSupabase: async (userId) => {
    const now = Date.now();
    if (now - lastLoadAt < LOAD_THROTTLE_MS && lastLoadUserId === userId) {
      return;
    }
    lastLoadAt = now;
    lastLoadUserId = userId;

    set({ userId });

    // 1. Load wedding first (needed for weddingId and checklist)
    const weddingData = await weddingService.getCurrentWeddingWithId(userId);
    const weddingId = weddingData?.id ?? null;
    if (weddingData) {
      set({ wedding: weddingData.plan, weddingId });
    }

    // 2. Load saved items, checklist, and budget in parallel
    const [savedItems, checklistItems, budgetData] = await Promise.all([
      savedItemsService.getSavedItems(userId),
      weddingId
        ? checklistService.getChecklistItems(userId, weddingId)
        : Promise.resolve([]),
      weddingId
        ? Promise.all([
            budgetService.getBudgetEntries(userId, weddingId),
            budgetService.getBudgetSettings(userId, weddingId),
          ]).then(([entries, settings]) => ({
            entries,
            manualCategorySpend: settings?.manualCategorySpend ?? {},
            budgetAllocationOverrides: settings?.allocationOverrides ?? {},
          }))
        : Promise.resolve({
            entries: [] as BudgetExpense[],
            manualCategorySpend: {} as Record<string, number>,
            budgetAllocationOverrides: {} as Record<string, number>,
          }),
    ]);

    set({
      savedItems,
      checklistItems,
      manualCategorySpend: budgetData.manualCategorySpend,
      budgetExpenses: budgetData.entries,
      budgetAllocationOverrides: budgetData.budgetAllocationOverrides,
    });
  },

  addManualCategorySpend: async (category, amount) => {
    const { userId, weddingId, manualCategorySpend } = get();
    if (!userId || !weddingId) return;
    const current = manualCategorySpend[category] || 0;
    const next = { ...manualCategorySpend, [category]: current + amount };
    set({ manualCategorySpend: next });
    await budgetService.updateBudgetSettings(userId, weddingId, { manualCategorySpend: next });
  },

  addBudgetExpense: async (expense) => {
    const { userId, weddingId, budgetExpenses } = get();
    if (!userId || !weddingId) return;
    const id = await budgetService.addBudgetEntry(userId, weddingId, expense);
    if (id) {
      set({ budgetExpenses: [...budgetExpenses, { ...expense, id }] });
    }
  },

  removeBudgetExpense: async (id) => {
    const success = await budgetService.removeBudgetEntry(id);
    if (success) {
      set({ budgetExpenses: get().budgetExpenses.filter((e) => e.id !== id) });
    }
  },

  updateAllocationOverrides: async (updates) => {
    const { userId, weddingId, budgetAllocationOverrides } = get();
    if (!userId || !weddingId) return;
    const next = { ...budgetAllocationOverrides, ...updates };
    set({ budgetAllocationOverrides: next });
    await budgetService.updateBudgetSettings(userId, weddingId, { allocationOverrides: next });
  },

  clearAll: () => {
    set({
      userId: null,
      weddingId: null,
      wedding: null,
      savedItems: [],
      checklistItems: [],
      manualCategorySpend: {},
      budgetExpenses: [],
      budgetAllocationOverrides: {},
    });
  },
}));
