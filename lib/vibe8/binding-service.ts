/**
 * VIBE8 DYNAMIC DATA BINDING ENGINE
 * Connects visual components to live travel domains: Living Journeys, Destinations, Tours, Hotels, Reviews.
 */

import { VIBE8_LIVING_JOURNEYS, VIBE8_DESTINATIONS, VIBE8_THEMES } from './registries';
import { JourneyLivingEntity, DestinationStudioModel } from './types';

export interface DataBindingFilter {
  destination?: string;
  theme?: string;
  minBudget?: number;
  maxBudget?: number;
  durationDays?: number;
  tags?: string[];
  minRating?: number;
  featuredOnly?: boolean;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'popular' | 'newest';
}

export interface TourCardData {
  id: string;
  title: string;
  slug: string;
  destination: string;
  duration: string;
  days: number;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  heroImage: string;
  highlights: string[];
  theme: string;
  badge?: string;
}

export interface HotelCardData {
  id: string;
  name: string;
  destination: string;
  category: '5_STAR_LUXURY' | 'HERITAGE_PALACE' | 'BOUTIQUE_RESORT' | 'WELLNESS_RETREAT' | 'ECO_LODGE';
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  amenities: string[];
  coordinates?: { lat: number; lng: number };
}

export interface ReviewCardData {
  id: string;
  author: string;
  avatarUrl: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  targetEntity: string;
  targetType: 'JOURNEY' | 'TOUR' | 'HOTEL' | 'DESTINATION';
  date: string;
  verifiedBooking: boolean;
}

// Seed Tour database for data binding
const SEED_TOURS: TourCardData[] = [
  {
    id: 'tour-kl-01',
    title: 'Wayanad Mist & Chembra Peak Trek',
    slug: 'wayanad-mist-chembra-peak',
    destination: 'Wayanad, Kerala',
    duration: '4 Days / 3 Nights',
    days: 4,
    price: 18500,
    currency: 'INR',
    rating: 4.8,
    reviewsCount: 142,
    heroImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Heart-shaped lake trek', 'Treehouse overnight stay', 'Bamboo rafting in Kuruva Island'],
    theme: 'ADVENTURE',
    badge: 'Popular Trek'
  },
  {
    id: 'tour-rj-01',
    title: 'Royal Udaipur & Lake Pichola Starlit Cruise',
    slug: 'royal-udaipur-lake-pichola',
    destination: 'Udaipur, Rajasthan',
    duration: '5 Days / 4 Nights',
    days: 5,
    price: 45000,
    currency: 'INR',
    rating: 4.95,
    reviewsCount: 320,
    heroImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Private solar boat charter', 'Heritage palace dinner', 'Sajjangarh sunset high tea'],
    theme: 'LUXURY_TRAVEL',
    badge: 'Bestseller'
  },
  {
    id: 'tour-lad-01',
    title: 'Ladakh High Passes & Pangong Tso Stargazing',
    slug: 'ladakh-high-passes-pangong',
    destination: 'Ladakh, Jammu & Kashmir',
    duration: '7 Days / 6 Nights',
    days: 7,
    price: 52000,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 210,
    heroImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Khardung La 18,380ft pass', 'Nubra Valley ATV dunes', 'Milky Way Astro-camp'],
    theme: 'ADVENTURE',
    badge: 'Bucket List'
  },
  {
    id: 'tour-kl-ayur',
    title: '7-Day Authentic Ayurvedic Rejuvenation Retreat',
    slug: '7-day-ayurvedic-rejuvenation-kerala',
    destination: 'Kovalam, Kerala',
    duration: '7 Days / 6 Nights',
    days: 7,
    price: 78000,
    currency: 'INR',
    rating: 4.96,
    reviewsCount: 98,
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Vaidya consultation & dosha pulse diagnosis', 'Daily Panchakarma therapy', 'Herbal organic coastal dining'],
    theme: 'AYURVEDA_TOURISM',
    badge: 'Certified Wellness'
  }
];

// Seed Hotel database for data binding
const SEED_HOTELS: HotelCardData[] = [
  {
    id: 'hotel-cg-01',
    name: 'Kumarakom Lake Resort',
    destination: 'Kumarakom, Kerala',
    category: '5_STAR_LUXURY',
    pricePerNight: 28000,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 840,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Private Plunge Pool', 'Ayurveda Spa', 'Lakefront Dining', 'Speedboat Transfer'],
    coordinates: { lat: 9.6175, lng: 76.4301 }
  },
  {
    id: 'hotel-taj-lake',
    name: 'Taj Lake Palace',
    destination: 'Udaipur, Rajasthan',
    category: 'HERITAGE_PALACE',
    pricePerNight: 65000,
    currency: 'INR',
    rating: 4.98,
    reviewsCount: 1450,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Island Palace on Lake', 'Butler Service', 'Royal Jiva Spa', 'Vintage Car Chauffeur'],
    coordinates: { lat: 24.5754, lng: 73.6800 }
  },
  {
    id: 'hotel-chitra-01',
    name: 'CGH Earth - Chidambara Vilas',
    destination: 'Chettinad, Tamil Nadu',
    category: 'HERITAGE_PALACE',
    pricePerNight: 16500,
    currency: 'INR',
    rating: 4.85,
    reviewsCount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    amenities: ['115-Year Mansion', 'Chettinad Culinary Masterclass', 'Burmese Teak Architecture'],
    coordinates: { lat: 10.0754, lng: 78.7800 }
  }
];

// Seed Reviews database
const SEED_REVIEWS: ReviewCardData[] = [
  {
    id: 'rev-01',
    author: 'Sunita Mehra',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    location: 'Mumbai, India',
    rating: 5,
    title: 'The Living Journey feature adapted perfectly to rain!',
    comment: 'When unexpected heavy rain hit Alleppey, the concierge automatically rerouted our afternoon to a private Kathakali performance and indoor spice tasting without any stress.',
    targetEntity: 'kerala-monsoon-soul-journey',
    targetType: 'JOURNEY',
    date: '2026-08-14',
    verifiedBooking: true
  },
  {
    id: 'rev-02',
    author: 'Vikram & Aisha Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    location: 'London, UK',
    rating: 5,
    title: 'Unbelievable attention to heritage and royal hospitality',
    comment: 'The private solar boat cruise in Lake Pichola with sunset champagne was the highlight of our 10th anniversary trip. Outstanding curation by Travel Planet OS.',
    targetEntity: 'royal-udaipur-lake-pichola',
    targetType: 'TOUR',
    date: '2026-07-22',
    verifiedBooking: true
  }
];

export class VIBE8BindingService {
  /**
   * Query Living Journeys with flexible domain filters
   */
  static queryLivingJourneys(filter: DataBindingFilter = {}): JourneyLivingEntity[] {
    let results = [...VIBE8_LIVING_JOURNEYS];

    if (filter.destination) {
      const q = filter.destination.toLowerCase();
      results = results.filter(j => 
        j.destination.toLowerCase().includes(q) || 
        j.title.toLowerCase().includes(q)
      );
    }

    if (filter.theme) {
      results = results.filter(j => j.theme === filter.theme);
    }

    if (filter.minBudget) {
      results = results.filter(j => j.pricing.basePrice >= (filter.minBudget || 0));
    }

    if (filter.maxBudget) {
      results = results.filter(j => j.pricing.basePrice <= (filter.maxBudget || Infinity));
    }

    if (filter.durationDays) {
      results = results.filter(j => j.durationDays === filter.durationDays);
    }

    if (filter.minRating) {
      results = results.filter(j => (j.socialProof.rating || 0) >= (filter.minRating || 0));
    }

    if (filter.sortBy) {
      switch (filter.sortBy) {
        case 'price_asc':
          results.sort((a, b) => a.pricing.basePrice - b.pricing.basePrice);
          break;
        case 'price_desc':
          results.sort((a, b) => b.pricing.basePrice - a.pricing.basePrice);
          break;
        case 'rating_desc':
          results.sort((a, b) => (b.socialProof.rating || 0) - (a.socialProof.rating || 0));
          break;
        case 'popular':
          results.sort((a, b) => b.socialProof.totalBookings - a.socialProof.totalBookings);
          break;
      }
    }

    if (filter.limit && filter.limit > 0) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Query Destination Studios
   */
  static queryDestinations(filter: { region?: string; country?: string; limit?: number } = {}): DestinationStudioModel[] {
    let results = [...VIBE8_DESTINATIONS];

    if (filter.region) {
      results = results.filter(d => d.region.toLowerCase().includes((filter.region || '').toLowerCase()));
    }

    if (filter.country) {
      results = results.filter(d => d.country.toLowerCase() === (filter.country || '').toLowerCase());
    }

    if (filter.limit && filter.limit > 0) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Query Tour Cards
   */
  static queryTours(filter: DataBindingFilter = {}): TourCardData[] {
    let results = [...SEED_TOURS];

    if (filter.destination) {
      results = results.filter(t => t.destination.toLowerCase().includes(filter.destination!.toLowerCase()));
    }

    if (filter.theme) {
      results = results.filter(t => t.theme === filter.theme);
    }

    if (filter.minBudget) {
      results = results.filter(t => t.price >= filter.minBudget!);
    }

    if (filter.maxBudget) {
      results = results.filter(t => t.price <= filter.maxBudget!);
    }

    if (filter.minRating) {
      results = results.filter(t => t.rating >= filter.minRating!);
    }

    if (filter.sortBy === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (filter.sortBy === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (filter.sortBy === 'rating_desc') {
      results.sort((a, b) => b.rating - a.rating);
    }

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Query Hotels
   */
  static queryHotels(filter: { destination?: string; category?: string; maxPrice?: number; limit?: number } = {}): HotelCardData[] {
    let results = [...SEED_HOTELS];

    if (filter.destination) {
      results = results.filter(h => h.destination.toLowerCase().includes(filter.destination!.toLowerCase()));
    }

    if (filter.category) {
      results = results.filter(h => h.category === filter.category);
    }

    if (filter.maxPrice) {
      results = results.filter(h => h.pricePerNight <= filter.maxPrice!);
    }

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Query Reviews / Social Proof
   */
  static queryReviews(filter: { targetEntity?: string; targetType?: string; minRating?: number; limit?: number } = {}): ReviewCardData[] {
    let results = [...SEED_REVIEWS];

    if (filter.targetEntity) {
      results = results.filter(r => r.targetEntity === filter.targetEntity);
    }

    if (filter.targetType) {
      results = results.filter(r => r.targetType === filter.targetType);
    }

    if (filter.minRating) {
      results = results.filter(r => r.rating >= filter.minRating!);
    }

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Dynamic Variable Interpolation for Visual Content Blocks
   * Example: "Discover {{destination.name}} in {{season.current}} starting at {{journey.price.formatted}}"
   */
  static interpolateTemplate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
      const parts = path.split('.');
      let current: any = context;
      for (const part of parts) {
        if (current === undefined || current === null) return match;
        current = current[part];
      }
      return current !== undefined && current !== null ? String(current) : match;
    });
  }

  /**
   * Resolve Component Data based on component type and binding source
   */
  static resolveComponentData(componentId: string, bindingSource: string, filters: Record<string, any> = {}): any {
    switch (bindingSource) {
      case 'LIVING_JOURNEYS':
        return this.queryLivingJourneys(filters);
      case 'DESTINATIONS':
        return this.queryDestinations(filters);
      case 'TOURS':
        return this.queryTours(filters);
      case 'HOTELS':
        return this.queryHotels(filters);
      case 'REVIEWS':
        return this.queryReviews(filters);
      case 'THEMES':
        return VIBE8_THEMES;
      default:
        return null;
    }
  }
}
