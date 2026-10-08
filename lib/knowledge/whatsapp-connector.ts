/**
 * KNOWLEDGE8: AUTHORIZED WHATSAPP CONNECTOR & INGESTION PIPELINE
 * 
 * STRICT COMPLIANCE:
 * Only authorized integrations, channels, and verified archives.
 * Absolutely NO scraping, session hijacking, or unauthorized group sniffing.
 */

import { TemporalPriceEngine, KnowledgePrice } from './temporal-price-engine';

export type WhatsAppSourceType =
  | 'WHATSAPP_CHANNEL'
  | 'WHATSAPP_GROUP'
  | 'WHATSAPP_COMMUNITY'
  | 'WHATSAPP_BUSINESS'
  | 'IMPORTED_MESSAGE_ARCHIVE'
  | 'ADMIN_UPLOADED_EXPORT'
  | 'APPROVED_MESSAGING_SOURCE';

export interface WhatsAppSource {
  sourceId: string;
  sourceName: string;
  sourceType: WhatsAppSourceType;
  organizationId: string;
  branchId: string;
  status: 'ACTIVE' | 'PAUSED' | 'DISCONNECTED';
  connectedAt: string;
  lastSyncAt: string;
  messageCount: number;
  extractedPricesCount: number;
  isInternalB2BOnly: boolean;
}

export interface IngestedWhatsAppMessage {
  id: string;
  sourceId: string;
  externalMessageId: string;
  senderName: string;
  timestamp: string;
  text: string;
  mediaType?: 'NONE' | 'PDF' | 'IMAGE' | 'DOCUMENT';
  isProcessed: boolean;
  extractedFacts?: {
    destination?: string;
    productName?: string;
    amount?: number;
    currency?: string;
    conditions?: string[];
    validUntil?: string;
  };
}

export class WhatsAppKnowledgeConnector {
  private static sources: Map<string, WhatsAppSource> = new Map();
  private static messages: IngestedWhatsAppMessage[] = [];

  static {
    // Seed canonical authorized B2B WhatsApp Channel & Partner Group
    this.sources.set('src-wa-kerala-b2b', {
      sourceId: 'src-wa-kerala-b2b',
      sourceName: 'Kerala B2B Travel Partners',
      sourceType: 'WHATSAPP_COMMUNITY',
      organizationId: 'org-tp-india',
      branchId: 'branch_kochi',
      status: 'ACTIVE',
      connectedAt: '2026-09-15T09:00:00Z',
      lastSyncAt: new Date().toISOString(),
      messageCount: 142,
      extractedPricesCount: 38,
      isInternalB2BOnly: true,
    });

    this.sources.set('src-wa-dubai-dmc', {
      sourceId: 'src-wa-dubai-dmc',
      sourceName: 'Dubai Arabian Journeys DMC Feed',
      sourceType: 'WHATSAPP_CHANNEL',
      organizationId: 'org-tp-india',
      branchId: 'branch_dubai',
      status: 'ACTIVE',
      connectedAt: '2026-09-18T10:00:00Z',
      lastSyncAt: new Date().toISOString(),
      messageCount: 89,
      extractedPricesCount: 24,
      isInternalB2BOnly: true,
    });
  }

  static getSources(): WhatsAppSource[] {
    return Array.from(this.sources.values());
  }

  static getSource(id: string): WhatsAppSource | undefined {
    return this.sources.get(id);
  }

  /**
   * Ingest and process an incoming authorized WhatsApp message
   */
  static ingestAuthorizedMessage(payload: {
    sourceId: string;
    externalMessageId: string;
    senderName: string;
    text: string;
    timestamp?: string;
    mediaType?: 'NONE' | 'PDF' | 'IMAGE' | 'DOCUMENT';
  }): { message: IngestedWhatsAppMessage; extractedPrice?: KnowledgePrice } {
    const source = this.sources.get(payload.sourceId);
    if (!source) throw new Error(`Unauthorized or unregistered WhatsApp source: ${payload.sourceId}`);
    if (source.status !== 'ACTIVE') throw new Error(`Source ${source.sourceName} is currently ${source.status}`);

    const msgId = `msg-wa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = payload.timestamp || new Date().toISOString();

    const message: IngestedWhatsAppMessage = {
      id: msgId,
      sourceId: payload.sourceId,
      externalMessageId: payload.externalMessageId,
      senderName: payload.senderName,
      timestamp,
      text: payload.text,
      mediaType: payload.mediaType || 'NONE',
      isProcessed: true,
    };

    // AI Extraction Simulation & Regex Parser
    const priceMatch = payload.text.match(/(?:₹|INR|AED|USD)?\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\s*\/\s*(person|pax|room|pkg))?/i);
    const destinationMatch = payload.text.match(/(Dubai|Kerala|Munnar|Bali|Maldives|Switzerland|Singapore|Kashmir|Goa)/i);

    let extractedPrice: KnowledgePrice | undefined;

    if (priceMatch && destinationMatch) {
      const rawNum = priceMatch[1].replace(/,/g, '');
      const amount = parseFloat(rawNum);
      const destination = destinationMatch[1];
      const currency = payload.text.includes('AED') ? 'AED' : (payload.text.includes('USD') ? 'USD' : 'INR');
      const unit = priceMatch[2] ? `per ${priceMatch[2].toLowerCase()}` : 'per person';

      // Check for explicit expiry keywords like "valid until 5 PM", "valid till tomorrow"
      let explicitValidUntil: Date | undefined;
      const validUntilMatch = payload.text.match(/valid\s*(?:until|till)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (validUntilMatch) {
        // Mock explicit date resolution
        const postTime = new Date(timestamp);
        explicitValidUntil = new Date(postTime.getTime() + 3 * 60 * 60 * 1000);
      }

      message.extractedFacts = {
        destination,
        productName: `${destination} Tour Package`,
        amount,
        currency,
        conditions: ['4-star hotel', 'Airport transfers included'],
        validUntil: explicitValidUntil?.toISOString(),
      };

      // Ingest directly into Knowledge8 Temporal Price Engine
      extractedPrice = TemporalPriceEngine.ingestPrice({
        sourceMessageId: msgId,
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        entityId: `ent-${destination.toLowerCase()}`,
        productId: `prod-${destination.toLowerCase()}-pkg`,
        productName: `${destination} Special Package`,
        supplierId: `supp-${payload.senderName.replace(/\s+/g, '-').toLowerCase()}`,
        supplierName: payload.senderName,
        destinationId: `dest-${destination.toLowerCase()}`,
        destinationName: destination,
        amount,
        currency,
        unit,
        conditions: ['Includes 4-star stay', 'Airport transfer included', 'Non-refundable within 48h'],
        inclusions: ['Breakfast', 'Transfers', 'Sightseeing'],
        exclusions: ['Visa fee', 'Personal expenses'],
        postedAt: timestamp,
        explicitValidUntil,
        sourceText: payload.text,
        isInternalB2BOnly: source.isInternalB2BOnly,
      });

      source.extractedPricesCount++;
    }

    source.messageCount++;
    source.lastSyncAt = new Date().toISOString();
    this.messages.push(message);

    return { message, extractedPrice };
  }

  static getMessages(): IngestedWhatsAppMessage[] {
    return this.messages;
  }
}
