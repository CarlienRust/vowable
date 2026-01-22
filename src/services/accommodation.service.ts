/**
 * Accommodation service stub
 * This will be implemented when LekkerSlaap or other accommodation API integration is added
 */

export const accommodationService = {
  /**
   * Search accommodations (stub)
   */
  async searchAccommodations(
    location: string,
    checkIn: string,
    checkOut: string,
    guests: number
  ): Promise<any[]> {
    throw new Error('Accommodation API integration not yet implemented');
  },

  /**
   * Get accommodation details (stub)
   */
  async getAccommodationDetails(id: string): Promise<any> {
    throw new Error('Accommodation API integration not yet implemented');
  },
};
