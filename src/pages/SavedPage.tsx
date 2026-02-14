import React, { useState, useEffect } from 'react';
import { SavedItem, SavedItemStatus, Listing } from '../domain/types';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { formatCurrency, formatDateShort } from '../domain/format';
import { authService } from '../services/auth.service';
import { enquiriesService } from '../services/enquiries.service';
import { EnquiryModal } from '../components/listings/EnquiryModal';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { theme } from '../styles/theme';
import streetBg from '../assets/backgrounds/street.png';

export const SavedPage: React.FC = () => {
  const savedItems = useWeddingPlanStore((state) => state.savedItems);
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const weddingId = useWeddingPlanStore((state) => state.weddingId);
  const updateSavedItem = useWeddingPlanStore((state) => state.updateSavedItem);
  const removeSavedItem = useWeddingPlanStore((state) => state.removeSavedItem);
  const loadFromSupabase = useWeddingPlanStore((state) => state.loadFromSupabase);
  const userId = useWeddingPlanStore((state) => state.userId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCost, setEditCost] = useState('');
  const [enquiryModalListing, setEnquiryModalListing] = useState<Listing | null>(null);
  const [enquiryStatuses, setEnquiryStatuses] = useState<Record<string, string>>({});

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

      // Load enquiry statuses
      if (userId) {
        const enquiries = await enquiriesService.getEnquiries(userId);
        const statusMap: Record<string, string> = {};
        enquiries.forEach((enq: { listing_id: string; status: string }) => {
          statusMap[enq.listing_id] = enq.status;
        });
        setEnquiryStatuses(statusMap);
      }
    };
    loadData();
  }, [userId, loadFromSupabase]);

  const handleEdit = (item: SavedItem) => {
    setEditingId(item.id);
    setEditNotes(item.notes);
    setEditCost(item.estimated_cost.toString());
  };

  const handleSaveEdit = async (id: string) => {
    await updateSavedItem(id, {
      notes: editNotes,
      estimated_cost: parseFloat(editCost) || 0,
    });
    setEditingId(null);
  };

  const handleStatusChange = async (id: string, status: SavedItemStatus) => {
    await updateSavedItem(id, { status });
  };

  const statusOptions = [
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'booked', label: 'Booked' },
    { value: 'rejected', label: 'Rejected' },
  ];

  if (savedItems.length === 0) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.background,
          backgroundImage: `linear-gradient(rgba(250,250,250,0.2), rgba(250,250,250,0.2)), url(${streetBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Card>
          <h1
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              marginBottom: theme.spacing.md,
            }}
          >
            Your Saved Items
          </h1>
          <p style={{ color: theme.colors.text.secondary }}>
            No saved items yet. Explore venues and vendors to start building your shortlist.
          </p>
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
        backgroundImage: `linear-gradient(rgba(250,250,250,0.2), rgba(250,250,250,0.2)), url(${streetBg})`,
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
        Your Saved Items
      </h1>

      {savedItems.map((item) => (
        <Card key={item.id} style={{ marginBottom: theme.spacing.md }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: theme.spacing.md,
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {item.listing.name}
              </h2>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {item.listing.location_name} • {item.listing.type}
              </p>
              <div style={{ display: 'flex', gap: theme.spacing.xs, marginBottom: theme.spacing.sm, flexWrap: 'wrap' }}>
                <Tag variant={item.status === 'booked' ? 'success' : 'default'}>
                  {item.status}
                </Tag>
                <Tag variant="accent">{item.listing.price_band}</Tag>
                {enquiryStatuses[item.listing.id] && (
                  <Tag variant={enquiryStatuses[item.listing.id] === 'booked' ? 'success' : 'default'}>
                    Enquiry: {enquiryStatuses[item.listing.id]}
                  </Tag>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEnquiryModalListing(item.listing)}
              >
                Enquire
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSavedItem(item.id)}
              >
                Remove
              </Button>
            </div>
          </div>

          {editingId === item.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <Textarea
                label="Notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
              <Input
                type="number"
                label="Estimated Cost (R)"
                value={editCost}
                onChange={(e) => setEditCost(e.target.value)}
              />
              <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                <Button size="sm" onClick={() => handleSaveEdit(item.id)}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {item.notes && (
                <p
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {item.notes}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.sm,
                }}
              >
                <p
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  Estimated Cost: {formatCurrency(item.estimated_cost)}
                </p>
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
              </div>
              <Select
                label="Status"
                options={statusOptions}
                value={item.status}
                onChange={(e) =>
                  handleStatusChange(item.id, e.target.value as SavedItemStatus)
                }
              />
              <p
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.muted,
                  marginTop: theme.spacing.xs,
                }}
              >
                Saved: {formatDateShort(item.savedAt)}
              </p>
            </div>
          )}
        </Card>
      ))}
      {enquiryModalListing && userId && (
        <EnquiryModal
          listing={enquiryModalListing}
          wedding={wedding}
          userId={userId}
          weddingId={weddingId}
          onClose={() => setEnquiryModalListing(null)}
          onSave={async () => {
            const enquiries = await enquiriesService.getEnquiries(userId);
            const statusMap: Record<string, string> = {};
            enquiries.forEach((enq: { listing_id: string; status: string }) => {
              statusMap[enq.listing_id] = enq.status;
            });
            setEnquiryStatuses(statusMap);
            setEnquiryModalListing(null);
          }}
        />
      )}
    </div>
  );
};
