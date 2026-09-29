# RBAC / RBWA / MULTITENANCY

## Roles

PLATFORM_SUPER_ADMIN, ADMIN, OPERATIONS_MANAGER, TRAVEL_AGENT, SALES_MANAGER, CRM_MANAGER, FINANCE_MANAGER, ACCOUNTANT, SUPPLIER_MANAGER, VENDOR_ADMIN, VENDOR_OPERATOR, CUSTOMER_SUPPORT, CONTENT_MANAGER, MARKETING_MANAGER, INTEGRATION_MANAGER, AI_OPERATOR, ANALYST, CUSTOMER, PARTNER.

## Permission syntax

`<DOMAIN>.<RESOURCE>.<ACTION>`

## Scopes

GLOBAL, ORGANIZATION, WORKSPACE, TEAM, ASSIGNED, OWN_RECORDS, OWN_CUSTOMERS, OWN_VENDOR, READ_ONLY.

## Authorization functions

hasPermission, hasAnyPermissions, hasAllPermissions, getDataScope, canAccessResource, canPerform.

## RBWA

Each role may have dedicated navigation, dashboard, KPIs, workflows, notifications, reports, AI assistant, search, shortcuts, permissions, theme preferences and widgets.

## Security

Navigation hiding is not authorization. Server/page/API/action/query/mutation enforcement is mandatory.

## Multi-role

Users switch workspaces/modes rather than receiving a confusing merged interface.
