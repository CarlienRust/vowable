import React from 'react';
import { ChecklistItem } from '../../domain/types';
import { formatDateShort } from '../../domain/format';
import { isWithinDays, isOverdue } from '../../domain/dates';
import { Card } from '../ui/Card';
import { theme } from '../../styles/theme';

interface ReminderPanelProps {
  items: ChecklistItem[];
}

export const ReminderPanel: React.FC<ReminderPanelProps> = ({ items }) => {
  const upcoming = items.filter(
    (item) =>
      !item.completed &&
      item.reminder_enabled &&
      item.due_date &&
      isWithinDays(new Date(item.due_date + 'T00:00:00'), 30)
  );

  const overdue = items.filter(
    (item) =>
      !item.completed &&
      item.reminder_enabled &&
      item.due_date &&
      isOverdue(new Date(item.due_date + 'T00:00:00'))
  );

  if (upcoming.length === 0 && overdue.length === 0) {
    return null;
  }

  return (
    <Card
      style={{
        marginBottom: theme.spacing.lg,
        backgroundColor: overdue.length > 0 ? '#FFF3E0' : '#E8F5E9',
      }}
    >
      <h2
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          marginBottom: theme.spacing.md,
          color: theme.colors.text.primary,
        }}
      >
        Reminders
      </h2>
      {overdue.length > 0 && (
        <div style={{ marginBottom: theme.spacing.md }}>
          <h3
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.error,
              marginBottom: theme.spacing.sm,
            }}
          >
            Overdue ({overdue.length})
          </h3>
          {overdue.map((item) => (
            <div
              key={item.id}
              style={{
                padding: theme.spacing.sm,
                marginBottom: theme.spacing.xs,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                }}
              >
                Due: {formatDateShort(item.due_date)}
              </p>
            </div>
          ))}
        </div>
      )}
      {upcoming.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.warning,
              marginBottom: theme.spacing.sm,
            }}
          >
            Upcoming (next 30 days) ({upcoming.length})
          </h3>
          {upcoming.map((item) => (
            <div
              key={item.id}
              style={{
                padding: theme.spacing.sm,
                marginBottom: theme.spacing.xs,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                }}
              >
                Due: {formatDateShort(item.due_date)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
