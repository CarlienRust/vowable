export type GuestCountRange = '0-50' | '50-100' | '100-150' | '150+';

export type BudgetPreset = 'under-50k' | '50k-100k' | '100k-200k' | '200k-300k' | '300k-500k' | '500k+';

export type Priority = 'Venue' | 'Food' | 'Photography' | 'Décor' | 'Accommodation' | 'Music/Party';

export type ListingType = 'venue' | 'caterer' | 'florist' | 'boutique' | 'accommodation';

export type PriceBand = 'low' | 'mid' | 'high';

export type SavedItemStatus = 'shortlisted' | 'booked' | 'rejected';

export interface WeddingPlan {
  weddingDate: string | null; // ISO date string
  guestCountRange: GuestCountRange | null;
  totalBudget: number | null;
  budgetPreset: BudgetPreset | null;
  location: string; // town/suburb
  locationLat: number | null;
  locationLng: number | null;
  radiusKm: number; // 10-200
  themePrimary: string;
  themeSecondary: string | null;
  themeTags: string[]; // 3 keywords
  themeColors: string[]; // 3 colors
  priorities: Priority[]; // top 3
}

export interface Listing {
  id: string;
  type: ListingType;
  name: string;
  location_name: string;
  lat: number;
  lng: number;
  price_band: PriceBand;
  tags: string[];
  capacity_min?: number; // venues/accommodation only
  capacity_max?: number; // venues/accommodation only
  contact_url: string;
  description?: string;
}

export interface SavedItem {
  id: string;
  listingId: string;
  listing: Listing;
  notes: string;
  estimated_cost: number;
  status: SavedItemStatus;
  savedAt: string; // ISO date string
}

export interface ChecklistItem {
  id: string;
  task_key: string;
  title: string;
  due_date: string | null; // ISO date string
  completed: boolean;
  priority_score: number;
  notes?: string;
  reminder_enabled: boolean;
  category?: string;
  dependencies?: string[]; // task_keys this depends on
  is_optional?: boolean;
}

export interface BudgetAllocation {
  category: string;
  suggestedPercent: number;
  suggestedAmount: number;
}

export interface BudgetExpense {
  id: string;
  category: string;
  amount: number;
  description: string;
}
