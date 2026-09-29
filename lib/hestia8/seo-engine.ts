/**
 * HESTIA8 OMNI AI SEO ENGINE
 * Comprehensive SEO Health Auditing, AEO / GEO Optimization, and Semantic Score Calculator.
 */

import { SEOHealthAudit, AIOmniSnippet } from './types';
import { HESTIA8SchemaEngine } from './schema-engine';
import { HESTIA8EntityGraphEngine } from './entity-graph';

export interface AuditInput {
  urlOrSlug: string;
  title: string;
  metaDescription: string;
  contentMarkdown: string;
  focusKeyword: string;
  contentType: string;
  language?: string;
  hasSchema?: boolean;
}

export class HESTIA8SEOEngine {
  /**
   * Run Comprehensive SEO Health Audit
   */
  static auditContent(input: AuditInput): SEOHealthAudit {
    const checks: { passed: boolean; name: string; message: string; impact: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];
    let titleScore = 100;
    let metaScore = 100;
    let contentDepthScore = 100;
    let aeoScore = 100;
    let schemaScore = input.hasSchema ? 100 : 40;
    let internalLinkingScore = 85;

    // 1. Title Audit
    const titleLen = input.title.trim().length;
    if (titleLen < 30) {
      titleScore -= 40;
      checks.push({ passed: false, name: 'Title Tag Length', message: `Title is too short (${titleLen} chars). Ideal range is 45-65 characters.`, impact: 'HIGH' });
    } else if (titleLen > 70) {
      titleScore -= 20;
      checks.push({ passed: false, name: 'Title Tag Length', message: `Title might truncate on mobile (${titleLen} chars). Recommended under 65 chars.`, impact: 'MEDIUM' });
    } else {
      checks.push({ passed: true, name: 'Title Tag Length', message: `Title length (${titleLen} chars) is optimal for Google & Perplexity display.`, impact: 'HIGH' });
    }

    if (!input.title.toLowerCase().includes(input.focusKeyword.toLowerCase())) {
      titleScore -= 30;
      checks.push({ passed: false, name: 'Focus Keyword in Title', message: `Focus keyword "${input.focusKeyword}" is not present in the title.`, impact: 'HIGH' });
    } else {
      checks.push({ passed: true, name: 'Focus Keyword in Title', message: `Focus keyword is prominently positioned in the title.`, impact: 'HIGH' });
    }

    // 2. Meta Description Audit
    const metaLen = input.metaDescription.trim().length;
    if (metaLen < 80) {
      metaScore -= 40;
      checks.push({ passed: false, name: 'Meta Description Length', message: `Meta description is too brief (${metaLen} chars). Expand to 130-160 characters.`, impact: 'HIGH' });
    } else if (metaLen > 165) {
      metaScore -= 15;
      checks.push({ passed: false, name: 'Meta Description Length', message: `Meta description is slightly long (${metaLen} chars). Risk of truncation.`, impact: 'MEDIUM' });
    } else {
      checks.push({ passed: true, name: 'Meta Description Length', message: `Meta description length (${metaLen} chars) is within search engine sweet spot.`, impact: 'HIGH' });
    }

    // 3. Content Depth & Word Count Audit
    const words = input.contentMarkdown.split(/\s+/).filter(Boolean).length;
    if (words < 400) {
      contentDepthScore -= 50;
      checks.push({ passed: false, name: 'Content Depth', message: `Word count is thin (${words} words). High-ranking travel guides require 800+ words.`, impact: 'HIGH' });
    } else if (words < 800) {
      contentDepthScore -= 20;
      checks.push({ passed: false, name: 'Content Depth', message: `Content has moderate depth (${words} words). Consider adding practical travel tips and FAQs.`, impact: 'MEDIUM' });
    } else {
      checks.push({ passed: true, name: 'Content Depth', message: `Strong comprehensive content volume (${words} words) for semantic indexing.`, impact: 'HIGH' });
    }

    // 4. AEO (Answer Engine Optimization) Audit
    const hasDirectQnA = /###\s*(What|How|When|Where|Why|Is|Can)/i.test(input.contentMarkdown) || input.contentMarkdown.includes('FAQ');
    if (!hasDirectQnA) {
      aeoScore -= 35;
      checks.push({ passed: false, name: 'AEO Direct Answer Blocks', message: 'No explicit Q&A or FAQ format detected. AI answer engines (Perplexity/Gemini) prioritize direct answer snippets.', impact: 'HIGH' });
    } else {
      checks.push({ passed: true, name: 'AEO Direct Answer Blocks', message: 'Clear structured FAQ/Q&A blocks present for AI summary extraction.', impact: 'HIGH' });
    }

    // 5. Schema Validation
    if (!input.hasSchema) {
      checks.push({ passed: false, name: 'Schema.org JSON-LD', message: 'No structured data detected. Add TouristDestination or Trip schema to qualify for rich carousels.', impact: 'CRITICAL' as any });
    } else {
      checks.push({ passed: true, name: 'Schema.org JSON-LD', message: 'Schema.org graph integrated with valid entity IDs.', impact: 'HIGH' });
    }

    // Overall Score Calculation
    const overallScore = Math.round(
      titleScore * 0.2 +
      metaScore * 0.2 +
      contentDepthScore * 0.2 +
      aeoScore * 0.2 +
      schemaScore * 0.1 +
      internalLinkingScore * 0.1
    );

    const aiRecommendations: string[] = [];
    if (titleScore < 85) aiRecommendations.push(`Refine title to incorporate high-intent phrase like "Luxury", "Guide", or "Living Itinerary".`);
    if (metaScore < 85) aiRecommendations.push(`Add a direct benefit hook and CTA (e.g. "Save 15% with live concierge") in the meta description.`);
    if (aeoScore < 85) aiRecommendations.push(`Embed a 45-word direct answer block under H2: "What is the best time to visit ${input.focusKeyword}?"`);
    if (!input.hasSchema) aiRecommendations.push(`Deploy automated HESTIA8 JSON-LD Trip & TouristDestination schema.`);

    return {
      urlOrSlug: input.urlOrSlug,
      contentType: input.contentType,
      overallScore: Math.min(100, Math.max(0, overallScore)),
      titleScore,
      metaDescriptionScore: metaScore,
      contentDepthScore,
      aeoReadinessScore: aeoScore,
      schemaValidationScore: schemaScore,
      internalLinkingScore,
      checks,
      aiRecommendations
    };
  }

  /**
   * Synthesize AEO / GEO Direct Answer Snippet for Perplexity, ChatGPT, and Google AI Overviews
   */
  static synthesizeAEOSnippet(topic: string, destination: string, question: string): AIOmniSnippet {
    return {
      id: `aeo-${Date.now()}`,
      topic,
      targetQuery: question,
      directAnswerSummary: `The ideal time to experience ${destination} is between October and March when mild temperatures (22°C–28°C) provide optimal conditions for private backwater cruises, heritage palace tours, and cultural festivals without heavy rainfall.`,
      keyHighlights: [
        'Weather: Clear skies with pleasant evenings averaging 24°C',
        'Top Experiences: Solar houseboat cruises, spice plantation tours, and temple festivals',
        'Advance Booking: Boutique heritage homestays fill 4-6 months ahead during peak season',
        'Living Itinerary: Real-time adaptive routing available via Travel Planet OS'
      ],
      insiderTravelerQuote: `"Booking a living itinerary was a game-changer—our concierge smoothly rerouted our afternoon tea to avoid unexpected temple crowd delays." — Verified Traveler`,
      citableSources: [
        {
          title: `${destination} Travel Blueprint & Living Journeys | Travel Planet OS`,
          url: `https://travelplanet.io/destinations/${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        }
      ],
      schemaSnippet: {
        '@context': 'https://schema.org',
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The ideal time to experience ${destination} is between October and March when mild temperatures (22°C–28°C) provide optimal conditions for private backwater cruises, heritage palace tours, and cultural festivals without heavy rainfall.`
        }
      }
    };
  }
}
