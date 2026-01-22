import React from 'react';
import { ListingType, PriceBand } from '../../domain/types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { theme } from '../../styles/theme';

interface FiltersBarProps {
  selectedType: ListingType | 'all';
  selectedPriceBand: PriceBand | 'all';
  searchQuery: string;
  onTypeChange: (type: ListingType | 'all') => void;
  onPriceBandChange: (band: PriceBand | 'all') => void;
  onSearchChange: (query: string) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  selectedType,
  selectedPriceBand,
  searchQuery,
  onTypeChange,
  onPriceBandChange,
  onSearchChange,
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
      </div>
    </div>
  );
};
