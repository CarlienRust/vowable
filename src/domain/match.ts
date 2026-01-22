import { haversineDistance } from './geo';
import { Listing, WeddingPlan, ListingType, PriceBand } from './types';

export type Category = 'venue' | 'caterer' | 'florist' | 'boutique' | 'accommodation' | 'any';

export type MatchConfig = {
  defaultRadiusKm: number;
  allowUnknownCapacity: boolean;
  priceAdjacency: Record<PriceBand, PriceBand[]>;
  weights: Record<Exclude<Category, 'any'>, Record<string, number>>;
};

export const DEFAULT_CONFIG: MatchConfig = {
  defaultRadiusKm: 50,
  allowUnknownCapacity: true,
  priceAdjacency: {
    low: ['mid'],
    mid: ['low', 'high'],
    high: ['mid'],
  },
  weights: {
    venue: { distance: 0.3, price: 0.25, capacity: 0.25, tags: 0.15, priority: 0.05 },
    caterer: { distance: 0.25, price: 0.3, capacity: 0.0, tags: 0.35, priority: 0.1 },
    florist: { distance: 0.25, price: 0.3, capacity: 0.0, tags: 0.35, priority: 0.1 },
    boutique: { distance: 0.25, price: 0.3, capacity: 0.0, tags: 0.35, priority: 0.1 },
    accommodation: { distance: 0.35, price: 0.25, capacity: 0.2, tags: 0.1, priority: 0.1 },
  },
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function priceFitScore(userBands: PriceBand[], listingBand: PriceBand, cfg: MatchConfig): number {
  if (userBands.includes(listingBand)) return 1.0;
  // adjacent match
  for (const b of userBands) {
    if (cfg.priceAdjacency[b]?.includes(listingBand)) return 0.6;
  }
  return 0.0;
}

function tagOverlapScore(userTags: string[], listingTags: string[]): number {
  const u = new Set(userTags.map((t) => t.toLowerCase().trim()).filter(Boolean));
  const l = new Set((listingTags ?? []).map((t) => t.toLowerCase().trim()).filter(Boolean));
  let overlap = 0;
  u.forEach((t) => {
    if (l.has(t)) overlap += 1;
  });
  const denom = Math.max(3, u.size || 0);
  return denom === 0 ? 0.3 : clamp01(overlap / denom);
}

function capacityScore(guests: number | null, listing: Listing, cfg: MatchConfig): number {
  if (!guests) return 0.7; // neutral when unknown guest count
  const min = listing.capacity_min ?? null;
  const max = listing.capacity_max ?? null;

  if (min == null && max == null) return cfg.allowUnknownCapacity ? 0.5 : 0.0;
  if (min != null && guests < min) return 0.0;
  if (max != null && guests > max) return 0.0;
  return 1.0;
}

function distanceScoreKm(d: number, radius: number): number {
  if (d > radius) return 0.0;
  return clamp01(1 - d / radius);
}

function priorityBoost(plan: WeddingPlan, listingType: ListingType): number {
  const p = new Set((plan.priorities ?? []).map((x) => x.toLowerCase()));
  return p.has(listingType.toLowerCase()) ? 1.0 : 0.0;
}

export type MatchResult = {
  listing_id: string;
  score: number; // 0..100
  breakdown: { distance: number; price: number; tags: number; capacity: number; priority: number };
  distance_km: number | null;
};

export function scoreListing(
  plan: WeddingPlan,
  listing: Listing,
  targetCategory: Category,
  requiredTags: string[],
  excludedTags: string[],
  userPriceBands: PriceBand[],
  guestsEstimate: number | null,
  cfg: MatchConfig = DEFAULT_CONFIG
): { ok: boolean; result?: MatchResult; reason?: string } {
  // category filter
  if (targetCategory !== 'any' && listing.type !== targetCategory) {
    return { ok: false, reason: 'category_mismatch' };
  }

  // excluded tags filter
  const lt = (listing.tags ?? []).map((t) => t.toLowerCase());
  for (const ex of excludedTags.map((t) => t.toLowerCase())) {
    if (lt.includes(ex)) return { ok: false, reason: 'excluded_tag' };
  }

  // required tags (soft: you can choose hard, but keep soft for discovery)
  // We'll keep soft via tag score; do not filter here.

  const radius = plan.radiusKm ?? cfg.defaultRadiusKm;

  // distance calc
  let d: number | null = null;
  if (plan.locationLat != null && plan.locationLng != null && listing.lat != null && listing.lng != null) {
    d = haversineDistance(plan.locationLat, plan.locationLng, listing.lat, listing.lng);
    if (d > radius) return { ok: false, reason: 'outside_radius' };
  }

  const wKey = (targetCategory === 'any' ? listing.type : targetCategory) as Exclude<Category, 'any'>;
  const weights = cfg.weights[wKey];

  const distS = d == null ? 0.3 : distanceScoreKm(d, radius);
  const priceS = priceFitScore(userPriceBands, listing.price_band, cfg);
  const tagS = tagOverlapScore([...(plan.themeTags ?? []), ...(requiredTags ?? [])], listing.tags ?? []);
  const capS =
    listing.type === 'venue' || listing.type === 'accommodation'
      ? capacityScore(guestsEstimate, listing, cfg)
      : 0.7;

  const prioS = priorityBoost(plan, listing.type);

  let raw =
    (weights.distance ?? 0) * distS +
    (weights.price ?? 0) * priceS +
    (weights.tags ?? 0) * tagS +
    (weights.capacity ?? 0) * capS +
    (weights.priority ?? 0) * prioS;

  // penalty for missing geo
  let penalty = 0;
  if (d == null) penalty -= 0.1; // -10 points

  raw = clamp01(raw + penalty);
  const score = Math.round(raw * 100);

  return {
    ok: true,
    result: {
      listing_id: listing.id,
      score,
      breakdown: { distance: distS, price: priceS, tags: tagS, capacity: capS, priority: prioS },
      distance_km: d,
    },
  };
}
