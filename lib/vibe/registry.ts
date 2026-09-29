/**
 * VIBE Registry (§08-§10, §26, §36)
 * Metadata-driven definitions. Builder, renderer, validator and AI assist all
 * read from these registries — the single source of truth for what can be composed.
 *
 * DB mirrors (ComponentDefinition/SectionDefinition/ExperienceTemplate/WidgetDefinition)
 * are seeded from here; at runtime the registry is authoritative so rendering never
 * depends on editor state.
 */

import { ExperienceTypeValue } from './types';

// ---------- Component registry ----------

export type PropValueType =
  | 'string' | 'number' | 'boolean' | 'image' | 'video' | 'richtext'
  | 'color' | 'select' | 'multiselect' | 'json' | 'dataSource';

export interface PropFieldDef {
  type: PropValueType;
  label: string;
  required?: boolean;
  options?: string[];
  default?: unknown;
  bindable?: boolean;
  description?: string;
}

export interface ComponentDef {
  key: string;
  name: string;
  category: 'GENERIC' | 'TRAVEL' | 'DASHBOARD';
  version: number;
  description: string;
  propsSchema: Record<string, PropFieldDef>;
  /** allowed binding roots for this component (whitelist) */
  bindingRoots: string[];
  events: string[];
  supportedActions: string[];
  /** container components accept children */
  container: boolean;
  /** dashboards restrict to grid layout */
  gridOnly: boolean;
  status: 'ACTIVE' | 'DEPRECATED';
  a11y: string[];
}

const text = (label: string, required = false): PropFieldDef => ({ type: 'string', label, required, bindable: true });

export const COMPONENT_REGISTRY: Record<string, ComponentDef> = {
  // ----- Generic -----
  heading: {
    key: 'heading', name: 'Heading', category: 'GENERIC', version: 1,
    description: 'Section heading with optional eyebrow label.',
    propsSchema: { text: text('Text', true), eyebrow: text('Eyebrow'), level: { type: 'select', label: 'Level', options: ['h1', 'h2', 'h3', 'h4'], default: 'h2' } },
    bindingRoots: ['entity', 'currentUser', 'runtime'], events: [], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['semantic heading level'],
  },
  richText: {
    key: 'richText', name: 'Rich Text', category: 'GENERIC', version: 1,
    description: 'Sanitized rich text block.',
    propsSchema: { html: { type: 'richtext', label: 'Content', required: true, bindable: true } },
    bindingRoots: ['entity', 'currentUser'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['sanitized HTML only'],
  },
  image: {
    key: 'image', name: 'Image', category: 'GENERIC', version: 1,
    description: 'Optimized responsive image.',
    propsSchema: { src: { type: 'image', label: 'Image', required: true, bindable: true }, alt: text('Alt text', true), caption: text('Caption') },
    bindingRoots: ['entity'], events: [], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['alt text required'],
  },
  button: {
    key: 'button', name: 'Button', category: 'GENERIC', version: 1,
    description: 'Call-to-action button bound to a structured action.',
    propsSchema: { label: text('Label', true), variant: { type: 'select', label: 'Variant', options: ['primary', 'secondary', 'ghost'], default: 'primary' } },
    bindingRoots: ['entity', 'currentUser'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'SUBMIT_FORM', 'BOOK', 'ADD_TO_JOURNEY', 'START_WORKFLOW', 'OPEN_MODAL'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['keyboard focusable'],
  },
  badge: {
    key: 'badge', name: 'Badge', category: 'GENERIC', version: 1,
    description: 'Small status/label chip.',
    propsSchema: { text: text('Text', true), tone: { type: 'select', label: 'Tone', options: ['sky', 'emerald', 'amber', 'rose', 'slate'], default: 'sky' } },
    bindingRoots: ['entity'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: [],
  },
  grid: {
    key: 'grid', name: 'Grid', category: 'GENERIC', version: 1,
    description: 'Responsive column grid container.',
    propsSchema: { columns: { type: 'number', label: 'Columns', default: 3 }, gap: { type: 'select', label: 'Gap', options: ['sm', 'md', 'lg'], default: 'md' } },
    bindingRoots: [], events: [], supportedActions: [],
    container: true, gridOnly: false, status: 'ACTIVE', a11y: ['semantic list when repeating'],
  },
  divider: {
    key: 'divider', name: 'Divider', category: 'GENERIC', version: 1,
    description: 'Horizontal rule / section break.',
    propsSchema: {}, bindingRoots: [], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['decorative hr'],
  },
  accordion: {
    key: 'accordion', name: 'Accordion', category: 'GENERIC', version: 1,
    description: 'Collapsible item list (FAQ).',
    propsSchema: { items: { type: 'json', label: 'Items [{question, answer}]', required: true, bindable: true } },
    bindingRoots: ['entity'], events: ['CLICK'], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['aria-expanded'],
  },
  hero: {
    key: 'hero', name: 'Hero', category: 'GENERIC', version: 1,
    description: 'Full-width hero with media, title, subtitle and CTA.',
    propsSchema: {
      title: text('Title', true), subtitle: text('Subtitle'),
      mediaUrl: { type: 'image', label: 'Background media', bindable: true },
      variant: { type: 'select', label: 'Variant', options: ['FULLSCREEN', 'SPLIT', 'EDITORIAL', 'IMMERSIVE', 'MINIMAL'], default: 'FULLSCREEN' },
      ctaLabel: text('CTA label'), ctaTarget: text('CTA path'),
    },
    bindingRoots: ['entity', 'currentUser'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'BOOK'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['heading present', 'contrast overlay'],
  },

  // ----- Travel components -----
  destinationCard: {
    key: 'destinationCard', name: 'Destination Card', category: 'TRAVEL', version: 1,
    propsSchema: { destination: { type: 'dataSource', label: 'Destination', required: true, bindable: true }, showPrice: { type: 'boolean', label: 'Show price', default: true } },
    bindingRoots: ['destination', 'product'], events: ['CLICK'], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['link card'],
    description: 'Destination summary card.',
  },
  placeCard: {
    key: 'placeCard', name: 'Place Card', category: 'TRAVEL', version: 1,
    propsSchema: { place: { type: 'dataSource', label: 'Place', required: true, bindable: true } },
    bindingRoots: ['place'], events: ['CLICK'], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['link card'],
    description: 'Place summary card.',
  },
  journeyCard: {
    key: 'journeyCard', name: 'Journey Card', category: 'TRAVEL', version: 1,
    propsSchema: { journey: { type: 'dataSource', label: 'Journey', required: true, bindable: true }, showDays: { type: 'boolean', label: 'Show duration', default: true } },
    bindingRoots: ['journey'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'ADD_TO_JOURNEY'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['link card'],
    description: 'Journey summary card.',
  },
  diaryCard: {
    key: 'diaryCard', name: 'Diary Card', category: 'TRAVEL', version: 1,
    propsSchema: { diary: { type: 'dataSource', label: 'Diary', required: true, bindable: true } },
    bindingRoots: ['diary'], events: ['CLICK'], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['link card'],
    description: 'Travel diary teaser card.',
  },
  productCard: {
    key: 'productCard', name: 'Product Card', category: 'TRAVEL', version: 1,
    propsSchema: { product: { type: 'dataSource', label: 'Product (hotel/experience/package)', required: true, bindable: true } },
    bindingRoots: ['product'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'BOOK'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['link card'],
    description: 'Hotel / experience / package card.',
  },
  journeyTimeline: {
    key: 'journeyTimeline', name: 'Journey Timeline', category: 'TRAVEL', version: 1,
    propsSchema: { days: { type: 'dataSource', label: 'Journey days', required: true, bindable: true } },
    bindingRoots: ['journey.days'], events: ['CLICK'], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['ordered list'],
    description: 'Day-by-day journey timeline.',
  },
  routeMap: {
    key: 'routeMap', name: 'Route Map', category: 'TRAVEL', version: 1,
    propsSchema: { points: { type: 'dataSource', label: 'Map points', required: true, bindable: true }, title: text('Title') },
    bindingRoots: ['journey', 'place'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['text alternative list of stops'],
    description: 'Static route/place map with stop list.',
  },
  travelBudget: {
    key: 'travelBudget', name: 'Travel Budget', category: 'TRAVEL', version: 1,
    propsSchema: { budget: { type: 'dataSource', label: 'Budget data', required: true, bindable: true } },
    bindingRoots: ['journey.budgetRange'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['table semantics'],
    description: 'Budget breakdown panel.',
  },
  travelTip: {
    key: 'travelTip', name: 'Travel Tip', category: 'TRAVEL', version: 1,
    propsSchema: { title: text('Title'), body: text('Body', true), icon: { type: 'select', label: 'Icon', options: ['lightbulb', 'shield', 'cloud', 'wallet'], default: 'lightbulb' } },
    bindingRoots: ['entity'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['aside element'],
    description: 'Highlighted practical tip.',
  },
  travelAdvisory: {
    key: 'travelAdvisory', name: 'Travel Advisory', category: 'TRAVEL', version: 1,
    propsSchema: { text: text('Advisory', true), severity: { type: 'select', label: 'Severity', options: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' } },
    bindingRoots: ['insights', 'entity'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['role=status'],
    description: 'Advisory banner (e.g. traveler diary reports).',
  },
  weatherStrip: {
    key: 'weatherStrip', name: 'Weather & Best Time', category: 'TRAVEL', version: 1,
    propsSchema: { bestTime: text('Best time', true, ), seasonNotes: text('Season notes') },
    bindingRoots: ['entity', 'insights'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: [],
    description: 'Best-time-to-visit / season panel.',
  },
  gallery: {
    key: 'gallery', name: 'Gallery', category: 'TRAVEL', version: 1,
    propsSchema: { images: { type: 'dataSource', label: 'Images', required: true, bindable: true }, columns: { type: 'number', label: 'Columns', default: 3 } },
    bindingRoots: ['entity.gallery'], events: ['CLICK'], supportedActions: ['OPEN_MODAL'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['alt on every image'],
    description: 'Photo gallery grid.',
  },
  reviewList: {
    key: 'reviewList', name: 'Reviews', category: 'TRAVEL', version: 1,
    propsSchema: { reviews: { type: 'dataSource', label: 'Reviews', required: true, bindable: true } },
    bindingRoots: ['product.reviews'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['blockquote'],
    description: 'Guest reviews list.',
  },
  availability: {
    key: 'availability', name: 'Availability', category: 'TRAVEL', version: 1,
    propsSchema: { productId: text('Product id', true) },
    bindingRoots: ['product'], events: ['SEARCH'], supportedActions: ['CALL_API', 'BOOK'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: [],
    description: 'Live availability lookup (Connect Hub).',
  },
  bookingCta: {
    key: 'bookingCta', name: 'Booking CTA', category: 'TRAVEL', version: 1,
    propsSchema: { title: text('Title'), price: text('Price display', true), ctaLabel: text('CTA', false) },
    bindingRoots: ['product', 'journey'], events: ['CLICK'], supportedActions: ['BOOK', 'START_WORKFLOW', 'NAVIGATE'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: [],
    description: 'Primary book/enquire panel; runs through workflow layer, not inline logic.',
  },
  leadForm: {
    key: 'leadForm', name: 'Lead Capture Form', category: 'TRAVEL', version: 1,
    propsSchema: { title: text('Title', true), destinationHint: text('Destination context'), campaign: text('Campaign tag') },
    bindingRoots: ['entity', 'runtime'], events: ['SUBMIT'], supportedActions: ['CALL_API'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['labelled inputs'],
    description: 'CRM lead capture form (posts to CRM API).',
  },
  faqSection: {
    key: 'faqSection', name: 'FAQ', category: 'GENERIC', version: 1,
    propsSchema: { items: { type: 'json', label: 'FAQ items', required: true, bindable: true }, structuredData: { type: 'boolean', label: 'Emit FAQPage schema', default: true } },
    bindingRoots: ['entity'], events: [], supportedActions: [],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: ['aria-expanded'],
    description: 'FAQ accordion with JSON-LD.',
  },
  footerCta: {
    key: 'footerCta', name: 'Closing CTA', category: 'GENERIC', version: 1,
    propsSchema: { title: text('Title', true), subtitle: text('Subtitle'), primaryLabel: text('Primary CTA'), primaryTarget: text('Primary path'), secondaryLabel: text('Secondary CTA'), secondaryTarget: text('Secondary path') },
    bindingRoots: ['entity'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'BOOK'],
    container: false, gridOnly: false, status: 'ACTIVE', a11y: [],
    description: 'End-of-page conversion band.',
  },

  // ----- Dashboard components -----
  kpi: {
    key: 'kpi', name: 'KPI', category: 'DASHBOARD', version: 1,
    propsSchema: { label: text('Label', true), value: { type: 'string', label: 'Value binding', required: true, bindable: true }, trend: text('Trend'), tone: { type: 'select', label: 'Tone', options: ['up', 'down', 'neutral'], default: 'neutral' } },
    bindingRoots: ['metrics', 'currentUser'], events: ['CLICK'], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: ['aria-label'],
    description: 'Single metric tile.',
  },
  dataTable: {
    key: 'dataTable', name: 'Data Table', category: 'DASHBOARD', version: 1,
    propsSchema: { rows: { type: 'dataSource', label: 'Rows', required: true, bindable: true }, columns: { type: 'json', label: 'Column defs', required: true }, pageSize: { type: 'number', label: 'Page size', default: 10 } },
    bindingRoots: ['collections'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'OPEN_MODAL'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: ['table semantics'],
    description: 'Scoped record table.',
  },
  kanban: {
    key: 'kanban', name: 'Kanban', category: 'DASHBOARD', version: 1,
    propsSchema: { lanes: { type: 'json', label: 'Lane defs', required: true }, items: { type: 'dataSource', label: 'Items', required: true, bindable: true } },
    bindingRoots: ['collections'], events: ['CLICK'], supportedActions: ['START_WORKFLOW', 'ASSIGN'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: [],
    description: 'Workflow queue board.',
  },
  activityFeed: {
    key: 'activityFeed', name: 'Activity Feed', category: 'DASHBOARD', version: 1,
    propsSchema: { items: { type: 'dataSource', label: 'Activity', required: true, bindable: true } },
    bindingRoots: ['collections'], events: ['CLICK'], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: ['timeline list'],
    description: 'Recent audit/activity stream.',
  },
  alertPanel: {
    key: 'alertPanel', name: 'Alerts', category: 'DASHBOARD', version: 1,
    propsSchema: { items: { type: 'dataSource', label: 'Alerts', required: true, bindable: true } },
    bindingRoots: ['collections', 'metrics'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'APPROVE', 'REJECT'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: ['role=alert'],
    description: 'Operational alerts with actions.',
  },
  chart: {
    key: 'chart', name: 'Chart', category: 'DASHBOARD', version: 1,
    propsSchema: { series: { type: 'dataSource', label: 'Series', required: true, bindable: true }, chartType: { type: 'select', label: 'Type', options: ['bar', 'line', 'area'], default: 'bar' }, unit: text('Unit') },
    bindingRoots: ['metrics'], events: [], supportedActions: [],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: ['data table fallback'],
    description: 'Lightweight SVG chart from bound metric series.',
  },
  quickActions: {
    key: 'quickActions', name: 'Quick Actions', category: 'DASHBOARD', version: 1,
    propsSchema: { actions: { type: 'json', label: 'Action defs', required: true } },
    bindingRoots: ['currentUser', 'role'], events: ['CLICK'], supportedActions: ['NAVIGATE', 'START_WORKFLOW', 'TRIGGER_AI'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: [],
    description: 'Role-aware shortcut pad.',
  },
  aiSummary: {
    key: 'aiSummary', name: 'AI Summary', category: 'DASHBOARD', version: 1,
    propsSchema: { scope: text('Scope key', true), title: text('Title') },
    bindingRoots: ['metrics'], events: ['CLICK'], supportedActions: ['TRIGGER_AI'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: [],
    description: 'Voyage8 copilot digest; read-only unless confirmed by user.',
  },
  recentRecords: {
    key: 'recentRecords', name: 'Recent Records', category: 'DASHBOARD', version: 1,
    propsSchema: { collection: text('Collection', true), limit: { type: 'number', label: 'Limit', default: 5 } },
    bindingRoots: ['collections'], events: ['CLICK'], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: [],
    description: 'Recently touched records for the workspace.',
  },
  progressPanel: {
    key: 'progressPanel', name: 'Progress', category: 'DASHBOARD', version: 1,
    propsSchema: { label: text('Label', true), percent: { type: 'number', label: 'Percent', required: true, bindable: true } },
    bindingRoots: ['metrics'], events: [], supportedActions: [],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: ['progressbar role'],
    description: 'Goal / completion meter.',
  },
  healthPanel: {
    key: 'healthPanel', name: 'System Health', category: 'DASHBOARD', version: 1,
    propsSchema: { title: text('Title') },
    bindingRoots: ['metrics'], events: [], supportedActions: ['NAVIGATE'],
    container: false, gridOnly: true, status: 'ACTIVE', a11y: [],
    description: 'Connector/system health matrix.',
  },
};

// ---------- Section registry (§09) ----------

export interface SectionDef {
  key: string;
  name: string;
  family: string;
  version: number;
  description: string;
  /** composition subtree — references ComponentDef keys */
  nodes: Array<Omit<import('./types').CompositionNode, 'locked' | 'hidden'> & Partial<Pick<import('./types').CompositionNode, 'locked' | 'hidden'>>>;
  dataNeeds: string[];
  status: 'ACTIVE' | 'DEPRECATED';
}

const n = (
  id: string,
  componentKey: string,
  props: Record<string, unknown> = {},
  bindings: import('./types').DataBinding[] = [],
  children: any[] = []
): SectionDef['nodes'][number] => ({
  id, componentKey, props, bindings, actions: [], responsive: [], style: { variants: [] }, children,
});

export const SECTION_REGISTRY: Record<string, SectionDef> = {
  'destination.hero.v1': {
    key: 'destination.hero.v1', name: 'Destination Hero', family: 'destination', version: 1,
    description: 'Hero bound to destination entity.',
    dataNeeds: ['destination'], status: 'ACTIVE',
    nodes: [n('dest-hero', 'hero', { variant: 'FULLSCREEN' }, [
      { id: 'b1', kind: 'FIELD', path: 'destination.name', targetProp: 'title' },
      { id: 'b2', kind: 'FIELD', path: 'destination.headline', targetProp: 'subtitle' },
      { id: 'b3', kind: 'FIELD', path: 'destination.heroImageUrl', targetProp: 'mediaUrl' },
    ])],
  },
  'destination.overview.v1': {
    key: 'destination.overview.v1', name: 'Destination Overview', family: 'destination', version: 1,
    description: 'Description and highlights.', dataNeeds: ['destination'], status: 'ACTIVE',
    nodes: [n('dest-overview', 'richText', {}, [{ id: 'b1', kind: 'FIELD', path: 'destination.description', targetProp: 'html' }])],
  },
  'destination.places.v1': {
    key: 'destination.places.v1', name: 'Places Grid', family: 'destination', version: 1,
    description: 'Related places card grid.', dataNeeds: ['destination.places'], status: 'ACTIVE',
    nodes: [
      n('places-h', 'heading', { text: 'Places to visit' }),
      n('places-grid', 'grid', { columns: 3 }, [], [
        n('place-card', 'placeCard', {}, [{ id: 'b1', kind: 'COLLECTION', path: 'destination.places', targetProp: 'place' }]),
      ]),
    ],
  },
  'destination.journeys.v1': {
    key: 'destination.journeys.v1', name: 'Journeys Showcase', family: 'destination', version: 1,
    description: 'Featured journeys for this destination.', dataNeeds: ['destination.journeys'], status: 'ACTIVE',
    nodes: [
      n('jr-h', 'heading', { text: 'Curated journeys' }),
      n('jr-grid', 'grid', { columns: 3 }, [], [
        n('jr-card', 'journeyCard', {}, [{ id: 'b1', kind: 'COLLECTION', path: 'destination.journeys', targetProp: 'journey' }]),
      ]),
    ],
  },
  'destination.diaries.v1': {
    key: 'destination.diaries.v1', name: 'Traveler Diaries', family: 'destination', version: 1,
    description: 'Published diaries referencing this destination.', dataNeeds: ['destination.diaries'], status: 'ACTIVE',
    nodes: [
      n('dr-h', 'heading', { text: 'Traveler diaries' }),
      n('dr-grid', 'grid', { columns: 3 }, [], [
        n('dr-card', 'diaryCard', {}, [{ id: 'b1', kind: 'COLLECTION', path: 'destination.diaries', targetProp: 'diary' }]),
      ]),
    ],
  },
  'destination.faq.v1': {
    key: 'destination.faq.v1', name: 'Destination FAQ', family: 'destination', version: 1,
    description: 'FAQ with structured data.', dataNeeds: ['destination.faq'], status: 'ACTIVE',
    nodes: [n('faq', 'faqSection', { items: [] }, [{ id: 'b1', kind: 'FIELD', path: 'destination.faq', targetProp: 'items' }])],
  },
  'journey.hero.v1': {
    key: 'journey.hero.v1', name: 'Journey Hero', family: 'journey', version: 1,
    description: 'Cinematic journey hero.', dataNeeds: ['journey'], status: 'ACTIVE',
    nodes: [n('j-hero', 'hero', { variant: 'CINEMATIC' }, [
      { id: 'b1', kind: 'FIELD', path: 'journey.title', targetProp: 'title' },
      { id: 'b2', kind: 'FIELD', path: 'journey.subtitle', targetProp: 'subtitle' },
      { id: 'b3', kind: 'FIELD', path: 'journey.coverImage', targetProp: 'mediaUrl' },
    ])],
  },
  'journey.timeline.v1': {
    key: 'journey.timeline.v1', name: 'Day-by-Day Timeline', family: 'journey', version: 1,
    description: 'Structured JourneyDays.', dataNeeds: ['journey.days'], status: 'ACTIVE',
    nodes: [
      n('j-tl-h', 'heading', { text: 'Day by day' }),
      n('j-tl', 'journeyTimeline', {}, [{ id: 'b1', kind: 'COLLECTION', path: 'journey.days', targetProp: 'days' }]),
    ],
  },
  'journey.route.v1': {
    key: 'journey.route.v1', name: 'Route Map', family: 'journey', version: 1,
    description: 'Route overview with stops.', dataNeeds: ['journey.places'], status: 'ACTIVE',
    nodes: [n('j-route', 'routeMap', {}, [{ id: 'b1', kind: 'COLLECTION', path: 'journey.places', targetProp: 'points' }])],
  },
  'journey.budget.v1': {
    key: 'journey.budget.v1', name: 'Budget', family: 'journey', version: 1,
    description: 'Budget range breakdown.', dataNeeds: ['journey.budgetRange'], status: 'ACTIVE',
    nodes: [n('j-budget', 'travelBudget', {}, [{ id: 'b1', kind: 'FIELD', path: 'journey.budgetRange', targetProp: 'budget' }])],
  },
  'journey.booking.v1': {
    key: 'journey.booking.v1', name: 'Journey Booking CTA', family: 'journey', version: 1,
    description: 'Customize/Book band gated by journey capability.', dataNeeds: ['journey'], status: 'ACTIVE',
    nodes: [n('j-cta', 'bookingCta', {}, [{ id: 'b1', kind: 'FIELD', path: 'journey.budgetRange.display', targetProp: 'price' }])],
  },
  'diary.hero.v1': {
    key: 'diary.hero.v1', name: 'Diary Hero', family: 'diary', version: 1,
    description: 'Editorial diary opener with author.', dataNeeds: ['diary'], status: 'ACTIVE',
    nodes: [n('d-hero', 'hero', { variant: 'EDITORIAL' }, [
      { id: 'b1', kind: 'FIELD', path: 'diary.title', targetProp: 'title' },
      { id: 'b2', kind: 'FIELD', path: 'diary.place.name', targetProp: 'subtitle' },
      { id: 'b3', kind: 'FIELD', path: 'diary.coverImage', targetProp: 'mediaUrl' },
    ])],
  },
  'diary.story.v1': {
    key: 'diary.story.v1', name: 'Diary Story', family: 'diary', version: 1,
    description: 'First-person narrative blocks.', dataNeeds: ['diary'], status: 'ACTIVE',
    nodes: [
      n('d-story-h', 'heading', { text: 'The story' }),
      n('d-story', 'richText', {}, [{ id: 'b1', kind: 'FIELD', path: 'diary.story', targetProp: 'html' }]),
      n('d-did', 'heading', { text: 'What I did' }),
      n('d-did-b', 'richText', {}, [{ id: 'b2', kind: 'FIELD', path: 'diary.whatIDid', targetProp: 'html' }]),
      n('d-ate', 'heading', { text: 'What I ate' }),
      n('d-ate-b', 'richText', {}, [{ id: 'b3', kind: 'FIELD', path: 'diary.whatIAte', targetProp: 'html' }]),
    ],
  },
  'diary.gallery.v1': {
    key: 'diary.gallery.v1', name: 'Photo Story', family: 'diary', version: 1,
    description: 'Diary gallery.', dataNeeds: ['diary.gallery'], status: 'ACTIVE',
    nodes: [n('d-gal', 'gallery', {}, [{ id: 'b1', kind: 'COLLECTION', path: 'diary.gallery', targetProp: 'images' }])],
  },
  'diary.practical-notes.v1': {
    key: 'diary.practical-notes.v1', name: 'Practical Notes', family: 'diary', version: 1,
    description: 'Notes, best time, getting there.', dataNeeds: ['diary'], status: 'ACTIVE',
    nodes: [
      n('d-pn-h', 'heading', { text: 'Practical notes' }),
      n('d-pn-tip', 'travelTip', { icon: 'lightbulb' }, [{ id: 'b1', kind: 'FIELD', path: 'diary.practicalNotes', targetProp: 'body' }]),
      n('d-pn-weather', 'weatherStrip', {}, [{ id: 'b2', kind: 'FIELD', path: 'diary.bestTime', targetProp: 'bestTime' }]),
      n('d-pn-how', 'travelTip', { icon: 'shield', title: 'Getting there' }, [{ id: 'b3', kind: 'FIELD', path: 'diary.gettingThere', targetProp: 'body' }]),
    ],
  },
  'dashboard.kpi-row.v1': {
    key: 'dashboard.kpi-row.v1', name: 'KPI Row', family: 'dashboard', version: 1,
    description: 'Four KPI tiles bound to workspace metrics.', dataNeeds: ['metrics'], status: 'ACTIVE',
    nodes: [n('db-kpis', 'grid', { columns: 4 }, [], [
      n('db-kpi', 'kpi', {}, [{ id: 'b1', kind: 'METRIC', path: 'metrics.primary', targetProp: 'value' }]),
    ])],
  },
  'dashboard.activity.v1': {
    key: 'dashboard.activity.v1', name: 'Activity Column', family: 'dashboard', version: 1,
    description: 'Activity + alerts column.', dataNeeds: ['collections.audit'], status: 'ACTIVE',
    nodes: [n('db-act', 'activityFeed', {}, [{ id: 'b1', kind: 'COLLECTION', path: 'collections.audit', targetProp: 'items' }])],
  },
};

// ---------- Template registry with inheritance (§10, §32) ----------

export interface TemplateDef {
  key: string;
  name: string;
  type: ExperienceTypeValue;
  parentKey?: string;
  /** ordered section keys forming base composition */
  sections: string[];
  dataSources: string[];
  category: string;
  status: 'ACTIVE' | 'DEPRECATED';
}

export const TEMPLATE_REGISTRY: Record<string, TemplateDef> = {
  'tpl.base': { key: 'tpl.base', name: 'Base Experience', type: 'PAGE', sections: [], dataSources: [], category: 'BASE', status: 'ACTIVE' },
  'tpl.travel': { key: 'tpl.travel', name: 'Travel Template', type: 'PAGE', parentKey: 'tpl.base', sections: [], dataSources: ['entity'], category: 'TRAVEL', status: 'ACTIVE' },
  'tpl.destination': { key: 'tpl.destination', name: 'Destination Page', type: 'DESTINATION', parentKey: 'tpl.travel',
    sections: ['destination.hero.v1', 'destination.overview.v1', 'destination.places.v1', 'destination.journeys.v1', 'destination.diaries.v1', 'destination.faq.v1'],
    dataSources: ['destination', 'destination.places', 'destination.journeys', 'destination.diaries'], category: 'TRAVEL', status: 'ACTIVE' },
  'tpl.place': { key: 'tpl.place', name: 'Place Page', type: 'PLACE', parentKey: 'tpl.travel',
    sections: ['destination.hero.v1', 'destination.overview.v1', 'destination.journeys.v1', 'destination.diaries.v1'],
    dataSources: ['place'], category: 'TRAVEL', status: 'ACTIVE' },
  'tpl.journey': { key: 'tpl.journey', name: 'Journey Page', type: 'JOURNEY', parentKey: 'tpl.travel',
    sections: ['journey.hero.v1', 'journey.timeline.v1', 'journey.route.v1', 'journey.budget.v1', 'destination.diaries.v1', 'journey.booking.v1'],
    dataSources: ['journey', 'journey.days', 'journey.places', 'journey.diaries'], category: 'TRAVEL', status: 'ACTIVE' },
  'tpl.diary': { key: 'tpl.diary', name: 'Diary Page', type: 'DIARY', parentKey: 'tpl.travel',
    sections: ['diary.hero.v1', 'diary.story.v1', 'diary.gallery.v1', 'diary.practical-notes.v1'],
    dataSources: ['diary'], category: 'TRAVEL', status: 'ACTIVE' },
  'tpl.landing': { key: 'tpl.landing', name: 'Campaign Landing', type: 'LANDING_PAGE', parentKey: 'tpl.base',
    sections: ['destination.hero.v1', 'destination.places.v1', 'dashboard.kpi-row.v1'], dataSources: ['entity'], category: 'MARKETING', status: 'ACTIVE' },
  'tpl.dashboard.exec': { key: 'tpl.dashboard.exec', name: 'Executive Dashboard', type: 'DASHBOARD', parentKey: 'tpl.base',
    sections: ['dashboard.kpi-row.v1', 'dashboard.activity.v1'], dataSources: ['metrics', 'collections.audit'], category: 'WORKSPACE', status: 'ACTIVE' },
  'tpl.dashboard.ops': { key: 'tpl.dashboard.ops', name: 'Operations Dashboard', type: 'DASHBOARD', parentKey: 'tpl.dashboard.exec',
    sections: ['dashboard.activity.v1'], dataSources: ['metrics', 'collections'], category: 'WORKSPACE', status: 'ACTIVE' },
  'tpl.workspace.agent': { key: 'tpl.workspace.agent', name: 'Travel Agent Workspace', type: 'WORKSPACE', parentKey: 'tpl.dashboard.exec',
    sections: ['dashboard.kpi-row.v1', 'dashboard.activity.v1'], dataSources: ['metrics', 'currentUser'], category: 'WORKSPACE', status: 'ACTIVE' },
};

/** Resolve full section chain across inheritance (child overrides parent) */
export function resolveTemplateSections(templateKey: string): string[] {
  const seen = new Set<string>();
  const chain: string[] = [];
  let current: TemplateDef | undefined = TEMPLATE_REGISTRY[templateKey];
  while (current && !seen.has(current.key)) {
    seen.add(current.key);
    if (current.sections.length > 0) return [...current.sections, ...chain];
    chain.unshift(...current.sections);
    current = current.parentKey ? TEMPLATE_REGISTRY[current.parentKey] : undefined;
  }
  return current?.sections ?? [];
}

// ---------- Widget registry (§26) — bridges existing DashboardEngine ----------

export const WIDGET_REGISTRY: Record<string, { componentKey: string; defaultWidth: number; dataScope: string }> = {
  gmv_metric: { componentKey: 'kpi', defaultWidth: 3, dataScope: 'GLOBAL' },
  active_trips_table: { componentKey: 'dataTable', defaultWidth: 8, dataScope: 'ORGANIZATION' },
  platform_health_matrix: { componentKey: 'healthPanel', defaultWidth: 4, dataScope: 'GLOBAL' },
  api_gateway_latency: { componentKey: 'chart', defaultWidth: 6, dataScope: 'GLOBAL' },
  ai_executive_summary: { componentKey: 'aiSummary', defaultWidth: 6, dataScope: 'GLOBAL' },
  pending_bookings_queue: { componentKey: 'kanban', defaultWidth: 12, dataScope: 'WORKSPACE' },
  recent_leads: { componentKey: 'recentRecords', defaultWidth: 4, dataScope: 'TEAM' },
  revenue_chart: { componentKey: 'chart', defaultWidth: 8, dataScope: 'ORGANIZATION' },
};

export type { ComponentDef as RegisteredComponent, SectionDef as RegisteredSection, TemplateDef as RegisteredTemplate };
