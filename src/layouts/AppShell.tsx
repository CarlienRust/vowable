import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, Profile } from '../services/auth.service';
import { Footer } from '../components/ui/Footer';
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
  { path: '/moodboard', label: 'Moodboard', icon: savedIcon },
  { path: '/explore', label: 'Explore', icon: exploreIcon },
  { path: '/chatbot', label: 'Assistant', icon: chatbotIcon },
];

const dropdownNavItems = [
  { path: '/dashboard', label: 'Wedding Profile', icon: dashboardIcon },
  { path: '/budget', label: 'Budget', icon: budgetIcon },
  { path: '/checklist', label: 'Checklist', icon: checklistIcon },
  { path: '/saved', label: 'Saved', icon: savedIcon },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await authService.getUser();
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await authService.getProfile(currentUser.id);
        setProfile(userProfile);
        setIsAdmin(userProfile?.is_admin || false);
      }
    };
    checkAdmin();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: theme.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>{user.email}</span>
              <span style={{ fontSize: '10px' }}>{dropdownOpen ? '▲' : '▼'}</span>
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: theme.spacing.xs,
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  boxShadow: theme.shadows.lg,
                  minWidth: '200px',
                  padding: theme.spacing.sm,
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: theme.spacing.sm,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {profile?.full_name || 'User'}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    {user.email}
                  </div>
                </div>
                <div
                  style={{
                    padding: theme.spacing.xs,
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  Account Details
                </div>
                {dropdownNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      padding: theme.spacing.sm,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.primary,
                      textDecoration: 'none',
                      borderRadius: theme.borderRadius.sm,
                      marginBottom: theme.spacing.xs,
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    />
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin/listings/new"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: theme.spacing.sm,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.accent.primary,
                      textDecoration: 'none',
                      borderRadius: theme.borderRadius.sm,
                      marginBottom: theme.spacing.xs,
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Add Listing
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: theme.borderRadius.sm,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main
        style={{
          flex: 1,
          paddingBottom: '120px', // Space for footer and bottom nav
          paddingTop: user ? '60px' : '0', // Space for top bar
        }}
      >
        {children}
      </main>

      <div
        style={{
          position: 'fixed',
          bottom: '60px', // Above the nav bar
          left: 0,
          right: 0,
          zIndex: 999,
        }}
      >
        <Footer />
      </div>

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
