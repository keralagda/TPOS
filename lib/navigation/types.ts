/**
 * Travel Planet OS — Goal-Based Navigation Architecture Types
 * Dual Navigation System: Business Experience Layer (Layer 1) & Advanced Platform Layer (Layer 2)
 */

export type ExperienceMode = 'simple' | 'advanced' | 'expert';

export type OperationModeType =
  | 'HOME'
  | 'TRAVEL'
  | 'CUSTOMERS_SALES'
  | 'OPERATIONS'
  | 'PACKAGES'
  | 'SUPPLIERS'
  | 'WEBSITE_CONTENT'
  | 'SEO_GROWTH'
  | 'MARKETING'
  | 'COMMUNITY'
  | 'DOCUMENTS'
  | 'FINANCE'
  | 'REPORTS_INSIGHTS'
  | 'AI_ASSISTANT'
  | 'BRANCH_MANAGEMENT'
  | 'PLATFORM_STUDIO'
  | 'SETTINGS';

export type UserRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'SAAS_ADMIN'
  | 'SECURITY_ADMIN'
  | 'INTEGRATION_ADMIN'
  | 'AI_ADMIN'
  | 'PLATFORM_ANALYST'
  | 'ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'REGIONAL_MANAGER'
  | 'BRANCH_MANAGER'
  | 'OPERATIONS_MANAGER'
  | 'SALES_MANAGER'
  | 'FINANCE_MANAGER'
  | 'SUPPLIER_MANAGER'
  | 'CONTENT_MANAGER'
  | 'MARKETING_MANAGER'
  | 'CRM_MANAGER'
  | 'SUPPORT_MANAGER'
  | 'ACCOUNTANT'
  | 'TRAVEL_AGENT'
  | 'SALES_AGENT'
  | 'OPERATIONS_AGENT'
  | 'FINANCE_EXECUTIVE'
  | 'CONTENT_EDITOR'
  | 'MARKETING_EXECUTIVE'
  | 'CUSTOMER_SUPPORT'
  | 'INTEGRATION_MANAGER'
  | 'AI_OPERATOR'
  | 'ANALYST'
  | 'CUSTOMER'
  | 'CORPORATE_TRAVELER'
  | 'PARTNER'
  | 'VENDOR_ADMIN'
  | 'VENDOR_MANAGER'
  | 'VENDOR_OPERATOR'
  | 'VENDOR_FINANCE'
  | 'VENDOR_CONTENT'
  | 'PARTNER_ADMIN'
  | 'PARTNER_AGENT'
  | 'DMC_USER'
  | 'HOTEL_USER'
  | 'TRANSPORT_OPERATOR'
  | 'EXPERIENCE_PROVIDER';

export interface BranchDefinition {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  currency: string;
  isHQ: boolean;
  timeZone: string;
  activeAgentsCount: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
  description?: string;
  techLabel?: string; // e.g., "Powered by VIBE8"
  permission?: string;
  requiredRoles?: UserRole[];
  isAdvancedOnly?: boolean;
  entityName?: string;
  actions?: string[];
  workflow?: string;
  analytics?: string;
}

export interface NavigationSection {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  isAdvancedOnly?: boolean;
  requiredRoles?: UserRole[];
  items: NavigationItem[];
}

export interface IntelligentSearchResult {
  query: string;
  title: string;
  subtitle: string;
  url: string;
  entity?: string;
  module: string;
  action?: string;
  permission?: string;
  confidence: number;
  category: 'NAVIGATION' | 'RECORD' | 'ACTION' | 'AI_PROMPT';
}

export interface QuickActionItem {
  id: string;
  label: string;
  actionCode: string;
  icon: string;
  targetUrl: string;
  permission?: string;
  category: string;
  shortcut?: string;
}

export interface AINavigationResolution {
  understoodIntent: string;
  resolvedEntity?: string;
  resolvedModule: string;
  resolvedAction?: string;
  targetUrl: string;
  branchSwitch?: string;
  confirmationText: string;
  suggestedFollowUps?: string[];
}
