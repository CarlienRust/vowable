// Supabase Edge Function: seed-vendors
// Seeds Western Cape vendor listings from OpenStreetMap (Overpass API) into `listings` (published).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ListingType = 'venue' | 'caterer' | 'florist' | 'boutique' | 'accommodation';

interface SeedRequest {
  dryRun?: boolean;
  types?: ListingType[];
}

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

function getOverpassFiltersForType(type: ListingType): string[] {
  switch (type) {
    case 'venue':
      return ['["amenity"="events_venue"]'];
    case 'caterer':
      return ['["craft"="caterer"]'];
    case 'florist':
      return ['["shop"="florist"]'];
    case 'boutique':
      return ['["shop"="bridal"]'];
    case 'accommodation':
      return ['["tourism"~"^(hotel|guest_house|hostel|apartment|chalet|resort|motel|camp_site)$"]'];
  }
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function osmElementUrl(el: OverpassElement): string {
  return `https://www.openstreetmap.org/${el.type}/${el.id}`;
}

function pickContactUrl(tags: Record<string, string> | undefined, fallback: string): string {
  if (!tags) return fallback;
  return tags['contact:website'] || tags['website'] || tags['url'] || fallback;
}

function pickLocationName(tags: Record<string, string> | undefined): string {
  if (!tags) return 'Western Cape';
  return (
    tags['addr:suburb'] ||
    tags['addr:city'] ||
    tags['addr:town'] ||
    tags['addr:village'] ||
    tags['addr:county'] ||
    tags['addr:state'] ||
    'Western Cape'
  );
}

async function fetchOverpass(overpassUrl: string, query: string): Promise<OverpassElement[]> {
  const res = await fetch(overpassUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      accept: 'application/json',
      // Some public Overpass instances throttle/deny generic agents; a clear UA helps.
      'user-agent': 'vowable-seed-vendors/1.0',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  // Overpass may return XML/HTML on overload/timeouts even when requesting JSON.
  // Always read as text first so we can surface a helpful error message.
  const contentType = res.headers.get('content-type') ?? '';
  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `Overpass HTTP ${res.status} (${contentType}): ${text.slice(0, 400)}`
    );
  }

  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      `Overpass returned non-JSON (${contentType}): ${text.slice(0, 400)}`
    );
  }

  if (!body || !Array.isArray(body.elements)) return [];
  return body.elements as OverpassElement[];
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

    const overpassUrl = Deno.env.get('OVERPASS_URL') ?? 'https://overpass-api.de/api/interpreter';

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRole) {
      return json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const input: SeedRequest = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const dryRun = !!input.dryRun;
    const types = (input.types?.length ? input.types : DEFAULT_TYPES).filter(Boolean);

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    const discovered: Array<{
      source: 'osm';
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
      const filters = getOverpassFiltersForType(type);
      for (const filter of filters) {
        const query = `
[out:json][timeout:60];
area["name"="Western Cape"]["boundary"="administrative"]->.wc;
(
  nwr(area.wc)${filter};
);
out center tags;
        `.trim();

        const elements = await fetchOverpass(overpassUrl, query);
        // Gentle pause to avoid hammering public Overpass instances
        await sleep(750);

        for (const el of elements) {
          const tags = el.tags ?? {};
          const name = tags['name'];
          if (!name) continue;

          const lat =
            el.type === 'node'
              ? (el.lat ?? null)
              : (el.center?.lat ?? null);
          const lng =
            el.type === 'node'
              ? (el.lon ?? null)
              : (el.center?.lon ?? null);

          const source_id = `${el.type}/${el.id}`;
          const fallbackUrl = osmElementUrl(el);
          discovered.push({
            source: 'osm',
            source_id,
            type,
            name,
            location_name: pickLocationName(tags),
            lat: lat == null ? null : Number(lat),
            lng: lng == null ? null : Number(lng),
            contact_url: pickContactUrl(tags, fallbackUrl),
            tags: [
              ...(tags['shop'] ? [`shop=${tags['shop']}`] : []),
              ...(tags['amenity'] ? [`amenity=${tags['amenity']}`] : []),
              ...(tags['tourism'] ? [`tourism=${tags['tourism']}`] : []),
              ...(tags['craft'] ? [`craft=${tags['craft']}`] : []),
            ].slice(0, 6),
          });
        }
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
        overpassUrl,
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
      overpassUrl,
      requestedTypes: types,
      upserted: upsertRows.length,
    });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
});

