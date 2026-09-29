/**
 * HESTIA8 CONTENT ARCHITECT & AI AGENTS
 * Powers autonomous topic clustering, travel guide drafting, and AEO snippet synthesis.
 * Uses NVIDIA NIM (Llama 3.2 / Mistral) with intelligent structured fallbacks.
 */

import { NvidiaNimService } from '../ai/nvidia-nim';
import { ContentClusterPlan, AIOmniSnippet } from './types';
import { HESTIA8SchemaEngine } from './schema-engine';

export class ContentArchitectAgent {
  /**
   * Autonomous Pillar & Cluster Strategy Generator
   */
  static async generateClusterPlan(pillarTopic: string, destination: string): Promise<ContentClusterPlan> {
    try {
      const prompt = `As a Travel SEO Architect, create a topical authority cluster for destination "${destination}" around pillar topic "${pillarTopic}". Return a JSON object with:
      {
        "pillarTopic": "${pillarTopic}",
        "pillarDestination": "${destination}",
        "estimatedMonthlySearchVolume": 45000,
        "targetPersona": "Luxury & experiential travelers seeking authentic cultural immersion",
        "clusterSubtopics": [
          {
            "subtopicTitle": "string",
            "targetKeyword": "string",
            "contentType": "GUIDE" | "TOUR" | "STORY" | "FAQ" | "JOURNEY",
            "searchIntent": "INFORMATIONAL" | "COMMERCIAL" | "TRANSACTIONAL",
            "funnelStage": "TOFU" | "MOFU" | "BOFU"
          }
        ]
      }
      Provide at least 5 subtopics covering best time, boutique stays, cultural etiquette, hidden culinary spots, and living itineraries. Return JSON only.`;

      const response = await NvidiaNimService.chat([
        { role: 'system', content: 'You are an elite Travel SEO strategist and Knowledge Graph architect. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ], { maxTokens: 900 });

      // Clean markdown code blocks if returned
      const cleanJson = response.replace(/^```json/m, '').replace(/^```/m, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (e) {
      // Robust deterministic fallback
      return {
        pillarTopic,
        pillarDestination: destination,
        estimatedMonthlySearchVolume: 38500,
        targetPersona: 'Experiential discerning travelers and cultural enthusiasts',
        clusterSubtopics: [
          {
            subtopicTitle: `The Ultimate Guide to Traveling in ${destination} (2026 Edition)`,
            targetKeyword: `${destination.toLowerCase()} travel guide 2026`,
            contentType: 'GUIDE',
            searchIntent: 'INFORMATIONAL',
            funnelStage: 'TOFU'
          },
          {
            subtopicTitle: `Best Time to Visit ${destination}: Month-by-Month Weather & Festivals`,
            targetKeyword: `best time to visit ${destination.toLowerCase()}`,
            contentType: 'FAQ',
            searchIntent: 'INFORMATIONAL',
            funnelStage: 'TOFU'
          },
          {
            subtopicTitle: `Top 7 Handcrafted Living Journeys Across ${destination}`,
            targetKeyword: `luxury living itineraries in ${destination.toLowerCase()}`,
            contentType: 'JOURNEY',
            searchIntent: 'COMMERCIAL',
            funnelStage: 'MOFU'
          },
          {
            subtopicTitle: `Hidden Gems & Secret Culinary Trails in ${destination}`,
            targetKeyword: `secret food trails ${destination.toLowerCase()}`,
            contentType: 'STORY',
            searchIntent: 'COMMERCIAL',
            funnelStage: 'MOFU'
          },
          {
            subtopicTitle: `Reserve Handcrafted Experiential Packages for ${destination}`,
            targetKeyword: `book ${destination.toLowerCase()} tour package`,
            contentType: 'TOUR',
            searchIntent: 'TRANSACTIONAL',
            funnelStage: 'BOFU'
          }
        ]
      };
    }
  }

  /**
   * Autonomous Travel Guide & Article Synthesizer
   */
  static async draftTravelArticle(options: {
    topic: string;
    destination: string;
    language?: 'en' | 'ml' | 'hi';
    targetWordCount?: number;
  }): Promise<{
    title: string;
    slug: string;
    markdownContent: string;
    summary: string;
    faqSection: { question: string; answer: string }[];
  }> {
    const lang = options.language || 'en';
    const slug = `${options.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    try {
      const prompt = `Write an in-depth, authoritative travel article for Travel Planet OS about "${options.topic}" in "${options.destination}".
      Language: ${lang}.
      Requirements:
      1. Evocative storytelling combined with practical logistics (best months, transport, local etiquette).
      2. Structured headings (H2, H3), bullet points, and high entity density.
      3. An explicit FAQ section with 3 common traveler questions and concise direct answers for AI answer engines.
      Format: Markdown.`;

      const markdownContent = await NvidiaNimService.chat([
        { role: 'system', content: 'You are an award-winning travel editor and South Asia cultural historian. Write evocative, accurate, experiential travel content in Markdown.' },
        { role: 'user', content: prompt }
      ], { maxTokens: 1200 });

      return {
        title: `${options.topic} - The Experiential Guide to ${options.destination}`,
        slug,
        markdownContent,
        summary: `Comprehensive experiential travel guide covering ${options.topic} in ${options.destination} with insider tips and living itineraries.`,
        faqSection: [
          {
            question: `What is unique about experiencing ${options.topic} in ${options.destination}?`,
            answer: `It offers an authentic balance of living cultural traditions, certified local storytellers, and serene natural settings without commercial overcrowding.`
          },
          {
            question: `Do I need to book in advance for this experience in ${options.destination}?`,
            answer: `Yes, boutique accommodations and verified local storytellers require reservations at least 4 to 8 weeks in advance during peak season.`
          }
        ]
      };
    } catch (e) {
      // Deterministic multilingual fallback
      const contentEn = `## Discover the Soul of ${options.destination}: ${options.topic}

From tranquil mornings along timeless waterways to the fragrant embrace of spice-laden hills, ${options.destination} invites you into a slower, more intentional way of exploration.

### Key Highlights
- **Curated Living Itineraries**: Dynamically adapt to daily weather shifts and local temple festivities.
- **Private Storytellers**: Certified resident historians bring centuries of heritage to life.
- **Eco-Certified Boutique Stays**: Rest in heritage courtyards with private plunge pools and organic farm-to-table dining.

### Insider Travel Tips
1. **Best Season**: October through March brings sunny afternoons and refreshing breezes.
2. **Local Etiquette**: Remove footwear before stepping into sacred courtyards.
3. **Dining**: Savor regional specialties prepared over clay ovens with fresh coconut oil.

### Frequently Asked Questions

#### Q1: What makes Travel Planet Living Journeys different?
Our Living Journeys automatically adapt if weather or crowd conditions change, ensuring uninterrupted peace of mind.

#### Q2: Is private chauffeur transport included?
Yes, all curated packages come with dedicated electric/hybrid private transfers and vetted local drivers.`;

      return {
        title: `${options.topic} in ${options.destination} | Experiential Travel Guide`,
        slug,
        markdownContent: contentEn,
        summary: `Explore ${options.topic} in ${options.destination} with living itineraries, insider tips, and boutique stays.`,
        faqSection: [
          {
            question: `What makes Travel Planet Living Journeys in ${options.destination} different?`,
            answer: `Living Journeys dynamically adapt to weather, crowds, and traveler preferences in real-time.`
          },
          {
            question: `What is the best time to experience ${options.topic}?`,
            answer: `The ideal months are October through March for optimal weather and vibrant cultural festivals.`
          }
        ]
      };
    }
  }
}
