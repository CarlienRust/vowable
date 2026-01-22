import React, { useEffect } from 'react';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { ChecklistItemRow } from '../components/checklist/ChecklistItemRow';
import { ReminderPanel } from '../components/checklist/ReminderPanel';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';

export const ChecklistPage: React.FC = () => {
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const checklistItems = useWeddingPlanStore((state) => state.checklistItems);
  const toggleChecklistItem = useWeddingPlanStore((state) => state.toggleChecklistItem);
  const toggleReminder = useWeddingPlanStore((state) => state.toggleReminder);
  const initializeChecklist = useWeddingPlanStore((state) => state.initializeChecklist);
  const loadFromStorage = useWeddingPlanStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
    if (wedding && checklistItems.length === 0) {
      initializeChecklist();
    }
  }, [loadFromStorage, wedding, checklistItems.length, initializeChecklist]);

  if (!wedding) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: theme.spacing.xl,
        }}
      >
        <Card>
          <p>Please complete onboarding first.</p>
        </Card>
      </div>
    );
  }

  // Group by category
  const itemsByCategory = checklistItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = { incomplete: [], completed: [] };
    }
    if (item.completed) {
      acc[category].completed.push(item);
    } else {
      acc[category].incomplete.push(item);
    }
    return acc;
  }, {} as Record<string, { incomplete: ChecklistItem[]; completed: ChecklistItem[] }>);

  const categories = Object.keys(itemsByCategory).sort();

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
        Checklist
      </h1>

      <ReminderPanel items={checklistItems} />

      {categories.map((category) => {
        const { incomplete, completed } = itemsByCategory[category];
        const total = incomplete.length + completed.length;
        
        if (total === 0) return null;

        return (
          <div key={category} style={{ marginBottom: theme.spacing.xl }}>
            <h2
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                marginBottom: theme.spacing.md,
                color: theme.colors.text.primary,
                borderBottom: `2px solid ${theme.colors.border}`,
                paddingBottom: theme.spacing.xs,
              }}
            >
              {category} ({completed.length}/{total} completed)
            </h2>

            {incomplete.length > 0 && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                {incomplete.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    onToggleComplete={toggleChecklistItem}
                    onToggleReminder={toggleReminder}
                  />
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <div style={{ opacity: 0.7 }}>
                <h3
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                    marginBottom: theme.spacing.sm,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Completed
                </h3>
                {completed.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    onToggleComplete={toggleChecklistItem}
                    onToggleReminder={toggleReminder}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {checklistItems.length === 0 && (
        <Card>
          <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
            No checklist items yet. Complete onboarding to generate your personalized checklist.
          </p>
          <Button onClick={() => initializeChecklist()}>Generate Checklist</Button>
        </Card>
      )}
    </div>
  );
};
