/**
 * Travel Planet OS — Branch Context Registry & Resolver
 * Enables multi-branch awareness across Kochi, Dubai, Delhi, Mumbai, and Global HQ.
 */

import { BranchDefinition } from './types';

export const BRANCH_REGISTRY: Record<string, BranchDefinition> = {
  global_hq: {
    id: 'global_hq',
    code: 'HQ-GLOBAL',
    name: 'Global Headquarters (All Branches)',
    city: 'Global',
    country: 'International',
    currency: 'INR',
    isHQ: true,
    timeZone: 'UTC+05:30',
    activeAgentsCount: 42,
  },
  branch_kochi: {
    id: 'branch_kochi',
    code: 'BR-COK-01',
    name: 'Kochi Branch (Kerala)',
    city: 'Kochi',
    country: 'India',
    currency: 'INR',
    isHQ: false,
    timeZone: 'UTC+05:30',
    activeAgentsCount: 14,
  },
  branch_dubai: {
    id: 'branch_dubai',
    code: 'BR-DXB-01',
    name: 'Dubai Branch (Deira & Marina)',
    city: 'Dubai',
    country: 'United Arab Emirates',
    currency: 'AED',
    isHQ: false,
    timeZone: 'UTC+04:00',
    activeAgentsCount: 8,
  },
  branch_delhi: {
    id: 'branch_delhi',
    code: 'BR-DEL-01',
    name: 'Delhi NCR Branch (Connaught Place)',
    city: 'New Delhi',
    country: 'India',
    currency: 'INR',
    isHQ: false,
    timeZone: 'UTC+05:30',
    activeAgentsCount: 12,
  },
  branch_mumbai: {
    id: 'branch_mumbai',
    code: 'BR-BOM-01',
    name: 'Mumbai Branch (BKC)',
    city: 'Mumbai',
    country: 'India',
    currency: 'INR',
    isHQ: false,
    timeZone: 'UTC+05:30',
    activeAgentsCount: 10,
  },
  branch_singapore: {
    id: 'branch_singapore',
    code: 'BR-SIN-01',
    name: 'Singapore APAC Hub',
    city: 'Singapore',
    country: 'Singapore',
    currency: 'SGD',
    isHQ: false,
    timeZone: 'UTC+08:00',
    activeAgentsCount: 6,
  },
};

export const DEFAULT_BRANCH = BRANCH_REGISTRY.global_hq;

export function getAllBranches(): BranchDefinition[] {
  return Object.values(BRANCH_REGISTRY);
}

export function getBranchById(idOrCode: string): BranchDefinition {
  if (BRANCH_REGISTRY[idOrCode]) return BRANCH_REGISTRY[idOrCode];
  const found = Object.values(BRANCH_REGISTRY).find(
    (b) =>
      b.code.toLowerCase() === idOrCode.toLowerCase() ||
      b.city.toLowerCase() === idOrCode.toLowerCase() ||
      b.name.toLowerCase().includes(idOrCode.toLowerCase())
  );
  return found || DEFAULT_BRANCH;
}
