import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { authService } from '../services/auth.service';
import { formatDate } from '../domain/format';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const checklistItems = useWeddingPlanStore((state) => state.checklistItems);
  const savedItems = useWeddingPlanStore((state) => state.savedItems);
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

  const completedTasks = checklistItems.filter((item) => item.completed).length;
  const totalTasks = checklistItems.length;

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
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
        Your Wedding Plan
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        }}
      >
        <Card>
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

        <Card>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Checklist Progress
          </h2>
          <p
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.accent.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            {completedTasks} / {totalTasks}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/checklist')}
            style={{ marginTop: theme.spacing.md }}
          >
            View Checklist
          </Button>
        </Card>

        <Card>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Saved Items
          </h2>
          <p
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.accent.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            {savedItems.length}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/saved')}
            style={{ marginTop: theme.spacing.md }}
          >
            View Saved
          </Button>
        </Card>
      </div>

      <div
        style={{
          display: 'flex',
          gap: theme.spacing.md,
          flexWrap: 'wrap',
        }}
      >
        <Button onClick={() => navigate('/explore')}>Explore Venues & Vendors</Button>
        <Button variant="outline" onClick={() => navigate('/budget')}>
          View Budget
        </Button>
      </div>
    </div>
  );
};
