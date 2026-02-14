import React from 'react';
import { theme } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onClick }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        boxShadow: theme.shadows.md,
        border: `1px solid ${theme.colors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...(onClick && {
          ':hover': {
            boxShadow: theme.shadows.lg,
          },
        }),
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = theme.shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = theme.shadows.md;
        }
      }}
    >
      {children}
    </div>
  );
};
