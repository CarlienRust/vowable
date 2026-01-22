import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingType, PriceBand } from '../domain/types';
import { listingsService } from '../services/listings.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { theme } from '../styles/theme';

export const AdminAddListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<ListingType>('venue');
  const [name, setName] = useState('');
  const [descriptionShort, setDescriptionShort] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [priceBand, setPriceBand] = useState<PriceBand>('mid');
  const [tags, setTags] = useState('');
  const [capacityMin, setCapacityMin] = useState('');
  const [capacityMax, setCapacityMax] = useState('');
  const [contactUrl, setContactUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [priceType, setPriceType] = useState<'from' | 'per_person' | 'package' | 'quote_only' | ''>('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [pricingNotes, setPricingNotes] = useState('');
  const [lastVerifiedAt, setLastVerifiedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const typeOptions = [
    { value: 'venue', label: 'Venue' },
    { value: 'caterer', label: 'Caterer' },
    { value: 'florist', label: 'Florist' },
    { value: 'boutique', label: 'Boutique' },
    { value: 'accommodation', label: 'Accommodation' },
  ];

  const priceBandOptions = [
    { value: 'low', label: 'Low' },
    { value: 'mid', label: 'Mid' },
    { value: 'high', label: 'High' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ];

  const priceTypeOptions = [
    { value: '', label: 'Not specified' },
    { value: 'from', label: 'From (minimum price)' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'package', label: 'Package' },
    { value: 'quote_only', label: 'Quote Only' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const listingData: any = {
        type,
        name,
        description: descriptionShort,
        location_name: locationName,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        price_band: priceBand,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        contact_url: contactUrl || null,
        phone: phone || null,
        email: email || null,
        status,
      };

      if (type === 'venue' || type === 'accommodation') {
        listingData.capacity_min = capacityMin ? parseInt(capacityMin) : null;
        listingData.capacity_max = capacityMax ? parseInt(capacityMax) : null;
      }

      if (priceType) {
        listingData.price_type = priceType;
        listingData.price_min = priceMin ? parseFloat(priceMin) : null;
        listingData.price_max = priceMax ? parseFloat(priceMax) : null;
        listingData.pricing_notes = pricingNotes || null;
        listingData.last_verified_at = lastVerifiedAt || null;
      }

      const listingId = await listingsService.createListing(listingData);

      if (listingId) {
        navigate('/explore');
      } else {
        setError('Failed to create listing');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '800px',
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
        Add New Listing
      </h1>

      {error && (
        <Card
          style={{
            marginBottom: theme.spacing.lg,
            backgroundColor: '#FFEBEE',
            color: theme.colors.error,
          }}
        >
          {error}
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Basic Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Select
              label="Type"
              options={typeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as ListingType)}
              required
            />
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Textarea
              label="Description"
              value={descriptionShort}
              onChange={(e) => setDescriptionShort(e.target.value)}
              rows={3}
            />
            <Input
              label="Location Name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
              <Input
                label="Latitude (optional)"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <Input
                label="Longitude (optional)"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
            <Input
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. outdoor, scenic, winelands"
            />
          </div>
        </Card>

        {(type === 'venue' || type === 'accommodation') && (
          <Card style={{ marginBottom: theme.spacing.lg }}>
            <h2
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                marginBottom: theme.spacing.md,
              }}
            >
              Capacity
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
              <Input
                label="Min Capacity"
                type="number"
                value={capacityMin}
                onChange={(e) => setCapacityMin(e.target.value)}
              />
              <Input
                label="Max Capacity"
                type="number"
                value={capacityMax}
                onChange={(e) => setCapacityMax(e.target.value)}
              />
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            }}
          >
            Pricing
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Select
              label="Price Band"
              options={priceBandOptions}
              value={priceBand}
              onChange={(e) => setPriceBand(e.target.value as PriceBand)}
              required
            />
            <Select
              label="Price Type"
              options={priceTypeOptions}
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as any)}
            />
            {priceType && priceType !== 'quote_only' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                  <Input
                    label="Price Min (R)"
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <Input
                    label="Price Max (R)"
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
                <Textarea
                  label="Pricing Notes"
                  value={pricingNotes}
                  onChange={(e) => setPricingNotes(e.target.value)}
                  rows={2}
                />
                <Input
                  label="Last Verified Date"
                  type="date"
                  value={lastVerifiedAt}
                  onChange={(e) => setLastVerifiedAt(e.target.value)}
                />
              </>
            )}
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
            Contact Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Input
              label="Contact URL"
              type="url"
              value={contactUrl}
              onChange={(e) => setContactUrl(e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </Card>

        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          />
        </Card>

        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <Button type="submit" size="lg" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/explore')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
