import { prisma } from '@/lib/prisma';
import { GemClassification, GemVerificationStatus } from '@prisma/client';

export interface CreateGemInput {
  name: string;
  slug: string;
  description: string;
  destinationId: string;
  iconicPairingPlaceId?: string;
  classification?: GemClassification;
  bestTimeToVisit?: string;
  accessibilityNotes?: string;
  safetyNotes?: string;
  confidenceScore?: number;
  verificationStatus?: GemVerificationStatus;
  tags?: string[];
  images?: string[];
  initialProvenance?: {
    sourceType: string;
    sourceRef?: string;
    authorName?: string;
    evidenceNote: string;
    confidence?: number;
  };
}

export class GemService {
  /**
   * Create a new GEM8 Beyond-The-Icon Discovery entry with provenance tracking
   */
  static async createGem(input: CreateGemInput) {
    return prisma.gemDiscovery.create({
      data: {
        name: input.name,
        slug: input.slug.toLowerCase().trim(),
        description: input.description,
        destinationId: input.destinationId,
        iconicPairingPlaceId: input.iconicPairingPlaceId,
        classification: input.classification ?? GemClassification.OFFBEAT,
        bestTimeToVisit: input.bestTimeToVisit,
        accessibilityNotes: input.accessibilityNotes,
        safetyNotes: input.safetyNotes,
        confidenceScore: input.confidenceScore ?? 0.85,
        verificationStatus: input.verificationStatus ?? GemVerificationStatus.PUBLISHED,
        tags: input.tags ?? [],
        images: input.images ?? [],
        ...(input.initialProvenance ? {
          provenanceEntries: {
            create: {
              sourceType: input.initialProvenance.sourceType,
              sourceRef: input.initialProvenance.sourceRef,
              authorName: input.initialProvenance.authorName,
              evidenceNote: input.initialProvenance.evidenceNote,
              confidence: input.initialProvenance.confidence ?? 0.9,
            },
          },
        } : {}),
      },
      include: {
        provenanceEntries: true,
      },
    });
  }

  /**
   * Get a Gem discovery by slug including full provenance evidence
   */
  static async getGemBySlug(slug: string) {
    return prisma.gemDiscovery.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        provenanceEntries: {
          orderBy: { lastVerifiedAt: 'desc' },
        },
      },
    });
  }

  /**
   * List verified Gems with filtering
   */
  static async listGems(options?: {
    destinationId?: string;
    classification?: GemClassification;
    limit?: number;
  }) {
    return prisma.gemDiscovery.findMany({
      where: {
        verificationStatus: GemVerificationStatus.PUBLISHED,
        ...(options?.destinationId ? { destinationId: options.destinationId } : {}),
        ...(options?.classification ? { classification: options.classification } : {}),
      },
      include: {
        provenanceEntries: {
          take: 1,
          orderBy: { confidence: 'desc' },
        },
      },
      take: options?.limit ?? 20,
      orderBy: { confidenceScore: 'desc' },
    });
  }

  /**
   * Retrieve Beyond-The-Icon alternatives linked to an iconic landmark (§17)
   */
  static async getGemsForIconicPairing(iconicPairingPlaceId: string) {
    return prisma.gemDiscovery.findMany({
      where: {
        iconicPairingPlaceId,
        verificationStatus: GemVerificationStatus.PUBLISHED,
      },
      include: {
        provenanceEntries: {
          take: 2,
          orderBy: { confidence: 'desc' },
        },
      },
      orderBy: { confidenceScore: 'desc' },
    });
  }

  /**
   * Add new evidence/provenance record to an existing Gem
   */
  static async addProvenance(gemId: string, provenance: {
    sourceType: string;
    sourceRef?: string;
    authorName?: string;
    evidenceNote: string;
    confidence?: number;
  }) {
    return prisma.gemProvenance.create({
      data: {
        gemId,
        sourceType: provenance.sourceType,
        sourceRef: provenance.sourceRef,
        authorName: provenance.authorName,
        evidenceNote: provenance.evidenceNote,
        confidence: provenance.confidence ?? 0.85,
      },
    });
  }
}
