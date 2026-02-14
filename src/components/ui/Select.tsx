import React from 'react';
import { theme } from '../../styles/theme';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, style, ...props }) => {
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
      <select
        style={{
          width: '100%',
          boxSizing: 'border-box',
          height: theme.controls.heightMd,
          padding: `0 ${theme.controls.paddingX}`,
          fontSize: theme.typography.fontSize.base,
          fontFamily: theme.typography.fontFamily.primary,
          border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text.primary,
          outline: 'none',
          cursor: 'pointer',
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
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
