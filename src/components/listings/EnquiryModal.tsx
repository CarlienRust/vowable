import React, { useState, useEffect } from 'react';
import { Listing } from '../../domain/types';
import { WeddingPlan } from '../../domain/types';
import { enquiriesService } from '../../services/enquiries.service';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

interface EnquiryModalProps {
  listing: Listing;
  wedding: WeddingPlan | null;
  userId: string;
  weddingId: string | null;
  onClose: () => void;
  onSave: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  listing,
  wedding,
  userId,
  weddingId,
  onClose,
  onSave,
}) => {
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp' | 'website' | 'phone'>('email');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('draft');
  const [existingEnquiry, setExistingEnquiry] = useState<any>(null);

  useEffect(() => {
    const loadExisting = async () => {
      const enquiry = await enquiriesService.getEnquiryForListing(userId, listing.id);
      if (enquiry) {
        setExistingEnquiry(enquiry);
        setContactMethod(enquiry.contact_method || 'email');
        setMessage(enquiry.message || '');
        setStatus(enquiry.status as 'draft' | 'sent');
      } else {
        // Generate template message
        const template = `Hi,

I'm planning my wedding${wedding?.weddingDate ? ` on ${new Date(wedding.weddingDate).toLocaleDateString()}` : ''}${wedding?.location ? ` in ${wedding.location}` : ''}${wedding?.guestCountRange ? ` for ${wedding.guestCountRange} guests` : ''}.

I'm interested in learning more about ${listing.name} for my wedding.

Could you please provide more information about:
- Availability
- Pricing
- Packages/services

Thank you!`;
        setMessage(template);
      }
    };
    loadExisting();
  }, [userId, listing.id, wedding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingEnquiry) {
      await enquiriesService.updateEnquiry(existingEnquiry.id, {
        message,
        contact_method: contactMethod,
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      });
    } else {
      await enquiriesService.createEnquiry(
        userId,
        weddingId,
        listing.id,
        message,
        contactMethod,
        status
      );
    }

    onSave();
    onClose();
  };

  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'website', label: 'Website Form' },
    { value: 'phone', label: 'Phone' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Save as Draft' },
    { value: 'sent', label: 'Mark as Sent' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: theme.spacing.lg,
      }}
      onClick={onClose}
    >
      <Card
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            Enquire about {listing.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: theme.typography.fontSize.xl,
              cursor: 'pointer',
              color: theme.colors.text.secondary,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <Select
            label="Contact Method"
            options={contactMethodOptions}
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value as any)}
            required
            style={{ marginBottom: theme.spacing.md }}
          />

          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            required
            style={{ marginBottom: theme.spacing.md }}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'sent')}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button type="submit" style={{ flex: 1 }}>
              {existingEnquiry ? 'Update Enquiry' : 'Save Enquiry'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
