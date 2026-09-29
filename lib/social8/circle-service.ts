import { prisma } from '@/lib/prisma';
import { CircleType, CirclePrivacy, CircleMemberRole } from '@prisma/client';

export interface CreateCircleInput {
  name: string;
  slug: string;
  description?: string;
  type?: CircleType;
  privacy?: CirclePrivacy;
  coverImage?: string;
  destinationId?: string;
  creatorId: string;
  rules?: string;
}

export interface CreateDiscussionInput {
  circleId: string;
  authorId: string;
  title: string;
  content: string;
  category?: string;
}

export class CircleService {
  /**
   * Create a new Travel Circle and assign creator as OWNER
   */
  static async createCircle(input: CreateCircleInput) {
    return prisma.$transaction(async (tx) => {
      const circle = await tx.circle.create({
        data: {
          name: input.name,
          slug: input.slug.toLowerCase().trim(),
          description: input.description,
          type: input.type ?? CircleType.INTEREST,
          privacy: input.privacy ?? CirclePrivacy.PUBLIC,
          coverImage: input.coverImage,
          destinationId: input.destinationId,
          creatorId: input.creatorId,
          rules: input.rules,
          memberCount: 1,
        },
      });

      await tx.circleMember.create({
        data: {
          circleId: circle.id,
          userId: input.creatorId,
          role: CircleMemberRole.OWNER,
        },
      });

      return circle;
    });
  }

  /**
   * Retrieve a Circle with its active members and recent discussions
   */
  static async getCircleBySlug(slug: string) {
    return prisma.circle.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        members: {
          take: 10,
          orderBy: { joinedAt: 'desc' },
        },
        discussions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            comments: {
              take: 5,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        trips: {
          where: { status: { in: ['PROPOSED', 'PLANNING', 'QUOTING'] } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * List discoverable circles with optional filters
   */
  static async listCircles(options?: { destinationId?: string; type?: CircleType; limit?: number }) {
    return prisma.circle.findMany({
      where: {
        isActive: true,
        privacy: { in: [CirclePrivacy.PUBLIC, CirclePrivacy.DISCOVERABLE] },
        ...(options?.destinationId ? { destinationId: options.destinationId } : {}),
        ...(options?.type ? { type: options.type } : {}),
      },
      take: options?.limit ?? 30,
      orderBy: [{ memberCount: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Join a Circle
   */
  static async joinCircle(circleId: string, userId: string, role: CircleMemberRole = CircleMemberRole.MEMBER) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.circleMember.findUnique({
        where: { circleId_userId: { circleId, userId } },
      });
      if (existing) {
        return existing;
      }

      const membership = await tx.circleMember.create({
        data: {
          circleId,
          userId,
          role,
        },
      });

      await tx.circle.update({
        where: { id: circleId },
        data: { memberCount: { increment: 1 } },
      });

      return membership;
    });
  }

  /**
   * Post a discussion in a circle with automatic travel intent detection (§16 conversion gate)
   */
  static async createDiscussion(input: CreateDiscussionInput) {
    const textToAnalyze = `${input.title} ${input.content}`.toLowerCase();
    const intentKeywords = [
      'group trip', 'planning to go', 'who wants to join', 'lets visit', 
      'travel dates', 'booking flights', 'looking for companions', 'trip proposal'
    ];
    const intentDetected = intentKeywords.some(kw => textToAnalyze.includes(kw));

    return prisma.$transaction(async (tx) => {
      const discussion = await tx.circleDiscussion.create({
        data: {
          circleId: input.circleId,
          authorId: input.authorId,
          title: input.title,
          content: input.content,
          category: input.category ?? (intentDetected ? 'TRIP_IDEA' : 'DISCUSSION'),
          intentDetected,
        },
      });

      await tx.circle.update({
        where: { id: input.circleId },
        data: { postCount: { increment: 1 } },
      });

      return discussion;
    });
  }

  /**
   * Add a reply comment to a circle discussion
   */
  static async addComment(discussionId: string, authorId: string, content: string) {
    return prisma.$transaction(async (tx) => {
      const comment = await tx.discussionComment.create({
        data: {
          discussionId,
          authorId,
          content,
        },
      });

      await tx.circleDiscussion.update({
        where: { id: discussionId },
        data: { commentCount: { increment: 1 } },
      });

      return comment;
    });
  }

  /**
   * Governed Journey Conversion Gate (§16):
   * DISCUSSION → INTENT DETECTED → JOURNEY PROPOSAL → GROUP FORMATION
   */
  static async proposeTripFromDiscussion(discussionId: string, tripData: {
    title: string;
    destinationId?: string;
    startDate?: Date;
    endDate?: Date;
    targetSize?: number;
  }) {
    const discussion = await prisma.circleDiscussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      throw new Error(`Discussion not found: ${discussionId}`);
    }

    return prisma.circleTrip.create({
      data: {
        circleId: discussion.circleId,
        title: tripData.title,
        destinationId: tripData.destinationId,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        targetSize: tripData.targetSize ?? 8,
        confirmedCount: 1,
        status: 'PROPOSED',
      },
    });
  }
}
