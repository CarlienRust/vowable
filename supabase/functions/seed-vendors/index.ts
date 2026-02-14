// Supabase Edge Function: seed-vendors
// Seeds Western Cape vendor listings from Google Places into `listings` (published).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ListingType = 'venue' | 'caterer' | 'florist' | 'boutique' | 'accommodation';

interface SeedRequest {
  dryRun?: boolean;
  types?: ListingType[];
  center?: { lat: number; lng: number };
  radiusMeters?: number;
}

const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 }; // Cape Town
const DEFAULT_RADIUS_METERS = 200_000;
const DEFAULT_TYPES: ListingType[] = ['venue', 'caterer', 'florist', 'boutique', 'accommodation'];

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getKeywordsForType(type: ListingType): string[] {
  switch (type) {
    case 'venue':
      return ['wedding venue', 'venue'];
    case 'caterer':
      return ['wedding caterer', 'caterer'];
    case 'florist':
      return ['wedding florist', 'florist'];
    case 'boutique':
      return ['bridal boutique', 'wedding dress'];
    case 'accommodation':
      return ['wedding accommodation', 'guest house'];
  }
}

interface PlacesResult {
  place_id: string;
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
  types?: string[];
}

async function fetchNearby(
  apiKey: string,
  params: { lat: number; lng: number; radius: number; keyword: string; pagetoken?: string }
): Promise<{ results: PlacesResult[]; next_page_token?: string }> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('location', `${params.lat},${params.lng}`);
  url.searchParams.set('radius', String(params.radius));
  url.searchParams.set('keyword', params.keyword);
  if (params.pagetoken) url.searchParams.set('pagetoken', params.pagetoken);

  const res = await fetch(url.toString());
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Places HTTP ${res.status}`);
  }
  if (body.status && body.status !== 'OK' && body.status !== 'ZERO_RESULTS') {
    throw new Error(`Places status ${body.status}: ${body.error_message ?? 'unknown error'}`);
  }
  return { results: body.results ?? [], next_page_token: body.next_page_token };
}

Deno.serve(async (req) => {
  try {
    const adminKey = Deno.env.get('SEED_VENDORS_ADMIN_KEY') ?? '';
    if (adminKey) {
      const provided = req.headers.get('x-seed-admin-key') ?? '';
      if (provided !== adminKey) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const placesKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!placesKey) return json({ error: 'Missing GOOGLE_PLACES_API_KEY' }, { status: 500 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRole) {
      return json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const input: SeedRequest = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const dryRun = !!input.dryRun;
    const center = input.center ?? DEFAULT_CENTER;
    const radiusMeters = input.radiusMeters ?? DEFAULT_RADIUS_METERS;
    const types = (input.types?.length ? input.types : DEFAULT_TYPES).filter(Boolean);

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    const discovered: Array<{
      source: 'google_places';
      source_id: string;
      type: ListingType;
      name: string;
      location_name: string;
      lat: number | null;
      lng: number | null;
      contact_url: string;
      tags: string[];
    }> = [];

    for (const type of types) {
      const keywords = getKeywordsForType(type);
      for (const keyword of keywords) {
        let pagetoken: string | undefined;
        let page = 0;
        do {
          // next_page_token needs a short delay to become valid
          if (pagetoken) await sleep(2000);
          const { results, next_page_token } = await fetchNearby(placesKey, {
            lat: center.lat,
            lng: center.lng,
            radius: radiusMeters,
            keyword,
            pagetoken,
          });
          for (const r of results) {
            if (!r.place_id || !r.name) continue;
            const lat = r.geometry?.location?.lat ?? null;
            const lng = r.geometry?.location?.lng ?? null;
            const location_name = r.vicinity ?? r.formatted_address ?? 'Western Cape';
            discovered.push({
              source: 'google_places',
              source_id: r.place_id,
              type,
              name: r.name,
              location_name,
              lat: lat == null ? null : Number(lat),
              lng: lng == null ? null : Number(lng),
              contact_url: `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
              tags: Array.isArray(r.types) ? r.types.slice(0, 6) : [],
            });
          }
          pagetoken = next_page_token;
          page += 1;
        } while (pagetoken && page < 3);
      }
    }

    // Deduplicate by source_id
    const byId = new Map<string, (typeof discovered)[number]>();
    for (const row of discovered) {
      byId.set(row.source_id, row);
    }
    const rows = Array.from(byId.values());

    if (dryRun) {
      return json({
        dryRun: true,
        center,
        radiusMeters,
        requestedTypes: types,
        discoveredCount: discovered.length,
        dedupedCount: rows.length,
      });
    }

    const upsertRows = rows.map((r) => ({
      source: r.source,
      source_id: r.source_id,
      type: r.type,
      name: r.name,
      description: null,
      location_name: r.location_name,
      lat: r.lat,
      lng: r.lng,
      price_band: 'mid',
      price_type: null,
      price_min: null,
      price_max: null,
      pricing_notes: null,
      last_verified_at: new Date().toISOString().slice(0, 10),
      currency: 'ZAR',
      tags: r.tags,
      capacity_min: null,
      capacity_max: null,
      contact_url: r.contact_url,
      phone: null,
      email: null,
      status: 'published',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('listings')
      .upsert(upsertRows, { onConflict: 'source,source_id' });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({
      ok: true,
      center,
      radiusMeters,
      requestedTypes: types,
      upserted: upsertRows.length,
    });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
});

