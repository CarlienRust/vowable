import React from 'react';
import { ChecklistItem } from '../../domain/types';
import { formatDateShort } from '../../domain/format';
import { daysUntil, isOverdue, isWithinDays } from '../../domain/dates';
import { theme } from '../../styles/theme';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggleComplete: (id: string) => void;
  onToggleReminder: (id: string) => void;
}

export const ChecklistItemRow: React.FC<ChecklistItemRowProps> = ({
  item,
  onToggleComplete,
  onToggleReminder,
}) => {
  const days = item.due_date ? daysUntil(new Date(item.due_date + 'T00:00:00')) : null;
  const overdue = item.due_date ? isOverdue(new Date(item.due_date + 'T00:00:00')) : false;
  const upcoming = item.due_date
    ? isWithinDays(new Date(item.due_date + 'T00:00:00'), 30)
    : false;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
        marginBottom: theme.spacing.sm,
        opacity: item.completed ? 0.6 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggleComplete(item.id)}
        style={{
          width: '20px',
          height: '20px',
          cursor: 'pointer',
          marginTop: '2px',
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
            flexWrap: 'wrap',
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: item.completed
                ? theme.typography.fontWeight.normal
                : theme.typography.fontWeight.medium,
              textDecoration: item.completed ? 'line-through' : 'none',
              color: item.completed ? theme.colors.text.muted : theme.colors.text.primary,
            }}
          >
            {item.title}
          </h3>
          {item.category && (
            <span
              style={{
                display: 'inline-block',
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                fontSize: theme.typography.fontSize.xs,
                borderRadius: theme.borderRadius.full,
                fontWeight: theme.typography.fontWeight.medium,
                backgroundColor: theme.colors.border,
                color: theme.colors.text.primary,
              }}
            >
              {item.category}
            </span>
          )}
          {item.is_optional && (
            <span
              style={{
                display: 'inline-block',
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                fontSize: theme.typography.fontSize.xs,
                borderRadius: theme.borderRadius.full,
                fontWeight: theme.typography.fontWeight.medium,
                backgroundColor: theme.colors.accent.light,
                color: theme.colors.accent.primary,
              }}
            >
              Optional
            </span>
          )}
          {overdue && !item.completed && (
            <span
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.error,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              Overdue
            </span>
          )}
          {upcoming && !item.completed && !overdue && (
            <span
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.warning,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              Due soon
            </span>
          )}
        </div>
        {item.due_date ? (
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}
          >
            Due: {formatDateShort(item.due_date)}
            {days !== null && (
              <span style={{ marginLeft: theme.spacing.xs }}>
                ({days > 0 ? `${days} days` : days === 0 ? 'Today' : `${Math.abs(days)} days ago`})
              </span>
            )}
          </p>
        ) : (
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.muted,
              fontStyle: 'italic',
              marginBottom: theme.spacing.xs,
            }}
          >
            Set date to schedule
          </p>
        )}
        {item.notes && (
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.lineHeight.relaxed,
            }}
          >
            {item.notes}
          </p>
        )}
      </div>
      <button
        onClick={() => onToggleReminder(item.id)}
        style={{
          fontSize: theme.typography.fontSize.xs,
          color: item.reminder_enabled ? theme.colors.accent.primary : theme.colors.text.muted,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: theme.spacing.xs,
        }}
        title={item.reminder_enabled ? 'Disable reminder' : 'Enable reminder'}
      >
        {item.reminder_enabled ? '🔔' : '🔕'}
      </button>
    </div>
  );
};
