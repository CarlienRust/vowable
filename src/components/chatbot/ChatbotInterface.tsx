import React, { useState, useRef, useEffect } from 'react';
import { ChatbotMessage as ChatbotMessageType } from '../../services/chatbot.service';
import { ChatbotMessage } from './ChatbotMessage';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

interface ChatbotInterfaceProps {
  messages: ChatbotMessageType[];
  onSendMessage: (message: string) => void;
  onSaveListing?: (listing: any) => void;
  disabled?: boolean;
}

export const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({
  messages,
  onSendMessage,
  onSaveListing,
  disabled,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
      }}
    >
      <div
        data-messages-container
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: theme.spacing.lg,
          minHeight: 0,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: theme.colors.text.secondary,
              padding: theme.spacing.xl,
            }}
          >
            <p>Start a conversation to get vendor recommendations!</p>
          </div>
        )}
        {messages.map((message, index) => (
          <ChatbotMessage
            key={index}
            message={message}
            onSaveListing={onSaveListing}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        data-chatbot-form
        onSubmit={handleSubmit}
        style={{
          padding: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
          display: 'flex',
          gap: theme.spacing.sm,
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for more affordable options, closer venues, etc..."
          disabled={disabled}
          style={{ flex: 1 }}
        />
        <Button type="submit" disabled={disabled || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};
