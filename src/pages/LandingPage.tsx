import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';
import logo from '../assets/logo.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          textAlign: 'center',
        }}
      >
        <img
          src={logo}
          alt="Toit Nups"
          style={{
            width: '200px',
            height: 'auto',
            marginBottom: theme.spacing.xl,
            objectFit: 'contain',
          }}
        />
        <h1
          style={{
            fontSize: theme.typography.fontSize['4xl'],
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.lg,
            color: theme.colors.text.primary,
            lineHeight: theme.typography.lineHeight.tight,
          }}
        >
          Plan Your Perfect Western Cape Wedding
        </h1>
        <p
          style={{
            fontSize: theme.typography.fontSize.xl,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xxl,
            lineHeight: theme.typography.lineHeight.relaxed,
          }}
        >
          Discover venues, vendors, and accommodations across the Western Cape.
          Organize your budget, track your checklist, and bring your vision to life.
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/login')}
          style={{
            fontSize: theme.typography.fontSize.lg,
            padding: `${theme.spacing.lg} ${theme.spacing.xxl}`,
          }}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};
