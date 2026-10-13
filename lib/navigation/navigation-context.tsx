'use client';

/**
 * Travel Planet (Voyage8) — Navigation Context & State Provider
 * 
 * Provides reactive access to:
 * - Experience Mode: [Simple] vs [Advanced]
 * - Active Role Selection (Travel Agent, Branch Manager, Enterprise Admin, Customer)
 * - Active Branch Context (HQ, Kochi, Dubai, Trivandrum, Singapore)
 * - Resolved Role-Based & Goal-Based Menus
 * - Intelligent Global Search Modal State
 * - Universal Quick Action Dialog State
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { ResolvedNavigationCategory, RoleMenuResolver } from './role-menu-resolver';
import { BranchContextManager, BranchDefinition, CANONICAL_BRANCHES } from './branch-context';
import { AINavigationAssistant, AINavResolution } from './ai-nav-assistant';

export type ExperienceMode = 'simple' | 'advanced';

interface NavigationContextType {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
  currentRole: string;
  setCurrentRole: (role: string) => void;
  availableRoles: Array<{ code: string; label: string; description: string }>;
  currentBranch: BranchDefinition;
  setCurrentBranch: (branch: BranchDefinition) => void;
  availableBranches: BranchDefinition[];
  resolvedCategories: ResolvedNavigationCategory[];
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (open: boolean) => void;
  executeAIQuery: (query: string) => AINavResolution;
}

const AVAILABLE_ROLES = [
  { code: 'PLATFORM_SUPER_ADMIN', label: 'Platform Super Admin', description: 'Enterprise Command Center & Platform Studio' },
  { code: 'BRANCH_MANAGER', label: 'Branch Manager', description: 'Regional Team, Sales Overview, Approvals & Operations' },
  { code: 'TRAVEL_AGENT', label: 'Travel Agent / Consultant', description: "Today's Work, Leads, Quotes & Itinerary Desk" },
  { code: 'CUSTOMER', label: 'B2C Traveler (Customer)', description: 'My Travel Space, Upcoming Trips & Community' },
];

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // 1. Experience Mode State (Defaults to 'simple')
  const [mode, setModeState] = useState<ExperienceMode>('simple');

  // 2. Role State (Defaults to PLATFORM_SUPER_ADMIN for admin, but allows 1-click switching)
  const [currentRole, setCurrentRole] = useState<string>('PLATFORM_SUPER_ADMIN');

  // 3. Branch State (Defaults to HQ)
  const [currentBranch, setCurrentBranch] = useState<BranchDefinition>(CANONICAL_BRANCHES[0]);

  // 4. Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Load persisted preferences from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('tp_experience_mode') as ExperienceMode;
      if (savedMode === 'simple' || savedMode === 'advanced') {
        setModeState(savedMode);
      }
      const savedRole = localStorage.getItem('tp_current_role');
      if (savedRole) {
        setCurrentRole(savedRole);
      }
      const savedBranchId = localStorage.getItem('tp_current_branch');
      if (savedBranchId) {
        const found = BranchContextManager.getBranch(savedBranchId);
        if (found) setCurrentBranch(found);
      }
    }
  }, []);

  // Sync Clerk user permissions & super admin elevation
  const { user: clerkUser } = useUser();
  useEffect(() => {
    if (clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
      const isSuper = 
        email === 'amal50058@gmail.com' || 
        email.startsWith('amal50058@') ||
        clerkUser.publicMetadata?.role === 'PLATFORM_SUPER_ADMIN' ||
        (clerkUser.publicMetadata?.roles as string[])?.includes('PLATFORM_SUPER_ADMIN');

      if (isSuper) {
        setCurrentRole('PLATFORM_SUPER_ADMIN');
      }
    }
  }, [clerkUser]);

  const setMode = (newMode: ExperienceMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tp_experience_mode', newMode);
    }
  };

  const toggleMode = () => {
    const next = mode === 'simple' ? 'advanced' : 'simple';
    setMode(next);
  };

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tp_current_role', newRole);
    }
  };

  const handleBranchChange = (newBranch: BranchDefinition) => {
    setCurrentBranch(newBranch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tp_current_branch', newBranch.id);
    }
  };

  // Available branches filtered by role
  const availableBranches = useMemo(() => {
    return BranchContextManager.getAllowedBranches([currentRole], currentBranch.id);
  }, [currentRole, currentBranch.id]);

  // Compute resolved goal-based menus dynamically
  const resolvedCategories = useMemo(() => {
    return RoleMenuResolver.resolveMenu({
      userRoles: [currentRole],
      mode,
      branchId: currentBranch.id,
      includeDynamicCRUDE8: true,
    });
  }, [currentRole, mode, currentBranch.id]);

  const executeAIQuery = (query: string): AINavResolution => {
    const res = AINavigationAssistant.resolve(query, {
      id: 'usr_active',
      email: 'operator@travelplanet.in',
      fullName: 'Operator',
      roles: [currentRole],
      organizationId: currentBranch.id,
    });

    if (res.type === 'BRANCH_SWITCH' && res.branch) {
      handleBranchChange(res.branch);
    }

    return res;
  };

  return (
    <NavigationContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        currentRole,
        setCurrentRole: handleRoleChange,
        availableRoles: AVAILABLE_ROLES,
        currentBranch,
        setCurrentBranch: handleBranchChange,
        availableBranches,
        resolvedCategories,
        isSearchOpen,
        setIsSearchOpen,
        isQuickActionOpen,
        setIsQuickActionOpen,
        executeAIQuery,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
