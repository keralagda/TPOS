/**
 * Travel Planet (Voyage8) — RBWA (Role-Based Workspace Access) & RXF Registry
 * 
 * Maps every user role to its dedicated workspace, navigation, dashboard,
 * KPIs, operational queues, workflows, and permitted actions.
 */

import { DataScope } from '../auth/scopes';

export interface WorkspaceDefinition {
  id: string;
  code: string;
  name: string;
  route: string;
  targetRole: string;
  defaultScope: DataScope;
  description: string;
  kpis: Array<{ label: string; value: string; trend?: string; status?: 'up' | 'down' | 'neutral' }>;
  quickActions: Array<{ label: string; actionCode: string; icon: string }>;
  operationalQueues?: string[];
  widgets: string[];
}

export const WORKSPACE_REGISTRY: Record<string, WorkspaceDefinition> = {
  SUPER_ADMIN: {
    id: 'ws_super_admin',
    code: 'SUPER_ADMIN',
    name: 'Platform Command Center',
    route: '/admin/dashboard',
    targetRole: 'PLATFORM_SUPER_ADMIN',
    defaultScope: 'GLOBAL',
    description: 'Global platform command center for Amal Babu oversight of GMV, system health, and cross-tenant integrity.',
    kpis: [
      { label: 'Gross Merchandise Value (GMV)', value: '₹4,82,50,000', trend: '+14.2% MoM', status: 'up' },
      { label: 'Platform Bookings (MTD)', value: '1,428', trend: '+8.6%', status: 'up' },
      { label: 'Active Tenant Workspaces', value: '42 Active', trend: '100% Isolated', status: 'neutral' },
      { label: 'System Uptime & Health', value: '99.98%', trend: 'All Gateways Live', status: 'up' },
    ],
    quickActions: [
      { label: 'Add Supplier', actionCode: 'suppliers.create', icon: 'building' },
      { label: 'Create Offer', actionCode: 'offers.create', icon: 'tag' },
      { label: 'Provision User', actionCode: 'users.create', icon: 'user-plus' },
      { label: 'Configure Integration', actionCode: 'integrations.manage', icon: 'cable' },
      { label: 'Open AI Copilot', actionCode: 'ai.chat', icon: 'sparkles' },
    ],
    widgets: ['gmv_metric', 'active_trips_table', 'platform_health_matrix', 'api_gateway_latency', 'ai_executive_summary'],
  },

  EXECUTIVE: {
    id: 'ws_executive',
    code: 'EXECUTIVE',
    name: 'Executive Leadership Overview',
    route: '/workspace/executive',
    targetRole: 'ADMIN',
    defaultScope: 'ORGANIZATION',
    description: 'Executive revenue trends, margins, average order values, and strategic destination demand.',
    kpis: [
      { label: 'Net Travel Revenue', value: '₹58,40,000', trend: '+18.1%', status: 'up' },
      { label: 'Average Booking Value', value: '₹68,500', trend: '+5.4%', status: 'up' },
      { label: 'Gross Operating Margin', value: '12.4%', trend: '+1.2%', status: 'up' },
      { label: 'Customer Retention Rate', value: '64.8%', trend: '+3.1%', status: 'up' },
    ],
    quickActions: [
      { label: 'Export P&L Summary', actionCode: 'analytics.export', icon: 'download' },
      { label: 'Review Monthly Yields', actionCode: 'analytics.view', icon: 'trending-up' },
      { label: 'Destination Strategy', actionCode: 'content.view', icon: 'compass' },
    ],
    widgets: ['revenue_trend_chart', 'destination_demand_funnel', 'supplier_yield_breakdown', 'ai_business_summary'],
  },

  OPERATIONS: {
    id: 'ws_operations',
    code: 'OPERATIONS',
    name: 'Operations Dispatch Center',
    route: '/operations/dashboard',
    targetRole: 'OPERATIONS_MANAGER',
    defaultScope: 'ORGANIZATION',
    description: 'Operational dispatch of active passenger departures, supplier confirmations, and flight PNR tracking.',
    kpis: [
      { label: 'Departures Today', value: '24 Trips', trend: '100% on schedule', status: 'up' },
      { label: 'Pending Supplier Confirmations', value: '3 Pending', trend: 'SLA < 15m', status: 'neutral' },
      { label: 'Ticketing Queue', value: '7 Orders', trend: 'Auto-processing', status: 'up' },
      { label: 'Disruption Alerts', value: '0 Critical', trend: 'Clear Sky', status: 'up' },
    ],
    quickActions: [
      { label: 'Issue Boarding Passes', actionCode: 'trips.manage', icon: 'ticket' },
      { label: 'Dispatch Supplier Voucher', actionCode: 'bookings.update', icon: 'send' },
      { label: 'Resolve Disruption', actionCode: 'support.tickets', icon: 'alert-triangle' },
    ],
    operationalQueues: ['NEW', 'ASSIGNED', 'PROCESSING', 'WAITING_SUPPLIER', 'CONFIRMED', 'ESCALATED'],
    widgets: ['operations_departure_timeline', 'ticketing_queue_kanban', 'disruption_sla_monitor'],
  },

  TRAVEL_AGENT: {
    id: 'ws_agent',
    code: 'TRAVEL_AGENT',
    name: 'Consultant & Agent Desk',
    route: '/agent/dashboard',
    targetRole: 'TRAVEL_AGENT',
    defaultScope: 'ASSIGNED',
    description: 'Travel agent sales inquiry management, custom AI itinerary synthesis, and quotation dispatch.',
    kpis: [
      { label: 'Active Inquiries', value: '18 Leads', trend: '4 due today', status: 'neutral' },
      { label: 'Quotes Out', value: '9 Quotes', trend: '₹6,40,000 pipeline', status: 'up' },
      { label: 'Closed Bookings (MTD)', value: '12 Bookings', trend: 'Goal: 15', status: 'up' },
      { label: 'Earned Commission', value: '₹74,200', trend: 'Payable 1st', status: 'up' },
    ],
    quickActions: [
      { label: 'Synthesize Itinerary', actionCode: 'itineraries.create', icon: 'wand-2' },
      { label: 'Generate Quote', actionCode: 'bookings.create', icon: 'file-text' },
      { label: 'Log Follow-Up Call', actionCode: 'leads.update', icon: 'phone-call' },
    ],
    widgets: ['agent_lead_pipeline', 'itinerary_builder_widget', 'commission_ledger_summary'],
  },

  CRM_SALES: {
    id: 'ws_crm',
    code: 'CRM_SALES',
    name: 'CRM & Pipeline Hub',
    route: '/crm/dashboard',
    targetRole: 'CRM_MANAGER',
    defaultScope: 'ORGANIZATION',
    description: 'Lead qualification, conversion velocity, customer 360 profiles, and pipeline forecasting.',
    kpis: [
      { label: 'New Qualified Leads', value: '142 Leads', trend: '+22% WoW', status: 'up' },
      { label: 'Pipeline Value', value: '₹1,24,00,000', trend: 'Weighted: ₹48L', status: 'up' },
      { label: 'Lead-to-Booking Conversion', value: '28.4%', trend: '+2.8%', status: 'up' },
      { label: 'Repeat Customer Rate', value: '41.2%', trend: 'High Loyalty', status: 'up' },
    ],
    quickActions: [
      { label: 'Assign Leads', actionCode: 'leads.assign', icon: 'user-check' },
      { label: 'Customer 360 Search', actionCode: 'customers.view', icon: 'search' },
      { label: 'Create Audience Segment', actionCode: 'marketing.view', icon: 'users' },
    ],
    widgets: ['sales_pipeline_stages', 'customer_360_table', 'conversion_cohort_chart'],
  },

  SUPPLIERS: {
    id: 'ws_suppliers',
    code: 'SUPPLIERS',
    name: 'Supplier Contracting & NDC Hub',
    route: '/suppliers/dashboard',
    targetRole: 'SUPPLIER_MANAGER',
    defaultScope: 'ORGANIZATION',
    description: 'Direct airline NDC feeds, hotel GDS connectors, supplier contracting, and inventory fresh rates.',
    kpis: [
      { label: 'Active Suppliers', value: '18 Connected', trend: '12 Realtime', status: 'up' },
      { label: 'Live Inventory Offers', value: '4,892 Active', trend: 'Fresh TTL < 10m', status: 'up' },
      { label: 'Direct NDC Bookings', value: '318 Flights', trend: 'Zero GDS markup', status: 'up' },
      { label: 'Sync Success Rate', value: '99.4%', trend: 'Delta sync healthy', status: 'up' },
    ],
    quickActions: [
      { label: 'New Supplier Contract', actionCode: 'vendors.manage', icon: 'file-plus' },
      { label: 'Trigger Delta Sync', actionCode: 'sync.trigger', icon: 'refresh-cw' },
      { label: 'Configure NDC Carrier', actionCode: 'integrations.manage', icon: 'plane' },
    ],
    widgets: ['supplier_connector_health', 'live_inventory_feed_table', 'ndc_margin_analysis'],
  },

  FINANCE: {
    id: 'ws_finance',
    code: 'FINANCE',
    name: 'Treasury & Double-Entry Ledger',
    route: '/finance/dashboard',
    targetRole: 'FINANCE_MANAGER',
    defaultScope: 'ORGANIZATION',
    description: 'Statutory 20% TCS (Section 206C(1G)), 5% GST tax reconciliation, gateway payouts, and double-entry balance.',
    kpis: [
      { label: 'Ledger Cash Balance', value: '₹1,42,80,000', trend: 'Balanced DR == CR', status: 'up' },
      { label: 'TCS Remittance Liability', value: '₹8,45,000', trend: 'Due 7th Oct', status: 'neutral' },
      { label: 'GST Output Tax (5%)', value: '₹2,92,400', trend: 'Matched to GSTR-1', status: 'up' },
      { label: 'Pending Supplier Settlements', value: '₹14,50,000', trend: 'Net 15 Terms', status: 'neutral' },
    ],
    quickActions: [
      { label: 'Compute Statutory Tax', actionCode: 'finance.view', icon: 'calculator' },
      { label: 'Export Tax Journal', actionCode: 'finance.export', icon: 'file-spreadsheet' },
      { label: 'Reconcile Gateway Payout', actionCode: 'finance.reconcile', icon: 'check-check' },
    ],
    widgets: ['ledger_balance_invariants', 'tax_statutory_summary', 'gateway_payout_reconciliation'],
  },

  CUSTOMER_SUPPORT: {
    id: 'ws_support',
    code: 'CUSTOMER_SUPPORT',
    name: 'Traveler Support & Concierge',
    route: '/support/dashboard',
    targetRole: 'CUSTOMER_SUPPORT',
    defaultScope: 'ORGANIZATION',
    description: '24/7 passenger trip support, flight rescheduling, emergency re-routing, and case triage.',
    kpis: [
      { label: 'Open Support Tickets', value: '4 Tickets', trend: 'Avg response 6m', status: 'up' },
      { label: 'Urgent Disruption Cases', value: '0 Cases', trend: 'All resolved', status: 'up' },
      { label: 'SLA Compliance Rate', value: '98.5%', trend: 'Target: >95%', status: 'up' },
      { label: 'CSAT Rating', value: '4.9 / 5.0', trend: 'Based on 48 reviews', status: 'up' },
    ],
    quickActions: [
      { label: 'Open Passenger Record', actionCode: 'customers.view', icon: 'user' },
      { label: 'Dispatch Flight Reschedule', actionCode: 'bookings.update', icon: 'plane-takeoff' },
      { label: 'Trigger AI Concierge', actionCode: 'ai.chat', icon: 'message-square' },
    ],
    widgets: ['support_ticket_inbox', 'passenger_trip_tracker', 'customer_satisfaction_kpi'],
  },

  MARKETING: {
    id: 'ws_marketing',
    code: 'MARKETING',
    name: 'Growth & Demand Engine',
    route: '/marketing/dashboard',
    targetRole: 'MARKETING_MANAGER',
    defaultScope: 'ORGANIZATION',
    description: 'Campaign attribution, coupon redemption, CAC/ROAS telemetry, and seasonal promotional rules.',
    kpis: [
      { label: 'Marketing ROAS', value: '4.8x Return', trend: '+0.6x QoQ', status: 'up' },
      { label: 'Cost Per Acquisition (CAC)', value: '₹1,240', trend: '-8% reduction', status: 'up' },
      { label: 'Active Promo Coupons', value: '6 Codes', trend: '942 claims', status: 'neutral' },
      { label: 'Organic Search Visitors', value: '48,200 / mo', trend: '+19% SEO boost', status: 'up' },
    ],
    quickActions: [
      { label: 'Launch Campaign', actionCode: 'marketing.campaigns', icon: 'zap' },
      { label: 'Generate Coupon Code', actionCode: 'marketing.promotions', icon: 'percent' },
      { label: 'Inspect Attribution', actionCode: 'analytics.view', icon: 'bar-chart-2' },
    ],
    widgets: ['marketing_campaign_roas', 'coupon_redemption_funnel', 'visitor_acquisition_chart'],
  },

  CONTENT_SEO: {
    id: 'ws_content',
    code: 'CONTENT_SEO',
    name: 'Directory & Content Catalog',
    route: '/content/dashboard',
    targetRole: 'CONTENT_MANAGER',
    defaultScope: 'ORGANIZATION',
    description: 'Destination travel guides, ICAO Doc 9303 visa advisories, hotel amenities, and SEO entities.',
    kpis: [
      { label: 'Indexed Destination Guides', value: '184 Guides', trend: '100% crawl rate', status: 'up' },
      { label: 'Curated Attractions', value: '1,420 Items', trend: '+45 this month', status: 'up' },
      { label: 'Visa Requirements Matrix', value: '84 Countries', trend: 'Updated 2026', status: 'up' },
      { label: 'Media Assets in CDN', value: '8,420 Images', trend: 'WebP compressed', status: 'up' },
    ],
    quickActions: [
      { label: 'New Destination Guide', actionCode: 'content.edit', icon: 'file-text' },
      { label: 'Update Visa Advisory', actionCode: 'content.edit', icon: 'passport' },
      { label: 'Upload Media Asset', actionCode: 'media.upload', icon: 'image' },
    ],
    widgets: ['content_publishing_queue', 'seo_indexing_monitor', 'destination_directory_table'],
  },

  ANALYTICS: {
    id: 'ws_analytics',
    code: 'ANALYTICS',
    name: 'Business Intelligence & Yields',
    route: '/analytics/dashboard',
    targetRole: 'ANALYST',
    defaultScope: 'READ_ONLY',
    description: 'Cohort analysis, route demand pacing, supplier commission yields, and destination booking funnels.',
    kpis: [
      { label: 'Annualized Run Rate', value: '₹57,90,00,000', trend: '+28% YoY', status: 'up' },
      { label: 'Route Yield Leader', value: 'DEL -> DXB', trend: '₹42,000 avg', status: 'up' },
      { label: 'Hotel Booking Margin', value: '14.8%', trend: 'Highest in Bali', status: 'up' },
      { label: 'Cancellation Ratio', value: '3.1%', trend: 'Low refund rate', status: 'up' },
    ],
    quickActions: [
      { label: 'Export Cohort Matrix', actionCode: 'analytics.export', icon: 'file-down' },
      { label: 'Query Route Demand', actionCode: 'analytics.view', icon: 'pie-chart' },
    ],
    widgets: ['cohort_retention_heatmap', 'route_profitability_scatter', 'cancellation_root_cause'],
  },

  INTEGRATIONS: {
    id: 'ws_integrations',
    code: 'INTEGRATIONS',
    name: 'API Connectors & Webhook Fleet',
    route: '/integrations/dashboard',
    targetRole: 'INTEGRATION_MANAGER',
    defaultScope: 'ORGANIZATION',
    description: 'Connector health monitoring, HMAC webhook signature verification, credential vault references, and delta syncs.',
    kpis: [
      { label: 'Connected Fleet', value: '12 / 12 Live', trend: 'Zero outages', status: 'up' },
      { label: 'Webhook Inbound Stream', value: '1,842 Events', trend: '100% HMAC valid', status: 'up' },
      { label: 'Delta Sync Freshness', value: '4.2m Avg', trend: 'TTL active', status: 'up' },
      { label: 'Vault Credential Pointers', value: '16 Encrypted', trend: 'Zero cleartext', status: 'up' },
    ],
    quickActions: [
      { label: 'Test Connector Ping', actionCode: 'integrations.view', icon: 'activity' },
      { label: 'Simulate Webhook', actionCode: 'webhooks.manage', icon: 'play' },
      { label: 'Rotate API Secret', actionCode: 'integrations.manage', icon: 'key' },
    ],
    widgets: ['connector_fleet_status_grid', 'inbound_webhook_event_stream', 'sync_latency_benchmarks'],
  },

  AI_OPERATIONS: {
    id: 'ws_ai',
    code: 'AI_OPERATIONS',
    name: 'Voyage8 AI Governance Hub',
    route: '/ai/dashboard',
    targetRole: 'AI_OPERATOR',
    defaultScope: 'ORGANIZATION',
    description: 'Voyage8 AI agent orchestration, model temperature routing, and consequential action confirmation gates.',
    kpis: [
      { label: 'AI Actions Dispatched', value: '412 Actions', trend: '100% governed', status: 'up' },
      { label: 'Action Gate Interventions', value: '12 Required', trend: 'Super Admin locked', status: 'neutral' },
      { label: 'Synthesis Latency', value: '1.2s Avg', trend: 'Route pacing active', status: 'up' },
      { label: 'Estimated Token Cost', value: '$14.20 MTD', trend: 'Efficient routing', status: 'up' },
    ],
    quickActions: [
      { label: 'Inspect AI Gate Queue', actionCode: 'ai.actions', icon: 'shield-alert' },
      { label: 'Prompt Tuning Matrix', actionCode: 'ai.prompts', icon: 'sliders' },
      { label: 'Test Trip Synthesis', actionCode: 'ai.chat', icon: 'wand-2' },
    ],
    widgets: ['ai_governance_action_gate', 'agent_dispatch_activity_log', 'synthesis_latency_graph'],
  },

  CUSTOMER: {
    id: 'ws_customer',
    code: 'CUSTOMER',
    name: 'Traveler Personal Hub',
    route: '/account/dashboard',
    targetRole: 'CUSTOMER',
    defaultScope: 'OWN_RECORDS',
    description: 'B2C consumer booking summary, real-time flight alerts, electronic boarding passes, and saved wishlists.',
    kpis: [
      { label: 'Upcoming Trips', value: '1 Confirmed', trend: 'Dubai Highlights', status: 'up' },
      { label: 'Saved Wishlists', value: '4 Packages', trend: 'Bali & Switzerland', status: 'neutral' },
      { label: 'Active Visas', value: '1 Valid', trend: 'UAE 30-Day Tourist', status: 'up' },
      { label: 'Loyalty Tier', value: 'Silver Explorer', trend: '1,400 pts to Gold', status: 'up' },
    ],
    quickActions: [
      { label: 'View Trip Itinerary', actionCode: 'trips.view', icon: 'calendar' },
      { label: 'Download E-Tickets', actionCode: 'bookings.view', icon: 'download' },
      { label: 'Ask AI Concierge', actionCode: 'ai.chat', icon: 'message-circle' },
    ],
    widgets: ['customer_upcoming_trips', 'customer_passport_documents', 'customer_loyalty_card'],
  },

  PARTNER: {
    id: 'ws_partner',
    code: 'PARTNER',
    name: 'B2B2C Partner Portal (Apex Voyages)',
    route: '/partner/dashboard',
    targetRole: 'PARTNER',
    defaultScope: 'WORKSPACE',
    description: 'Wholesale partner agent workspace, instant net wallet drawdown, dynamic markups, and white-label quotes.',
    kpis: [
      { label: 'Available Wallet Deposit', value: '₹2,84,500', trend: 'Acc: 2002-PARTNER', status: 'up' },
      { label: 'Wholesale Markup Yield', value: '6.0% Markup', trend: '₹2,520 per booking', status: 'up' },
      { label: 'Partner Bookings (MTD)', value: '14 Issued', trend: '+4 vs target', status: 'up' },
      { label: 'White-Label Quotes Sent', value: '28 Quotes', trend: '42% conversion', status: 'up' },
    ],
    quickActions: [
      { label: 'Generate Wholesale Quote', actionCode: 'bookings.create', icon: 'file-text' },
      { label: 'Top-Up Partner Wallet', actionCode: 'finance.view', icon: 'wallet' },
      { label: 'Download Branded Voucher', actionCode: 'itineraries.view', icon: 'download' },
    ],
    widgets: ['partner_wallet_balance_card', 'wholesale_quote_calculator', 'partner_bookings_table'],
  },

  CORPORATE: {
    id: 'ws_corporate',
    code: 'CORPORATE',
    name: 'Corporate Business Travel Hub',
    route: '/corporate/dashboard',
    targetRole: 'ADMIN',
    defaultScope: 'WORKSPACE',
    description: 'Corporate travel policy compliance, GST invoice consolidation, employee flight approval workflows.',
    kpis: [
      { label: 'Corporate Spend (MTD)', value: '₹18,40,000', trend: 'Budget: ₹25,00,000', status: 'up' },
      { label: 'Policy Compliance', value: '96.2%', trend: '3 exceptions logged', status: 'up' },
      { label: 'Pending Travel Requests', value: '2 Approvals', trend: 'CEO flight request', status: 'neutral' },
      { label: 'Input Tax Credit (GST)', value: '₹92,000', trend: 'Matched to GSTIN', status: 'up' },
    ],
    quickActions: [
      { label: 'Submit Travel Request', actionCode: 'bookings.create', icon: 'send' },
      { label: 'Approve Flight Itinerary', actionCode: 'trips.manage', icon: 'check-circle' },
      { label: 'Consolidated GST Invoices', actionCode: 'finance.export', icon: 'file-text' },
    ],
    widgets: ['corporate_travel_policy_monitor', 'pending_employee_approvals', 'gstin_tax_credit_table'],
  },
};
