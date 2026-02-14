import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/ui/Footer';
import { theme } from '../styles/theme';
import logo from '../assets/logo.png';
import newspaperBg from '../assets/backgrounds/newspaper.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        // Dark overlay for reliable text contrast
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${newspaperBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
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
            alt="Vowable"
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
              color: 'rgba(255,255,255,0.95)',
              textShadow: '0 2px 10px rgba(0,0,0,0.35)',
              lineHeight: theme.typography.lineHeight.tight,
            }}
          >
            Plan Your Perfect Western Cape Wedding
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.xl,
              color: 'rgba(255,255,255,0.85)',
              textShadow: '0 2px 10px rgba(0,0,0,0.35)',
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
      <Footer />
    </div>
  );
};
