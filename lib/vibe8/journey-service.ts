/**
 * VIBE8 LIVING JOURNEY SERVICE
 * Manages Travel Planet OS Living Journeys: dynamic itineraries that adapt to weather, crowds, and traveler intent in real-time.
 */

import { VIBE8_LIVING_JOURNEYS } from './registries';

export interface JourneyCreationPayload {
  title: string;
  slug: string;
  destination: string;
  durationDays: number;
  theme: string;
  basePrice: number;
  currency?: string;
  days: {
    dayNumber: number;
    title: string;
    description: string;
    location: string;
    highlights: string[];
    accommodations?: string;
  }[];
}

export interface AdaptationEvent {
  eventType: 'HEAVY_RAIN' | 'EXTREME_HEAT' | 'FLIGHT_DELAY' | 'TEMPLE_FESTIVAL_CROWD' | 'VIP_EVENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedDay: number;
  triggerDescription: string;
}

export interface AdaptationResult {
  journeyId: string;
  event: AdaptationEvent;
  adapted: boolean;
  previousActivity: string;
  newActivity: string;
  conciergeNotification: string;
  travellerMessage: {
    en: string;
    ml: string;
    hi: string;
  };
}

export class VIBE8JourneyService {
  private static journeys: any[] = [...VIBE8_LIVING_JOURNEYS];

  /**
   * List all Living Journeys
   */
  static listJourneys(): any[] {
    return this.journeys;
  }

  /**
   * Get Journey by Slug or ID
   */
  static getJourneyBySlug(slug: string): any | undefined {
    return this.journeys.find(j => j.slug === slug || j.id === slug);
  }

  /**
   * Create or Save a new Living Journey
   */
  static createJourney(payload: JourneyCreationPayload): any {
    const newJourney: any = {
      id: `journey-${Date.now()}`,
      slug: payload.slug,
      title: payload.title,
      summary: `Tailored ${payload.durationDays}-day living journey exploring ${payload.destination}.`,
      destination: payload.destination,
      durationDays: payload.durationDays,
      theme: payload.theme,
      heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80',
      pricing: {
        basePrice: payload.basePrice,
        currency: payload.currency || 'INR',
        discountPercentage: 0,
        tier: 'STANDARD'
      },
      itinerary: payload.days.map(d => ({
        dayNumber: d.dayNumber,
        title: d.title,
        description: d.description,
        location: d.location,
        highlights: d.highlights,
        mealPlan: ['Breakfast'],
        accommodations: d.accommodations || 'Boutique Hotel / Luxury Homestay',
        dynamicTriggers: [
          {
            condition: 'weather === "heavy_rain"',
            action: 'reroute_indoor_cultural_session',
            fallbackPlan: 'Indoor spice workshop and live Kathakali or heritage recital'
          }
        ]
      })),
      realtimeVariables: {
        weatherConditions: {
          currentTempC: 28,
          condition: 'Partly Cloudy',
          rainProbabilityPercent: 20
        },
        crowdIndex: 'LOW',
        currentSeason: 'MONSOON_WINTER_PEAK'
      },
      socialProof: {
        rating: 5.0,
        totalBookings: 1,
        verifiedReviewsCount: 1,
        featuredReview: 'Newly crafted experience curated for authentic immersion.'
      },
      seo: {
        metaTitle: `${payload.title} | Travel Planet OS Living Journey`,
        metaDescription: `Discover ${payload.destination} with dynamic living itineraries, personalized local concierges, and real-time adaptation.`,
        focusKeyword: `${payload.destination} living journey`,
        secondaryKeywords: [payload.theme.toLowerCase(), `${payload.destination} itinerary`, 'curated travel india']
      }
    };

    this.journeys.unshift(newJourney);
    return newJourney;
  }

  /**
   * Living Adaptation Engine: Simulates or reacts to weather/crowd triggers
   * Adapts the journey day and generates multilingual concierge alerts
   */
  static triggerLivingAdaptation(journeyId: string, event: AdaptationEvent): AdaptationResult {
    const journey = this.journeys.find(j => j.id === journeyId || j.slug === journeyId);
    if (!journey) {
      throw new Error(`Journey ${journeyId} not found`);
    }

    const day = journey.itinerary.find(d => d.dayNumber === event.affectedDay) || journey.itinerary[0];
    const prevActivity = day.highlights[0] || 'Scheduled outdoor activity';
    let newActivity = '';
    let notificationEn = '';
    let notificationMl = '';
    let notificationHi = '';

    switch (event.eventType) {
      case 'HEAVY_RAIN':
        newActivity = 'Private Heritage Kathakali performance & Indoor Spice Culinary Session';
        notificationEn = `Weather alert for Day ${day.dayNumber}: Monsoon showers detected. We have seamlessly switched outdoor visits to an exclusive indoor Kathakali & culinary experience.`;
        notificationMl = `ദിനം ${day.dayNumber} കാലാവസ്ഥാ മുന്നറിയിപ്പ്: കനത്ത മഴ കാരണം പുറത്തെ യാത്രയ്ക്ക് പകരം ഇൻഡോർ കഥകളി അനുഭവവും സുഗന്ധവ്യഞ്ജന പാചക സെഷനും സജ്ജമാക്കിയിരിക്കുന്നു.`;
        notificationHi = `दिन ${day.dayNumber} मौसम सूचना: भारी बारिश के कारण बाहरी भ्रमण को एक निजी कथकली प्रदर्शन और पारंपरिक भोजन सत्र में स्थानांतरित कर दिया गया है।`;
        break;
      case 'TEMPLE_FESTIVAL_CROWD':
        newActivity = 'VIP Fast-track Sanctuary Entrance with Resident Historian';
        notificationEn = `Crowd surge at temple festival: Your concierge arranged VIP fast-track sanctuary access and private historian escort.`;
        notificationMl = `ക്ഷേത്രോത്സവ തിരക്ക്: വിഐപി ദർശന സൗകര്യവും ചരിത്രകാരന്റെ സഹായവും നിങ്ങൾക്ക് മുൻകൂട്ടി ഒരുക്കിയിട്ടുണ്ട്.`;
        notificationHi = `मंदिर उत्सव में भीड़: आपके लिए वीआईपी प्रवेश और विशेषज्ञ इतिहासकार की सुविधा व्यवस्थित कर दी गई है।`;
        break;
      case 'FLIGHT_DELAY':
        newActivity = 'Extended late checkout with complimentary Ayurvedic foot massage';
        notificationEn = `Inbound flight delay: Hotel check-out extended to 4:00 PM with complimentary spa treatment.`;
        notificationMl = `വിമാന കാലതാമസം: ചെക്ക്-ഔട്ട് സമയം വൈകുന്നേരം 4 മണി വരെ നീട്ടി, ആയുർവേദ സ്പാ ലഭ്യമാക്കിയിരിക്കുന്നു.`;
        notificationHi = `उड़ान में देरी: होटल चेक-आउट शाम 4 बजे तक बढ़ा दिया गया है तथा मानार्थ स्पा सेवा उपलब्ध है।`;
        break;
      default:
        newActivity = 'Customized private lounge relaxation & scenic river tea session';
        notificationEn = `Contextual adaptation triggered: ${event.triggerDescription}`;
        notificationMl = `സാഹചര്യത്തിനനുസരിച്ചുള്ള അപ്‌ഡേറ്റ്: ${event.triggerDescription}`;
        notificationHi = `अनुकूलित अपडेट: ${event.triggerDescription}`;
    }

    // Update the journey itinerary state dynamically
    day.highlights = [newActivity, ...day.highlights.slice(1)];
    day.description = `[ADAPTED LIVE]: ${newActivity}. ${day.description}`;

    return {
      journeyId: journey.id,
      event,
      adapted: true,
      previousActivity: prevActivity,
      newActivity,
      conciergeNotification: `Travel Planet Concierge dispatched update to traveler mobile device & local guide.`,
      travellerMessage: {
        en: notificationEn,
        ml: notificationMl,
        hi: notificationHi
      }
    };
  }
}
