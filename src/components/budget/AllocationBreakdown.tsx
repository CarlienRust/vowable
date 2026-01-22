import React from 'react';
import { WeddingPlan, SavedItem } from '../../domain/types';
import { formatCurrency } from '../../domain/format';
import { getSuggestedAllocations, listingTypeToCategory } from '../../domain/budget';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { theme } from '../../styles/theme';

interface AllocationBreakdownProps {
  wedding: WeddingPlan;
  savedItems: SavedItem[];
}

export const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({
  wedding,
  savedItems,
}) => {
  const allocations = getSuggestedAllocations(wedding);
  const totalBudget = wedding.totalBudget || 0;

  // Calculate actual spend per category
  const categorySpend: Record<string, number> = {};
  savedItems
    .filter((item) => item.status !== 'rejected')
    .forEach((item) => {
      const category = listingTypeToCategory(item.listing.type);
      categorySpend[category] = (categorySpend[category] || 0) + item.estimated_cost;
    });

  if (totalBudget === 0) {
    return null;
  }

  return (
    <Card>
      <h2
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          marginBottom: theme.spacing.lg,
          color: theme.colors.text.primary,
        }}
      >
        Suggested Allocation
      </h2>
      {allocations.map((alloc) => {
        const actual = categorySpend[alloc.category] || 0;
        const percentage = totalBudget > 0 ? (actual / totalBudget) * 100 : 0;
        const suggestedPercentage = alloc.suggestedPercent;

        return (
          <div
            key={alloc.category}
            style={{
              marginBottom: theme.spacing.lg,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.xs,
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                {alloc.category}
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: theme.spacing.md,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                <span>Actual: {formatCurrency(actual)}</span>
                <span>Suggested: {formatCurrency(alloc.suggestedAmount)}</span>
              </div>
            </div>
            <ProgressBar value={percentage} max={suggestedPercentage} />
            <div
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.muted,
                marginTop: theme.spacing.xs,
              }}
            >
              {suggestedPercentage.toFixed(1)}% of budget
            </div>
          </div>
        );
      })}
    </Card>
  );
};
