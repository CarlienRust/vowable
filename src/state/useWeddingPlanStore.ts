import { create } from 'zustand';
import { WeddingPlan, SavedItem, ChecklistItem, Listing, BudgetExpense } from '../domain/types';
import { weddingService } from '../services/wedding.service';
import { savedItemsService } from '../services/savedItems.service';
import { checklistService } from '../services/checklist.service';
import { generateChecklist } from '../domain/checklist';

const BUDGET_MANUAL_SPEND_KEY = 'budget_manual_spend';
const BUDGET_EXPENSES_KEY = 'budget_expenses';
const BUDGET_ALLOCATION_OVERRIDES_KEY = 'budget_allocation_overrides';

function loadManualCategorySpend(weddingId: string | null): Record<string, number> {
  if (!weddingId) return {};
  try {
    const raw = localStorage.getItem(`${BUDGET_MANUAL_SPEND_KEY}_${weddingId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (_) {}
  return {};
}

function saveManualCategorySpend(weddingId: string | null, data: Record<string, number>) {
  if (!weddingId) return;
  try {
    localStorage.setItem(`${BUDGET_MANUAL_SPEND_KEY}_${weddingId}`, JSON.stringify(data));
  } catch (_) {}
}

function loadBudgetExpenses(weddingId: string | null): BudgetExpense[] {
  if (!weddingId) return [];
  try {
    const raw = localStorage.getItem(`${BUDGET_EXPENSES_KEY}_${weddingId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

function saveBudgetExpenses(weddingId: string | null, data: BudgetExpense[]) {
  if (!weddingId) return;
  try {
    localStorage.setItem(`${BUDGET_EXPENSES_KEY}_${weddingId}`, JSON.stringify(data));
  } catch (_) {}
}

function loadBudgetAllocationOverrides(weddingId: string | null): Record<string, number> {
  if (!weddingId) return {};
  try {
    const raw = localStorage.getItem(`${BUDGET_ALLOCATION_OVERRIDES_KEY}_${weddingId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (_) {}
  return {};
}

function saveBudgetAllocationOverrides(weddingId: string | null, data: Record<string, number>) {
  if (!weddingId) return;
  try {
    localStorage.setItem(`${BUDGET_ALLOCATION_OVERRIDES_KEY}_${weddingId}`, JSON.stringify(data));
  } catch (_) {}
}

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
  addManualCategorySpend: (category: string, amount: number) => void;
  addBudgetExpense: (expense: Omit<BudgetExpense, 'id'>) => void;
  removeBudgetExpense: (id: string) => void;
  updateAllocationOverrides: (updates: Record<string, number>) => void;
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
      set({
        manualCategorySpend: loadManualCategorySpend(currentWeddingId),
        budgetExpenses: loadBudgetExpenses(currentWeddingId),
        budgetAllocationOverrides: loadBudgetAllocationOverrides(currentWeddingId),
      });
    } else {
      const weddingId = await weddingService.createWedding(userId, wedding);
      if (weddingId) {
        set({
          weddingId,
          manualCategorySpend: loadManualCategorySpend(weddingId),
          budgetExpenses: loadBudgetExpenses(weddingId),
          budgetAllocationOverrides: loadBudgetAllocationOverrides(weddingId),
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

    // 1. Load wedding first (needed for weddingId and checklist)
    const weddingData = await weddingService.getCurrentWeddingWithId(userId);
    const weddingId = weddingData?.id ?? null;
    if (weddingData) {
      set({ wedding: weddingData.plan, weddingId });
    }

    // 2. Load saved items and checklist in parallel (reduces initial load time at scale)
    const [savedItems, checklistItems] = await Promise.all([
      savedItemsService.getSavedItems(userId),
      weddingId
        ? checklistService.getChecklistItems(userId, weddingId)
        : Promise.resolve([]),
    ]);

    set({
      savedItems,
      checklistItems,
      manualCategorySpend: loadManualCategorySpend(weddingId),
      budgetExpenses: loadBudgetExpenses(weddingId),
      budgetAllocationOverrides: loadBudgetAllocationOverrides(weddingId),
    });
  },

  addManualCategorySpend: (category, amount) => {
    const { weddingId, manualCategorySpend } = get();
    const current = manualCategorySpend[category] || 0;
    const next = { ...manualCategorySpend, [category]: current + amount };
    set({ manualCategorySpend: next });
    saveManualCategorySpend(weddingId, next);
  },

  addBudgetExpense: (expense) => {
    const { weddingId, budgetExpenses } = get();
    const entry: BudgetExpense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };
    const next = [...budgetExpenses, entry];
    set({ budgetExpenses: next });
    saveBudgetExpenses(weddingId, next);
  },

  removeBudgetExpense: (id) => {
    const { weddingId, budgetExpenses } = get();
    const next = budgetExpenses.filter((e) => e.id !== id);
    set({ budgetExpenses: next });
    saveBudgetExpenses(weddingId, next);
  },

  updateAllocationOverrides: (updates) => {
    const { weddingId, budgetAllocationOverrides } = get();
    const next = { ...budgetAllocationOverrides, ...updates };
    set({ budgetAllocationOverrides: next });
    saveBudgetAllocationOverrides(weddingId, next);
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
