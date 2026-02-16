import React from 'react';
import { ListingType, PriceBand } from '../../domain/types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { theme } from '../../styles/theme';

export type ExploreCenterMode = 'wedding' | 'cape_town';

interface FiltersBarProps {
  selectedType: ListingType | 'all';
  selectedPriceBand: PriceBand | 'all';
  searchQuery: string;
  radiusKm: number;
  centerMode: ExploreCenterMode;
  weddingLocationAvailable: boolean;
  onTypeChange: (type: ListingType | 'all') => void;
  onPriceBandChange: (band: PriceBand | 'all') => void;
  onSearchChange: (query: string) => void;
  onRadiusChange: (radiusKm: number) => void;
  onCenterModeChange: (mode: ExploreCenterMode) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  selectedType,
  selectedPriceBand,
  searchQuery,
  radiusKm,
  centerMode,
  weddingLocationAvailable,
  onTypeChange,
  onPriceBandChange,
  onSearchChange,
  onRadiusChange,
  onCenterModeChange,
}) => {
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'venue', label: 'Venues' },
    { value: 'caterer', label: 'Caterers' },
    { value: 'florist', label: 'Florists' },
    { value: 'boutique', label: 'Boutiques' },
    { value: 'accommodation', label: 'Accommodation' },
  ];

  const priceBandOptions = [
    { value: 'all', label: 'All Prices' },
    { value: 'low', label: 'Low' },
    { value: 'mid', label: 'Mid' },
    { value: 'high', label: 'High' },
  ];

  const centerOptions = [
    { value: 'cape_town', label: 'Cape Town (default)' },
    { value: 'wedding', label: weddingLocationAvailable ? 'Wedding location' : 'Wedding location (set on profile)' },
  ];

  const radiusOptions = [10, 25, 50, 75, 100, 150, 200].map((km) => ({
    value: String(km),
    label: `${km} km`,
  }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <Input
        placeholder="Search by name or location..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md,
        }}
      >
        <Select
          options={typeOptions}
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as ListingType | 'all')}
        />
        <Select
          options={priceBandOptions}
          value={selectedPriceBand}
          onChange={(e) => onPriceBandChange(e.target.value as PriceBand | 'all')}
        />
        <Select
          options={centerOptions}
          value={centerMode}
          onChange={(e) => onCenterModeChange(e.target.value as ExploreCenterMode)}
        />
        <Select
          options={radiusOptions}
          value={String(radiusKm)}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
        />
      </div>
      {!weddingLocationAvailable && centerMode === 'wedding' && (
        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
          Set your wedding location coordinates in Wedding Profile to filter around it. Using Cape Town for now.
        </div>
      )}
    </div>
  );
};
