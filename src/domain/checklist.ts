import { WeddingPlan, ChecklistItem, Priority } from './types';
import { addMonths, toISODateString, parseISODate } from './dates';

export interface ChecklistTemplate {
  task_key: string;
  title: string;
  offset_months: number;
  notes: string;
  base_priority: number;
  priority_boost?: Priority[]; // Tasks that get boosted if these priorities are selected
  dependencies?: string[]; // task_keys this depends on
  category: string;
  is_optional?: boolean;
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  // CORE SETUP (Foundation)
  {
    task_key: 'set_budget_guestlist',
    title: 'Confirm budget + rough guest list',
    offset_months: -12,
    notes: 'Drives venue/catering choices early; common SA planning anchor.',
    base_priority: 10,
    category: 'Core Setup',
    dependencies: [],
  },
  {
    task_key: 'choose_location_radius',
    title: 'Choose wedding location area + radius',
    offset_months: -12,
    notes: 'Narrow down to Winelands, coastal, or city area for focused search.',
    base_priority: 9,
    category: 'Core Setup',
    dependencies: ['set_budget_guestlist'],
  },
  {
    task_key: 'choose_style_theme',
    title: 'Choose wedding style/theme direction',
    offset_months: -12,
    notes: 'Rustic, elegant, modern, garden, coastal - helps guide all vendor choices.',
    base_priority: 8,
    category: 'Core Setup',
    dependencies: [],
  },
  {
    task_key: 'lock_wedding_date',
    title: 'Lock wedding date (or shortlist dates)',
    offset_months: -11,
    notes: 'Essential for booking vendors. Have 2-3 backup dates ready.',
    base_priority: 10,
    category: 'Core Setup',
    dependencies: [],
  },

  // VENUE & KEY BOOKINGS
  {
    task_key: 'book_venue',
    title: 'Book ceremony + reception venue (or combined)',
    offset_months: -11,
    notes: 'WC venues (Winelands/coastal) book out early in peak season.',
    base_priority: 10,
    category: 'Venue & Key Bookings',
    priority_boost: ['Venue'],
    dependencies: ['set_budget_guestlist', 'choose_location_radius'],
  },
  {
    task_key: 'confirm_weather_backup',
    title: 'Confirm indoor/outdoor plan + weather backup',
    offset_months: -11,
    notes: 'WC wind/rain planning matters; include indoor option or marquee plan.',
    base_priority: 9,
    category: 'Venue & Key Bookings',
    dependencies: ['book_venue'],
  },
  {
    task_key: 'book_photographer',
    title: 'Book photographer (and/or videographer)',
    offset_months: -10,
    notes: 'Top WC photographers fill fast for Sep–Mar.',
    base_priority: 8,
    category: 'Venue & Key Bookings',
    priority_boost: ['Photography'],
    dependencies: ['lock_wedding_date'],
  },
  {
    task_key: 'book_catering',
    title: 'Book caterer / confirm venue catering package',
    offset_months: -9,
    notes: 'SA weddings often venue-linked; lock menu direction early.',
    base_priority: 8,
    category: 'Venue & Key Bookings',
    priority_boost: ['Food'],
    dependencies: ['book_venue'],
  },
  {
    task_key: 'bar_beverage_plan',
    title: 'Confirm bar plan (open / limited / cash)',
    offset_months: -8,
    notes: 'Include wine/beer counts; align with venue corkage rules.',
    base_priority: 7,
    category: 'Venue & Key Bookings',
    priority_boost: ['Food'],
    dependencies: ['book_catering'],
  },
  {
    task_key: 'estimate_alcohol_quantities',
    title: 'Estimate wine / alcohol quantities',
    offset_months: -8,
    notes: 'Plan per-guest consumption; consider SA wine preferences.',
    base_priority: 6,
    category: 'Venue & Key Bookings',
    dependencies: ['bar_beverage_plan'],
  },

  // GUEST EXPERIENCE & LOGISTICS
  {
    task_key: 'decide_destination_logistics',
    title: 'Decide on destination-style logistics',
    offset_months: -8,
    notes: 'If Winelands/Garden Route, plan guest travel and accommodation needs.',
    base_priority: 6,
    category: 'Guest Experience & Logistics',
    dependencies: ['book_venue'],
  },
  {
    task_key: 'accommodation_block',
    title: 'Arrange accommodation options or group blocks',
    offset_months: -7,
    notes: 'Big for Winelands/Garden Route; link options for guests.',
    base_priority: 6,
    category: 'Guest Experience & Logistics',
    priority_boost: ['Accommodation'],
    dependencies: ['decide_destination_logistics'],
  },
  {
    task_key: 'draft_transport_plan',
    title: 'Draft transport plan (buses, shuttles, parking)',
    offset_months: -6,
    notes: 'Especially important for remote venues or if guests are staying off-site.',
    base_priority: 5,
    category: 'Guest Experience & Logistics',
    dependencies: ['accommodation_block'],
  },
  {
    task_key: 'create_wedding_website',
    title: 'Create wedding website or info pack (optional)',
    offset_months: -6,
    notes: 'Helpful for destination weddings; share travel info, RSVPs, registry.',
    base_priority: 4,
    category: 'Guest Experience & Logistics',
    is_optional: true,
    dependencies: ['lock_wedding_date'],
  },
  {
    task_key: 'send_save_the_dates',
    title: 'Send save-the-dates / early guest notice',
    offset_months: -6,
    notes: 'SA travel logistics; helps guests plan flights/drives early.',
    base_priority: 7,
    category: 'Guest Experience & Logistics',
    dependencies: ['lock_wedding_date'],
  },

  // LOOK & FEEL (DECOR / ATTIRE)
  {
    task_key: 'choose_florist',
    title: 'Choose florist',
    offset_months: -6,
    notes: 'Seasonal flowers availability in SA affects cost and look.',
    base_priority: 6,
    category: 'Look & Feel',
    priority_boost: ['Décor'],
    dependencies: ['book_venue', 'choose_style_theme'],
  },
  {
    task_key: 'confirm_decor_items',
    title: 'Confirm décor items (tables, ceremony setup, candles)',
    offset_months: -5,
    notes: 'Work with florist and venue on what\'s allowed (candles, hanging items, etc.).',
    base_priority: 5,
    category: 'Look & Feel',
    dependencies: ['choose_florist'],
  },
  {
    task_key: 'attire_order',
    title: 'Order attire (dress / suit)',
    offset_months: -6,
    notes: 'Imports/alterations can take time; boutiques book fittings.',
    base_priority: 6,
    category: 'Look & Feel',
    dependencies: ['choose_style_theme'],
  },
  {
    task_key: 'book_fittings_timeline',
    title: 'Book fittings / alterations timeline',
    offset_months: -5,
    notes: 'Schedule first fitting, second fitting, and final pickup dates.',
    base_priority: 5,
    category: 'Look & Feel',
    dependencies: ['attire_order'],
  },
  {
    task_key: 'decide_hair_makeup_approach',
    title: 'Decide hair & makeup approach',
    offset_months: -5,
    notes: 'DIY, salon, or on-site artist? Consider trial run.',
    base_priority: 5,
    category: 'Look & Feel',
    dependencies: ['choose_style_theme'],
  },
  {
    task_key: 'book_hair_makeup',
    title: 'Book hair & makeup artist',
    offset_months: -4,
    notes: 'Popular artists book early; consider trial session.',
    base_priority: 5,
    category: 'Look & Feel',
    dependencies: ['lock_wedding_date'],
  },

  // ADMIN & LEGAL
  {
    task_key: 'confirm_officiant',
    title: 'Confirm officiant / marriage officer',
    offset_months: -5,
    notes: 'Religious or civil ceremony? Book early for popular dates.',
    base_priority: 7,
    category: 'Admin & Legal',
    dependencies: [],
  },
  {
    task_key: 'check_home_affairs',
    title: 'Check Home Affairs requirements',
    offset_months: -4,
    notes: 'Understand documentation needed (ID, birth certificates, etc.).',
    base_priority: 7,
    category: 'Admin & Legal',
    dependencies: ['confirm_officiant'],
  },
  {
    task_key: 'prepare_marriage_docs',
    title: 'Prepare marriage documentation',
    offset_months: -2,
    notes: 'Gather all required documents; make copies.',
    base_priority: 8,
    category: 'Admin & Legal',
    dependencies: ['check_home_affairs'],
  },

  // FINAL DETAILS
  {
    task_key: 'send_formal_invitations',
    title: 'Send formal invitations',
    offset_months: -4,
    notes: 'Include RSVP deadline, accommodation info, and registry if applicable.',
    base_priority: 7,
    category: 'Final Details',
    dependencies: ['book_venue', 'accommodation_block'],
  },
  {
    task_key: 'confirm_menu_tastings',
    title: 'Confirm menu choices & tastings',
    offset_months: -3,
    notes: 'Schedule tasting session; finalize dietary requirements handling.',
    base_priority: 6,
    category: 'Final Details',
    dependencies: ['book_catering'],
  },
  {
    task_key: 'plan_seating_layout',
    title: 'Plan seating layout approach',
    offset_months: -2,
    notes: 'Start with rough plan; refine as RSVPs come in.',
    base_priority: 5,
    category: 'Final Details',
    dependencies: ['send_formal_invitations'],
  },
  {
    task_key: 'choose_music_plan',
    title: 'Choose music plan (DJ / playlist / band)',
    offset_months: -3,
    notes: 'Consider venue sound rules, space, and vibe.',
    base_priority: 5,
    category: 'Final Details',
    dependencies: ['book_venue'],
  },
  {
    task_key: 'book_dj_band',
    title: 'Book DJ / band (if applicable)',
    offset_months: -3,
    notes: 'Popular DJs and bands book early; confirm sound requirements.',
    base_priority: 5,
    category: 'Final Details',
    priority_boost: ['Music/Party'],
    dependencies: ['choose_music_plan'],
  },
  {
    task_key: 'confirm_decor_quantities',
    title: 'Confirm décor quantities & floor plan',
    offset_months: -2,
    notes: 'Finalize table count, centerpieces, ceremony setup based on final guest count.',
    base_priority: 5,
    category: 'Final Details',
    dependencies: ['plan_seating_layout'],
  },

  // COUNTDOWN PHASE
  {
    task_key: 'finalise_guest_list',
    title: 'Finalise guest list & RSVPs',
    offset_months: -1.5,
    notes: 'Chase late RSVPs; confirm final numbers with all vendors.',
    base_priority: 8,
    category: 'Countdown',
    dependencies: ['send_formal_invitations'],
  },
  {
    task_key: 'confirm_transport_numbers',
    title: 'Confirm transport numbers',
    offset_months: -1,
    notes: 'Finalize shuttle/bus bookings based on confirmed guest count.',
    base_priority: 6,
    category: 'Countdown',
    dependencies: ['finalise_guest_list'],
  },
  {
    task_key: 'confirm_accommodation_bookings',
    title: 'Confirm accommodation bookings',
    offset_months: -1,
    notes: 'Verify all guest accommodation is confirmed; share details.',
    base_priority: 6,
    category: 'Countdown',
    dependencies: ['finalise_guest_list'],
  },
  {
    task_key: 'create_wedding_timeline',
    title: 'Create wedding day timeline',
    offset_months: -1,
    notes: 'Detailed hour-by-hour schedule; share with all vendors and key people.',
    base_priority: 8,
    category: 'Countdown',
    dependencies: [],
  },
  {
    task_key: 'confirm_all_vendors',
    title: 'Confirm all vendors (final details)',
    offset_months: -3, // -3 weeks = -0.75 months, round to -1
    notes: 'Final check-ins: arrival times, contact numbers, special requests.',
    base_priority: 8,
    category: 'Countdown',
    dependencies: ['create_wedding_timeline'],
  },
  {
    task_key: 'prepare_payment_schedule',
    title: 'Prepare payment schedule & tips',
    offset_months: -2, // -2 weeks = -0.5 months, round to -1
    notes: 'Organize final payments, tips envelopes, and vendor thank-yous.',
    base_priority: 6,
    category: 'Countdown',
    dependencies: [],
  },

  // WEEK OF / DAY-OF
  {
    task_key: 'pack_emergency_kit',
    title: 'Pack emergency kit',
    offset_months: 0, // -3 days, round to 0
    notes: 'Safety pins, tape, scissors, painkillers, stain remover, phone charger, etc.',
    base_priority: 5,
    category: 'Week Of / Day-Of',
    dependencies: [],
  },
  {
    task_key: 'final_venue_walkthrough',
    title: 'Final venue walkthrough (if possible)',
    offset_months: 0, // -2 days, round to 0
    notes: 'Confirm setup locations, parking, access points with venue coordinator.',
    base_priority: 6,
    category: 'Week Of / Day-Of',
    dependencies: [],
    is_optional: true,
  },
  {
    task_key: 'confirm_weather_backup_activation',
    title: 'Confirm weather + backup activation',
    offset_months: 0, // -2 days, round to 0
    notes: 'Check forecast; activate indoor/marquee backup if needed.',
    base_priority: 7,
    category: 'Week Of / Day-Of',
    dependencies: ['confirm_weather_backup'],
  },
  {
    task_key: 'handoff_coordination',
    title: 'Hand off coordination to trusted person',
    offset_months: 0, // -1 day, round to 0
    notes: 'Delegate day-of coordination to wedding coordinator or trusted friend/family.',
    base_priority: 7,
    category: 'Week Of / Day-Of',
    dependencies: ['create_wedding_timeline'],
  },
];

/**
 * Generate checklist items from wedding plan
 */
export function generateChecklist(wedding: WeddingPlan): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const weddingDate = wedding.weddingDate ? parseISODate(wedding.weddingDate) : null;

  for (const template of CHECKLIST_TEMPLATES) {
    let dueDate: string | null = null;
    
    if (weddingDate) {
      const due = addMonths(weddingDate, template.offset_months);
      dueDate = toISODateString(due);
    }

    // Calculate priority score
    let priorityScore = template.base_priority;
    if (template.priority_boost) {
      const hasBoost = template.priority_boost.some((p) =>
        wedding.priorities.includes(p)
      );
      if (hasBoost) {
        priorityScore += 2;
      }
    }

    items.push({
      id: `checklist-${template.task_key}-${Date.now()}`,
      task_key: template.task_key,
      title: template.title,
      due_date: dueDate,
      completed: false,
      priority_score: priorityScore,
      notes: template.notes,
      reminder_enabled: true,
      category: template.category,
      dependencies: template.dependencies || [],
      is_optional: template.is_optional || false,
    });
  }

  // Sort: if date exists, by due_date ascending, then priority_score descending
  // If no date, by logical order (template order) then priority_score
  items.sort((a, b) => {
    if (a.due_date && b.due_date) {
      const dateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.priority_score - a.priority_score;
    }
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    return b.priority_score - a.priority_score;
  });

  return items;
}
