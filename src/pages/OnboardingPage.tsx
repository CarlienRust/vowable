import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WeddingPlan, GuestCountRange, Priority } from '../domain/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { theme } from '../styles/theme';
import champagneBg from '../assets/backgrounds/champagne.png';

const GUEST_COUNT_OPTIONS = [
  { value: '', label: 'Select range' },
  { value: '0-50', label: '0-50 guests' },
  { value: '50-100', label: '50-100 guests' },
  { value: '100-150', label: '100-150 guests' },
  { value: '150+', label: '150+ guests' },
];


const PRIORITY_OPTIONS: Priority[] = [
  'Venue',
  'Food',
  'Photography',
  'Décor',
  'Accommodation',
  'Music/Party',
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const setWedding = useWeddingPlanStore((state) => state.setWedding);
  const existingWedding = useWeddingPlanStore((state) => state.wedding);

  const [weddingDate, setWeddingDate] = useState(existingWedding?.weddingDate || '');
  const [guestCountRange, setGuestCountRange] = useState<GuestCountRange | ''>(
    existingWedding?.guestCountRange || ''
  );
  const [totalBudget, setTotalBudget] = useState(
    existingWedding?.totalBudget?.toString() || ''
  );
  const [location, setLocation] = useState(existingWedding?.location || '');
  const [radiusKm, setRadiusKm] = useState(existingWedding?.radiusKm?.toString() || '50');
  const [themePrimary, setThemePrimary] = useState(existingWedding?.themePrimary || '');
  const [themeTag1, setThemeTag1] = useState(existingWedding?.themeTags[0] || '');
  const [themeTag2, setThemeTag2] = useState(existingWedding?.themeTags[1] || '');
  const [themeTag3, setThemeTag3] = useState(existingWedding?.themeTags[2] || '');
  const [color1, setColor1] = useState(existingWedding?.themeColors[0] || '');
  const [color2, setColor2] = useState(existingWedding?.themeColors[1] || '');
  const [color3, setColor3] = useState(existingWedding?.themeColors[2] || '');
  const [priorities, setPriorities] = useState<Priority[]>(existingWedding?.priorities || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple geocoding stub - in real app would use geocoding service
    // For MVP, we'll use approximate coordinates for common WC locations
    const locationCoords: Record<string, { lat: number; lng: number }> = {
      'cape town': { lat: -33.9249, lng: 18.4241 },
      'franschhoek': { lat: -33.9122, lng: 19.1208 },
      'stellenbosch': { lat: -33.9344, lng: 18.8667 },
      'constantia': { lat: -34.0167, lng: 18.4167 },
      'camps bay': { lat: -33.9500, lng: 18.3833 },
    };

    const locationKey = location.toLowerCase().trim();
    const coords = locationCoords[locationKey] || { lat: -33.9249, lng: 18.4241 };

    const wedding: WeddingPlan = {
      weddingDate: weddingDate || null,
      guestCountRange: (guestCountRange as GuestCountRange) || null,
      totalBudget: totalBudget ? parseFloat(totalBudget) : null,
      budgetPreset: null,
      location: location || '',
      locationLat: coords.lat,
      locationLng: coords.lng,
      radiusKm: parseInt(radiusKm) || 50,
      themePrimary: themePrimary || '',
      themeSecondary: null,
      themeTags: [themeTag1, themeTag2, themeTag3].filter(Boolean),
      themeColors: [color1, color2, color3].filter(Boolean),
      priorities: priorities.slice(0, 3),
    };

    await setWedding(wedding);
    navigate('/dashboard');
  };

  const togglePriority = (priority: Priority) => {
    if (priorities.includes(priority)) {
      setPriorities(priorities.filter((p) => p !== priority));
    } else if (priorities.length < 3) {
      setPriorities([...priorities, priority]);
    }
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        backgroundImage: `linear-gradient(rgba(250,250,250,0.92), rgba(250,250,250,0.92)), url(${champagneBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
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
        Tell us about your wedding
      </h1>

      <form onSubmit={handleSubmit}>
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Basic Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Input
              type="date"
              label="Wedding Date (optional)"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
            <Select
              label="Guest Count Range"
              options={GUEST_COUNT_OPTIONS}
              value={guestCountRange}
              onChange={(e) => setGuestCountRange(e.target.value as GuestCountRange | '')}
            />
          </div>
        </Card>

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Budget
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Input
              type="number"
              label="Total Budget (R)"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="e.g. 150000"
            />
          </div>
        </Card>

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Location
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Input
              label="Town/Suburb"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Franschhoek, Stellenbosch, Cape Town"
              required
            />
            <Input
              type="number"
              label="Search Radius (km)"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              min="10"
              max="200"
            />
          </div>
        </Card>

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Theme
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Input
              label="Primary Theme"
              value={themePrimary}
              onChange={(e) => setThemePrimary(e.target.value)}
              placeholder="e.g. Rustic, Elegant, Modern"
            />
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: theme.spacing.xs,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                Theme Keywords (3)
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: theme.spacing.sm,
                }}
              >
                <Input
                  value={themeTag1}
                  onChange={(e) => setThemeTag1(e.target.value)}
                  placeholder="Keyword 1"
                />
                <Input
                  value={themeTag2}
                  onChange={(e) => setThemeTag2(e.target.value)}
                  placeholder="Keyword 2"
                />
                <Input
                  value={themeTag3}
                  onChange={(e) => setThemeTag3(e.target.value)}
                  placeholder="Keyword 3"
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: theme.spacing.xs,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                Theme Colors (3)
              </label>
              <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                <Input
                  type="color"
                  value={color1 || '#000000'}
                  onChange={(e) => setColor1(e.target.value)}
                  style={{ 
                    width: '88px', 
                    height: theme.controls.heightMd,
                    padding: 0,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                  }}
                />
                <Input
                  type="color"
                  value={color2 || '#000000'}
                  onChange={(e) => setColor2(e.target.value)}
                  style={{ 
                    width: '88px', 
                    height: theme.controls.heightMd,
                    padding: 0,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                  }}
                />
                <Input
                  type="color"
                  value={color3 || '#000000'}
                  onChange={(e) => setColor3(e.target.value)}
                  style={{ 
                    width: '88px', 
                    height: theme.controls.heightMd,
                    padding: 0,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Priorities (select top 3)
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
            }}
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => togglePriority(priority)}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${
                    priorities.includes(priority)
                      ? theme.colors.accent.primary
                      : theme.colors.border
                  }`,
                  backgroundColor: priorities.includes(priority)
                    ? theme.colors.accent.light
                    : theme.colors.surface,
                  color: priorities.includes(priority)
                    ? theme.colors.accent.primary
                    : theme.colors.text.primary,
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                {priority}
              </button>
            ))}
          </div>
          <p
            style={{
              marginTop: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            Selected: {priorities.length}/3
          </p>
        </Card>

        <Button type="submit" size="lg" style={{ width: '100%' }}>
          Save & Continue
        </Button>
      </form>
    </div>
  );
};
