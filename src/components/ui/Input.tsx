import React from 'react';
import { theme } from '../../styles/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: theme.spacing.md,
          fontSize: theme.typography.fontSize.base,
          fontFamily: theme.typography.fontFamily.primary,
          border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text.primary,
          outline: 'none',
          transition: 'border-color 0.2s ease',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.accent.primary;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? theme.colors.error : theme.colors.border;
        }}
        {...props}
      />
      {error && (
        <div
          style={{
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.error,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
