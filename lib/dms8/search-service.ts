/**
 * DMS8 SMART SEARCH INTELLIGENCE ENGINE
 * Multi-facet filtering and Natural Language Semantic Travel Document Querying.
 */

import { SEED_DMS_DOCUMENTS } from './registries';
import { DocumentRegistryItem, TravelDocumentType } from './types';
import { DMS8VaultService } from './vault-service';

export interface SearchFacetFilter {
  keyword?: string;
  category?: string;
  documentType?: TravelDocumentType;
  ownerId?: string;
  destination?: string;
  classification?: string;
  status?: string;
  hasExpired?: boolean;
  expiringInDays?: number;
}

export class DMS8SearchService {
  /**
   * Faceted Structured Search
   */
  static search(filter: SearchFacetFilter): DocumentRegistryItem[] {
    const docs = DMS8VaultService.getAllDocuments();
    let results = [...docs];

    if (filter.keyword) {
      const q = filter.keyword.toLowerCase();
      results = results.filter(d => 
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q)) ||
        (d.ocrData?.rawText && d.ocrData.rawText.toLowerCase().includes(q))
      );
    }

    if (filter.category) {
      results = results.filter(d => d.category === filter.category);
    }

    if (filter.documentType) {
      results = results.filter(d => d.documentType === filter.documentType);
    }

    if (filter.classification) {
      results = results.filter(d => d.classification === filter.classification);
    }

    if (filter.status) {
      results = results.filter(d => d.approvalStatus === filter.status || d.lifecycleStatus === filter.status);
    }

    if (filter.expiringInDays !== undefined) {
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + filter.expiringInDays);

      results = results.filter(d => {
        if (!d.expiryDate) return false;
        const exp = new Date(d.expiryDate);
        return exp >= now && exp <= targetDate;
      });
    }

    if (filter.hasExpired) {
      const now = new Date();
      results = results.filter(d => d.expiryDate && new Date(d.expiryDate) < now);
    }

    return results;
  }

  /**
   * Semantic Natural Language Search Parser
   * Parses queries like:
   * - "Find all expired travel insurance documents"
   * - "Show Dubai customer files"
   * - "Find pending visa documents"
   */
  static semanticSearch(query: string): {
    interpretedIntent: string;
    appliedFilters: SearchFacetFilter;
    results: DocumentRegistryItem[];
  } {
    const q = query.toLowerCase();
    const appliedFilters: SearchFacetFilter = {};
    let intent = 'General Keyword Match';

    if (q.includes('insurance')) {
      appliedFilters.documentType = 'INSURANCE';
      intent = 'Filter by Travel Insurance';
    } else if (q.includes('passport')) {
      appliedFilters.documentType = 'PASSPORT';
      intent = 'Filter by Passports';
    } else if (q.includes('visa')) {
      appliedFilters.documentType = 'VISA';
      intent = 'Filter by Visas';
    } else if (q.includes('voucher') || q.includes('ticket')) {
      appliedFilters.category = 'BOOKING';
      intent = 'Filter by Booking Vouchers & Tickets';
    } else if (q.includes('contract') || q.includes('supplier')) {
      appliedFilters.category = 'SUPPLIER';
      intent = 'Filter by Supplier Agreements';
    }

    if (q.includes('expir') || q.includes('due') || q.includes('soon')) {
      appliedFilters.expiringInDays = 30;
      intent += ' • Expiring in 30 Days';
    }

    if (q.includes('pending') || q.includes('approval')) {
      appliedFilters.status = 'PENDING';
      intent += ' • Pending Approvals';
    }

    if (q.includes('dubai')) {
      appliedFilters.keyword = 'dubai';
      intent += ' • Dubai Destination Context';
    } else if (q.includes('kerala')) {
      appliedFilters.keyword = 'kerala';
      intent += ' • Kerala Destination Context';
    }

    const results = this.search(appliedFilters);
    return {
      interpretedIntent: intent,
      appliedFilters,
      results
    };
  }
}
