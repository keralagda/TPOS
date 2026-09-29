/**
 * Idea Discovery Engine Service
 * Conforms to §09 (09_IDEA_DISCOVERY_ENGINE.md) & §45 (45_IDEA_DISCOVERY_PROMPT_PACK.md)
 * Stages: CANDID8 → EVALU8 → EXPERIMEN8 → ADOP8 → ARCHIVE8
 */

import { prisma } from '@/lib/prisma';
import { IdeaStage } from '@prisma/client';

export interface CreateIdeaInput {
  title: string;
  problemStatement: string;
  targetPersona: string;
  sourceTrigger: string;
  hypothesis: string;
  proposedSolution: string;
  strategicFitScore?: number;
  feasibilityScore?: number;
  valueScore?: number;
  mappedEngine?: string;
  ownerId?: string;
}

export class IdeaDiscoveryService {
  /**
   * Create a new structured idea candidate
   */
  static async createCandidate(input: CreateIdeaInput) {
    return prisma.ideaCandidate.create({
      data: {
        title: input.title,
        problemStatement: input.problemStatement,
        targetPersona: input.targetPersona,
        sourceTrigger: input.sourceTrigger,
        hypothesis: input.hypothesis,
        proposedSolution: input.proposedSolution,
        strategicFitScore: input.strategicFitScore ?? 0.8,
        feasibilityScore: input.feasibilityScore ?? 0.8,
        valueScore: input.valueScore ?? 0.8,
        stage: IdeaStage.CANDID8,
        mappedEngine: input.mappedEngine,
        ownerId: input.ownerId,
      },
    });
  }

  /**
   * List idea candidates by stage or overall
   */
  static async listCandidates(stage?: IdeaStage) {
    return prisma.ideaCandidate.findMany({
      where: stage ? { stage } : undefined,
      include: {
        experiments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update candidate evaluation and transition stage
   */
  static async evaluateCandidate(
    id: string,
    updates: {
      strategicFitScore?: number;
      feasibilityScore?: number;
      valueScore?: number;
      stage?: IdeaStage;
    }
  ) {
    return prisma.ideaCandidate.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Spawn a micro-experiment for a candidate
   */
  static async createExperiment(ideaId: string, experiment: {
    hypothesis: string;
    metricToObserve: string;
    successThreshold: string;
    sampleSize?: number;
  }) {
    // Automatically transition candidate to EXPERIMEN8 stage
    await prisma.ideaCandidate.update({
      where: { id: ideaId },
      data: { stage: IdeaStage.EXPERIMEN8 },
    });

    return prisma.ideaExperiment.create({
      data: {
        ideaId,
        hypothesis: experiment.hypothesis,
        metricToObserve: experiment.metricToObserve,
        successThreshold: experiment.successThreshold,
        sampleSize: experiment.sampleSize || 100,
        status: 'RUNNING',
      },
    });
  }
}
