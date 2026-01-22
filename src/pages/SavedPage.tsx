import React, { useState } from 'react';
import { SavedItem, SavedItemStatus } from '../domain/types';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { formatCurrency, formatDateShort } from '../domain/format';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { theme } from '../styles/theme';

export const SavedPage: React.FC = () => {
  const savedItems = useWeddingPlanStore((state) => state.savedItems);
  const updateSavedItem = useWeddingPlanStore((state) => state.updateSavedItem);
  const removeSavedItem = useWeddingPlanStore((state) => state.removeSavedItem);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCost, setEditCost] = useState('');

  const handleEdit = (item: SavedItem) => {
    setEditingId(item.id);
    setEditNotes(item.notes);
    setEditCost(item.estimated_cost.toString());
  };

  const handleSaveEdit = (id: string) => {
    updateSavedItem(id, {
      notes: editNotes,
      estimated_cost: parseFloat(editCost) || 0,
    });
    setEditingId(null);
  };

  const handleStatusChange = (id: string, status: SavedItemStatus) => {
    updateSavedItem(id, { status });
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
              <div style={{ display: 'flex', gap: theme.spacing.xs, marginBottom: theme.spacing.sm }}>
                <Tag variant={item.status === 'booked' ? 'success' : 'default'}>
                  {item.status}
                </Tag>
                <Tag variant="accent">{item.listing.price_band}</Tag>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeSavedItem(item.id)}
            >
              Remove
            </Button>
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
    </div>
  );
};
