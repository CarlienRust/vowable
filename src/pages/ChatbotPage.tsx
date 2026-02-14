import React, { useState, useEffect } from 'react';
import { useWeddingPlanStore } from '../state/useWeddingPlanStore';
import { Listing } from '../domain/types';
import {
  VendorPreferences,
  ChatbotMessage,
  findVendorMatches,
  generateExplanation,
  parseRefinement,
} from '../services/chatbot.service';
import { ListingType, PriceBand } from '../domain/types';
import { Category } from '../domain/match';
import { VendorIntakeForm } from '../components/chatbot/VendorIntakeForm';
import { ChatbotInterface } from '../components/chatbot/ChatbotInterface';
import { Button } from '../components/ui/Button';
import { listingsService } from '../services/listings.service';
import { theme } from '../styles/theme';

export const ChatbotPage: React.FC = () => {
  const wedding = useWeddingPlanStore((state) => state.wedding);
  const savedItems = useWeddingPlanStore((state) => state.savedItems);
  const addSavedItem = useWeddingPlanStore((state) => state.addSavedItem);

  const [showIntake, setShowIntake] = useState(true);
  const [currentPreferences, setCurrentPreferences] = useState<VendorPreferences | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);

  // Legacy form preferences interface
  interface FormVendorPreferences {
    type: ListingType;
    indoorOutdoor?: 'indoor' | 'outdoor' | 'either';
    guestCount?: number;
    budgetMin?: number;
    budgetMax?: number;
    maxDistanceKm?: number;
    priority?: 'scenery' | 'food' | 'party' | 'convenience' | 'budget';
    themeKeywords?: string[];
  }

  useEffect(() => {
    const loadListings = async () => {
      const data = await listingsService.getAllListings();
      setListings(data);
    };
    loadListings();
  }, []);

  useEffect(() => {
    if (wedding) {
      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm here to help you find the perfect vendors for your wedding in ${wedding.location || 'the Western Cape'}. 

I can help you:
• Find venues, caterers, florists, boutiques, or accommodation
• Match vendors to your budget, guest count, and style
• Refine your search based on your preferences

What would you like to find?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [wedding]);

  const handleIntakeSubmit = async (formPrefs: FormVendorPreferences) => {
    setIsProcessing(true);

    // Convert form format to new VendorPreferences format
    const newPreferences: VendorPreferences = {
      category: formPrefs.type as Category,
      guestCount: formPrefs.guestCount,
      radiusKm: formPrefs.maxDistanceKm,
      priceBands: formPrefs.budgetMin && formPrefs.budgetMax
        ? inferPriceBands(formPrefs.budgetMin, formPrefs.budgetMax)
        : undefined,
      requiredTags: formPrefs.indoorOutdoor && formPrefs.indoorOutdoor !== 'either'
        ? [formPrefs.indoorOutdoor]
        : formPrefs.themeKeywords,
    };

    setCurrentPreferences(newPreferences);
    setShowIntake(false);

    // Find matches
    const matches = findVendorMatches(listings, newPreferences, wedding, savedItems);
    const explanation = generateExplanation(matches, newPreferences, wedding);

    // Add user message
    const userMessage: ChatbotMessage = {
      role: 'user',
      content: `Help me find ${formPrefs.type}s${formPrefs.guestCount ? ` for ${formPrefs.guestCount} guests` : ''}${formPrefs.budgetMin && formPrefs.budgetMax ? ` with budget R${formPrefs.budgetMin.toLocaleString()} - R${formPrefs.budgetMax.toLocaleString()}` : ''}`,
      timestamp: new Date().toISOString(),
    };

    // Add assistant response
    const assistantMessage: ChatbotMessage = {
      role: 'assistant',
      content: explanation,
      explanation: matches.length > 0 ? `Found ${matches.length} matches based on your criteria.` : undefined,
      listings: matches.slice(0, 5).map((m) => m.listing),
      matchResults: matches.map((m) => ({
        listing_id: m.listing.id,
        score: m.score,
        breakdown: m.breakdown || { distance: 0, price: 0, tags: 0, capacity: 0, priority: 0 },
        distance_km: m.distance || null,
      })),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsProcessing(false);
  };

  function inferPriceBands(min: number, max: number): PriceBand[] {
    const avg = (min + max) / 2;
    if (avg < 50000) return ['low'];
    if (avg < 150000) return ['low', 'mid'];
    if (avg < 300000) return ['mid', 'high'];
    return ['high'];
  }

  const handleSendMessage = async (message: string) => {
    if (!currentPreferences) {
      // If no preferences set, treat as new search
      setShowIntake(true);
      return;
    }

    setIsProcessing(true);

    // Add user message
    const userMessage: ChatbotMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Parse refinement
    const updates = parseRefinement(message, currentPreferences, wedding);
    const updatedPreferences = { ...currentPreferences, ...updates };
    setCurrentPreferences(updatedPreferences);

    // Re-run search
    const matches = findVendorMatches(listings, updatedPreferences, wedding, savedItems);
    const explanation = generateExplanation(matches, updatedPreferences, wedding);

    const assistantMessage: ChatbotMessage = {
      role: 'assistant',
      content: explanation,
      explanation: matches.length > 0 ? `Updated search results based on your request.` : undefined,
      listings: matches.slice(0, 5).map((m) => m.listing),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsProcessing(false);
  };

  const handleSaveListing = async (listing: Listing) => {
    await addSavedItem(listing);
  };

  const handleNewSearch = () => {
    setShowIntake(true);
    setCurrentPreferences(null);
  };

  if (!wedding || !wedding.location) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: theme.spacing.xl,
        }}
      >
        <p>Please complete onboarding first to use the chatbot.</p>
      </div>
    );
  }


  return (
    <div
      data-chatbot-container
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
          }}
        >
          Vendor Assistant
        </h1>
        {!showIntake && (
          <Button variant="outline" size="sm" onClick={handleNewSearch}>
            New Search
          </Button>
        )}
      </div>

      {showIntake ? (
        <div style={{ flexShrink: 0 }} key="intake">
          <VendorIntakeForm
            key="vendor-intake"
            onSubmit={handleIntakeSubmit}
            onCancel={undefined}
            wedding={wedding}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            overflow: 'hidden',
            backgroundColor: theme.colors.surface,
            minHeight: 0,
          }}
        >
          <ChatbotInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onSaveListing={handleSaveListing}
            disabled={isProcessing}
          />
        </div>
      )}
    </div>
  );
};
