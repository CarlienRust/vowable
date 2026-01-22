import React from 'react';
import { WeddingPlan, SavedItem } from '../../domain/types';
import { formatCurrency } from '../../domain/format';
import { calculateCommittedSpend } from '../../domain/budget';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { theme } from '../../styles/theme';

interface BudgetSummaryProps {
  wedding: WeddingPlan;
  savedItems: SavedItem[];
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ wedding, savedItems }) => {
  const totalBudget = wedding.totalBudget || 0;
  const committed = calculateCommittedSpend(savedItems);
  const remaining = totalBudget - committed;
  const percentageUsed = totalBudget > 0 ? (committed / totalBudget) * 100 : 0;

  if (totalBudget === 0) {
    return (
      <Card>
        <p style={{ color: theme.colors.text.secondary }}>
          Set your budget in onboarding to track spending
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2
        style={{
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.semibold,
          marginBottom: theme.spacing.lg,
          color: theme.colors.text.primary,
        }}
      >
        Budget Overview
      </h2>
      <div
        style={{
          marginBottom: theme.spacing.lg,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary,
            }}
          >
            Total Budget
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            {formatCurrency(totalBudget)}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary,
            }}
          >
            Committed
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.accent.primary,
            }}
          >
            {formatCurrency(committed)}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary,
            }}
          >
            Remaining
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: remaining >= 0 ? theme.colors.success : theme.colors.error,
            }}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
        <ProgressBar value={percentageUsed} showValue />
      </div>
    </Card>
  );
};
