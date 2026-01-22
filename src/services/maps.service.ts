/**
 * Maps service stub
 * This will be implemented when map integration is added
 */

export const mapsService = {
  /**
   * Initialize map (stub)
   */
  async initializeMap(containerId: string, center: { lat: number; lng: number }): Promise<void> {
    throw new Error('Map integration not yet implemented');
  },

  /**
   * Add marker to map (stub)
   */
  async addMarker(lat: number, lng: number, title: string): Promise<void> {
    throw new Error('Map integration not yet implemented');
  },

  /**
   * Get directions (stub)
   */
  async getDirections(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<any> {
    throw new Error('Map integration not yet implemented');
  },
};
