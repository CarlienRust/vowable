import React, { useState, useMemo } from 'react';
import { Listing, ListingType, PriceBand } from '../domain/types';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { filterByRadius } from '../domain/geo';
import { ListingCard } from '../components/listings/ListingCard';
import { FiltersBar } from '../components/listings/FiltersBar';
import { MapPlaceholder } from '../components/listings/MapPlaceholder';
import { Button } from '../components/ui/Button';
import seedListings from '../data/seed_listings.western_cape.json';
import { theme } from '../styles/theme';

type ViewMode = 'list' | 'map';

export const ExplorePage: React.FC = () => {
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const addSavedItem = useWeddingPlanStore((state) => state.addSavedItem);
  const savedItems = useWeddingPlanStore((state) => state.savedItems);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedPriceBand, setSelectedPriceBand] = useState<PriceBand | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const listings = seedListings as Listing[];

  const filteredListings = useMemo(() => {
    let filtered = listings;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((listing) => listing.type === selectedType);
    }

    // Filter by price band
    if (selectedPriceBand !== 'all') {
      filtered = filtered.filter((listing) => listing.price_band === selectedPriceBand);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.name.toLowerCase().includes(query) ||
          listing.location_name.toLowerCase().includes(query) ||
          listing.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by distance if location is set
    if (wedding?.locationLat && wedding?.locationLng) {
      const withDistance = filterByRadius(
        filtered,
        wedding.locationLat,
        wedding.locationLng,
        wedding.radiusKm || 200
      );
      return withDistance.map((item) => ({
        listing: item.listing as Listing,
        distance: item.distance,
      }));
    }

    return filtered.map((listing) => ({ listing, distance: undefined }));
  }, [listings, selectedType, selectedPriceBand, searchQuery, wedding]);

  const handleSave = (listing: Listing) => {
    const savedItem = {
      id: `saved-${Date.now()}`,
      listingId: listing.id,
      listing,
      notes: '',
      estimated_cost: 0,
      status: 'shortlisted' as const,
      savedAt: new Date().toISOString(),
    };
    addSavedItem(savedItem);
    alert('Listing saved to your shortlist!');
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}
      >
        <h1
          style={{
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}
        >
          Explore Venues & Vendors
        </h1>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            Map
          </Button>
        </div>
      </div>

      <FiltersBar
        selectedType={selectedType}
        selectedPriceBand={selectedPriceBand}
        searchQuery={searchQuery}
        onTypeChange={setSelectedType}
        onPriceBandChange={setSelectedPriceBand}
        onSearchChange={setSearchQuery}
      />

      {viewMode === 'list' ? (
        <div>
          <p
            style={{
              marginBottom: theme.spacing.md,
              color: theme.colors.text.secondary,
            }}
          >
            Found {filteredListings.length} listings
          </p>
          {filteredListings.map(({ listing, distance }) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              distance={distance}
              onSave={handleSave}
            />
          ))}
        </div>
      ) : (
        <MapPlaceholder />
      )}
    </div>
  );
};
