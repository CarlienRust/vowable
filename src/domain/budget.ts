import { WeddingPlan, SavedItem, BudgetAllocation } from './types';

/**
 * Merge suggested allocations with user overrides and normalize to 100%.
 * Used for Budget Breakdown when user adjusts % per category.
 */
export function getEffectiveAllocations(
  suggested: BudgetAllocation[],
  overrides: Record<string, number>,
  totalBudget: number
): BudgetAllocation[] {
  const base = suggested.map((a) => ({
    ...a,
    suggestedPercent: overrides[a.category] ?? a.suggestedPercent,
  }));
  const total = base.reduce((s, a) => s + a.suggestedPercent, 0);
  if (total <= 0) return suggested;
  return base.map((a) => {
    const pct = (a.suggestedPercent / total) * 100;
    return {
      ...a,
      suggestedPercent: pct,
      suggestedAmount: (totalBudget * pct) / 100,
    };
  });
}

/**
 * Calculate suggested budget allocation percentages
 */
export function getSuggestedAllocations(wedding: WeddingPlan): BudgetAllocation[] {
  const totalBudget = wedding.totalBudget || 0;
  
  // Base allocation percentages (SA wedding typical breakdown)
  const allocations: BudgetAllocation[] = [
    { category: 'Venue', suggestedPercent: 35, suggestedAmount: 0 },
    { category: 'Food & Beverage', suggestedPercent: 30, suggestedAmount: 0 },
    { category: 'Photography', suggestedPercent: 10, suggestedAmount: 0 },
    { category: 'Décor & Flowers', suggestedPercent: 10, suggestedAmount: 0 },
    { category: 'Attire', suggestedPercent: 5, suggestedAmount: 0 },
    { category: 'Music/Entertainment', suggestedPercent: 5, suggestedAmount: 0 },
    { category: 'Accommodation', suggestedPercent: 3, suggestedAmount: 0 },
    { category: 'Other', suggestedPercent: 2, suggestedAmount: 0 },
  ];

  // Adjust based on priorities
  const priorityBoosts: Record<string, number> = {};
  wedding.priorities.forEach((priority) => {
    if (priority === 'Venue') priorityBoosts['Venue'] = 5;
    if (priority === 'Food') priorityBoosts['Food & Beverage'] = 5;
    if (priority === 'Photography') priorityBoosts['Photography'] = 3;
    if (priority === 'Décor') priorityBoosts['Décor & Flowers'] = 3;
    if (priority === 'Accommodation') priorityBoosts['Accommodation'] = 2;
    if (priority === 'Music/Party') priorityBoosts['Music/Entertainment'] = 3;
  });

  // Apply boosts and normalize
  let totalPercent = 100;
  allocations.forEach((alloc) => {
    const boost = priorityBoosts[alloc.category] || 0;
    alloc.suggestedPercent += boost;
    totalPercent += boost;
  });

  // Normalize to 100%
  allocations.forEach((alloc) => {
    alloc.suggestedPercent = (alloc.suggestedPercent / totalPercent) * 100;
    alloc.suggestedAmount = (totalBudget * alloc.suggestedPercent) / 100;
  });

  return allocations;
}

/**
 * Calculate committed spend from saved items
 */
export function calculateCommittedSpend(savedItems: SavedItem[]): number {
  return savedItems
    .filter((item) => item.status !== 'rejected')
    .reduce((sum, item) => sum + item.estimated_cost, 0);
}

/**
 * Map listing type to budget category
 */
export function listingTypeToCategory(type: string): string {
  const mapping: Record<string, string> = {
    venue: 'Venue',
    caterer: 'Food & Beverage',
    florist: 'Décor & Flowers',
    boutique: 'Attire',
    accommodation: 'Accommodation',
  };
  return mapping[type] || 'Other';
}

/** Category options for Add expense (same order as suggested allocations) */
export const BUDGET_CATEGORIES = [
  'Venue',
  'Food & Beverage',
  'Photography',
  'Décor & Flowers',
  'Attire',
  'Music/Entertainment',
  'Accommodation',
  'Other',
] as const;
