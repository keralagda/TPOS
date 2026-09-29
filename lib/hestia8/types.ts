/**
 * HESTIA8: OMNI AI SEO & GROWTH INTELLIGENCE ENGINE TYPES
 * Next-Generation Travel SEO: GEO, AEO, LLMO, SXO, Entity Graphs, and Schema.org
 */

export type SEOOptimizationParadigm = 
  | 'GEO'          // Generative Engine Optimization (Google AI Overviews, Gemini, Perplexity)
  | 'AEO'          // Answer Engine Optimization (Direct Answers, Q&A, Voice snippets)
  | 'LLMO'         // Large Language Model Optimization (Citable source formatting, semantic density)
  | 'SXO'          // Search Experience Optimization (Fast LCP, interactive itineraries, conversion)
  | 'ENTITY_SEO'   // Knowledge Graph / Entity interlinking
  | 'SEMANTIC_SEO';// Topical authority clusters & LSI keywords

export type TravelSchemaType = 
  | 'TravelAgency'
  | 'TouristDestination'
  | 'TouristAttraction'
  | 'Trip'
  | 'Product'
  | 'Offer'
  | 'Hotel'
  | 'FAQPage'
  | 'BreadcrumbList'
  | 'Article';

export interface SEOHealthAudit {
  urlOrSlug: string;
  contentType: string;
  overallScore: number; // 0 - 100
  titleScore: number;
  metaDescriptionScore: number;
  contentDepthScore: number;
  aeoReadinessScore: number; // For AI answer engines
  schemaValidationScore: number;
  internalLinkingScore: number;
  checks: {
    passed: boolean;
    name: string;
    message: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  aiRecommendations: string[];
}

export interface EntityGraphNode {
  id: string;
  name: string;
  entityType: 'DESTINATION' | 'EXPERIENCE' | 'HOTEL' | 'TOUR' | 'GUIDE' | 'STORY' | 'JOURNEY';
  slug: string;
  schemaType: TravelSchemaType;
  inboundLinksCount: number;
  outboundLinksCount: number;
  topicalCluster: string;
  connectedEntities: {
    targetId: string;
    relationType: 'CHILD_OF' | 'LOCATED_IN' | 'OFFERS_EXPERIENCE' | 'RECOMMENDS_STAY' | 'COMPLEMENTARY_TO';
    weight: number;
  }[];
}

export interface InternalLinkingRecommendation {
  sourceEntityId: string;
  sourceEntityTitle: string;
  sourceType: string;
  targetEntityId: string;
  targetEntityTitle: string;
  targetType: string;
  suggestedAnchorText: string;
  suggestedParagraphContext: string;
  hierarchicalRelation: 
    | 'DESTINATION_TO_EXPERIENCE'
    | 'EXPERIENCE_TO_HOTEL'
    | 'HOTEL_TO_PACKAGE'
    | 'PACKAGE_TO_GUIDE'
    | 'GUIDE_TO_STORY'
    | 'STORY_TO_JOURNEY';
  growthPotential: 'HIGH' | 'MEDIUM' | 'CRITICAL';
}

export interface AIOmniSnippet {
  id: string;
  topic: string;
  targetQuery: string;
  directAnswerSummary: string; // 40-60 word high-density direct answer for Perplexity/Google AI Overview
  keyHighlights: string[];
  insiderTravelerQuote: string;
  citableSources: {
    title: string;
    url: string;
  }[];
  schemaSnippet: Record<string, any>;
}

export interface ContentClusterPlan {
  pillarTopic: string;
  pillarDestination: string;
  estimatedMonthlySearchVolume: number;
  targetPersona: string;
  clusterSubtopics: {
    subtopicTitle: string;
    targetKeyword: string;
    contentType: 'GUIDE' | 'TOUR' | 'STORY' | 'FAQ' | 'JOURNEY';
    searchIntent: 'INFORMATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL';
    funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  }[];
}
