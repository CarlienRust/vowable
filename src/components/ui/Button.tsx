import React from 'react';
import { theme } from '../../styles/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.accent.primary,
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: theme.colors.accent.light,
      color: theme.colors.text.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.accent.primary,
      border: `1px solid ${theme.colors.accent.primary}`,
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      fontSize: theme.typography.fontSize.lg,
    },
  };

  const hoverStyle: React.CSSProperties =
    variant === 'primary'
      ? { backgroundColor: theme.colors.accent.primaryHover }
      : variant === 'secondary'
      ? { backgroundColor: '#DDD5C9' }
      : { borderColor: theme.colors.accent.primaryHover, color: theme.colors.accent.primaryHover };

  return (
    <button
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.color = '';
      }}
      {...props}
    >
      {children}
    </button>
  );
};
