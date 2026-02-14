import React, { useState, useEffect, useRef } from 'react';
import { ListingType, WeddingPlan } from '../../domain/types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { theme } from '../../styles/theme';

// Legacy interface for form compatibility
interface FormVendorPreferences {
  type: ListingType;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'either';
  guestCount?: number;
  budgetMin?: number;
  budgetMax?: number;
  maxDistanceKm?: number;
  priority?: 'scenery' | 'food' | 'party' | 'convenience' | 'budget';
  themeKeywords?: string[];
}

function defaultGuestCountFromRange(range: string | null): number | undefined {
  if (!range) return undefined;
  if (range === '0-50') return 25;
  if (range === '50-100') return 75;
  if (range === '100-150') return 125;
  if (range === '150+') return 175;
  return undefined;
}

interface VendorIntakeFormProps {
  onSubmit: (preferences: FormVendorPreferences) => void;
  onCancel?: () => void;
  initialType?: ListingType;
  /** Default form values from Wedding Profile; user can change without updating profile */
  wedding?: WeddingPlan | null;
}

export const VendorIntakeForm: React.FC<VendorIntakeFormProps> = ({
  onSubmit,
  onCancel,
  initialType,
  wedding,
}) => {
  const [type, setType] = useState<ListingType>(initialType || 'venue');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'either'>('either');
  const [guestCount, setGuestCount] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState('');
  const [priority, setPriority] = useState<'scenery' | 'food' | 'party' | 'convenience' | 'budget'>('convenience');

  const hasInitializedFromWedding = useRef(false);
  // Pre-fill from Wedding Profile once when form is shown (user can change without updating profile)
  useEffect(() => {
    if (!wedding || hasInitializedFromWedding.current) return;
    hasInitializedFromWedding.current = true;
    if (wedding.guestCountRange) {
      const n = defaultGuestCountFromRange(wedding.guestCountRange);
      if (n !== undefined) setGuestCount(String(n));
    }
    if (wedding.totalBudget != null && wedding.totalBudget > 0) {
      const total = wedding.totalBudget;
      setBudgetMin(String(Math.round(total * 0.25)));
      setBudgetMax(String(Math.round(total * 0.5)));
    }
    if (wedding.radiusKm != null) setMaxDistanceKm(String(wedding.radiusKm));
  }, [wedding]);

  const typeOptions = [
    { value: 'venue', label: 'Venues' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'florist', label: 'Florists' },
    { value: 'boutique', label: 'Boutiques' },
    { value: 'accommodation', label: 'Accommodation' },
  ];

  const indoorOutdoorOptions = [
    { value: 'either', label: 'Either' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'outdoor', label: 'Outdoor' },
  ];

  const priorityOptions = [
    { value: 'convenience', label: 'Convenience' },
    { value: 'scenery', label: 'Scenery' },
    { value: 'food', label: 'Food Quality' },
    { value: 'party', label: 'Party Vibe' },
    { value: 'budget', label: 'Budget' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preferences: FormVendorPreferences = {
      type,
      indoorOutdoor: type === 'venue' ? indoorOutdoor : undefined,
      guestCount: guestCount ? parseInt(guestCount) : undefined,
      budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
      budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
      maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm) : undefined,
      priority,
    };
    onSubmit(preferences);
  };

  return (
    <Card>
      <h2
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          marginBottom: theme.spacing.xs,
        }}
      >
        Tell me what you're looking for
      </h2>
      <p
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.md,
        }}
      >
        Defaults are from your Wedding Profile. You can change them here to see different results without updating your profile.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Select
            label="Vendor Type"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as ListingType)}
            required
          />

          {type === 'venue' && (
            <>
              <Select
                label="Indoor or Outdoor?"
                options={indoorOutdoorOptions}
                value={indoorOutdoor}
                onChange={(e) => setIndoorOutdoor(e.target.value as 'indoor' | 'outdoor' | 'either')}
              />
              <Input
                type="number"
                label="Guest Count"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="e.g. 120"
              />
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
            <Input
              type="number"
              label="Budget Min (R)"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="e.g. 50000"
            />
            <Input
              type="number"
              label="Budget Max (R)"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="e.g. 150000"
            />
          </div>

          <Input
            type="number"
            label="Max Distance (km)"
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(e.target.value)}
            placeholder="e.g. 50"
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
          />

          <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <Button type="submit" style={{ flex: 1 }}>
              Find Matches
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};
