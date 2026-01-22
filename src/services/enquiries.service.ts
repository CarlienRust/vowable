import { supabase } from './supabaseClient';

export interface EnquiryRow {
  id: string;
  user_id: string;
  wedding_id: string | null;
  listing_id: string;
  status: 'draft' | 'sent' | 'replied' | 'booked' | 'not_interested';
  message: string | null;
  contact_method: 'email' | 'whatsapp' | 'website' | 'phone' | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const enquiriesService = {
  async getEnquiries(userId: string, listingId?: string): Promise<EnquiryRow[]> {
    let query = supabase
      .from('enquiries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (listingId) {
      query = query.eq('listing_id', listingId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data;
  },

  async createEnquiry(
    userId: string,
    weddingId: string | null,
    listingId: string,
    message: string,
    contactMethod: 'email' | 'whatsapp' | 'website' | 'phone',
    status: 'draft' | 'sent' = 'draft'
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        user_id: userId,
        wedding_id: weddingId,
        listing_id: listingId,
        message,
        contact_method: contactMethod,
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating enquiry:', error);
      return null;
    }

    return data.id;
  },

  async updateEnquiry(
    enquiryId: string,
    updates: Partial<Pick<EnquiryRow, 'status' | 'message' | 'contact_method' | 'sent_at'>>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', enquiryId);

    return !error;
  },

  async getEnquiryForListing(userId: string, listingId: string): Promise<EnquiryRow | null> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  },
};
