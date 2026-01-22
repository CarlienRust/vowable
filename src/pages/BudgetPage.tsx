import React from 'react';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { BudgetSummary } from '../components/budget/BudgetSummary';
import { AllocationBreakdown } from '../components/budget/AllocationBreakdown';
import { theme } from '../styles/theme';

export const BudgetPage: React.FC = () => {
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const savedItems = useWeddingPlanStore((state) => state.savedItems);

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
        backgroundColor: theme.colors.background,
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
        <BudgetSummary wedding={wedding} savedItems={savedItems} />
        <AllocationBreakdown wedding={wedding} savedItems={savedItems} />
      </div>
    </div>
  );
};
