import React from 'react';
import { theme } from '../../styles/theme';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div style={{ width: '100%' }}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: theme.colors.border,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: theme.colors.accent.primary,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
