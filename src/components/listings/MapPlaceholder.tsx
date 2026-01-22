import React from 'react';
import { theme } from '../../styles/theme';

export const MapPlaceholder: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '500px',
        backgroundColor: theme.colors.border,
        borderRadius: theme.borderRadius.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: theme.colors.text.secondary,
        }}
      >
        <p
          style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: theme.spacing.sm,
          }}
        >
          Map integration coming soon
        </p>
        <p style={{ fontSize: theme.typography.fontSize.sm }}>
          Map view will show listings with distance and location details
        </p>
      </div>
    </div>
  );
};
