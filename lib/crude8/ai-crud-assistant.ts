/**
 * CRUDE8: AI CRUD ASSISTANT & SAFE PROPOSAL ENGINE
 * Translates natural language into governed CRUD operations with safety verification gates.
 */

import { CRUDEntityName, CRUDActionType } from './types';
import { UniversalEntityRegistry } from './entity-registry';
import { UserContext } from './permission-resolver';

export interface AICRUDProposal {
  proposalId: string;
  nlPrompt: string;
  action: CRUDActionType | 'ROLLBACK' | 'SCHEMA_QUERY';
  entity: CRUDEntityName;
  suggestedPayload: Record<string, any>;
  filters: Record<string, any>;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresConfirmation: boolean;
  safetyWarning?: string;
  explanation: string;
  targetVersion?: number;
  timestamp: string;
}

export class CRUDE8AIAssistant {
  private static proposals: Map<string, AICRUDProposal> = new Map();

  /**
   * Translates natural language instructions into a governed CRUD proposal
   */
  static interpretCommand(prompt: string, user: UserContext): AICRUDProposal {
    const proposalId = `ai-prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const lower = prompt.toLowerCase();

    // 1. Identify Entity
    let targetEntity: CRUDEntityName = 'Customer';
    const entities = UniversalEntityRegistry.listEntities();
    for (const ent of entities) {
      if (lower.includes(ent.entityName.toLowerCase())) {
        targetEntity = ent.entityName;
        break;
      }
    }

    // 2. Identify Action
    let action: CRUDActionType | 'ROLLBACK' | 'SCHEMA_QUERY' = 'READ';
    if (lower.startsWith('create') || lower.startsWith('add') || lower.startsWith('new') || lower.startsWith('register')) {
      action = 'CREATE';
    } else if (lower.startsWith('update') || lower.startsWith('edit') || lower.startsWith('modify') || lower.startsWith('change') || lower.startsWith('set')) {
      action = 'UPDATE';
    } else if (lower.startsWith('delete') || lower.startsWith('remove') || lower.startsWith('archive') || lower.startsWith('cancel')) {
      action = 'DELETE';
    } else if (lower.includes('rollback') || lower.includes('revert') || lower.includes('restore')) {
      action = 'ROLLBACK';
    } else if (lower.includes('schema') || lower.includes('fields') || lower.includes('definition')) {
      action = 'SCHEMA_QUERY';
    }

    // 3. Extract Payload / Filters
    const suggestedPayload: Record<string, any> = {};
    const filters: Record<string, any> = {};

    if (action === 'CREATE') {
      suggestedPayload.id = `${targetEntity.toLowerCase()}-${Date.now().toString().slice(-6)}`;
      suggestedPayload.tenantId = user.tenantId;

      if (targetEntity === 'Customer') {
        const nameMatch = prompt.match(/named\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) || 
                          prompt.match(/customer\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        suggestedPayload.name = nameMatch ? nameMatch[1] : 'New Traveler';
        suggestedPayload.email = `${suggestedPayload.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        suggestedPayload.loyaltyTier = lower.includes('vip') || lower.includes('gold') ? 'GOLD' : 'BRONZE';
        suggestedPayload.status = 'ACTIVE';
      } else if (targetEntity === 'Journey') {
        suggestedPayload.title = 'Curated Splendor Journey';
        suggestedPayload.slug = 'curated-splendor-journey';
        suggestedPayload.destination = 'Kerala, India';
        suggestedPayload.durationDays = 7;
        suggestedPayload.basePrice = 75000;
        suggestedPayload.currency = 'INR';
      } else if (targetEntity === 'Booking') {
        suggestedPayload.bookingNumber = `TP-2026-${Math.floor(100 + Math.random() * 900)}`;
        suggestedPayload.paxCount = 2;
        suggestedPayload.totalAmount = 85000;
        suggestedPayload.paymentStatus = 'PENDING';
        suggestedPayload.bookingStatus = 'CONFIRMED';
      }
    } else if (action === 'UPDATE') {
      if (lower.includes('status')) {
        if (lower.includes('active')) suggestedPayload.status = 'ACTIVE';
        if (lower.includes('archived')) suggestedPayload.status = 'ARCHIVED';
        if (lower.includes('vip') || lower.includes('platinum')) suggestedPayload.loyaltyTier = 'PLATINUM';
      }
      const idMatch = prompt.match(/(?:id|record|key|code)\s+([a-zA-Z0-9_-]+)/i);
      if (idMatch) {
        filters.id = idMatch[1];
      }
    } else if (action === 'DELETE') {
      const idMatch = prompt.match(/(?:id|record|customer|booking)\s+([a-zA-Z0-9_-]+)/i);
      if (idMatch) {
        filters.id = idMatch[1];
      }
    }

    // 4. Safety Gates & Impact Assessment
    let impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let requiresConfirmation = false;
    let safetyWarning: string | undefined;

    if (action === 'DELETE') {
      impactLevel = 'CRITICAL';
      requiresConfirmation = true;
      safetyWarning = `Destructive DELETE on ${targetEntity}. Soft-delete & state snapshot required prior to operation.`;
    } else if (action === 'UPDATE' && (!filters.id || Object.keys(filters).length === 0)) {
      impactLevel = 'HIGH';
      requiresConfirmation = true;
      safetyWarning = `Unbounded bulk update detected. Requires manual review of target filters.`;
    } else if (targetEntity === 'Invoice' || targetEntity === 'Tenant' || targetEntity === 'User') {
      impactLevel = 'HIGH';
      requiresConfirmation = true;
      safetyWarning = `Governance Policy: Mutations on ${targetEntity} require explicit administrative authorization.`;
    } else if (action === 'ROLLBACK') {
      impactLevel = 'MEDIUM';
      requiresConfirmation = true;
      safetyWarning = `Entity state restoration will create a forward-incremented rollback version.`;
    }

    const proposal: AICRUDProposal = {
      proposalId,
      nlPrompt: prompt,
      action,
      entity: targetEntity,
      suggestedPayload,
      filters,
      impactLevel,
      requiresConfirmation,
      safetyWarning,
      explanation: `AI Assistant interpreted intent as ${action} for ${targetEntity} with ${impactLevel} impact.`,
      timestamp: new Date().toISOString()
    };

    this.proposals.set(proposalId, proposal);
    return proposal;
  }

  /**
   * Retrieves a stored proposal
   */
  static getProposal(proposalId: string): AICRUDProposal | undefined {
    return this.proposals.get(proposalId);
  }
}
