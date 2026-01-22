import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { theme } from '../styles/theme';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Plan', icon: '📋' },
  { path: '/explore', label: 'Explore', icon: '🔍' },
  { path: '/chatbot', label: 'Assistant', icon: '💬' },
  { path: '/budget', label: 'Budget', icon: '💰' },
  { path: '/checklist', label: 'Checklist', icon: '✅' },
  { path: '/saved', label: 'Saved', icon: '⭐' },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
      }}
    >
      <main
        style={{
          flex: 1,
          paddingBottom: '80px', // Space for bottom nav
        }}
      >
        {children}
      </main>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: `${theme.spacing.sm} 0`,
          boxShadow: theme.shadows.md,
          zIndex: 1000,
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: theme.spacing.xs,
                padding: theme.spacing.sm,
                textDecoration: 'none',
                color: isActive ? theme.colors.accent.primary : theme.colors.text.secondary,
                fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
                fontSize: theme.typography.fontSize.sm,
                transition: 'color 0.2s ease',
              }}
            >
              <span style={{ fontSize: theme.typography.fontSize.lg }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
