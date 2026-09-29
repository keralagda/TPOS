'use client';

import React from 'react';
import { Globe, Search, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/travel/LanguageSwitcher';

export const Navbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition">
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">TRAVEL PLANET</span>
            <span className="text-[10px] font-semibold text-sky-600 tracking-wider uppercase mt-0.5">Voyage8 Powered</span>
          </div>
        </Link>

        {/* Main Nav Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-slate-700">
          <Link href="/destinations" className="text-sky-600 hover:text-sky-700 transition">Explore</Link>
          <Link href="/circles" data-tour="social-circles" className="text-sky-700 hover:text-sky-600 transition flex items-center gap-1 font-bold">
            <Users className="w-3.5 h-3.5" />
            Circles
          </Link>
          <Link href="/packages" className="hover:text-sky-600 transition">Packages</Link>
          <Link href="/ideas" className="hover:text-sky-600 transition">Innovation</Link>
          <Link href="/help" className="hover:text-sky-600 transition">Help & Docs</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          <LanguageSwitcher />
          <Link href="/trips" className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">My Trips</span>
          </Link>
          <Link href="#ai-planner" data-tour="ai-planner" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-sm hover:shadow transition">
            Plan Trip
          </Link>
        </div>
      </div>
    </header>
  );
};
