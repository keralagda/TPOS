/**
 * Travel Planet (Voyage8) — Composable Dashboard Widget Engine
 * 
 * Supports dynamic widget composition based on metadata, permissions,
 * and multi-tenant data scopes.
 */

import { DataScope } from '../auth/scopes';
import { AuthUser, AuthorizationEngine } from '../auth/rbac-engine';

export type WidgetType =
  | 'KPI'
  | 'CHART'
  | 'TABLE'
  | 'KANBAN'
  | 'TIMELINE'
  | 'QUEUE'
  | 'ACTIVITY'
  | 'ALERT'
  | 'MAP'
  | 'FUNNEL'
  | 'CALENDAR'
  | 'PROGRESS'
  | 'HEALTH'
  | 'AI_SUMMARY'
  | 'QUICK_ACTION'
  | 'RECENT_RECORDS';

export interface WidgetDefinition {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  dataSource: string;
  permissions: string[];
  dataScope: DataScope;
  refreshIntervalMs?: number;
  width: number; // 1 to 12 grid columns
  height?: number; // In px or units
  visibility: boolean;
  roleBindings: string[];
  config?: Record<string, any>;
}

export class DashboardEngine {
  private static widgetsRegistry = new Map<string, WidgetDefinition>();

  public static registerWidget(widget: WidgetDefinition): void {
    this.widgetsRegistry.set(widget.id, widget);
  }

  public static getWidget(id: string): WidgetDefinition | undefined {
    return this.widgetsRegistry.get(id);
  }

  public static getAllWidgets(): WidgetDefinition[] {
    return Array.from(this.widgetsRegistry.values());
  }

  /**
   * Filter and compose widgets permitted for an authenticated user
   */
  public static getPermittedWidgetsForUser(user: AuthUser, workspaceCode?: string): WidgetDefinition[] {
    const all = this.getAllWidgets();
    const isSuperAdmin = user.roles.includes('PLATFORM_SUPER_ADMIN') || user.roles.includes('SUPER_ADMIN');

    return all.filter(widget => {
      // 1. Check role binding if specified
      if (widget.roleBindings.length > 0 && !isSuperAdmin) {
        const hasRoleMatch = widget.roleBindings.some(r => user.roles.includes(r));
        if (!hasRoleMatch) return false;
      }

      // 2. Check granular permission
      if (widget.permissions.length > 0 && !isSuperAdmin) {
        const hasPerm = widget.permissions.every(p => AuthorizationEngine.hasPermission(user, p));
        if (!hasPerm) return false;
      }

      return widget.visibility;
    });
  }
}

// Pre-register standard system widgets
const STANDARD_WIDGETS: WidgetDefinition[] = [
  {
    id: 'gmv_metric',
    type: 'KPI',
    title: 'Gross Merchandise Value (GMV)',
    description: 'Total transaction volume across all platform bookings.',
    dataSource: '/api/v1/analytics/gmv',
    permissions: ['analytics.view', 'finance.view'],
    dataScope: 'GLOBAL',
    width: 3,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER'],
  },
  {
    id: 'active_trips_table',
    type: 'TABLE',
    title: 'Real-Time Active Passenger Trips',
    description: 'Day-by-day active traveler itineraries and emergency flight tracking.',
    dataSource: '/api/v1/trips',
    permissions: ['trips.view'],
    dataScope: 'ORGANIZATION',
    width: 6,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'OPERATIONS_MANAGER', 'TRAVEL_AGENT', 'CUSTOMER_SUPPORT'],
  },
  {
    id: 'platform_health_matrix',
    type: 'HEALTH',
    title: 'System & Gateway Fleet Health',
    description: 'Real-time uptime, response latency, and circuit breaker status.',
    dataSource: '/api/v1/health',
    permissions: ['settings.view', 'integrations.view'],
    dataScope: 'GLOBAL',
    width: 3,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'INTEGRATION_MANAGER'],
  },
  {
    id: 'ticketing_queue_kanban',
    type: 'KANBAN',
    title: 'Operations Ticketing & Dispatch Pipeline',
    description: 'Multi-stage dispatch: NEW -> PROCESSING -> WAITING_SUPPLIER -> CONFIRMED.',
    dataSource: '/api/v1/operations/runbook',
    permissions: ['bookings.view', 'bookings.update'],
    dataScope: 'ORGANIZATION',
    width: 8,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'OPERATIONS_MANAGER'],
  },
  {
    id: 'ai_executive_summary',
    type: 'AI_SUMMARY',
    title: 'Voyage8 AI Executive Daily Brief',
    description: 'Automated synthesis of yesterday performance, revenue bottlenecks, and supplier SLAs.',
    dataSource: '/api/v1/voyage8/copilot',
    permissions: ['ai.view', 'analytics.view'],
    dataScope: 'ORGANIZATION',
    width: 4,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'ADMIN', 'AI_OPERATOR'],
  },
  {
    id: 'partner_wallet_balance_card',
    type: 'KPI',
    title: 'Wholesale Deposit Wallet',
    description: 'Pre-funded B2B2C partner balance and instant drawdown availability.',
    dataSource: '/api/v1/b2b2c/wallet',
    permissions: ['finance.view'],
    dataScope: 'WORKSPACE',
    width: 4,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'PARTNER'],
  },
  {
    id: 'ndc_direct_carrier_feed',
    type: 'RECENT_RECORDS',
    title: 'Direct Airline NDC Pricing Stream',
    description: 'Direct airline API fares bypassing legacy GDS surcharges.',
    dataSource: '/api/v1/connectors/ndc',
    permissions: ['offers.view'],
    dataScope: 'ORGANIZATION',
    width: 6,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'SUPPLIER_MANAGER', 'TRAVEL_AGENT'],
  },
  {
    id: 'indian_tax_compliance_kpi',
    type: 'KPI',
    title: 'Section 206C(1G) TCS Liability',
    description: '20% TCS threshold monitoring against ₹7,00,000 annual remittance buffers.',
    dataSource: '/api/v1/finance/tax',
    permissions: ['finance.view'],
    dataScope: 'ORGANIZATION',
    width: 4,
    visibility: true,
    roleBindings: ['PLATFORM_SUPER_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
  },
];

STANDARD_WIDGETS.forEach(w => DashboardEngine.registerWidget(w));
