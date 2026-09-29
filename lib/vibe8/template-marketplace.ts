/**
 * VIBE8 TEMPLATE MARKETPLACE & REUSABLE SECTION LIBRARY
 * Turnkey templates for Travel Agencies, Tour Operators, Destination Portals, and White-Label Sites.
 */

export interface MarketplaceTemplate {
  id: string;
  name: string;
  targetArchetype: 'TRAVEL_AGENCY' | 'TOUR_OPERATOR' | 'DESTINATION_PORTAL' | 'CORPORATE_PORTAL';
  themeId: string;
  previewImageUrl: string;
  includedSections: string[];
  conversionOptimized: boolean;
  downloadsCount: number;
  rating: number;
}

export class VIBE8TemplateMarketplace {
  private static templates: MarketplaceTemplate[] = [
    {
      id: 'tmpl-luxury-agency-01',
      name: 'Monarch & Mist — Ultra Luxury Travel Agency',
      targetArchetype: 'TRAVEL_AGENCY',
      themeId: 'LUXURY_TRAVEL',
      previewImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      includedSections: ['HeroVideo', 'LivingJourneyCarousels', 'PrivateConciergeBadge', 'VIPTestimonials', 'BookingWidget'],
      conversionOptimized: true,
      downloadsCount: 1420,
      rating: 4.96
    },
    {
      id: 'tmpl-ayurveda-retreat-02',
      name: 'Prakriti — Authentic Wellness & Ayurveda Portal',
      targetArchetype: 'DESTINATION_PORTAL',
      themeId: 'AYURVEDA_TOURISM',
      previewImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      includedSections: ['DoshaQuizWidget', 'PlantationStays', 'DoctorConsultationForm', 'HerbalDiningTimeline'],
      conversionOptimized: true,
      downloadsCount: 890,
      rating: 4.92
    },
    {
      id: 'tmpl-adventure-safari-03',
      name: 'WildTrail — Expeditions & Wildlife Treks',
      targetArchetype: 'TOUR_OPERATOR',
      themeId: 'ADVENTURE',
      previewImageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      includedSections: ['TrailDifficultyIndicator', 'WeatherSensorMap', 'GearChecklist', 'InstantQuoteStickyBar'],
      conversionOptimized: true,
      downloadsCount: 1150,
      rating: 4.88
    }
  ];

  static listTemplates(): MarketplaceTemplate[] {
    return this.templates;
  }
}
