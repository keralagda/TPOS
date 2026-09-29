/**
 * Tour & In-App Guidance Engine for Travel Planet (Voyage8)
 * Conforms to §21 (21_HELP_CENTER_JOYRIDE.md)
 */

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  role?: string;
}

export interface TourDefinition {
  tourId: string;
  name: string;
  description: string;
  audience: 'ALL' | 'TRAVELER' | 'AGENT' | 'ADMIN';
  steps: TourStep[];
}

export const TOUR_REGISTRY: TourDefinition[] = [
  {
    tourId: 'welcome-voyage8',
    name: 'Welcome to Travel Planet (Voyage8)',
    description: 'An interactive 5-minute tour introducing the autonomous travel operating system.',
    audience: 'ALL',
    steps: [
      {
        target: 'body',
        placement: 'center',
        title: 'Welcome to Travel Planet (Voyage8)',
        content: 'Discover the next generation of cognitive travel. This platform integrates 16-stage itinerary synthesis, double-entry financial truth, and social travel graphs.',
      },
      {
        target: '[data-tour="ai-planner"]',
        placement: 'bottom',
        title: 'NVIDIA NIM Itinerary Synthesis',
        content: 'Synthesize custom multi-day travel plans instantly with pacing, live Pexels photography, and verified local recommendations.',
      },
      {
        target: '[data-tour="voice-assistant"]',
        placement: 'bottom',
        title: 'Voice AI Navigator (VN8/VO8)',
        content: 'Speak commands in English, Malayalam, or Hindi. Governed operations enforce RBAC role permissions before execution.',
      },
      {
        target: '[data-tour="social-circles"]',
        placement: 'top',
        title: 'Social8 Travel Graph',
        content: 'Join destination circles, plan group journeys, and convert discussions directly into verified quotes.',
      },
      {
        target: '[data-tour="gem-discovery"]',
        placement: 'top',
        title: 'GEM8 Beyond-The-Icon Discovery',
        content: 'Explore offbeat travel gems with multi-source provenance scoring to prevent AI hallucination.',
      },
      {
        target: '[data-tour="control-plane"]',
        placement: 'left',
        title: 'SaaS Control Plane & Feature Flags',
        content: 'Administrators control tenant modes, server-authoritative feature flags, and timed schedule OTA rollovers.',
      },
    ],
  },
  {
    tourId: 'agent-ops-flow',
    name: 'Agent Travel Operations (CRM → TMS)',
    description: 'Walkthrough for travel agents managing leads, quotes, and margin equations.',
    audience: 'AGENT',
    steps: [
      {
        target: '[data-tour="crm-leads"]',
        placement: 'bottom',
        title: 'CRM Leads & Enquiries Board',
        content: 'Review incoming customer leads and enquiries assigned to your agent tenant workspace.',
      },
      {
        target: '[data-tour="quote-calculator"]',
        placement: 'bottom',
        title: 'Quotation Engine & Margin Rules',
        content: 'Generate quotes with automated Net Margin, Agent Commission, and GST calculations.',
      },
      {
        target: '[data-tour="dms-templates"]',
        placement: 'left',
        title: 'DMS Document Engine',
        content: 'Generate tamper-evident vouchers with verifiable SHA-256 digital hashes.',
      },
    ],
  },
];
