/**
 * HESTIA8 SCHEMA ENGINE
 * Generates Google & Perplexity-compliant JSON-LD Schema.org graphs for travel entities.
 */

import { TravelSchemaType } from './types';
import { JourneyLivingEntity, DestinationStudioModel } from '../vibe8/types';
import { HotelCardData } from '../vibe8/binding-service';

export class HESTIA8SchemaEngine {
  private static BASE_URL = 'https://travelplanet.io';

  /**
   * TravelAgency Organization Schema
   */
  static generateTravelAgencySchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      '@id': `${this.BASE_URL}/#agency`,
      name: 'Travel Planet OS',
      url: this.BASE_URL,
      logo: `${this.BASE_URL}/brand/logo.png`,
      description: 'Experiential travel creation and distribution operating system powering living journeys, authentic cultural tours, and curated luxury stays in South Asia.',
      telephone: '+91-9876543210',
      email: 'concierge@travelplanet.io',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kochi',
        addressRegion: 'Kerala',
        postalCode: '682001',
        addressCountry: 'IN'
      },
      priceRange: '₹₹ - ₹₹₹₹',
      currenciesAccepted: 'INR, USD, EUR, GBP, AED',
      paymentAccepted: 'Credit Card, UPI, Net Banking, Razorpay, Stripe'
    };
  }

  /**
   * TouristDestination Schema
   */
  static generateTouristDestinationSchema(dest: DestinationStudioModel) {
    return {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      '@id': `${this.BASE_URL}/destinations/${dest.slug}#destination`,
      name: dest.name,
      description: dest.overview.en,
      image: dest.heroImage,
      address: {
        '@type': 'PostalAddress',
        addressRegion: dest.region,
        addressCountry: dest.country
      },
      touristType: [
        'Luxury Travelers',
        'Cultural Enthusiasts',
        'Wellness & Ayurveda Seekers',
        'Eco Tourists'
      ],
      includesAttraction: dest.topAttractions.map(att => ({
        '@type': 'TouristAttraction',
        name: att.name,
        description: att.description
      }))
    };
  }

  /**
   * Trip & Living Journey Schema
   */
  static generateTripSchema(journey: JourneyLivingEntity) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Trip',
      '@id': `${this.BASE_URL}/journeys/${journey.slug}#trip`,
      name: journey.title,
      description: journey.summary,
      image: journey.heroImage,
      touristType: journey.theme,
      offers: {
        '@type': 'Offer',
        price: journey.pricing.basePrice,
        priceCurrency: journey.pricing.currency,
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: `${this.BASE_URL}/journeys/${journey.slug}`
      },
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: journey.itinerary.length,
        itemListElement: journey.itinerary.map(day => ({
          '@type': 'ListItem',
          position: day.dayNumber,
          item: {
            '@type': 'TravelAction',
            name: `Day ${day.dayNumber}: ${day.title}`,
            description: day.description,
            location: {
              '@type': 'Place',
              name: day.location
            }
          }
        }))
      },
      provider: {
        '@id': `${this.BASE_URL}/#agency`
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: journey.socialProof.rating,
        reviewCount: journey.socialProof.totalBookings,
        bestRating: 5,
        worstRating: 1
      }
    };
  }

  /**
   * Hotel Schema
   */
  static generateHotelSchema(hotel: HotelCardData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      '@id': `${this.BASE_URL}/hotels/${hotel.id}#hotel`,
      name: hotel.name,
      image: hotel.imageUrl,
      priceRange: `₹${hotel.pricePerNight} per night`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: hotel.destination
      },
      amenityFeature: hotel.amenities.map(a => ({
        '@type': 'LocationFeatureSpecification',
        name: a,
        value: true
      })),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: hotel.rating,
        reviewCount: hotel.reviewsCount
      }
    };
  }

  /**
   * FAQPage Schema for Answer Engine Optimization (Perplexity & Google AI Overviews)
   */
  static generateFAQPageSchema(faqs: { question: string; answer: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  /**
   * BreadcrumbList Schema
   */
  static generateBreadcrumbSchema(crumbs: { name: string; url: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${this.BASE_URL}${crumb.url}`
      }))
    };
  }

  /**
   * Generate Full Combined Knowledge Graph JSON-LD
   */
  static generateKnowledgeGraph(entities: {
    destination?: DestinationStudioModel;
    journey?: JourneyLivingEntity;
    faqs?: { question: string; answer: string }[];
  }) {
    const graph: any[] = [this.generateTravelAgencySchema()];

    if (entities.destination) {
      graph.push(this.generateTouristDestinationSchema(entities.destination));
    }

    if (entities.journey) {
      graph.push(this.generateTripSchema(entities.journey));
    }

    if (entities.faqs && entities.faqs.length > 0) {
      graph.push(this.generateFAQPageSchema(entities.faqs));
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph
    };
  }
}
