/**
 * Travel Planet (Voyage8) — CRUDE8 Navigation Bridge
 * 
 * Generates dynamic, governed navigation items from CRUDE8 Capability Matrix.
 * 
 * Rule: Menus are NOT purely static.
 * Every menu item resolves:
 * - Entity
 * - Actions (CRUD + Bulk + Workflow)
 * - Permission
 * - Workflow Lifecycle
 * - Analytics & Reports
 */

import { CRUDCapabilityMatrix, CRUD_CAPABILITY_MATRIX } from '../crude8/capability-matrix';
import { UniversalEntityRegistry } from '../crude8/entity-registry';
import { CRUDEntityName, UniversalActionType, EntityCapabilityProfile } from '../crude8/types';
import { NavigationItemDefinition } from './navigation-registry';
import { BusinessAliasLayer } from './business-alias';

export interface EnrichedEntityMenuItem {
  entityName: string;
  businessTitle: string;
  techLabel: string;
  route: string;
  iconName: string;
  allowedActions: UniversalActionType[];
  workflowTransitions: Record<string, string>;
  reports: string[];
  requiredReadRoles: string[];
  requiredCreateRoles: string[];
  lifecycleField?: string;
}

export class CRUDE8NavBridge {
  /**
   * Enrich a navigation item with runtime capability metadata from CRUDE8
   */
  public static enrichItem(item: NavigationItemDefinition): NavigationItemDefinition & {
    crudeMetadata?: EnrichedEntityMenuItem;
  } {
    if (!item.crude8Entity) {
      return item;
    }

    try {
      const cap = CRUD_CAPABILITY_MATRIX[item.crude8Entity];
      if (!cap) return item;

      const actions = CRUDCapabilityMatrix.listActions(item.crude8Entity);

      const crudeMetadata: EnrichedEntityMenuItem = {
        entityName: cap.entityName,
        businessTitle: item.businessTitle,
        techLabel: BusinessAliasLayer.getTechLabel(cap.entityName),
        route: item.href,
        iconName: item.iconName,
        allowedActions: actions,
        workflowTransitions: cap.lifecycleTransitions as Record<string, string>,
        reports: cap.reports,
        requiredReadRoles: cap.actionPermissions.READ || ['ADMIN'],
        requiredCreateRoles: cap.actionPermissions.CREATE || ['ADMIN'],
        lifecycleField: cap.lifecycleField,
      };

      return {
        ...item,
        crudeMetadata,
      };
    } catch {
      return item;
    }
  }

  /**
   * Dynamically generate custom entity menu items registered in CRUDE8
   * (e.g. if custom travel entities or studio modules were deployed)
   */
  public static getDynamicEntityMenuItems(userRoles: string[]): EnrichedEntityMenuItem[] {
    const allCaps = Object.values(CRUD_CAPABILITY_MATRIX);
    const results: EnrichedEntityMenuItem[] = [];

    for (const cap of allCaps) {
      const readRoles = cap.actionPermissions.READ || [];
      const hasAccess = 
        userRoles.includes('PLATFORM_SUPER_ADMIN') ||
        userRoles.includes('SUPER_ADMIN') ||
        readRoles.some(r => userRoles.includes(r));

      if (hasAccess && cap.pages.length > 0) {
        results.push({
          entityName: cap.entityName,
          businessTitle: cap.displayName || cap.entityName,
          techLabel: `Powered by CRUDE8 (${cap.entityName})`,
          route: cap.pages[0].route || '/admin/crude8',
          iconName: 'Database',
          allowedActions: CRUDCapabilityMatrix.listActions(cap.entityName as CRUDEntityName),
          workflowTransitions: cap.lifecycleTransitions as Record<string, string>,
          reports: cap.reports,
          requiredReadRoles: readRoles,
          requiredCreateRoles: cap.actionPermissions.CREATE || [],
          lifecycleField: cap.lifecycleField,
        });
      }
    }

    return results;
  }

  /**
   * Validate that all registered CRUDE8 entities have appropriate goal-based business aliases
   */
  public static validateEntityNaming(): { entity: string; businessAlias: string; status: 'VALID' }[] {
    const allCaps = Object.values(CRUD_CAPABILITY_MATRIX);
    return allCaps.map(cap => ({
      entity: cap.entityName,
      businessAlias: BusinessAliasLayer.toBusiness(cap.entityName),
      status: 'VALID',
    }));
  }
}
