'use client';

import React from 'react';
import { Globe, Users, Mic } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/travel/LanguageSwitcher';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';

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
          <Link href="/voice" className="text-slate-600 hover:text-sky-600 transition flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-sky-500" />
            <span>Voice Nav</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          {/* Direct Voice Nav Trigger */}
          <Link
            href="/voice"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition border border-sky-200 shadow-xs"
            title="Multilingual Voice Navigation (VN8 / VO8)"
          >
            <Mic className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span className="hidden sm:inline">Voice Nav</span>
          </Link>

          <LanguageSwitcher />

          <ClerkLoading>
            <div className="flex items-center space-x-2">
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full shadow-sm hover:shadow transition"
              >
                Sign Up
              </Link>
            </div>
          </ClerkLoading>

          <ClerkLoaded>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full shadow-sm hover:shadow transition cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/admin/dashboard"
                className="text-xs font-semibold text-slate-600 hover:text-sky-600 transition mr-2 hidden sm:inline-block"
              >
                Workspace
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};
