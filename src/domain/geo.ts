/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter listings by distance from a center point
 */
export function filterByRadius(
  listings: Array<{ lat: number; lng: number }>,
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Array<{ listing: { lat: number; lng: number }; distance: number }> {
  return listings
    .map((listing) => ({
      listing,
      distance: haversineDistance(centerLat, centerLng, listing.lat, listing.lng),
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
