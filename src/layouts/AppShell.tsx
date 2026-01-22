import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
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
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await authService.getUser();
      setUser(currentUser);
      if (currentUser) {
        const profile = await authService.getProfile(currentUser.id);
        setIsAdmin(profile?.is_admin || false);
      }
    };
    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
      }}
    >
      {user && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.surface,
            borderBottom: `1px solid ${theme.colors.border}`,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
            {user.email}
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
            {isAdmin && (
              <Link
                to="/admin/listings/new"
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.accent.primary,
                  textDecoration: 'none',
                }}
              >
                Add Listing
              </Link>
            )}
            <button
              onClick={handleSignOut}
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <main
        style={{
          flex: 1,
          paddingBottom: '80px', // Space for bottom nav
          paddingTop: user ? '60px' : '0', // Space for top bar
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
