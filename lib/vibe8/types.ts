/**
 * VIBE8 — Travel-First CMS, Experience Operating System & Component Architecture
 * Framework: Heuris8 Cognitive OS & Voyage8 Kernel
 * 
 * Unifies WordPress flexibility + Webflow visual design power + Deep Travel Domain Intelligence.
 */

import { z } from 'zod';

// ==========================================
// 1. 18 CANONICAL TRAVEL CONTENT TYPES (§02)
// ==========================================

export const TRAVEL_CONTENT_TYPES = [
  'DESTINATION',
  'JOURNEY',
  'TOUR_PACKAGE',
  'EXPERIENCE',
  'HOTEL',
  'ACTIVITY',
  'TRAVEL_GUIDE',
  'TRAVEL_DIARY',
  'BLOG_STORY',
  'LOCAL_EXPERT',
  'TRAVEL_CIRCLE',
  'EVENT',
  'OFFER',
  'CAMPAIGN',
  'ITINERARY',
  'FAQ',
  'TESTIMONIAL',
  'VIDEO_STORY'
] as const;

export type TravelContentType = (typeof TRAVEL_CONTENT_TYPES)[number];

// ==========================================
// 2. GOVERNED WORKFLOW & PUBLISHING STATUSES
// ==========================================

export const CONTENT_LIFECYCLE_STATUSES = [
  'DRAFT',
  'AI_ASSISTED',
  'EDITOR_REVIEW',
  'SEO_CHECK',
  'APPROVAL',
  'PUBLISHED',
  'INDEXED',
  'ARCHIVED'
] as const;

export type ContentLifecycleStatus = (typeof CONTENT_LIFECYCLE_STATUSES)[number];

// ==========================================
// 3. CORE SUB-PROFILES (SEO, AI, ANALYTICS)
// ==========================================

export interface SEOProfile {
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  canonicalUrl: string;
  schemaType: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
  readabilityScore?: number;
  keywordDensity?: number;
  schemaMarkup?: Record<string, any>;
  aeoAnswerSnippet?: string;
  llmCitationFacts?: string[];
}

export interface AIContentProfile {
  intent: 'INSPIRATIONAL' | 'COMMERCIAL_INVESTIGATION' | 'TRANSACTIONAL' | 'NAVIGATIONAL';
  targetPersona: string[];
  tone: 'LUXURY' | 'ADVENTURE' | 'WARM_FAMILY' | 'HISTORIC_CURATOR' | 'PRACTICAL';
  aiSummary: string;
  aiSearchVisibilityScore: number; // 0 - 100
  entityConfidence: number;        // 0 - 100
  suggestedRelatedKeywords: string[];
  generatedByModel?: string;
  lastAIAssistTimestamp?: string;
}

export interface ContentAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPageSeconds: number;
  bounceRatePercent: number;
  searchImpressions: number;
  aiSearchAppearances: number;
  bookingConversions: number;
  attributedRevenue: number;
}

export interface EntityRelationGraph {
  destinationIds: string[];
  journeyIds: string[];
  packageIds: string[];
  hotelIds: string[];
  experienceIds: string[];
  circleIds: string[];
  tagTaxonomies: string[];
  categoryTaxonomies: string[];
}

export interface ContentRevision {
  revisionId: string;
  version: number;
  authorId: string;
  authorName: string;
  changeNote: string;
  createdAt: string;
  snapshot: Record<string, any>;
}

// ==========================================
// 4. CANONICAL BASE CONTENT ENTITY (§03)
// ==========================================

export interface TravelContentEntity {
  id: string;
  canonicalId: string;
  slug: string;
  type: TravelContentType;
  status: ContentLifecycleStatus;
  locale: 'en-IN' | 'ml-IN' | 'hi-IN';
  title: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  galleryImages?: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

  // Rich WordPress-grade fields
  taxonomies: {
    categories: string[];
    tags: string[];
    regions?: string[];
    travelThemes?: string[];
  };
  customFields: Record<string, any>;
  
  // Intelligence Profiles
  seo: SEOProfile;
  ai: AIContentProfile;
  analytics: ContentAnalytics;
  relations: EntityRelationGraph;
  revisions: ContentRevision[];
}

// ==========================================
// 5. LIVING JOURNEY OBJECT (§04)
// ==========================================

export interface JourneyStop {
  dayNumber: number;
  placeName: string;
  coordinates?: { lat: number; lng: number };
  highlight: string;
  activityIds: string[];
  hotelId?: string;
  transportType: 'PRIVATE_CHAUFFEUR' | 'DOMESTIC_FLIGHT' | 'SPEEDBOAT' | 'TRAIN' | 'SEAPLANE' | 'WALKING';
  mealsIncluded: ('BREAKFAST' | 'LUNCH' | 'DINNER')[];
  localExpertTips?: string;
}

export interface JourneyLivingEntity {
  id: string;
  canonicalId: string;
  slug: string;
  title: string;
  destination: string;
  country: string;
  durationDays: number;
  durationNights: number;
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'EXPEDITION';
  pace: 'RELAXED' | 'BALANCED' | 'FAST_PACED';
  basePrice: number;
  currency: string;
  stops: JourneyStop[];
  inclusions: string[];
  exclusions: string[];
  requiredDocuments: string[];
  minPax: number;
  maxPax: number;
  socialCircleId?: string;
  seoProfile: SEOProfile;
  aiScore: number;
  status: ContentLifecycleStatus;
}

// ==========================================
// 6. DESTINATION STUDIO MODEL (§05)
// ==========================================

export interface DestinationStudioModel {
  id: string;
  canonicalId: string;
  name: string;
  stateOrRegion: string;
  country: string;
  slug: string;
  heroHeadline: string;
  tagline: string;
  overviewRichText: string;
  bestTimeToVisit: {
    peakSeason: string;
    shoulderSeason: string;
    offSeason: string;
    bestMonths: string[];
  };
  weatherClimate: {
    avgTempSummer: string;
    avgTempWinter: string;
    monsoonMonths: string;
    currentAdvisory?: string;
  };
  keyPlaces: { name: string; type: string; highlight: string; image: string }[];
  hiddenGems: { name: string; provenanceNote: string; exclusivityScore: number }[];
  faqs: { question: string; answer: string }[];
  seo: SEOProfile;
  ai: AIContentProfile;
}

// ==========================================
// 7. TRAVEL THEME ENGINE SPECIFICATION (§06)
// ==========================================

export const TRAVEL_THEMES = [
  'LUXURY_TRAVEL',
  'ADVENTURE',
  'FAMILY_TRAVEL',
  'BACKPACKING',
  'CORPORATE_TRAVEL',
  'AYURVEDA_TOURISM',
  'RELIGIOUS_TOURISM',
  'WEDDING_TOURISM',
  'WILDLIFE_TOURISM',
  'CRUISE_TOURISM'
] as const;

export type TravelThemeKey = (typeof TRAVEL_THEMES)[number];

export interface TravelThemeDefinition {
  themeKey: TravelThemeKey;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  fontFamily: string;
  layoutStyle: 'MODERN_CLEAN' | 'HERITAGE_EDITORIAL' | 'BOLD_ADVENTURE' | 'MINIMAL_SERENE';
  suggestedHeroType: 'FULLSCREEN_VIDEO' | 'PANORAMIC_SLIDER' | 'SPLIT_STORY' | 'MAGAZINE_GRID';
  conversionBlocks: string[];
  defaultSchemaType: string;
}

// ==========================================
// 8. VISUAL COMPONENT REGISTRY DEFINITION
// ==========================================

export interface VIBE8ComponentDefinition {
  component_id: string;
  name: string;
  category: 'HERO' | 'DESTINATION' | 'JOURNEY' | 'COMMERCE' | 'SOCIAL' | 'AI_GROWTH';
  schema: Record<string, any>;
  props: Record<string, { type: string; label: string; default?: any; bindable?: boolean }>;
  data_source?: 'DestinationRegistry' | 'JourneyRegistry' | 'TourRegistry' | 'HotelRegistry' | 'ReviewRegistry' | 'SocialGraph';
  theme_compatibility: TravelThemeKey[];
  variants: string[];
  responsive_rules: { mobileStacked: boolean; desktopCols: number };
  seo_rules: { emitSchema: boolean; headingHierarchyRequired: boolean };
  analytics_tracking: boolean;
  permissions: string[];
  version: string;
}
