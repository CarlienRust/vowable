import React from 'react';
import { Listing } from '../../domain/types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { formatDistance, formatCurrency } from '../../domain/format';
import { theme } from '../../styles/theme';

interface ListingCardProps {
  listing: Listing & {
    price_type?: 'from' | 'per_person' | 'package' | 'quote_only';
    price_min?: number | null;
    price_max?: number | null;
    pricing_notes?: string | null;
    last_verified_at?: string | null;
  };
  distance?: number;
  onSave?: (listing: Listing) => void;
  onView?: (listing: Listing) => void;
  onEnquire?: (listing: Listing) => void;
  enquiryStatus?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  distance,
  onSave,
  onView,
  onEnquire,
  enquiryStatus,
}) => {
  const priceBandColors: Record<string, string> = {
    low: theme.colors.success,
    mid: theme.colors.warning,
    high: theme.colors.accent.primary,
  };

  return (
    <Card
      onClick={() => onView?.(listing)}
      style={{
        marginBottom: theme.spacing.md,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm,
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.xs,
              color: theme.colors.text.primary,
            }}
          >
            {listing.name}
          </h3>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}
          >
            {listing.location_name}
            {distance !== undefined && ` • ${formatDistance(distance)} away`}
          </p>
        </div>
        <span
          style={{
            display: 'inline-block',
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            fontSize: theme.typography.fontSize.sm,
            borderRadius: theme.borderRadius.full,
            fontWeight: theme.typography.fontWeight.medium,
            backgroundColor: priceBandColors[listing.price_band] + '20',
            color: priceBandColors[listing.price_band],
          }}
        >
          {listing.price_band}
        </span>
      </div>

      {listing.description && (
        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.md,
            lineHeight: theme.typography.lineHeight.relaxed,
          }}
        >
          {listing.description}
        </p>
      )}

      {(listing.capacity_min || listing.capacity_max) && (
        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.sm,
          }}
        >
          Capacity: {listing.capacity_min || '?'} - {listing.capacity_max || '?'} guests
        </p>
      )}

      {/* Pricing display */}
      {listing.price_type && (
        <div style={{ marginBottom: theme.spacing.sm }}>
          {listing.price_type === 'quote_only' && (
            <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
              Quote only
            </p>
          )}
          {listing.price_type === 'from' && listing.price_min && (
            <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              From {formatCurrency(listing.price_min)}
            </p>
          )}
          {listing.price_type === 'per_person' && listing.price_min && listing.price_max && (
            <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              {formatCurrency(listing.price_min)}–{formatCurrency(listing.price_max)} pp
            </p>
          )}
          {listing.price_type === 'package' && listing.price_min && listing.price_max && (
            <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
              {formatCurrency(listing.price_min)}–{formatCurrency(listing.price_max)} package
            </p>
          )}
          {listing.last_verified_at && (
            <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.muted, marginTop: theme.spacing.xs }}>
              Verified {new Date(listing.last_verified_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Enquiry status */}
      {enquiryStatus && (
        <div style={{ marginBottom: theme.spacing.sm }}>
          <Tag variant={enquiryStatus === 'booked' ? 'success' : 'default'}>
            Enquiry: {enquiryStatus}
          </Tag>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme.spacing.xs,
          marginBottom: theme.spacing.md,
        }}
      >
        {listing.tags.slice(0, 4).map((tag) => (
          <Tag key={tag} variant="default">
            {tag}
          </Tag>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: theme.spacing.sm,
          flexWrap: 'wrap',
        }}
      >
        <a
          href={listing.contact_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.accent.primary,
            textDecoration: 'underline',
          }}
        >
          View Details
        </a>
        {onSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(listing);
            }}
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.accent.primary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Save
          </button>
        )}
        {onEnquire && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnquire(listing);
            }}
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.accent.primary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Enquire
          </button>
        )}
      </div>
    </Card>
  );
};
