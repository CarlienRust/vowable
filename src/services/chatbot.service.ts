import { Listing, ListingType, PriceBand, WeddingPlan, SavedItem } from '../domain/types';
import { rankListings } from '../domain/rank';
import { Category, MatchResult } from '../domain/match';
import { extractFiltersFromMessage, ExtractedFilters } from './chatbot-prompts';

export interface VendorPreferences {
  category: Category;
  requiredTags?: string[];
  excludedTags?: string[];
  priceBands?: PriceBand[];
  guestCount?: number;
  radiusKm?: number;
}

export interface ChatbotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  listings?: Listing[];
  explanation?: string;
  matchResults?: MatchResult[];
}

export interface VendorMatch {
  listing: Listing;
  score: number;
  reasons: string[];
  distance?: number;
  breakdown?: MatchResult['breakdown'];
}

/**
 * Generate "why" reasons from match breakdown
 */
function generateWhyReasons(
  listing: Listing,
  matchResult: MatchResult,
  wedding: WeddingPlan | null
): string[] {
  const reasons: string[] = [];
  const { breakdown, distance_km } = matchResult;

  // Distance reason
  if (distance_km !== null) {
    if (distance_km < 10) {
      reasons.push(`Very close (${distance_km.toFixed(1)}km away)`);
    } else if (distance_km < 30) {
      reasons.push(`Within easy reach (${distance_km.toFixed(1)}km)`);
    } else {
      reasons.push(`${distance_km.toFixed(1)}km from your location`);
    }
  }

  // Price reason
  if (breakdown.price > 0.8) {
    reasons.push(`Perfect budget fit (${listing.price_band} tier)`);
  } else if (breakdown.price > 0.5) {
    reasons.push(`Good budget match (${listing.price_band} tier)`);
  }

  // Capacity reason (for venues/accommodation)
  if ((listing.type === 'venue' || listing.type === 'accommodation') && breakdown.capacity > 0.8) {
    if (listing.capacity_min && listing.capacity_max) {
      reasons.push(`Perfect capacity (${listing.capacity_min}-${listing.capacity_max} guests)`);
    }
  }

  // Tag/theme reason
  if (breakdown.tags > 0.5) {
    const matchingTags = listing.tags.filter((tag) => {
      const weddingTags = wedding?.themeTags || [];
      return weddingTags.some((wt) => tag.toLowerCase().includes(wt.toLowerCase()));
    });
    if (matchingTags.length > 0) {
      reasons.push(`Matches your theme: ${matchingTags.slice(0, 2).join(', ')}`);
    } else if (listing.tags.length > 0) {
      reasons.push(`Great style: ${listing.tags.slice(0, 2).join(', ')}`);
    }
  }

  // Priority boost reason
  if (breakdown.priority > 0.5 && wedding?.priorities) {
    const priorityMatch = wedding.priorities.find((p) => {
      const pLower = p.toLowerCase();
      return listing.type === pLower || listing.tags.some((t) => t.toLowerCase().includes(pLower));
    });
    if (priorityMatch) {
      reasons.push(`Matches your priority: ${priorityMatch}`);
    }
  }

  // Fallback if no specific reasons
  if (reasons.length === 0) {
    reasons.push(`Good match for your criteria`);
  }

  return reasons.slice(0, 2); // Max 2 reasons
}

/**
 * Find and rank vendors based on preferences using production-safe ranking
 */
export function findVendorMatches(
  listings: Listing[],
  preferences: VendorPreferences,
  wedding: WeddingPlan | null,
  savedItems: SavedItem[]
): VendorMatch[] {
  if (!wedding) {
    return [];
  }

  // Determine price bands from preferences or wedding plan
  let priceBands: PriceBand[] = preferences.priceBands || [];
  if (priceBands.length === 0 && wedding.totalBudget) {
    // Infer from budget
    if (wedding.totalBudget < 50000) {
      priceBands = ['low'];
    } else if (wedding.totalBudget < 150000) {
      priceBands = ['low', 'mid'];
    } else if (wedding.totalBudget < 300000) {
      priceBands = ['mid', 'high'];
    } else {
      priceBands = ['high'];
    }
  }
  if (priceBands.length === 0) {
    priceBands = ['low', 'mid', 'high']; // Default: all bands
  }

  // Get guest estimate
  const guestEstimate = preferences.guestCount || getGuestEstimateFromRange(wedding.guestCountRange);

  // Rank listings
  const matchResults = rankListings({
    plan: wedding,
    listings,
    category: preferences.category,
    requiredTags: preferences.requiredTags || [],
    excludedTags: preferences.excludedTags || [],
    priceBands,
    guestsEstimate: guestEstimate,
    limit: 5,
  });

  // Convert to VendorMatch format
  const matches: VendorMatch[] = matchResults
    .map((matchResult) => {
      const listing = listings.find((l) => l.id === matchResult.listing_id);
      if (!listing) return null;

      const reasons = generateWhyReasons(listing, matchResult, wedding);

      return {
        listing,
        score: matchResult.score,
        reasons,
        distance: matchResult.distance_km || undefined,
        breakdown: matchResult.breakdown,
      };
    })
    .filter((m): m is VendorMatch => m !== null);

  return matches;
}

function getGuestEstimateFromRange(range: string | null): number | null {
  if (!range) return null;
  const ranges: Record<string, number> = {
    '0-50': 35,
    '50-100': 75,
    '100-150': 125,
    '150+': 175,
  };
  return ranges[range] || null;
}

/**
 * Generate explanation text for matches (production-safe, never hallucinates)
 */
export function generateExplanation(
  matches: VendorMatch[],
  preferences: VendorPreferences,
  wedding: WeddingPlan | null
): string {
  if (matches.length === 0) {
    return "I couldn't find any vendors matching your criteria. Try adjusting your preferences, such as expanding the search radius or budget range.";
  }

  const topMatches = matches.slice(0, 5);
  const categoryLabel = preferences.category === 'any' 
    ? 'vendors' 
    : preferences.category.charAt(0).toUpperCase() + preferences.category.slice(1) + 's';

  let explanation = `Based on your preferences, I found ${matches.length} ${categoryLabel} that match your criteria. Here are the top ${Math.min(5, topMatches.length)} recommendations:\n\n`;

  topMatches.forEach((match, index) => {
    explanation += `${index + 1}. **${match.listing.name}** (${match.listing.location_name})`;
    if (match.distance !== undefined) {
      explanation += ` - ${match.distance.toFixed(1)}km away`;
    }
    explanation += `\n   ${match.reasons.join(' • ')}\n\n`;
  });

  if (matches.length > 5) {
    explanation += `\nThere are ${matches.length - 5} more options available. You can refine your search to see more specific matches.`;
  }

  return explanation;
}

/**
 * Handle refinement requests (map natural language to filter adjustments)
 * Uses rule-based extraction (can be replaced with AI later)
 */
export function parseRefinement(
  message: string,
  currentPreferences: VendorPreferences,
  wedding: WeddingPlan | null
): Partial<VendorPreferences> {
  const extracted = extractFiltersFromMessage(message, wedding || {});
  const updates: Partial<VendorPreferences> = {};

  // Update category if specified
  if (extracted.target_category !== 'any') {
    updates.category = extracted.target_category;
  }

  // Update tags
  if (extracted.required_tags.length > 0) {
    updates.requiredTags = [
      ...(currentPreferences.requiredTags || []),
      ...extracted.required_tags,
    ];
  }
  if (extracted.excluded_tags.length > 0) {
    updates.excludedTags = [
      ...(currentPreferences.excludedTags || []),
      ...extracted.excluded_tags,
    ];
  }

  // Update price bands
  if (extracted.price_bands.length > 0) {
    updates.priceBands = extracted.price_bands;
  }

  // Update capacity
  if (extracted.capacity_preference) {
    updates.guestCount = extracted.capacity_preference;
  }

  // Update radius
  if (extracted.radius_override_km) {
    updates.radiusKm = extracted.radius_override_km;
  }

  // Additional refinement patterns
  const lower = message.toLowerCase();

  // Distance adjustments
  if (lower.includes('closer') || lower.includes('nearer')) {
    const currentRadius = currentPreferences.radiusKm || wedding?.radiusKm || 50;
    updates.radiusKm = Math.round(currentRadius * 0.7);
  }
  if (lower.includes('further') || lower.includes('wider')) {
    const currentRadius = currentPreferences.radiusKm || wedding?.radiusKm || 50;
    updates.radiusKm = Math.round(currentRadius * 1.3);
  }

  // Capacity adjustments
  if (lower.includes('smaller') || lower.includes('intimate')) {
    if (currentPreferences.guestCount) {
      updates.guestCount = Math.max(20, Math.round(currentPreferences.guestCount * 0.7));
    }
  }
  if (lower.includes('larger') || lower.includes('bigger')) {
    if (currentPreferences.guestCount) {
      updates.guestCount = Math.round(currentPreferences.guestCount * 1.3);
    }
  }

  return updates;
}
