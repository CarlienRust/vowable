import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { theme } from '../styles/theme';
import dashboardIcon from '../assets/dashboard.png';
import exploreIcon from '../assets/explore.png';
import chatbotIcon from '../assets/chatbot.png';
import budgetIcon from '../assets/budget.png';
import checklistIcon from '../assets/checklist.png';
import savedIcon from '../assets/saved.png';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Plan', icon: dashboardIcon },
  { path: '/explore', label: 'Explore', icon: exploreIcon },
  { path: '/chatbot', label: 'Assistant', icon: chatbotIcon },
  { path: '/budget', label: 'Budget', icon: budgetIcon },
  { path: '/checklist', label: 'Checklist', icon: checklistIcon },
  { path: '/saved', label: 'Saved', icon: savedIcon },
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
              <img
                src={item.icon}
                alt={item.label}
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                  opacity: isActive ? 1 : 0.6,
                  transition: 'opacity 0.2s ease',
                }}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
