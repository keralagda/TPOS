/**
 * KNOWLEDGE8: AI KNOWLEDGE ASSISTANT & RETRIEVAL CHATBOT
 * 
 * Strict Grounding & Doctrinal Rules:
 * - K8-D01 Source Before Answer
 * - K8-D03 Exact Value Preservation
 * - K8-D05 Provenance Always
 * - K8-D09 Conflicts Must Be Surfaced
 * - K8-D10 Unknown > Fabrication
 * - K8-D13 Customer AI != Internal AI
 * - Multi-lingual (en-IN, ml-IN, hi-IN)
 */

import { TemporalPriceEngine, PriceQueryResult } from './temporal-price-engine';

export interface AIKnowledgeResponse {
  answer: string;
  language: 'en-IN' | 'ml-IN' | 'hi-IN';
  exactPrice?: {
    amount: number;
    currency: string;
    unit: string;
    status: string;
    postedAt: string;
    validUntil: string;
    sourceName: string;
    sourceMessageId: string;
    verification: string;
  };
  hasConflicts: boolean;
  provenanceAvailable: boolean;
}

export class AIKnowledgeAssistant {
  /**
   * Process Natural Language Query against Temporal Price & Knowledge Graph
   */
  static askKnowledge(options: {
    query: string;
    language?: 'en-IN' | 'ml-IN' | 'hi-IN';
    isCustomerAudience?: boolean;
    referenceTime?: Date;
  }): AIKnowledgeResponse {
    const lang = options.language || 'en-IN';
    const query = options.query.trim();

    // Destination or product extraction
    const destMatch = query.match(/(Dubai|Kerala|Munnar|Bali|Maldives|Switzerland|Singapore|Kashmir|Goa)/i);
    const destination = destMatch ? destMatch[1] : 'Dubai';

    const resolution: PriceQueryResult = TemporalPriceEngine.resolvePrice({
      productIdOrDestination: destination,
      referenceTime: options.referenceTime || new Date(),
      isCustomerAudience: options.isCustomerAudience ?? false,
    });

    if (resolution.status === 'NOT_FOUND') {
      let notFoundText = "I couldn't find an exact price in the authorized knowledge sources.";
      if (lang === 'ml-IN') notFoundText = "അംഗീകൃത ഉറവിടങ്ങളിൽ കൃത്യമായ നിരക്കുകൾ കണ്ടെത്താനായില്ല.";
      if (lang === 'hi-IN') notFoundText = "अधिकृत ज्ञान स्रोतों में कोई सटीक दर नहीं मिली।";

      return {
        answer: notFoundText,
        language: lang,
        hasConflicts: false,
        provenanceAvailable: false,
      };
    }

    if (resolution.status === 'CONFLICTING') {
      let conflictText = resolution.explanation;
      if (lang === 'ml-IN') {
        conflictText = `വ്യത്യസ്ത പങ്കാളികളിൽ നിന്ന് പരസ്പര വിരുദ്ധമായ നിരക്കുകൾ കണ്ടെത്തി. ഏതാണ് കൃത്യമെന്ന് ഉറപ്പാക്കാൻ കഴിഞ്ഞിട്ടില്ല.`;
      }
      return {
        answer: conflictText,
        language: lang,
        hasConflicts: true,
        provenanceAvailable: true,
      };
    }

    if (resolution.status === 'EXPIRED') {
      const p = resolution.latestPrice!;
      let expText = resolution.explanation;
      if (lang === 'ml-IN') {
        expText = `ഏറ്റവും ഒടുവിൽ രേഖപ്പെടുത്തിയ നിരക്ക് ${p.currency} ${p.amount.toLocaleString('en-IN')} ആയിരുന്നു. എന്നാൽ ഇതിന്റെ സാധുത കാലാവധി അവസാനിച്ചു. നിലവിൽ സാധുവായ നിരക്കുകൾ ലഭ്യമല്ല.`;
      } else if (lang === 'hi-IN') {
        expText = `अंतिम दर्ज दर ${p.currency} ${p.amount.toLocaleString('en-IN')} थी, लेकिन इसकी वैधता समाप्त हो गई है।`;
      }

      return {
        answer: expText,
        language: lang,
        exactPrice: {
          amount: p.amount,
          currency: p.currency,
          unit: p.unit,
          status: 'EXPIRED',
          postedAt: p.postedAt,
          validUntil: p.validUntil,
          sourceName: p.sourceName,
          sourceMessageId: p.sourceMessageId,
          verification: p.verificationStatus,
        },
        hasConflicts: false,
        provenanceAvailable: true,
      };
    }

    // ACTIVE / FOUND
    const p = resolution.currentPrice!;
    let answerText = `${p.productName}\n${p.currency} ${p.amount.toLocaleString('en-IN')} ${p.unit}\n\nPosted: ${new Date(p.postedAt).toLocaleTimeString('en-IN')}\nValid Until: ${new Date(p.validUntil).toLocaleTimeString('en-IN')} (${p.validityDurationHours}h validity)\nSource: ${p.sourceName}\nStatus: ACTIVE (${p.verificationStatus})\nConditions: ${p.conditions.join(', ')}`;

    if (lang === 'ml-IN') {
      answerText = `${p.productName} ഇപ്പോഴത്തെ നിരക്ക്: ${p.currency} ${p.amount.toLocaleString('en-IN')} (${p.unit}). സാധുത: ${new Date(p.validUntil).toLocaleTimeString('en-IN')} വരെ. ഉറവിടം: ${p.sourceName}.`;
    }

    return {
      answer: answerText,
      language: lang,
      exactPrice: {
        amount: p.amount,
        currency: p.currency,
        unit: p.unit,
        status: 'ACTIVE',
        postedAt: p.postedAt,
        validUntil: p.validUntil,
        sourceName: p.sourceName,
        sourceMessageId: p.sourceMessageId,
        verification: p.verificationStatus,
      },
      hasConflicts: false,
      provenanceAvailable: true,
    };
  }
}
