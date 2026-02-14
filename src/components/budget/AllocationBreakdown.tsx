import React, { useState } from 'react';
import { WeddingPlan, SavedItem, BudgetExpense } from '../../domain/types';
import { formatCurrency } from '../../domain/format';
import {
  getSuggestedAllocations,
  getEffectiveAllocations,
  listingTypeToCategory,
  BUDGET_CATEGORIES,
} from '../../domain/budget';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { theme } from '../../styles/theme';

const ALLOCATION_STEP = 5;
const FALLBACK_CATEGORY = 'Other';

interface AllocationBreakdownProps {
  wedding: WeddingPlan;
  savedItems: SavedItem[];
  manualCategorySpend?: Record<string, number>;
  budgetExpenses: BudgetExpense[];
  budgetAllocationOverrides: Record<string, number>;
  onAddExpense: (expense: Omit<BudgetExpense, 'id'>) => void;
  onRemoveExpense: (id: string) => void;
  onUpdateAllocationOverrides: (updates: Record<string, number>) => void;
}

export const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({
  wedding,
  savedItems,
  manualCategorySpend = {},
  budgetExpenses,
  budgetAllocationOverrides,
  onAddExpense,
  onRemoveExpense,
  onUpdateAllocationOverrides,
}) => {
  const suggested = getSuggestedAllocations(wedding);
  const totalBudget = wedding.totalBudget || 0;
  const allocations = getEffectiveAllocations(suggested, budgetAllocationOverrides, totalBudget);

  // Spent per category: from saved items + legacy manual + expense entries
  const fromSaved: Record<string, number> = {};
  savedItems
    .filter((item) => item.status !== 'rejected')
    .forEach((item) => {
      const category = listingTypeToCategory(item.listing.type);
      fromSaved[category] = (fromSaved[category] || 0) + item.estimated_cost;
    });

  const categoryOptions = BUDGET_CATEGORIES.map((c) => ({ value: c, label: c }));

  if (totalBudget === 0) {
    return null;
  }

  const handleAdjustPercent = (category: string, delta: number) => {
    const otherCategory = category === FALLBACK_CATEGORY ? 'Venue' : FALLBACK_CATEGORY;
    const next = allocations.map((a) => {
      let pct = a.suggestedPercent;
      if (a.category === category) pct = Math.max(0, Math.min(100, pct + delta));
      if (a.category === otherCategory) pct = Math.max(0, Math.min(100, pct - delta));
      return { category: a.category, pct };
    });
    const total = next.reduce((s, a) => s + a.pct, 0);
    if (total <= 0) return;
    const normalized = next.map((a) => ({ ...a, pct: (a.pct / total) * 100 }));
    const overrides: Record<string, number> = {};
    normalized.forEach((a) => { overrides[a.category] = a.pct; });
    onUpdateAllocationOverrides(overrides);
  };

  return (
    <Card>
      <h2
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          marginBottom: theme.spacing.md,
          color: theme.colors.text.primary,
        }}
      >
        Budget Breakdown
      </h2>

      <AddExpenseForm
        categoryOptions={categoryOptions}
        onAdd={onAddExpense}
      />

      {allocations.map((alloc, index) => {
        const saved = fromSaved[alloc.category] || 0;
        const manual = manualCategorySpend[alloc.category] || 0;
        const expensesForCategory = budgetExpenses.filter((e) => e.category === alloc.category);
        const fromExpenses = expensesForCategory.reduce((s, e) => s + e.amount, 0);
        const spent = saved + manual + fromExpenses;
        const suggested = alloc.suggestedAmount;
        const remaining = Math.max(0, suggested - spent);
        const fillPercent = suggested > 0 ? Math.min(100, (spent / suggested) * 100) : 0;

        return (
          <SectionRow
            key={alloc.category}
            category={alloc.category}
            suggested={suggested}
            spent={spent}
            remaining={remaining}
            fillPercent={fillPercent}
            suggestedPercent={alloc.suggestedPercent}
            expenses={expensesForCategory}
            onRemoveExpense={onRemoveExpense}
            onIncreasePercent={() => handleAdjustPercent(alloc.category, ALLOCATION_STEP)}
            onDecreasePercent={() => handleAdjustPercent(alloc.category, -ALLOCATION_STEP)}
            isLast={index === allocations.length - 1}
          />
        );
      })}
    </Card>
  );
};

interface AddExpenseFormProps {
  categoryOptions: Array<{ value: string; label: string }>;
  onAdd: (expense: Omit<BudgetExpense, 'id'>) => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ categoryOptions, onAdd }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(BUDGET_CATEGORIES[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount.replace(/\s/g, ''), 10);
    if (!Number.isNaN(num) && num > 0 && category) {
      onAdd({ category, amount: num, description: description.trim() || '—' });
      setAmount('');
      setDescription('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <h3
        style={{
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          marginBottom: theme.spacing.md,
          color: theme.colors.text.primary,
        }}
      >
        Add expense
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: theme.spacing.md,
          alignItems: 'end',
        }}
      >
        <Input
          type="number"
          min={1}
          label="Amount (R)"
          placeholder="e.g. 15000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Select
          label="Type"
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input
          label="Description"
          placeholder="e.g. Deposit for venue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minWidth: '180px' }}
        />
        <Button type="submit" disabled={!amount.trim()} style={{ width: '100%' }}>
          Add expense
        </Button>
      </div>
    </form>
  );
};

interface SectionRowProps {
  category: string;
  suggested: number;
  spent: number;
  remaining: number;
  fillPercent: number;
  suggestedPercent: number;
  expenses: BudgetExpense[];
  onRemoveExpense: (id: string) => void;
  onIncreasePercent: () => void;
  onDecreasePercent: () => void;
  isLast?: boolean;
}

const SectionRow: React.FC<SectionRowProps> = ({
  category,
  suggested,
  spent,
  remaining,
  fillPercent,
  suggestedPercent,
  expenses,
  onRemoveExpense,
  onIncreasePercent,
  onDecreasePercent,
  isLast = false,
}) => {
  return (
    <div
      style={{
        marginBottom: theme.spacing.xl,
        paddingBottom: theme.spacing.lg,
        borderBottom: isLast ? 'none' : `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xs,
          flexWrap: 'wrap',
          gap: theme.spacing.xs,
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
          }}
        >
          {category}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            {formatCurrency(suggested)} ({suggestedPercent.toFixed(0)}%)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
            <button
              type="button"
              onClick={onDecreasePercent}
              aria-label="Decrease allocation"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                color: theme.colors.text.primary,
                fontSize: '1rem',
                cursor: 'pointer',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              −
            </button>
            <button
              type="button"
              onClick={onIncreasePercent}
              aria-label="Increase allocation"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                color: theme.colors.text.primary,
                fontSize: '1rem',
                cursor: 'pointer',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <ProgressBar value={fillPercent} showValue />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
          fontSize: theme.typography.fontSize.sm,
        }}
      >
        <span style={{ color: theme.colors.text.secondary }}>
          Spent: {formatCurrency(spent)}
        </span>
        <span
          style={{
            fontWeight: theme.typography.fontWeight.medium,
            color: remaining >= 0 ? theme.colors.success : theme.colors.error,
          }}
        >
          Left: {formatCurrency(remaining)}
        </span>
      </div>
      {expenses.length > 0 && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}
          >
            Expenses
          </div>
          <ul style={{ margin: 0, paddingLeft: theme.spacing.lg }}>
            {expenses.map((exp) => (
              <li
                key={exp.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  marginBottom: theme.spacing.xs,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                <span style={{ flex: 1 }}>
                  {formatCurrency(exp.amount)} — {exp.description}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveExpense(exp.id)}
                  style={{
                    padding: theme.spacing.xs,
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
