import React from 'react';
import { ChatbotMessage as ChatbotMessageType } from '../../services/chatbot.service';
import { ListingCard } from '../listings/ListingCard';
import { theme } from '../../styles/theme';

interface ChatbotMessageProps {
  message: ChatbotMessageType;
  onSaveListing?: (listing: any) => void;
}

export const ChatbotMessage: React.FC<ChatbotMessageProps> = ({ message, onSaveListing }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: theme.spacing.lg,
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: isUser
            ? theme.colors.accent.primary
            : theme.colors.surface,
          color: isUser ? '#FFFFFF' : theme.colors.text.primary,
          border: isAssistant ? `1px solid ${theme.colors.border}` : 'none',
        }}
      >
        <p
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            lineHeight: theme.typography.lineHeight.relaxed,
          }}
        >
          {message.content}
        </p>
        {message.explanation && (
          <div
            style={{
              marginTop: theme.spacing.md,
              padding: theme.spacing.sm,
              backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : theme.colors.accent.light,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.sm,
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.explanation}
            </p>
          </div>
        )}
      </div>

      {message.listings && message.listings.length > 0 && (
        <div
          style={{
            marginTop: theme.spacing.md,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
          }}
        >
          {message.listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSave={onSaveListing}
            />
          ))}
        </div>
      )}

      <span
        style={{
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.text.muted,
          marginTop: theme.spacing.xs,
        }}
      >
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
};
