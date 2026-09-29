/**
 * HESTIA8 TRAVEL ENTITY GRAPH & INTERNAL LINKING ENGINE
 * Maps travel entities into a semantically linked graph and generates high-value internal links.
 * Hierarchy: Destination -> Experiences -> Hotels -> Packages -> Guides -> Stories -> Journeys
 */

import { EntityGraphNode, InternalLinkingRecommendation } from './types';

export class HESTIA8EntityGraphEngine {
  private static nodes: Map<string, EntityGraphNode> = new Map();

  // Initialize seed travel knowledge graph
  static {
    const seedNodes: EntityGraphNode[] = [
      {
        id: 'dest-kerala',
        name: 'Kerala',
        entityType: 'DESTINATION',
        slug: 'kerala',
        schemaType: 'TouristDestination',
        inboundLinksCount: 14,
        outboundLinksCount: 22,
        topicalCluster: 'South India Cultural & Wellness Tourism',
        connectedEntities: [
          { targetId: 'exp-backwaters', relationType: 'OFFERS_EXPERIENCE', weight: 0.95 },
          { targetId: 'exp-ayurveda', relationType: 'OFFERS_EXPERIENCE', weight: 0.92 },
          { targetId: 'journey-kerala-soul', relationType: 'CHILD_OF', weight: 0.88 },
          { targetId: 'hotel-kumarakom', relationType: 'RECOMMENDS_STAY', weight: 0.85 }
        ]
      },
      {
        id: 'exp-backwaters',
        name: 'Alleppey & Kumarakom Houseboat Living',
        entityType: 'EXPERIENCE',
        slug: 'kerala-backwaters-houseboat',
        schemaType: 'TouristAttraction',
        inboundLinksCount: 9,
        outboundLinksCount: 12,
        topicalCluster: 'South India Cultural & Wellness Tourism',
        connectedEntities: [
          { targetId: 'dest-kerala', relationType: 'LOCATED_IN', weight: 0.95 },
          { targetId: 'hotel-kumarakom', relationType: 'RECOMMENDS_STAY', weight: 0.9 },
          { targetId: 'journey-kerala-soul', relationType: 'CHILD_OF', weight: 0.92 }
        ]
      },
      {
        id: 'journey-kerala-soul',
        name: 'Kerala Monsoon & Soul Awakening',
        entityType: 'JOURNEY',
        slug: 'kerala-monsoon-soul-journey',
        schemaType: 'Trip',
        inboundLinksCount: 18,
        outboundLinksCount: 15,
        topicalCluster: 'South India Cultural & Wellness Tourism',
        connectedEntities: [
          { targetId: 'dest-kerala', relationType: 'LOCATED_IN', weight: 0.95 },
          { targetId: 'exp-backwaters', relationType: 'OFFERS_EXPERIENCE', weight: 0.9 },
          { targetId: 'hotel-kumarakom', relationType: 'RECOMMENDS_STAY', weight: 0.88 }
        ]
      },
      {
        id: 'hotel-kumarakom',
        name: 'Kumarakom Lake Resort',
        entityType: 'HOTEL',
        slug: 'kumarakom-lake-resort',
        schemaType: 'Hotel',
        inboundLinksCount: 7,
        outboundLinksCount: 6,
        topicalCluster: 'South India Cultural & Wellness Tourism',
        connectedEntities: [
          { targetId: 'dest-kerala', relationType: 'LOCATED_IN', weight: 0.95 },
          { targetId: 'exp-backwaters', relationType: 'COMPLEMENTARY_TO', weight: 0.85 }
        ]
      },
      {
        id: 'guide-monsoon-kerala',
        name: 'Complete Guide to Kerala in Monsoon',
        entityType: 'GUIDE',
        slug: 'complete-guide-kerala-monsoon',
        schemaType: 'Article',
        inboundLinksCount: 6,
        outboundLinksCount: 8,
        topicalCluster: 'South India Cultural & Wellness Tourism',
        connectedEntities: [
          { targetId: 'dest-kerala', relationType: 'LOCATED_IN', weight: 0.9 },
          { targetId: 'journey-kerala-soul', relationType: 'COMPLEMENTARY_TO', weight: 0.92 }
        ]
      },
      {
        id: 'dest-rajasthan',
        name: 'Rajasthan',
        entityType: 'DESTINATION',
        slug: 'rajasthan',
        schemaType: 'TouristDestination',
        inboundLinksCount: 16,
        outboundLinksCount: 19,
        topicalCluster: 'Royal Heritage & Desert Safaris',
        connectedEntities: [
          { targetId: 'journey-rajasthan-royal', relationType: 'CHILD_OF', weight: 0.94 },
          { targetId: 'hotel-taj-lake', relationType: 'RECOMMENDS_STAY', weight: 0.9 }
        ]
      },
      {
        id: 'journey-rajasthan-royal',
        name: 'Royal Heritage & Desert Whispers',
        entityType: 'JOURNEY',
        slug: 'rajasthan-royal-heritage-desert-whispers',
        schemaType: 'Trip',
        inboundLinksCount: 12,
        outboundLinksCount: 14,
        topicalCluster: 'Royal Heritage & Desert Safaris',
        connectedEntities: [
          { targetId: 'dest-rajasthan', relationType: 'LOCATED_IN', weight: 0.95 },
          { targetId: 'hotel-taj-lake', relationType: 'RECOMMENDS_STAY', weight: 0.92 }
        ]
      },
      {
        id: 'hotel-taj-lake',
        name: 'Taj Lake Palace Udaipur',
        entityType: 'HOTEL',
        slug: 'taj-lake-palace-udaipur',
        schemaType: 'Hotel',
        inboundLinksCount: 8,
        outboundLinksCount: 5,
        topicalCluster: 'Royal Heritage & Desert Safaris',
        connectedEntities: [
          { targetId: 'dest-rajasthan', relationType: 'LOCATED_IN', weight: 0.95 },
          { targetId: 'journey-rajasthan-royal', relationType: 'COMPLEMENTARY_TO', weight: 0.9 }
        ]
      }
    ];

    for (const node of seedNodes) {
      this.nodes.set(node.id, node);
    }
  }

  /**
   * Get all registered Entity Graph Nodes
   */
  static getAllNodes(): EntityGraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get Node by ID
   */
  static getNode(id: string): EntityGraphNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Register or Update an Entity Node
   */
  static registerNode(node: EntityGraphNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Generate Automated Internal Linking Recommendations following hierarchical flow
   * Destination -> Experiences -> Hotels -> Packages -> Guides -> Stories -> Journeys
   */
  static generateInternalLinkingRecommendations(): InternalLinkingRecommendation[] {
    const recommendations: InternalLinkingRecommendation[] = [];

    // Analyze nodes and uncover missing or high-potential connections
    this.nodes.forEach(source => {
      if (source.entityType === 'DESTINATION') {
        // Destination should link to its Living Journeys & Experiences
        const connectedJourneys = source.connectedEntities.filter(c => c.relationType === 'CHILD_OF');
        if (connectedJourneys.length > 0) {
          const journeyNode = this.nodes.get(connectedJourneys[0].targetId);
          if (journeyNode) {
            recommendations.push({
              sourceEntityId: source.id,
              sourceEntityTitle: source.name,
              sourceType: source.entityType,
              targetEntityId: journeyNode.id,
              targetEntityTitle: journeyNode.name,
              targetType: journeyNode.entityType,
              suggestedAnchorText: `discover the living journey in ${source.name}`,
              suggestedParagraphContext: `For travelers seeking deeper cultural immersion, explore how our dynamic itinerary adapts in real-time.`,
              hierarchicalRelation: 'DESTINATION_TO_EXPERIENCE',
              growthPotential: 'CRITICAL'
            });
          }
        }
      }

      if (source.entityType === 'GUIDE') {
        // Guide should link to Living Journeys and Hotels
        const connectedLiving = source.connectedEntities.find(c => c.relationType === 'COMPLEMENTARY_TO');
        if (connectedLiving) {
          const target = this.nodes.get(connectedLiving.targetId);
          if (target) {
            recommendations.push({
              sourceEntityId: source.id,
              sourceEntityTitle: source.name,
              sourceType: source.entityType,
              targetEntityId: target.id,
              targetEntityTitle: target.name,
              targetType: target.entityType,
              suggestedAnchorText: `handcrafted ${target.name}`,
              suggestedParagraphContext: `Rather than organizing transfers and boat permits independently, consider reserving the complete vetted itinerary.`,
              hierarchicalRelation: 'GUIDE_TO_STORY',
              growthPotential: 'HIGH'
            });
          }
        }
      }

      if (source.entityType === 'HOTEL') {
        // Hotel should link to complementary experiences in that destination
        const dest = source.connectedEntities.find(c => c.relationType === 'LOCATED_IN');
        if (dest) {
          recommendations.push({
            sourceEntityId: source.id,
            sourceEntityTitle: source.name,
            sourceType: source.entityType,
            targetEntityId: dest.targetId,
            targetEntityTitle: dest.targetId.replace('dest-', ''),
            targetType: 'DESTINATION',
            suggestedAnchorText: `explore nearby attractions and heritage trails`,
            suggestedParagraphContext: `Guests staying at ${source.name} can easily take day excursions to the surrounding region.`,
            hierarchicalRelation: 'HOTEL_TO_PACKAGE',
            growthPotential: 'MEDIUM'
          });
        }
      }
    });

    return recommendations;
  }

  /**
   * Calculate Graph Health Metrics
   */
  static getGraphHealthMetrics() {
    const nodes = this.getAllNodes();
    const totalNodes = nodes.length;
    let totalLinks = 0;
    let orphanCount = 0;

    nodes.forEach(n => {
      totalLinks += n.connectedEntities.length;
      if (n.inboundLinksCount === 0) orphanCount++;
    });

    const averageDegree = totalNodes > 0 ? Number((totalLinks / totalNodes).toFixed(1)) : 0;
    const healthScore = Math.max(0, 100 - (orphanCount * 15));

    return {
      totalNodes,
      totalLinks,
      orphanCount,
      averageDegree,
      healthScore,
      clustersCount: 2
    };
  }
}
