import { Listing, WeddingPlan, PriceBand } from './types';
import { scoreListing, MatchResult, Category } from './match';

export function rankListings(params: {
  plan: WeddingPlan;
  listings: Listing[];
  category: Category;
  requiredTags: string[];
  excludedTags: string[];
  priceBands: PriceBand[];
  guestsEstimate: number | null;
  limit?: number;
}): MatchResult[] {
  const limit = params.limit ?? 5;
  const scored: MatchResult[] = [];

  for (const l of params.listings) {
    const r = scoreListing(
      params.plan,
      l,
      params.category,
      params.requiredTags,
      params.excludedTags,
      params.priceBands,
      params.guestsEstimate
    );
    if (r.ok && r.result) scored.push(r.result);
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
