/**
 * VIBE8 Core Registries (§01-§10)
 * Single Source of Truth for Experience Composition, Living Journeys, Themes, and Dynamic Data Binding.
 */

import { 
  TravelContentEntity, TravelContentType, ContentLifecycleStatus,
  JourneyLivingEntity, DestinationStudioModel, TravelThemeDefinition, 
  TravelThemeKey, VIBE8ComponentDefinition 
} from './types';

// ==========================================
// 1. THEME REGISTRY (10 Travel Themes)
// ==========================================

export const TRAVEL_THEME_REGISTRY: Record<TravelThemeKey, TravelThemeDefinition> = {
  LUXURY_TRAVEL: {
    themeKey: 'LUXURY_TRAVEL',
    name: 'Royal & Ultra-Luxury',
    description: 'Bespoke elegance with gold accents, deep midnight tones, and spacious editorial serif typography.',
    primaryColor: '#0f172a',
    accentColor: '#d97706',
    backgroundColor: '#020617',
    surfaceColor: '#1e293b',
    fontFamily: 'Playfair Display, serif',
    layoutStyle: 'HERITAGE_EDITORIAL',
    suggestedHeroType: 'PANORAMIC_SLIDER',
    conversionBlocks: ['BookingWidget', 'PrivateConciergeCTA', 'VipReviewShowcase'],
    defaultSchemaType: 'TouristDestination'
  },
  ADVENTURE: {
    themeKey: 'ADVENTURE',
    name: 'High-Altitude & Wild Exploration',
    description: 'High-contrast energetic palettes, outdoor topology textures, and vibrant terrain indicators.',
    primaryColor: '#065f46',
    accentColor: '#f97316',
    backgroundColor: '#064e3b',
    surfaceColor: '#047857',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    layoutStyle: 'BOLD_ADVENTURE',
    suggestedHeroType: 'FULLSCREEN_VIDEO',
    conversionBlocks: ['ExpeditionTimeline', 'EquipmentChecklist', 'InstantSlotLock'],
    defaultSchemaType: 'TouristAttraction'
  },
  FAMILY_TRAVEL: {
    themeKey: 'FAMILY_TRAVEL',
    name: 'Safe & Joyful Family Holidays',
    description: 'Warm, approachable layouts with safety badges, kid-friendly meal tags, and gentle pastels.',
    primaryColor: '#0284c7',
    accentColor: '#f59e0b',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    layoutStyle: 'MODERN_CLEAN',
    suggestedHeroType: 'MAGAZINE_GRID',
    conversionBlocks: ['FamilyRoomSelector', 'PacedDailySchedule', 'AllInclusiveBadge'],
    defaultSchemaType: 'TouristDestination'
  },
  BACKPACKING: {
    themeKey: 'BACKPACKING',
    name: 'Nomad & Backpacker Discovery',
    description: 'Community-centric hostel ratings, budget calculators, and local bus/train transit guides.',
    primaryColor: '#4f46e5',
    accentColor: '#10b981',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    layoutStyle: 'MODERN_CLEAN',
    suggestedHeroType: 'SPLIT_STORY',
    conversionBlocks: ['BudgetSplitter', 'SocialCircleJoin', 'HostelDormSelector'],
    defaultSchemaType: 'TouristDestination'
  },
  CORPORATE_TRAVEL: {
    themeKey: 'CORPORATE_TRAVEL',
    name: 'Enterprise MICE & Executive Bleisure',
    description: 'Sleek executive aesthetics with GST compliance widgets, high-speed WiFi tags, and airport lounge passes.',
    primaryColor: '#1e1b4b',
    accentColor: '#38bdf8',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    fontFamily: 'Inter, sans-serif',
    layoutStyle: 'MODERN_CLEAN',
    suggestedHeroType: 'SPLIT_STORY',
    conversionBlocks: ['GSTInvoiceAutoClaim', 'DirectorApprovalTracker', 'MeetingRoomLock'],
    defaultSchemaType: 'LocalBusiness'
  },
  AYURVEDA_TOURISM: {
    themeKey: 'AYURVEDA_TOURISM',
    name: 'Holistic Ayurveda & Wellness Stays',
    description: 'Earthy botanical hues, soothing calm typography, and certified physician consultation badges.',
    primaryColor: '#285e3e',
    accentColor: '#84cc16',
    backgroundColor: '#fbfbf9',
    surfaceColor: '#ffffff',
    fontFamily: 'Lora, serif',
    layoutStyle: 'MINIMAL_SERENE',
    suggestedHeroType: 'PANORAMIC_SLIDER',
    conversionBlocks: ['DoshaQuizConsultation', 'TreatmentPackageSelect', 'DoctorCredentials'],
    defaultSchemaType: 'MedicalBusiness'
  },
  RELIGIOUS_TOURISM: {
    themeKey: 'RELIGIOUS_TOURISM',
    name: 'Spiritual Yatra & Sacred Pilgrimages',
    description: 'Dignified saffron and gold highlights with darshan slot countdowns and senior citizen accessibility notes.',
    primaryColor: '#7c2d12',
    accentColor: '#eab308',
    backgroundColor: '#fffbeb',
    surfaceColor: '#ffffff',
    fontFamily: 'Noto Serif Devanagari, serif',
    layoutStyle: 'HERITAGE_EDITORIAL',
    suggestedHeroType: 'PANORAMIC_SLIDER',
    conversionBlocks: ['DarshanBookingGate', 'WheelchairAssistantRequest', 'PrasadamDetails'],
    defaultSchemaType: 'PlaceOfWorship'
  },
  WEDDING_TOURISM: {
    themeKey: 'WEDDING_TOURISM',
    name: 'Destination Weddings & Celebrations',
    description: 'Romantic champagne and rose gold styling with grand banquet capacity calculators and guestroom block locks.',
    primaryColor: '#831843',
    accentColor: '#fb7185',
    backgroundColor: '#fff1f2',
    surfaceColor: '#ffffff',
    fontFamily: 'Cinzel, serif',
    layoutStyle: 'HERITAGE_EDITORIAL',
    suggestedHeroType: 'PANORAMIC_SLIDER',
    conversionBlocks: ['RoomBlockEstimator', 'MandapDecoratorShowcase', 'CateringMenuBuilder'],
    defaultSchemaType: 'EventVenue'
  },
  WILDLIFE_TOURISM: {
    themeKey: 'WILDLIFE_TOURISM',
    name: 'Jungle Safaris & Tiger Reserves',
    description: 'Deep savannah and forest greens with safari jeep zone maps, naturalist bios, and animal sighting logs.',
    primaryColor: '#365314',
    accentColor: '#eab308',
    backgroundColor: '#14532d',
    surfaceColor: '#166534',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    layoutStyle: 'BOLD_ADVENTURE',
    suggestedHeroType: 'FULLSCREEN_VIDEO',
    conversionBlocks: ['GypsySafariZonePicker', 'ForestPermitUpload', 'NaturalistSelection'],
    defaultSchemaType: 'TouristAttraction'
  },
  CRUISE_TOURISM: {
    themeKey: 'CRUISE_TOURISM',
    name: 'Ocean Luxury Liners & Backwater Houseboats',
    description: 'Deep oceanic blues and crisp maritime whites with deck cabin selectors, shore excursion itineraries, and dining menus.',
    primaryColor: '#0c4a6e',
    accentColor: '#38bdf8',
    backgroundColor: '#082f49',
    surfaceColor: '#0369a1',
    fontFamily: 'Inter, sans-serif',
    layoutStyle: 'MODERN_CLEAN',
    suggestedHeroType: 'PANORAMIC_SLIDER',
    conversionBlocks: ['DeckCabinSelector', 'ShoreExcursionPicker', 'AllInclusiveDrinkPass'],
    defaultSchemaType: 'Product'
  }
};

// ==========================================
// 2. COMPONENT REGISTRY (16 Core Components)
// ==========================================

export const VIBE8_COMPONENT_REGISTRY: Record<string, VIBE8ComponentDefinition> = {
  Hero: {
    component_id: 'Hero',
    name: 'Travel Destination & Experience Hero',
    category: 'HERO',
    schema: { title: 'string', subtitle: 'string', backgroundMedia: 'url', ctaText: 'string', ctaRoute: 'string' },
    props: {
      title: { type: 'string', label: 'Hero Title', default: 'Discover Timeless Wonders', bindable: true },
      subtitle: { type: 'string', label: 'Tagline', default: 'Curated by Voyage8 Travel Intelligence', bindable: true },
      backgroundMedia: { type: 'image', label: 'Background Image/Video', bindable: true },
      ctaText: { type: 'string', label: 'Button Label', default: 'Explore Experiences' },
      ctaRoute: { type: 'string', label: 'Target Route', default: '#experiences' }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'FAMILY_TRAVEL', 'AYURVEDA_TOURISM', 'WILDLIFE_TOURISM', 'CRUISE_TOURISM'],
    variants: ['CINEMATIC_OVERLAY', 'SPLIT_SIDEBAR', 'MINIMAL_SEARCH'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: true },
    analytics_tracking: true,
    permissions: ['CONTENT_CREATE', 'CONTENT_EDIT'],
    version: '2.0.0'
  },
  DestinationCard: {
    component_id: 'DestinationCard',
    name: 'Intelligent Destination Card',
    category: 'DESTINATION',
    schema: { destinationId: 'string', showBestTime: 'boolean', showPriceFrom: 'boolean' },
    props: {
      destinationId: { type: 'select', label: 'Linked Destination', bindable: true },
      showBestTime: { type: 'boolean', label: 'Display Best Time Badge', default: true },
      showPriceFrom: { type: 'boolean', label: 'Display Starting Price', default: true }
    },
    data_source: 'DestinationRegistry',
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'FAMILY_TRAVEL', 'BACKPACKING', 'AYURVEDA_TOURISM'],
    variants: ['PORTRAIT_CARD', 'COMPACT_PILL', 'EXPANDED_FEATURE'],
    responsive_rules: { mobileStacked: true, desktopCols: 3 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  JourneyTimeline: {
    component_id: 'JourneyTimeline',
    name: 'Interactive Day-by-Day Journey Timeline',
    category: 'JOURNEY',
    schema: { journeyId: 'string', allowStopExpansion: 'boolean', displayCoordinates: 'boolean' },
    props: {
      journeyId: { type: 'select', label: 'Linked Living Journey', bindable: true },
      allowStopExpansion: { type: 'boolean', label: 'Collapsible Stops', default: true },
      displayCoordinates: { type: 'boolean', label: 'Map Linkable Coordinates', default: true }
    },
    data_source: 'JourneyRegistry',
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'FAMILY_TRAVEL', 'BACKPACKING', 'AYURVEDA_TOURISM', 'RELIGIOUS_TOURISM'],
    variants: ['VERTICAL_STEPPER', 'HORIZONTAL_PACED_SLIDER', 'TABBED_DAYS'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: true },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  TourCard: {
    component_id: 'TourCard',
    name: 'Dynamic Package Tour Showcase',
    category: 'COMMERCE',
    schema: { packageId: 'string', showMarkup: 'boolean', showInstantBook: 'boolean' },
    props: {
      packageId: { type: 'select', label: 'Linked Tour Package', bindable: true },
      showInstantBook: { type: 'boolean', label: 'Instant Booking CTA', default: true }
    },
    data_source: 'TourRegistry',
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'FAMILY_TRAVEL', 'WILDLIFE_TOURISM', 'CRUISE_TOURISM'],
    variants: ['GRID_CARD', 'LIST_ROW', 'FEATURED_BADGE'],
    responsive_rules: { mobileStacked: true, desktopCols: 3 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  HotelCard: {
    component_id: 'HotelCard',
    name: 'Hospitality & Luxury Resort Card',
    category: 'COMMERCE',
    schema: { hotelId: 'string', showStarRating: 'boolean', showAmenities: 'boolean' },
    props: {
      hotelId: { type: 'select', label: 'Linked Hotel Entity', bindable: true },
      showStarRating: { type: 'boolean', label: 'Star Rating', default: true }
    },
    data_source: 'HotelRegistry',
    theme_compatibility: ['LUXURY_TRAVEL', 'FAMILY_TRAVEL', 'CORPORATE_TRAVEL', 'WEDDING_TOURISM'],
    variants: ['RESORT_LUXURY', 'BOUTIQUE_COMPACT'],
    responsive_rules: { mobileStacked: true, desktopCols: 3 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  ExperienceCard: {
    component_id: 'ExperienceCard',
    name: 'Signature Curated Experience Card',
    category: 'DESTINATION',
    schema: { experienceId: 'string', badgeText: 'string' },
    props: {
      experienceId: { type: 'select', label: 'Linked Experience', bindable: true },
      badgeText: { type: 'string', label: 'Exclusivity Badge', default: 'Voyage8 Signature' }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'AYURVEDA_TOURISM'],
    variants: ['EDITORIAL_CARD', 'MINIMAL_TAG'],
    responsive_rules: { mobileStacked: true, desktopCols: 3 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  MapBlock: {
    component_id: 'MapBlock',
    name: 'Interactive Route & Destination Map',
    category: 'DESTINATION',
    schema: { destination: 'string', zoom: 'number', markers: 'json' },
    props: {
      destination: { type: 'string', label: 'Center Destination', default: 'Dubai, UAE' },
      zoom: { type: 'number', label: 'Zoom Level', default: 11 }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'BACKPACKING'],
    variants: ['FULL_BLEED', 'CARD_CONTAINED'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: false, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  WeatherWidget: {
    component_id: 'WeatherWidget',
    name: 'Live Seasonal Climate & Weather Widget',
    category: 'DESTINATION',
    schema: { destination: 'string', showForecast: 'boolean' },
    props: {
      destination: { type: 'string', label: 'Destination Name', bindable: true },
      showForecast: { type: 'boolean', label: '7-Day Forecast', default: true }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'FAMILY_TRAVEL'],
    variants: ['COMPACT_BADGE', 'EXTENDED_ACCORDION'],
    responsive_rules: { mobileStacked: true, desktopCols: 2 },
    seo_rules: { emitSchema: false, headingHierarchyRequired: false },
    analytics_tracking: false,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  BookingWidget: {
    component_id: 'BookingWidget',
    name: 'Instant Date & Pax Booking Lock Gate',
    category: 'COMMERCE',
    schema: { entityType: 'string', entityId: 'string', allowCustomPax: 'boolean' },
    props: {
      entityType: { type: 'select', label: 'Booking Target Type', default: 'TOUR_PACKAGE' },
      allowCustomPax: { type: 'boolean', label: 'Custom Pax Input', default: true }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'FAMILY_TRAVEL', 'ADVENTURE'],
    variants: ['STICKY_BOTTOM_BAR', 'INLINE_FLOATING_CARD'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  ReviewBlock: {
    component_id: 'ReviewBlock',
    name: 'Verified Traveler Reviews & CSAT',
    category: 'SOCIAL',
    schema: { targetId: 'string', minRating: 'number', limit: 'number' },
    props: {
      targetId: { type: 'string', label: 'Target Entity ID', bindable: true },
      minRating: { type: 'number', label: 'Minimum Rating (1-5)', default: 4 }
    },
    data_source: 'ReviewRegistry',
    theme_compatibility: ['LUXURY_TRAVEL', 'FAMILY_TRAVEL', 'CORPORATE_TRAVEL'],
    variants: ['CAROUSEL_TESTIMONIAL', 'MASONRY_GRID'],
    responsive_rules: { mobileStacked: true, desktopCols: 3 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  FAQBlock: {
    component_id: 'FAQBlock',
    name: 'Structured Accordion FAQ Block with JSON-LD',
    category: 'DESTINATION',
    schema: { items: 'json', autoEmitFaqSchema: 'boolean' },
    props: {
      autoEmitFaqSchema: { type: 'boolean', label: 'Emit Google FAQPage JSON-LD', default: true }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'FAMILY_TRAVEL', 'CORPORATE_TRAVEL'],
    variants: ['ACCORDION_LIST', 'TWO_COLUMN_GRID'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  Gallery: {
    component_id: 'Gallery',
    name: 'High-Res Media Showcase & Lightbox',
    category: 'HERO',
    schema: { images: 'json', aspectRatio: 'string' },
    props: {
      aspectRatio: { type: 'select', label: 'Aspect Ratio', default: '16:9' }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'WEDDING_TOURISM', 'WILDLIFE_TOURISM'],
    variants: ['MASONRY_MOSAIC', 'SLIDER_LIGHTBOX'],
    responsive_rules: { mobileStacked: true, desktopCols: 3 },
    seo_rules: { emitSchema: false, headingHierarchyRequired: false },
    analytics_tracking: false,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  VideoStory: {
    component_id: 'VideoStory',
    name: 'Immersive Video Story (9:16 or 16:9)',
    category: 'HERO',
    schema: { videoUrl: 'url', poster: 'image', autoPlay: 'boolean' },
    props: {
      videoUrl: { type: 'string', label: 'Video Stream URL', bindable: true },
      autoPlay: { type: 'boolean', label: 'Muted Autoplay', default: true }
    },
    theme_compatibility: ['ADVENTURE', 'LUXURY_TRAVEL', 'WILDLIFE_TOURISM'],
    variants: ['REEL_STORY_VERTICAL', 'CINEMATIC_HORIZONTAL'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  TravelDiary: {
    component_id: 'TravelDiary',
    name: 'Traveler Authentic Diary & Micro-Blog',
    category: 'SOCIAL',
    schema: { diaryId: 'string', showAuthorBio: 'boolean' },
    props: {
      diaryId: { type: 'select', label: 'Linked Travel Diary', bindable: true },
      showAuthorBio: { type: 'boolean', label: 'Author Avatar & Bio', default: true }
    },
    theme_compatibility: ['BACKPACKING', 'ADVENTURE', 'FAMILY_TRAVEL'],
    variants: ['STORY_CARD', 'LONGFORM_READER'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: true, headingHierarchyRequired: true },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  SocialCircle: {
    component_id: 'SocialCircle',
    name: 'Social8 Group & Community Discussion Embed',
    category: 'SOCIAL',
    schema: { circleId: 'string', showJoinButton: 'boolean' },
    props: {
      circleId: { type: 'select', label: 'Linked Social Circle', bindable: true },
      showJoinButton: { type: 'boolean', label: 'Display Join Action', default: true }
    },
    data_source: 'SocialGraph',
    theme_compatibility: ['BACKPACKING', 'ADVENTURE', 'FAMILY_TRAVEL'],
    variants: ['FEED_EMBED', 'COMMUNITY_BANNER'],
    responsive_rules: { mobileStacked: true, desktopCols: 1 },
    seo_rules: { emitSchema: false, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  },
  AIRecommendation: {
    component_id: 'AIRecommendation',
    name: 'Personalized AI Travel Matcher',
    category: 'AI_GROWTH',
    schema: { persona: 'string', destination: 'string', maxRecommendations: 'number' },
    props: {
      destination: { type: 'string', label: 'Target Destination', bindable: true },
      maxRecommendations: { type: 'number', label: 'Cards to Display', default: 3 }
    },
    theme_compatibility: ['LUXURY_TRAVEL', 'ADVENTURE', 'FAMILY_TRAVEL', 'CORPORATE_TRAVEL'],
    variants: ['AI_SMART_CARDS', 'COMPACT_SUGGESTION_ROW'],
    responsive_rules: { mobileStacked: true, desktopCols: 3 },
    seo_rules: { emitSchema: false, headingHierarchyRequired: false },
    analytics_tracking: true,
    permissions: ['CONTENT_EDIT'],
    version: '2.0.0'
  }
};

// ==========================================
// 3. LIVING JOURNEY REGISTRY (Seed Data)
// ==========================================

export const JOURNEY_REGISTRY: Record<string, any> = {
  'jrn-kerala-ayurveda-7d': {
    id: 'jrn-kerala-ayurveda-7d',
    canonicalId: 'CANON-JRN-KL001',
    slug: 'kerala-backwaters-and-ayurvedic-rejuvenation-7d',
    title: '7-Day Divine Kerala: Backwaters Houseboat & Ayurvedic Sanctuary',
    summary: 'A fully immersive 7-day Kerala experience combining private Alleppey houseboat cruises, Munnar tea hill treks, and clinical Ayurvedic rejuvenation in Marari Beach.',
    destination: 'Kerala, India',
    country: 'India',
    durationDays: 7,
    durationNights: 6,
    difficulty: 'EASY',
    pace: 'RELAXED',
    theme: 'AYURVEDA_TOURISM',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80',
    pricing: {
      basePrice: 68500,
      currency: 'INR',
      discountPercentage: 0,
      tier: 'LUXURY'
    },
    itinerary: [
      {
        dayNumber: 1,
        title: 'Fort Kochi Heritage Harbor',
        description: 'Arrival at Kochi, transfer to boutique heritage hotel, evening Kathakali dance performance and sunset walk along the iconic Chinese fishing nets.',
        location: 'Fort Kochi',
        highlights: ['Sunset Chinese fishing nets walk', 'Classical Kathakali dance invocation', 'Jew Town spice warehouse'],
        mealPlan: ['Dinner'],
        accommodations: 'Brunton Boatyard Heritage Hotel',
        dynamicTriggers: [
          { condition: 'weather === "heavy_rain"', action: 'reroute_indoor_cultural', fallbackPlan: 'Indoor Kathakali performance and spice culinary workshop' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Munnar Tea Hills & Waterfalls',
        description: 'Scenic mountain drive through Cheeyappara Falls into the bio-diverse Munnar tea valleys, guided estate walk with a certified tea master.',
        location: 'Munnar',
        highlights: ['Scenic misty tea valley ascent', 'Cheeyappara Falls', 'Tea estate guided walk'],
        mealPlan: ['Breakfast', 'Dinner'],
        accommodations: 'Windermere Estate Munnar',
        dynamicTriggers: [
          { condition: 'crowd === "HIGH"', action: 'early_estate_access', fallbackPlan: 'Private sunrise estate access before general visitors arrive' }
        ]
      },
      {
        dayNumber: 3,
        title: 'Eravikulam National Park — Nilgiri Tahr Safari',
        description: 'Private naturalist-led safari through rolling shola grasslands in search of the endangered Nilgiri Tahr.',
        location: 'Eravikulam',
        highlights: ['Private naturalist safari', 'Nilgiri Tahr sighting', 'Shola grassland trek'],
        mealPlan: ['Breakfast', 'Lunch', 'Dinner'],
        accommodations: 'Windermere Estate Munnar',
        dynamicTriggers: []
      },
      {
        dayNumber: 4,
        title: 'Periyar Tiger Sanctuary & Spice Groves',
        description: 'Guided bamboo rafting on Periyar Lake, cardamom and black pepper plantation immersion.',
        location: 'Thekkady',
        highlights: ['Bamboo raft safari on Periyar Lake', 'Cardamom plantation walk', 'Spice market with local guide'],
        mealPlan: ['Breakfast', 'Dinner'],
        accommodations: 'Spice Village Eco-Resort',
        dynamicTriggers: []
      },
      {
        dayNumber: 5,
        title: 'Alleppey Backwaters — Private Kettuvallam',
        description: 'Exclusive cruise on Punnamada Lake aboard a luxury air-conditioned bedroom kettuvallam with onboard private chef.',
        location: 'Alleppey',
        highlights: ['Private kettuvallam houseboat cruise', 'Freshly caught Karimeen Pollichathu', 'Sunset on Vembanad Lake'],
        mealPlan: ['Breakfast', 'Lunch', 'Dinner'],
        accommodations: 'Spice Coast Kettuvallam (Houseboat)',
        dynamicTriggers: [
          { condition: 'weather === "heavy_rain"', action: 'indoor_boat_experience', fallbackPlan: 'Covered deck candle-light dinner and movie about Kerala backwaters' }
        ]
      },
      {
        dayNumber: 6,
        title: 'Marari Beach Ayurvedic Sanctuary',
        description: '90-minute customized Abhyanga medicated full-body oil massage under a certified Vaidya, followed by beach yoga.',
        location: 'Marari Beach',
        highlights: ['90-minute Abhyanga Ayurvedic massage', 'Certified Vaidya consultation', 'Sunrise beach yoga session'],
        mealPlan: ['Breakfast', 'Lunch', 'Dinner'],
        accommodations: 'Marari Beach Resort',
        dynamicTriggers: []
      },
      {
        dayNumber: 7,
        title: 'Cochin Departure',
        description: 'Organic spice gifting ceremony and private chauffeur transfer to Cochin International Airport.',
        location: 'Kochi',
        highlights: ['Organic spice gifting', 'Airport chauffeur transfer'],
        mealPlan: ['Breakfast'],
        accommodations: '',
        dynamicTriggers: []
      }
    ],
    realtimeVariables: {
      weatherConditions: {
        currentTempC: 28,
        condition: 'Partly Cloudy',
        rainProbabilityPercent: 25
      },
      crowdIndex: 'MEDIUM',
      currentSeason: 'MONSOON_WINTER_PEAK'
    },
    socialProof: {
      rating: 4.9,
      totalBookings: 312,
      verifiedReviewsCount: 287,
      featuredReview: 'The houseboat experience on Day 5 was a genuine once-in-a-lifetime affair. The Ayurvedic session on Day 6 cured my chronic back pain.'
    },
    inclusions: [
      '6 Nights 5-Star Boutique & Luxury Eco-Resort Accommodations',
      'Dedicated AC Toyota Innova Crysta Chauffeur for all 7 Days',
      'Exclusive Air-Conditioned Bedroom Kettuvallam Houseboat with Chef',
      '2 Complete Ayurvedic Consultation & Panchakarma Sessions',
      'All Entry Permits, Monument Fees & Toll Taxes'
    ],
    exclusions: ['Airfare to/from Kochi', 'Personal Gratuities', 'Optional Alcoholic Beverages'],
    requiredDocuments: ['Indian National ID or Valid Passport', 'Ayurveda Health Intake Questionnaire'],
    minPax: 2,
    maxPax: 12,
    seo: {
      metaTitle: '7-Day Kerala Backwaters & Ayurveda Luxury Tour | Travel Planet',
      metaDescription: 'Experience divine Kerala with private Alleppey houseboat stays, Munnar tea hills, and authentic Ayurvedic rejuvenation. Book now with guaranteed price lock.',
      focusKeyword: 'Kerala luxury tour',
      secondaryKeywords: ['Alleppey houseboat itinerary', 'Kerala ayurveda package', 'Munnar 7 day trip'],
      canonicalUrl: 'https://travelplanet.in/journeys/kerala-backwaters-and-ayurvedic-rejuvenation-7d',
      schemaType: 'Trip'
    },
    aiScore: 98,
    status: 'PUBLISHED'
  },
  'jrn-dubai-future-5d': {
    id: 'jrn-dubai-future-5d',
    canonicalId: 'CANON-JRN-DXB002',
    slug: 'dubai-futuristic-skyline-and-desert-oasis-5d',
    title: '5D/4N Dubai Futuristic Skyline & Private Royal Desert Oasis',
    summary: 'A 5-day premium Dubai experience spanning Burj Khalifa Level 148, private yacht cruise, vintage Land Rover desert safari, and Abu Dhabi Louvre.',
    destination: 'Dubai, UAE',
    country: 'United Arab Emirates',
    durationDays: 5,
    durationNights: 4,
    difficulty: 'EASY',
    pace: 'BALANCED',
    theme: 'LUXURY_TRAVEL',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
    pricing: {
      basePrice: 115000,
      currency: 'INR',
      discountPercentage: 0,
      tier: 'ULTRA_LUXURY'
    },
    itinerary: [
      {
        dayNumber: 1,
        title: 'Downtown Dubai & Burj Khalifa At The Top SKY',
        description: 'VIP Level 148 lounge access at sunset, followed by exclusive private table at the Fountain Boardwalk.',
        location: 'Downtown Dubai',
        highlights: ['Burj Khalifa Level 148 VIP SKY Access', 'Dubai Fountain Boardwalk private dinner', 'Dubai Mall luxury shopping'],
        mealPlan: ['Dinner'],
        accommodations: 'Atlantis The Royal, Palm Jumeirah',
        dynamicTriggers: [
          { condition: 'weather === "extreme_heat"', action: 'indoor_luxury_route', fallbackPlan: 'Private sunset cocktail at Nobu restaurant overlooking the fountain' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Museum of the Future & Dubai Marina Yacht Charter',
        description: 'Morning visit to the architecturally stunning Museum of the Future, followed by private 56ft Sunseeker yacht sunset cruise.',
        location: 'Dubai Marina',
        highlights: ['Museum of the Future private tour', 'Private 56ft Sunseeker yacht charter', 'Palm Jumeirah aerial view'],
        mealPlan: ['Breakfast', 'Dinner'],
        accommodations: 'Atlantis The Royal, Palm Jumeirah',
        dynamicTriggers: []
      },
      {
        dayNumber: 3,
        title: 'Al Marmoom Desert Conservation Reserve',
        description: 'Private vintage Land Rover dune safari, professional falconry display, and star-gazing Bedouin desert dinner.',
        location: 'Al Marmoom Desert',
        highlights: ['Vintage Land Rover dune safari', 'Falconry experience', 'Star-gazing Bedouin camp dinner'],
        mealPlan: ['Breakfast', 'Lunch', 'Dinner'],
        accommodations: 'Bab Al Shams Desert Resort',
        dynamicTriggers: [
          { condition: 'weather === "sandstorm"', action: 'indoor_desert_experience', fallbackPlan: 'Indoor Bedouin heritage museum tour and private camel photography session' }
        ]
      },
      {
        dayNumber: 4,
        title: 'Abu Dhabi Louvre & Sheikh Zayed Grand Mosque',
        description: 'Full-day architectural and cultural tour of Abu Dhabi including fast-track access to the Louvre Abu Dhabi and Sheikh Zayed Grand Mosque.',
        location: 'Abu Dhabi',
        highlights: ['Louvre Abu Dhabi fast-track access', 'Sheikh Zayed Grand Mosque VIP entry', 'Corniche waterfront drive'],
        mealPlan: ['Breakfast', 'Lunch'],
        accommodations: 'Atlantis The Royal, Palm Jumeirah',
        dynamicTriggers: []
      },
      {
        dayNumber: 5,
        title: 'DXB Departure — Private Limousine Transfer',
        description: 'Farewell breakfast at Atlantis, private limousine transfer to Dubai International Airport Terminal 3.',
        location: 'Dubai International Airport',
        highlights: ['Farewell gourmet breakfast', 'Private limousine airport transfer'],
        mealPlan: ['Breakfast'],
        accommodations: '',
        dynamicTriggers: []
      }
    ],
    realtimeVariables: {
      weatherConditions: {
        currentTempC: 24,
        condition: 'Clear & Sunny',
        rainProbabilityPercent: 2
      },
      crowdIndex: 'LOW',
      currentSeason: 'PEAK_WINTER_SEASON'
    },
    socialProof: {
      rating: 5.0,
      totalBookings: 187,
      verifiedReviewsCount: 168,
      featuredReview: 'The Atlantis The Royal experience was beyond imagination. The desert camp under the stars was the most magical evening I have ever had.'
    },
    inclusions: [
      '4 Nights Atlantis The Royal & Bab Al Shams Desert Resort',
      'Private Chauffeur Lexus ES / Mercedes V-Class throughout',
      'Burj Khalifa Level 148 VIP SKY Access',
      'Private 2-Hour Yacht Charter with Refreshments',
      '30-Day UAE Tourist eVisa with Express Insurance'
    ],
    exclusions: ['International Flights', 'Discretionary Shopping'],
    requiredDocuments: ['Valid Passport with 6-Month Expiry', 'UAE Tourist eVisa'],
    minPax: 2,
    maxPax: 8,
    seo: {
      metaTitle: '5D/4N Dubai Luxury Family & Desert Safari Package | Travel Planet',
      metaDescription: 'Experience Atlantis The Royal, private yacht cruises, and vintage desert safaris in Dubai with Travel Planet luxury concierge.',
      focusKeyword: 'Dubai luxury package',
      secondaryKeywords: ['Atlantis The Royal itinerary', 'Dubai 5 day tour', 'Private desert safari UAE'],
      canonicalUrl: 'https://travelplanet.in/journeys/dubai-futuristic-skyline-and-desert-oasis-5d',
      schemaType: 'Trip'
    },
    aiScore: 96,
    status: 'PUBLISHED'
  }
};


export const DESTINATION_STUDIO_REGISTRY: Record<string, any> = {
  kerala: {
    id: 'dest-kerala',
    canonicalId: 'CANON-DEST-KL',
    name: 'Kerala',
    region: 'South India',
    stateOrRegion: 'South India',
    country: 'India',
    slug: 'kerala',
    heroHeadline: 'God\u2019s Own Country: Where Water, Mist & Wellness Unite',
    tagline: 'Lush tea plantations, tranquil backwaters, and five millennia of Ayurvedic wisdom.',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80',
    overview: {
      en: 'Flanked by the Arabian Sea to the west and the towering Western Ghats to the east, Kerala is a tropical paradise renowned for eco-tourism, cultural heritage, and world-class Ayurvedic wellness retreats.',
      ml: 'കേരളം — ദൈവത്തിന്റെ സ്വന്തം നാട്. കായലുകളും തേക്കിൻ‌തോപ്പുകളും ആയുർവേദ ചികിത്സകളും ഒത്തിണങ്ങിയ ഒരു ഉഷ്ണമേഖലാ പ്രദേശം.',
      hi: 'केरल — भगवान का अपना देश। अरब सागर और पश्चिमी घाट के बीच बसा यह राज्य आयुर्वेद, बैकवाटर और सांस्कृतिक विरासत का केन्द्र है।'
    },
    overviewRichText: 'Flanked by the Arabian Sea to the west and the towering Western Ghats to the east, Kerala is a tropical paradise renowned for eco-tourism, cultural heritage, and world-class Ayurvedic wellness retreats.',
    bestTimeToVisit: {
      peakSeason: 'September to March',
      shoulderSeason: 'April to May',
      moderateSeason: 'April to May',
      offSeason: 'June to August (Monsoon Wellness Season)',
      bestMonths: ['October', 'November', 'December', 'January', 'February'],
      monthWiseRecommendation: [
        { month: 'Jan', climate: 'Cool & Sunny', crowdLevel: 'HIGH', scoreOutOf10: 9.8 },
        { month: 'Jun', climate: 'Lush Monsoon', crowdLevel: 'MEDIUM', scoreOutOf10: 8.2 },
        { month: 'Nov', climate: 'Crisp & Festive', crowdLevel: 'HIGH', scoreOutOf10: 9.9 }
      ]
    },
    weatherClimate: {
      avgTempSummer: '28°C - 34°C',
      avgTempWinter: '22°C - 30°C',
      monsoonMonths: 'June to August (South-West) & October to November (North-East)',
      currentAdvisory: 'Pleasant tropical breeze across backwater corridors.'
    },
    keyPlaces: [
      { name: 'Alleppey (Alappuzha)', type: 'BACKWATERS', highlight: 'Vast labyrinth of canals, lagoons, and private kettuvallams.', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944' },
      { name: 'Munnar', type: 'HILL_STATION', highlight: 'High-altitude emerald tea estates and Nilgiri Tahr habitat.', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2' }
    ],
    topAttractions: [
      { name: 'Alleppey Backwater Houseboat', category: 'BACKWATERS', description: 'Cruise through 900 km of navigable inland waterways on a traditional kettuvallam.', timeNeeded: 'Full Day' },
      { name: 'Munnar Tea Estate Walk', category: 'NATURE', description: 'Guided walk through emerald-green high-altitude tea gardens with panoramic views.', timeNeeded: '3 - 4 Hours' },
      { name: 'Periyar Tiger Sanctuary Safari', category: 'WILDLIFE', description: 'Bamboo raft safari and jungle trek through one of India\'s premier tiger reserves.', timeNeeded: 'Half Day' }
    ],
    hiddenGems: [
      { name: 'Munroe Island Canoe Waterways', description: 'Narrow palm-fringed channels inaccessible to motor houseboats; pure untouched village serenity.', insiderTip: 'Visit at sunrise for silent mist over the water — arrive by 5:45 AM with a local guide.', provenanceNote: 'Verified by Voyage8 Ground Intelligence Network', exclusivityScore: 94 },
      { name: 'Muziris Archeological Heritage Trail', description: '2,000-year-old spice port linking ancient Rome, Egypt, and Phoenicia with Malabar Coast.', insiderTip: 'Book the private archaeologist-led tour; the public route misses the Roman amphora chambers.', provenanceNote: 'UNESCO Tentative List candidate site', exclusivityScore: 91 }
    ],
    localCuisines: [
      { dish: 'Karimeen Pollichathu', description: 'Pearl spot fish marinated in spices and slow-grilled inside banana leaf over open flame.', mustTryAt: 'Finishing Point Restaurant, Kumarakom' },
      { dish: 'Kerala Prawn Moilee', description: 'Delicate coconut milk prawn curry perfumed with fresh turmeric and green chilies.', mustTryAt: 'Malabar Junction, Fort Kochi' },
      { dish: 'Puttu and Kadala Curry', description: 'Steamed rice cylinders served with spiced black chickpea curry — quintessential Kerala breakfast.', mustTryAt: 'Any family-run thattu kadai (street stall) in Thrissur' }
    ],
    faqs: [
      { question: 'What is the best time for Ayurvedic treatments in Kerala?', answer: 'The monsoon season (June to September) is considered optimal by classical Ayurveda practitioners because the body\'s pores open up to herbal oils.' },
      { question: 'Is a houseboat stay safe for families and children?', answer: 'Yes, all Voyage8 partner houseboats are government-certified Gold or Green category vessels equipped with life jackets, dedicated captains, and private chefs.' }
    ],
    linkedJourneys: ['jrn-kerala-ayurveda-7d'],
    linkedHotels: [],
    seo: {
      metaTitle: 'Kerala Tourism & Complete Travel Guide 2026 | Travel Planet',
      metaDescription: 'Explore Kerala destinations, luxury backwater houseboat packages, hill station retreats, and verified wellness guides with Voyage8 intelligence.',
      focusKeyword: 'Kerala travel guide',
      secondaryKeywords: ['Kerala tourism', 'Munnar Alleppey package', 'Kerala houseboats booking'],
      schemaType: 'TouristDestination',
      canonicalUrl: 'https://travelplanet.in/destinations/kerala',
      ogImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      aeoAnswerSnippet: 'Kerala is best visited between September and March for sightseeing, or during June-August for traditional Ayurvedic rejuvenation.',
      llmCitationFacts: ['Recognized by National Geographic as one of the 50 destinations of a lifetime.', 'Has over 900 km of navigable inland backwater waterways.']
    },
    ai: {
      intent: 'INSPIRATIONAL',
      targetPersona: ['Luxury Leisure', 'Wellness Seekers', 'Couples', 'Cultural Historians'],
      tone: 'WARM_FAMILY',
      aiSummary: 'A premier green paradise destination in Southern India offering backwaters, high-elevation biodiversity, and traditional medicine.',
      aiSearchVisibilityScore: 97,
      entityConfidence: 99,
      suggestedRelatedKeywords: ['Alleppey houseboat rates', 'Munnar best resorts', 'Kerala backwaters itinerary 7 days']
    }
  },
  dubai: {
    id: 'dest-dubai',
    canonicalId: 'CANON-DEST-DXB',
    name: 'Dubai',
    region: 'Emirate of Dubai',
    stateOrRegion: 'Emirate of Dubai',
    country: 'United Arab Emirates',
    slug: 'dubai',
    heroHeadline: 'Dubai: Where Ambition Defies the Desert Horizon',
    tagline: 'Record-shattering architectural triumphs, Michelin gastronomy, and majestic desert silence.',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
    overview: {
      en: 'Dubai is a global metropolis of futuristic architecture, luxury shopping, and desert heritage. From the world\'s tallest tower to private island retreats, Dubai redefines what is possible.',
      ml: 'ദുബായ് — ഭൂലോകത്തിലെ ഏറ്റവും ഉയരമുള്ള കെട്ടിടം, ആഡംബര ഷോപ്പിംഗ്, മരുഭൂ സഫാരി എന്നിവ ഒത്തിണങ്ങിയ ഒരു ആഗോള നഗരം.',
      hi: 'दुबई — दुनिया की सबसे ऊंची इमारत, लक्जरी शॉपिंग और रेगिस्तानी सफारी का संगम — एक अद्भुत वैश्विक महानगर।'
    },
    overviewRichText: 'Dubai is a global metropolis of futuristic architecture, luxury shopping, and desert heritage.',
    bestTimeToVisit: {
      peakSeason: 'November to March',
      shoulderSeason: 'April and October',
      moderateSeason: 'April and October',
      offSeason: 'May to September (Summer Shopping & Indoor Mega-Attractions)',
      bestMonths: ['November', 'December', 'January', 'February', 'March'],
      monthWiseRecommendation: [
        { month: 'Jan', climate: 'Perfect Outdoor', crowdLevel: 'HIGH', scoreOutOf10: 9.9 },
        { month: 'Jul', climate: 'Extreme Heat', crowdLevel: 'LOW', scoreOutOf10: 6.0 },
        { month: 'Nov', climate: 'Ideal', crowdLevel: 'HIGH', scoreOutOf10: 9.8 }
      ]
    },
    weatherClimate: {
      avgTempSummer: '38°C - 45°C',
      avgTempWinter: '20°C - 28°C',
      monsoonMonths: 'Rare rainfall in January/February',
      currentAdvisory: 'Perfect winter weather for outdoor dining, yacht charters, and desert safaris.'
    },
    keyPlaces: [
      { name: 'Burj Khalifa & Downtown Dubai', type: 'URBAN_ICON', highlight: 'World\'s tallest architectural marvel and dancing fountains.', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c' },
      { name: 'Palm Jumeirah & Atlantis', type: 'ISLAND_RESORT', highlight: 'World-famous man-made palm archipelago and waterpark.', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914' }
    ],
    topAttractions: [
      { name: 'Burj Khalifa SKY Observation Deck', category: 'URBAN_ICON', description: 'Ascend to the 148th floor for a 360° panorama of the city, desert, and Arabian Gulf.', timeNeeded: '2 - 3 Hours' },
      { name: 'Desert Safari & Dune Bashing', category: 'ADVENTURE', description: 'Private 4×4 dune bashing at sunset followed by Bedouin camp dinner under the stars.', timeNeeded: 'Half Day Evening' },
      { name: 'Dubai Creek & Al Fahidi Heritage District', category: 'HERITAGE', description: 'Traditional abra boat rides through Dubai Creek and wind-tower coral architecture.', timeNeeded: '3 Hours' }
    ],
    hiddenGems: [
      { name: 'Al Qudra Love Lakes & Desert Stargazing', description: 'Twin heart-shaped desert oasis with endangered Arabian gazelles and tranquil evening dunes.', insiderTip: 'Visit on a new moon night for unobstructed Milky Way views — bring a telescope.', provenanceNote: 'Verified by Dubai Desert Conservation Reserve guides', exclusivityScore: 92 },
      { name: 'Alserkal Avenue Contemporary Arts', description: 'Dubai\'s thriving industrial-turned-arts district with over 30 international galleries.', insiderTip: 'Visit on Thursday evenings when private vernissages and artist talks are open to visitors.', provenanceNote: 'Rated top 10 emerging arts hubs by Condé Nast Traveler 2025', exclusivityScore: 85 }
    ],
    localCuisines: [
      { dish: 'Al Harees', description: 'Slow-cooked wheat and lamb porridge — a Ramadan and Eid staple of UAE heritage.', mustTryAt: 'Arabian Tea House, Al Fahidi' },
      { dish: 'Luqaimat', description: 'Crispy date syrup and sesame seed-drizzled sweet dumplings — Dubai\'s beloved street dessert.', mustTryAt: 'Old Dubai Night Souk Street Stalls' },
      { dish: 'Wagyu Omakase', description: 'Premium Japanese A5 Wagyu multi-course chef\'s menu — Dubai\'s culinary status symbol.', mustTryAt: 'Nobu Atlantis The Palm or Zuma DIFC' }
    ],
    faqs: [
      { question: 'Do Indian passport holders get Visa on Arrival in Dubai?', answer: 'Indian citizens with a valid US, UK, or EU residence visa or tourist visa can obtain a 14-day Visa on Arrival at DXB airport.' },
      { question: 'What is the dress code in public areas in Dubai?', answer: 'Dubai is cosmopolitan and welcoming. Modest clothing covering shoulders and knees is appreciated in mosques, heritage areas, and government offices.' }
    ],
    linkedJourneys: [],
    linkedHotels: [],
    seo: {
      metaTitle: 'Dubai Travel Guide 2026: Luxury Stays, Itineraries & eVisa | Travel Planet',
      metaDescription: 'Complete Dubai guide featuring Burj Khalifa SKY access, Palm Jumeirah luxury hotels, and private desert safari bookings with Voyage8 pricing.',
      focusKeyword: 'Dubai travel guide',
      secondaryKeywords: ['Dubai luxury holiday packages', 'Dubai 5 day itinerary', 'Burj Khalifa tickets online'],
      schemaType: 'TouristDestination',
      canonicalUrl: 'https://travelplanet.in/destinations/dubai',
      ogImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      aeoAnswerSnippet: 'Dubai is best visited from November through March when outdoor temperatures average between 20°C and 28°C.',
      llmCitationFacts: ['Home to Burj Khalifa, the tallest building in the world at 828 meters.', 'Operates the world\'s longest driverless automated metro network.']
    },
    ai: {
      intent: 'COMMERCIAL_INVESTIGATION',
      targetPersona: ['High Net Worth', 'Family Holidays', 'Tech Entrepreneurs', 'Shoppers'],
      tone: 'LUXURY',
      aiSummary: 'Futuristic global tourism capital delivering hyper-luxury hotels, theme parks, yachting, and desert experiences.',
      aiSearchVisibilityScore: 99,
      entityConfidence: 100,
      suggestedRelatedKeywords: ['Dubai luxury package price in INR', 'Atlantis The Royal reviews', 'Best desert safari Dubai']
    }
  }
};

// ==========================================
// EXPORT ALIASES & LISTS FOR UI / SERVICES
// ==========================================
export const DESTINATION_REGISTRY = DESTINATION_STUDIO_REGISTRY;
export const VIBE8_THEMES = Object.values(TRAVEL_THEME_REGISTRY);
export const VIBE8_COMPONENTS = Object.values(VIBE8_COMPONENT_REGISTRY);
export const VIBE8_DESTINATIONS = Object.values(DESTINATION_STUDIO_REGISTRY);
export const VIBE8_LIVING_JOURNEYS = Object.values(JOURNEY_REGISTRY);

export const VIBE8_CONTENT_TYPES = [
  { type: 'DESTINATION', displayName: 'Destinations' },
  { type: 'JOURNEY', displayName: 'Living Journeys' },
  { type: 'TOUR_PACKAGE', displayName: 'Tour Packages' },
  { type: 'EXPERIENCE', displayName: 'Experiences' },
  { type: 'HOTEL', displayName: 'Hotels & Resorts' },
  { type: 'ACTIVITY', displayName: 'Activities' },
  { type: 'TRAVEL_GUIDE', displayName: 'Travel Guides' },
  { type: 'TRAVEL_DIARY', displayName: 'Travel Diaries' },
  { type: 'BLOG_STORY', displayName: 'Blog Stories' },
  { type: 'LOCAL_EXPERT', displayName: 'Local Experts' },
  { type: 'TRAVEL_CIRCLE', displayName: 'Travel Circles' },
  { type: 'EVENT', displayName: 'Events' },
  { type: 'OFFER', displayName: 'Offers & Deals' },
  { type: 'CAMPAIGN', displayName: 'Campaigns' },
  { type: 'ITINERARY', displayName: 'Fixed Itineraries' },
  { type: 'FAQ', displayName: 'FAQs' },
  { type: 'TESTIMONIAL', displayName: 'Testimonials' },
  { type: 'VIDEO_STORY', displayName: 'Video Stories' }
];
