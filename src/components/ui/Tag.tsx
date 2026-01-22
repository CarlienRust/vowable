import React from 'react';
import { theme } from '../../styles/theme';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
  onClick?: () => void;
}

export const Tag: React.FC<TagProps> = ({ children, variant = 'default', onClick }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: theme.colors.border,
      color: theme.colors.text.primary,
    },
    accent: {
      backgroundColor: theme.colors.accent.light,
      color: theme.colors.accent.primary,
    },
    success: {
      backgroundColor: '#E8F5E9',
      color: theme.colors.success,
    },
    warning: {
      backgroundColor: '#FFF3E0',
      color: theme.colors.warning,
    },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        fontSize: theme.typography.fontSize.sm,
        borderRadius: theme.borderRadius.full,
        fontWeight: theme.typography.fontWeight.medium,
        cursor: onClick ? 'pointer' : 'default',
        ...variantStyles[variant],
      }}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
