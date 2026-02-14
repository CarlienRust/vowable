import React, { useState, useMemo, useEffect } from 'react';
import { Listing, ListingType, PriceBand } from '../domain/types';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { listingsService } from '../services/listings.service';
import { enquiriesService } from '../services/enquiries.service';
import { filterByRadius } from '../domain/geo';
import { ListingCard } from '../components/listings/ListingCard';
import { FiltersBar } from '../components/listings/FiltersBar';
import { MapPlaceholder } from '../components/listings/MapPlaceholder';
import { EnquiryModal } from '../components/listings/EnquiryModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { theme } from '../styles/theme';

type ViewMode = 'list' | 'map';

export const ExplorePage: React.FC = () => {
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const weddingId = useWeddingPlanStore((state) => state.weddingId);
  const addSavedItem = useWeddingPlanStore((state) => state.addSavedItem);
  const userId = useWeddingPlanStore((state) => state.userId);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedPriceBand, setSelectedPriceBand] = useState<PriceBand | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsHasMore, setListingsHasMore] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [enquiryModalListing, setEnquiryModalListing] = useState<Listing | null>(null);
  const [enquiryStatuses, setEnquiryStatuses] = useState<Record<string, string>>({});

  const fetchListingsPage = async (offset: number, append: boolean) => {
    const type = selectedType === 'all' ? undefined : selectedType;
    const opts = {
      offset,
      limit: listingsService.LISTINGS_PAGE_SIZE,
      type,
    };
    const { data, hasMore } =
      offset === 0
        ? await listingsService.getListingsCached(opts)
        : await listingsService.getListings(opts);
    setListings((prev) => (append ? [...prev, ...data] : data));
    setListingsHasMore(hasMore);
  };

  const handleLoadMore = () => {
    fetchListingsPage(listings.length, true);
  };

  useEffect(() => {
    const loadFirstPage = async () => {
      setListingsLoading(true);
      await fetchListingsPage(0, false);
      setListingsLoading(false);
    };
    loadFirstPage();
  }, [selectedType]);

  useEffect(() => {
    if (userId) {
      enquiriesService.getEnquiries(userId).then((enquiries) => {
        const statusMap: Record<string, string> = {};
        enquiries.forEach((enq) => {
          statusMap[enq.listing_id] = enq.status;
        });
        setEnquiryStatuses(statusMap);
      });
    }
  }, [userId]);

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
          listing.tags.some((tag: string) => tag.toLowerCase().includes(query))
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

  const handleSave = async (listing: Listing) => {
    await addSavedItem(listing);
    alert('Listing saved to your shortlist!');
  };

  const handleEnquire = (listing: Listing) => {
    setEnquiryModalListing(listing);
  };

  const handleEnquirySaved = async () => {
    if (userId && enquiryModalListing) {
      const enquiries = await enquiriesService.getEnquiries(userId);
      const statusMap: Record<string, string> = {};
      enquiries.forEach((enq) => {
        statusMap[enq.listing_id] = enq.status;
      });
      setEnquiryStatuses(statusMap);
    }
    setEnquiryModalListing(null);
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

      <Card
        style={{
          marginBottom: theme.spacing.lg,
          backgroundColor: '#fff5f7',
          border: `2px solid #ffc0cb`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
          }}
        >
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: '#d81b60',
                marginBottom: theme.spacing.xs,
              }}
            >
              Pink Book Weddings
            </h2>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.sm,
              }}
            >
              Browse South Africa's comprehensive wedding directory with hundreds of vetted vendors
            </p>
          </div>
          <Button
            onClick={() => window.open('https://pink-book.co.za', '_blank', 'noopener,noreferrer')}
            style={{
              backgroundColor: '#d81b60',
              color: 'white',
              border: 'none',
            }}
          >
            Visit Pink Book →
          </Button>
        </div>
      </Card>

      {viewMode === 'list' ? (
        <div>
          <p
            style={{
              marginBottom: theme.spacing.md,
              color: theme.colors.text.secondary,
            }}
          >
            {listingsLoading ? 'Loading…' : `Showing ${filteredListings.length} listings`}
          </p>
          {filteredListings.map(({ listing, distance }) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              distance={distance}
              onSave={handleSave}
              onEnquire={handleEnquire}
              enquiryStatus={enquiryStatuses[listing.id]}
            />
          ))}
          {listingsHasMore && (
            <div style={{ marginTop: theme.spacing.lg, textAlign: 'center' }}>
              <Button variant="outline" onClick={handleLoadMore}>
                Load more
              </Button>
            </div>
          )}
          {enquiryModalListing && userId && (
            <EnquiryModal
              listing={enquiryModalListing}
              wedding={wedding}
              userId={userId}
              weddingId={weddingId}
              onClose={() => setEnquiryModalListing(null)}
              onSave={handleEnquirySaved}
            />
          )}
        </div>
      ) : (
        <MapPlaceholder />
      )}
    </div>
  );
};
