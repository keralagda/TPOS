/**
 * VIBE8 CAMPAIGN STUDIO SERVICE
 * Generates omni-channel campaigns: Landing Page, SEO, Ads, WhatsApp, Instagram, and Email.
 */

export interface CampaignBlueprintInput {
  name: string;
  theme: 'ONAM_FESTIVAL' | 'DIWALI_ESCAPE' | 'MONSOON_BLISS' | 'CHRISTMAS_NEW_YEAR' | 'SUMMER_COOL_RETREAT' | 'CUSTOM';
  destination: string;
  targetAudience: 'LUXURY_COUPLES' | 'FAMILY_HOLIDAY' | 'NRI_HOMECOMING' | 'ADVENTURE_GROUPS' | 'CORPORATE_RETREAT';
  budgetTier: 'AFFORDABLE_LUXURY' | 'ULTRA_LUXURY' | 'PREMIUM_STANDARD';
  offerDiscountPercent?: number;
  startDate: string;
  endDate: string;
}

export interface GeneratedCampaign {
  id: string;
  name: string;
  slug: string;
  theme: string;
  destination: string;
  status: 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'ARCHIVED';
  utmParams: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
  };
  landingPage: {
    heroHeadline: string;
    subheadline: string;
    ctaText: string;
    exclusivePerks: string[];
  };
  seoConfig: {
    title: string;
    metaDescription: string;
    targetKeywords: string[];
  };
  socialAssets: {
    instagramCaption: string;
    instagramHashtags: string[];
    adCopy: {
      headline: string;
      primaryText: string;
      callToAction: string;
    };
  };
  messaging: {
    whatsappTemplate: {
      en: string;
      ml: string;
      hi: string;
    };
    emailNewsletter: {
      subject: string;
      previewText: string;
      bodyMarkdown: string;
    };
  };
  conversionMetrics: {
    impressions: number;
    clicks: number;
    inquiries: number;
    conversions: number;
    roiEstimate: string;
  };
}

const SEED_CAMPAIGNS: GeneratedCampaign[] = [
  {
    id: 'camp-onam-2026',
    name: 'Onam Grandeur & Backwater Splendor 2026',
    slug: 'onam-backwater-splendor-2026',
    theme: 'ONAM_FESTIVAL',
    destination: 'Kerala Backwaters & Munnar',
    status: 'ACTIVE',
    utmParams: {
      utm_source: 'omni_campaign_engine',
      utm_medium: 'digital_growth',
      utm_campaign: 'onam_grandeur_2026'
    },
    landingPage: {
      heroHeadline: 'Experience the Majestic Spirit of Onam in God’s Own Country',
      subheadline: 'Exclusive private houseboat feasts (Onasadya with 26 dishes), Aranmula Snake Boat Procession VIP access, and mist-wrapped tea hills.',
      ctaText: 'Claim 15% Festive Privilege Pass',
      exclusivePerks: [
        'Private Sadya feast prepared by master chefs on luxury solar houseboats',
        'VIP viewing gallery for Aranmula Uthrattathi Vallamkali',
        'Ayurvedic herbal gift hamper curated for each traveler',
        'Dedicated 24/7 personal trip concierge'
      ]
    },
    seoConfig: {
      title: 'Kerala Onam Tour Packages 2026 | Luxury Houseboat & Vallamkali Experiences',
      metaDescription: 'Celebrate Onam 2026 in Kerala with Travel Planet OS. Handcrafted private houseboat itineraries, traditional 26-dish Onasadya, and Aranmula snake boat races.',
      targetKeywords: ['onam tour packages 2026', 'kerala onam holiday', 'luxury houseboat onasadya', 'aranmula snake boat race tour']
    },
    socialAssets: {
      instagramCaption: 'Celebrate the Homecoming of King Mahabali amidst whispering palm groves and golden sunsets. 🌸⛵ Indulge in an authentic 26-course Onasadya aboard a private luxury houseboat in Alleppey.',
      instagramHashtags: ['#Onam2026', '#KeralaTourism', '#LivingJourney', '#TravelPlanetOS', '#HouseboatKerala', '#IncredibleIndia'],
      adCopy: {
        headline: 'Celebrate Onam in Kerala: Up to 15% Early-Bird Privilege',
        primaryText: 'Limited private houseboats reserved for Aranmula boat races and traditional Onasadya. Handcrafted with 24/7 concierge.',
        callToAction: 'Book Festive Escape'
      }
    },
    messaging: {
      whatsappTemplate: {
        en: '🌸 *Namaskaram from Travel Planet!* Onam celebrations have officially begun. Reserve your private luxury houseboat and authentic Onasadya in Alleppey with early-bird privileges. Reply *ONAM* to receive the curated itinerary.',
        ml: '🌸 *ഓണാശംസകൾ!* ട്രാവൽ പ്ലാനറ്റ് ഒരുക്കുന്ന പ്രത്യേക ഓണം പാക്കേജുകൾ: ആഡംബര ഹൗസ്ബോട്ടിൽ 26 വിഭവങ്ങളടങ്ങിയ ഓണസദ്യയും ആറന്മുള വള്ളംകളി കാഴ്ചകളും. കൂടുതൽ വിവരങ്ങൾക്ക് *ONAM* എന്ന് മറുപടി നൽകുക.',
        hi: '🌸 *ट्रैवल प्लैनेट की ओर से ओणम की शुभकामनाएं!* केरल के प्रसिद्ध बैकवाटर्स में निजी हाउसबोट और पारंपरिक ओणसद्या का आनंद लें। विशेष उत्सव छूट के लिए *ONAM* रिप्लाई करें।'
      },
      emailNewsletter: {
        subject: 'Celebrate Onam 2026 in Kerala: Private Houseboats & Royal Feasts Await',
        previewText: 'Experience the true majesty of God’s Own Country during the festive season of joy and unity.',
        bodyMarkdown: '## Golden Backwaters & Festive Joy\n\nThere is no season quite like Onam to witness Kerala in its full cultural grandeur.\n\nFrom the thunderous rhythm of the Aranmula snake boat races to the fragrant aroma of steaming red rice and jaggery payasam, this journey is created for those who seek authentic cultural immersion.\n\n### Exclusive Campaign Inclusions:\n- 4 Nights / 5 Days Curated Living Itinerary\n- Private Chef-prepared Grand Onasadya\n- VIP Viewing of Aranmula Vallamkali\n- Complimentary 60-Minute Ayurvedic Rejuvenation\n\n[Explore Living Journey Itinerary](https://travelplanet.io/journeys/kerala-monsoon-soul-journey)'
      }
    },
    conversionMetrics: {
      impressions: 48200,
      clicks: 3410,
      inquiries: 184,
      conversions: 32,
      roiEstimate: '4.8x'
    }
  }
];

export class VIBE8CampaignService {
  private static campaigns: GeneratedCampaign[] = [...SEED_CAMPAIGNS];

  /**
   * List all campaigns
   */
  static listCampaigns(): GeneratedCampaign[] {
    return this.campaigns;
  }

  /**
   * Get Campaign by ID or slug
   */
  static getCampaign(id: string): GeneratedCampaign | undefined {
    return this.campaigns.find(c => c.id === id || c.slug === id);
  }

  /**
   * Synthesize Omni-Channel Campaign from Theme, Destination & Audience
   */
  static generateCampaign(input: CampaignBlueprintInput): GeneratedCampaign {
    const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const discount = input.offerDiscountPercent || 10;

    const newCampaign: GeneratedCampaign = {
      id: `camp-${Date.now()}`,
      name: input.name,
      slug,
      theme: input.theme,
      destination: input.destination,
      status: 'ACTIVE',
      utmParams: {
        utm_source: 'hestia8_omni_engine',
        utm_medium: 'growth_campaign',
        utm_campaign: slug
      },
      landingPage: {
        heroHeadline: `Discover ${input.destination}: Tailored ${input.budgetTier.replace('_', ' ')} Experiences`,
        subheadline: `Handcrafted experiential travel package with live concierge adaptation, verified local experts, and exclusive ${discount}% launch privilege.`,
        ctaText: `Claim ${discount}% Special Privilege`,
        exclusivePerks: [
          `Complimentary local storyteller tour across ${input.destination}`,
          `Real-time weather & crowd-adaptive itinerary guarantee`,
          `Flexible cancellation & instant priority support`,
          `Bespoke culinary experience and curated stay accommodations`
        ]
      },
      seoConfig: {
        title: `${input.name} | ${input.destination} Experiential Packages 2026`,
        metaDescription: `Book your ${input.theme} getaway to ${input.destination}. Includes boutique stays, cultural tours, and 24/7 concierge support. Save ${discount}% today.`,
        targetKeywords: [
          `${input.destination.toLowerCase()} tour packages`,
          `${input.destination.toLowerCase()} ${input.theme.toLowerCase()}`,
          `luxury stays in ${input.destination.toLowerCase()}`
        ]
      },
      socialAssets: {
        instagramCaption: `Escape into pure wonder in ${input.destination}. ✨ Indulge in handpicked boutique stays, private heritage tours, and authentic regional gastronomy with Travel Planet OS.\n\nEnjoy ${discount}% special privilege for upcoming departures!`,
        instagramHashtags: [
          `#${input.destination.replace(/[\s,]+/g, '')}`,
          '#TravelPlanetOS',
          '#LivingJourney',
          '#Wanderlust2026',
          '#BoutiqueTravel'
        ],
        adCopy: {
          headline: `${input.destination} Awaits: Exclusive ${discount}% Privilege`,
          primaryText: `Unlock unforgettable travel in ${input.destination}. Curated luxury stays and real-time living concierge support.`,
          callToAction: 'Claim Your Privilege'
        }
      },
      messaging: {
        whatsappTemplate: {
          en: `✨ *Exclusive Invitation from Travel Planet OS!*\nPlan your dream journey to *${input.destination}* with our special *${discount}% privilege*.\nReply *EXPLORE* to view the living itinerary and dates.`,
          ml: `✨ *ട്രാവൽ പ്ലാനറ്റ് പ്രത്യേക ഓഫർ!*\n*${input.destination}* ലേക്കുള്ള ആകർഷകമായ യാത്രാ പാക്കേജിൽ *${discount}% ഇളവ്* സ്വന്തമാക്കൂ. വിവരങ്ങൾക്കായി *EXPLORE* എന്ന് മെസ്സേജ് അയക്കൂ.`,
          hi: `✨ *ट्रैवल प्लैनेट का विशेष निमंत्रण!*\n*${input.destination}* के लिए हमारे खास टूर पैकेज पर *${discount}% छूट* पाएं। पूरा यात्रा कार्यक्रम देखने के लिए *EXPLORE* लिखकर भेजें।`
        },
        emailNewsletter: {
          subject: `Exclusive Invitation: Experience ${input.destination} with ${discount}% Privilege`,
          previewText: `Your private escape to ${input.destination} is now open for bookings.`,
          bodyMarkdown: `## Unwind in ${input.destination}\n\nWe have unveiled a brand-new Living Journey tailored specifically for discerning travelers.\n\n### What awaits you:\n- Handpicked boutique & heritage luxury accommodations\n- Private experiential storyteller walks\n- 24/7 local concierge on your mobile\n\nUse your special ${discount}% privilege today.\n\n[View Full Campaign Landing Page](https://travelplanet.io/campaigns/${slug})`
        }
      },
      conversionMetrics: {
        impressions: 1200,
        clicks: 95,
        inquiries: 8,
        conversions: 2,
        roiEstimate: '3.6x'
      }
    };

    this.campaigns.unshift(newCampaign);
    return newCampaign;
  }
}
