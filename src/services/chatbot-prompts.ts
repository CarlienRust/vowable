/**
 * Production-safe chatbot prompts
 * These prompts ensure the AI never hallucinates vendors and only works with provided data
 */

export const SYSTEM_PROMPT = `You are "Toit Nups Match", a wedding vendor matching assistant for the Western Cape (South Africa).

Hard rules:
- You may ONLY recommend vendors/listings that appear in the provided LISTINGS array.
- NEVER invent vendor names, pricing, locations, capacities, ratings, or features that are not in the listing data.
- If the user asks for something not represented in LISTINGS, say you cannot find it and ask a short follow-up question.
- Prefer 3–5 recommendations max. If fewer than 3 qualify, return fewer.
- Explain each recommendation with 1–2 short reasons tied to the user's constraints (budget, distance, capacity, tags).
- If the user's wedding date is missing, do not imply due dates; focus on constraints only.
Output must be valid JSON ONLY (no markdown, no extra text).`;

export const DEVELOPER_PROMPT = `You will receive:
- WEDDING_PLAN: user's preferences
- USER_MESSAGE: what the user typed
- LISTINGS: candidate vendors
- CONTEXT: optional previous chat state

Your job:
1) Determine target_category from USER_MESSAGE (venue/caterer/florist/boutique/accommodation/any).
2) Convert USER_MESSAGE into FILTER_UPDATES (price_band, tags, distance preference, capacity preference, etc).
3) Rank LISTINGS using the provided scoring policy:
   - Filter out invalid matches (hard constraints).
   - Compute score for each remaining listing (0..100).
   - Return top 3–5 with brief reasons.
4) Ask at most ONE follow-up question if constraints are too vague or result count is 0.

Return JSON in exactly this shape:
{
  "target_category": "venue|caterer|florist|boutique|accommodation|any",
  "filters_applied": {
    "radius_km": number,
    "price_bands": ["low","mid","high"],
    "capacity_needed": number|null,
    "required_tags": string[],
    "excluded_tags": string[]
  },
  "results": [
    {
      "listing_id": string,
      "match_score": number,
      "why": [string, string]
    }
  ],
  "follow_up_question": string|null
}

Notes:
- "why" must be short, factual, and derived from listing fields and WEDDING_PLAN.
- "match_score" must be consistent with the scoring formula.`;

export const FILTER_EXTRACTION_PROMPT = `You are a filter extractor for a wedding vendor matching app.

Return JSON only:
{
  "target_category": "venue|caterer|florist|boutique|accommodation|any",
  "required_tags": string[],
  "excluded_tags": string[],
  "price_bands": ["low","mid","high"],
  "capacity_preference": number|null,
  "radius_override_km": number|null
}

Rules:
- Infer target_category from the user message. If unclear, use "any".
- required_tags/excluded_tags must be short single tokens (e.g. "outdoor", "modern", "winelands", "coastal", "halaal", "vegan", "farm", "luxury").
- If user mentions budget like "cheap/affordable" => ["low"]; "mid-range" => ["mid"]; "luxury" => ["high"].
- If user mentions guest count, set capacity_preference.
- Do not mention vendors. Do not output anything except JSON.`;

/**
 * Rule-based filter extraction (MVP - no AI needed)
 * This can be replaced with AI call later
 */
export interface ExtractedFilters {
  target_category: 'venue' | 'caterer' | 'florist' | 'boutique' | 'accommodation' | 'any';
  required_tags: string[];
  excluded_tags: string[];
  price_bands: ('low' | 'mid' | 'high')[];
  capacity_preference: number | null;
  radius_override_km: number | null;
}

export function extractFiltersFromMessage(
  message: string,
  weddingPlan: any
): ExtractedFilters {
  const lower = message.toLowerCase();
  const filters: ExtractedFilters = {
    target_category: 'any',
    required_tags: [],
    excluded_tags: [],
    price_bands: [],
    capacity_preference: null,
    radius_override_km: null,
  };

  // Category detection
  if (lower.includes('venue') || lower.includes('location') || lower.includes('place')) {
    filters.target_category = 'venue';
  } else if (lower.includes('cater') || lower.includes('food') || lower.includes('menu')) {
    filters.target_category = 'caterer';
  } else if (lower.includes('flor') || lower.includes('flower') || lower.includes('decor')) {
    filters.target_category = 'florist';
  } else if (lower.includes('boutique') || lower.includes('dress') || lower.includes('attire')) {
    filters.target_category = 'boutique';
  } else if (lower.includes('accommodation') || lower.includes('hotel') || lower.includes('stay')) {
    filters.target_category = 'accommodation';
  }

  // Price band detection
  if (lower.includes('cheap') || lower.includes('affordable') || lower.includes('budget')) {
    filters.price_bands = ['low'];
  } else if (lower.includes('mid') || lower.includes('medium')) {
    filters.price_bands = ['mid'];
  } else if (lower.includes('luxury') || lower.includes('high-end') || lower.includes('premium')) {
    filters.price_bands = ['high'];
  }

  // Tag extraction
  const tagKeywords: Record<string, string> = {
    outdoor: 'outdoor',
    indoor: 'indoor',
    modern: 'modern',
    rustic: 'rustic',
    elegant: 'elegant',
    winelands: 'winelands',
    coastal: 'coastal',
    garden: 'garden',
    scenic: 'scenic',
    mountain: 'mountain',
    ocean: 'ocean',
  };

  for (const [key, tag] of Object.entries(tagKeywords)) {
    if (lower.includes(key)) {
      filters.required_tags.push(tag);
    }
  }

  // Capacity extraction
  const capacityMatch = message.match(/(\d+)\s*(?:guest|people|person)/i);
  if (capacityMatch) {
    filters.capacity_preference = parseInt(capacityMatch[1]);
  }

  return filters;
}
