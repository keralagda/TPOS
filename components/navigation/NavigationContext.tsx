'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ExperienceMode, 
  UserRole, 
  BranchDefinition, 
  NavigationSection 
} from '@/lib/navigation/types';
import { DEFAULT_BRANCH, getBranchById } from '@/lib/navigation/branches';
import { resolveNavigation, ResolvedNavigationState } from '@/lib/navigation/role-menus';

interface NavigationContextValue {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  branch: BranchDefinition;
  setBranch: (branchId: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  aiAssistOpen: boolean;
  setAiAssistOpen: (open: boolean) => void;
  quickActionsOpen: boolean;
  setQuickActionsOpen: (open: boolean) => void;
  resolvedNav: ResolvedNavigationState;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ExperienceMode>('simple');
  const [role, setRoleState] = useState<UserRole>('PLATFORM_SUPER_ADMIN');
  const [branch, setBranchState] = useState<BranchDefinition>(DEFAULT_BRANCH);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Load persisted mode / role / branch from localStorage or auth cookies if in client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('tpos_experience_mode') as ExperienceMode;
      if (savedMode === 'simple' || savedMode === 'advanced' || savedMode === 'expert') {
        setModeState(savedMode);
      }
      
      // Check active role cookie first, then localStorage
      const cookieMatch = document.cookie.match(/tp_dev_user_role=([^;]+)/);
      const cookieRole = cookieMatch ? (decodeURIComponent(cookieMatch[1]) as UserRole) : null;
      const savedRole = (localStorage.getItem('tpos_active_role') as UserRole) || cookieRole;
      
      if (savedRole) {
        setRoleState(savedRole);
      }
      const savedBranch = localStorage.getItem('tpos_active_branch');
      if (savedBranch) {
        setBranchState(getBranchById(savedBranch));
      }
    }
  }, []);

  const setMode = (newMode: ExperienceMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tpos_experience_mode', newMode);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tpos_active_role', newRole);
    }
  };

  const setBranch = (branchId: string) => {
    const selected = getBranchById(branchId);
    setBranchState(selected);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tpos_active_branch', selected.id);
    }
  };

  // Keyboard shortcut listener: Ctrl+K or Cmd+K opens Intelligent Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setAiAssistOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resolvedNav = resolveNavigation({
    role,
    branchId: branch.id,
    mode,
  });

  return (
    <NavigationContext.Provider
      value={{
        mode,
        setMode,
        role,
        setRole,
        branch,
        setBranch,
        searchOpen,
        setSearchOpen,
        aiAssistOpen,
        setAiAssistOpen,
        quickActionsOpen,
        setQuickActionsOpen,
        resolvedNav,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    // Return safe fallback if rendered outside provider
    const fallbackBranch = DEFAULT_BRANCH;
    const fallbackNav = resolveNavigation({ role: 'PLATFORM_SUPER_ADMIN', mode: 'simple' });
    return {
      mode: 'simple' as ExperienceMode,
      setMode: () => {},
      role: 'PLATFORM_SUPER_ADMIN' as UserRole,
      setRole: () => {},
      branch: fallbackBranch,
      setBranch: () => {},
      searchOpen: false,
      setSearchOpen: () => {},
      aiAssistOpen: false,
      setAiAssistOpen: () => {},
      quickActionsOpen: false,
      setQuickActionsOpen: () => {},
      resolvedNav: fallbackNav,
    };
  }
  return ctx;
}
