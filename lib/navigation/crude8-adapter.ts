/**
 * Travel Planet OS — CRUDE8 Dynamic Navigation Generator
 * 
 * CORE REQUIREMENT:
 * Menus generated from Capability Registry. NOT STATIC.
 * Every menu item includes: Entity, Actions, Permission, Workflow, Analytics.
 */

import { CRUD_CAPABILITY_MATRIX } from '../crude8/capability-matrix';
import { NavigationItem } from './types';
import { getBusinessTitle } from './aliases';

export interface DynamicEntityMenuItem extends NavigationItem {
  entityName: string;
  actions: string[];
  permission: string;
  workflow: string;
  analytics: string;
  moduleGroup: string;
}

/**
 * Reads directly from the live CRUDE8 Capability Matrix and synthesizes
 * dynamic, governed navigation items.
 */
export function generateDynamicCrude8MenuItems(): DynamicEntityMenuItem[] {
  const dynamicItems: DynamicEntityMenuItem[] = [];

  for (const [entityKey, profile] of Object.entries(CRUD_CAPABILITY_MATRIX)) {
    const primaryRoute = profile.pages.find((p) => p.view === 'LIST')?.route || profile.pages[0]?.route || `/admin/crude8?entity=${entityKey}`;
    
    // Aggregate actions: CRUD + bulk + workflow
    const allActions = Array.from(new Set([
      ...profile.crudActions,
      ...profile.bulkActions,
      ...profile.workflowActions
    ]));

    // Format workflows
    const workflowSummary = profile.workflowActions.length > 0 
      ? profile.workflowActions.join(' • ') 
      : (profile.lifecycleField ? `Lifecycle: ${profile.lifecycleField}` : 'Standard CRUD');

    // Format analytics
    const analyticsSummary = profile.reports && profile.reports.length > 0 
      ? profile.reports.slice(0, 2).join(' | ') 
      : (profile.aiActions && profile.aiActions.length > 0 ? profile.aiActions[0] : 'Telemetry & Audit');

    // Determine read/manage permission
    const readRoles = profile.actionPermissions['READ'] || ['ADMIN'];
    const primaryPermission = readRoles.includes('*') ? '*' : `${entityKey.toLowerCase()}.read`;

    // Map module group to business category
    let moduleGroup = 'OPERATIONS';
    if (['Lead', 'Customer', 'Quote', 'Deal', 'Contact'].includes(entityKey)) {
      moduleGroup = 'CUSTOMERS_AND_SALES';
    } else if (['Booking', 'Trip', 'TravelPackage', 'Supplier', 'Flight', 'Hotel'].includes(entityKey)) {
      moduleGroup = 'TRAVEL_OPERATIONS';
    } else if (['Document', 'Passport', 'Visa', 'Contract', 'Template'].includes(entityKey)) {
      moduleGroup = 'DOCUMENTS';
    } else if (['Payment', 'Invoice', 'Ledger', 'Settlement', 'Expense'].includes(entityKey)) {
      moduleGroup = 'FINANCE';
    } else if (['Campaign', 'Content', 'Page', 'Theme', 'Media'].includes(entityKey)) {
      moduleGroup = 'WEBSITE_AND_MARKETING';
    } else if (['User', 'Tenant', 'Role', 'AuditLog', 'Setting'].includes(entityKey)) {
      moduleGroup = 'SETTINGS';
    }

    dynamicItems.push({
      id: `crude8-${entityKey.toLowerCase()}`,
      label: getBusinessTitle(profile.displayName || entityKey),
      href: primaryRoute,
      icon: getIconForEntity(entityKey),
      badge: `${allActions.length} Actions`,
      description: `Governed ${profile.displayName} with ${profile.workflowActions.length} workflows`,
      techLabel: `CRUDE8 [${entityKey}]`,
      permission: primaryPermission,
      entityName: entityKey,
      actions: allActions,
      workflow: workflowSummary,
      analytics: analyticsSummary,
      moduleGroup,
    });
  }

  return dynamicItems;
}

function getIconForEntity(entity: string): string {
  const map: Record<string, string> = {
    User: 'Users',
    Tenant: 'Building',
    Lead: 'UserPlus',
    Customer: 'Users',
    Trip: 'Compass',
    Booking: 'CheckCircle2',
    TravelPackage: 'Package',
    Supplier: 'Handshake',
    Invoice: 'FileText',
    Payment: 'DollarSign',
    Document: 'FileText',
    Campaign: 'Megaphone',
  };
  return map[entity] || 'Layers';
}

/**
 * Filter dynamic CRUDE8 items by module group
 */
export function getCrude8ItemsForGroup(group: string): DynamicEntityMenuItem[] {
  const all = generateDynamicCrude8MenuItems();
  return all.filter((item) => item.moduleGroup === group);
}
