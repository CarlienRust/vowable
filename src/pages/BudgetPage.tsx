import React from 'react';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { BudgetSummary } from '../components/budget/BudgetSummary';
import { AllocationBreakdown } from '../components/budget/AllocationBreakdown';
import { theme } from '../styles/theme';

export const BudgetPage: React.FC = () => {
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const savedItems = useWeddingPlanStore((state) => state.savedItems);
  const manualCategorySpend = useWeddingPlanStore((state) => state.manualCategorySpend);
  const budgetExpenses = useWeddingPlanStore((state) => state.budgetExpenses);
  const addBudgetExpense = useWeddingPlanStore((state) => state.addBudgetExpense);
  const removeBudgetExpense = useWeddingPlanStore((state) => state.removeBudgetExpense);
  const budgetAllocationOverrides = useWeddingPlanStore((state) => state.budgetAllocationOverrides);
  const updateAllocationOverrides = useWeddingPlanStore((state) => state.updateAllocationOverrides);

  if (!wedding) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: theme.spacing.xl,
        }}
      >
        <p>Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: theme.spacing.xl,
      }}
    >
      <h1
        style={{
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing.xl,
          color: theme.colors.text.primary,
        }}
      >
        Budget
      </h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.lg,
        }}
      >
        <BudgetSummary
          wedding={wedding}
          savedItems={savedItems}
          manualCategorySpend={manualCategorySpend}
          budgetExpenses={budgetExpenses}
        />
        <AllocationBreakdown
          wedding={wedding}
          savedItems={savedItems}
          manualCategorySpend={manualCategorySpend}
          budgetExpenses={budgetExpenses}
          budgetAllocationOverrides={budgetAllocationOverrides}
          onAddExpense={addBudgetExpense}
          onRemoveExpense={removeBudgetExpense}
          onUpdateAllocationOverrides={updateAllocationOverrides}
        />
      </div>
    </div>
  );
};
