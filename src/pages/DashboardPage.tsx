import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { authService } from '../services/auth.service';
import { formatDate } from '../domain/format';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';
import eraBg from '../assets/backgrounds/era.png';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const loadFromSupabase = useWeddingPlanStore((state) => state.loadFromSupabase);
  const userId = useWeddingPlanStore((state) => state.userId);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        const user = await authService.getUser();
        if (user) {
          await loadFromSupabase(user.id);
        }
      } else {
        await loadFromSupabase(userId);
      }
    };
    loadData();
  }, [userId, loadFromSupabase]);

  if (!wedding || !wedding.location) {
    return (
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: theme.spacing.xl,
        }}
      >
        <Card>
          <h1
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              marginBottom: theme.spacing.md,
            }}
          >
            Welcome!
          </h1>
          <p style={{ marginBottom: theme.spacing.lg, color: theme.colors.text.secondary }}>
            Complete onboarding to get started with your wedding planning.
          </p>
          <Button onClick={() => navigate('/onboarding')}>Start Onboarding</Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        backgroundImage: `linear-gradient(rgba(250,250,250,0.92), rgba(250,250,250,0.92)), url(${eraBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <h1
        style={{
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing.xl,
          color: theme.colors.text.primary,
        }}
      >
        Wedding Profile
      </h1>

      <Card style={{ maxWidth: '500px' }}>
        <h2
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            marginBottom: theme.spacing.md,
          }}
        >
          Wedding Details
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {wedding.weddingDate && (
            <p>
              <strong>Date:</strong> {formatDate(wedding.weddingDate)}
            </p>
          )}
          {wedding.guestCountRange && (
            <p>
              <strong>Guests:</strong> {wedding.guestCountRange}
            </p>
          )}
          <p>
            <strong>Location:</strong> {wedding.location}
          </p>
          {wedding.themePrimary && (
            <p>
              <strong>Theme:</strong> {wedding.themePrimary}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/onboarding')}
          style={{ marginTop: theme.spacing.md }}
        >
          Edit Details
        </Button>
      </Card>
    </div>
  );
};
