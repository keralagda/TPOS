'use client';

import React from 'react';
import { Globe, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-14 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          
          <div className="col-span-2">
            <div className="flex items-center space-x-2 text-white mb-3">
              <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">TRAVEL PLANET</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm mb-4">
              The world, planned your way. A unified travel management and directory OS powered by H8 & Voyage8 travel intelligence.
            </p>
            <div className="flex space-x-3 text-slate-400">
              <a href="#" className="hover:text-white"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="#explore" className="hover:text-white">Destinations</Link></li>
              <li><Link href="#stays" className="hover:text-white">Hotels & Stays</Link></li>
              <li><Link href="#flights" className="hover:text-white">Flights</Link></li>
              <li><Link href="#packages" className="hover:text-white">Packages</Link></li>
              <li><Link href="#experiences" className="hover:text-white">Experiences</Link></li>
              <li><Link href="#directory" className="hover:text-white">Travel Directory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Plan</h4>
            <ul className="space-y-2">
              <li><Link href="#ai-planner" className="hover:text-white">AI Trip Planner</Link></li>
              <li><a href="#" className="hover:text-white">Itineraries</a></li>
              <li><a href="#" className="hover:text-white">Visa Services</a></li>
              <li><a href="#" className="hover:text-white">Travel Documents</a></li>
              <li><a href="#" className="hover:text-white">Travel Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Booking Support</a></li>
              <li><a href="#" className="hover:text-white">Cancellation</a></li>
              <li><a href="#" className="hover:text-white">Refunds</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Partners</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Become a Partner</a></li>
              <li><Link href="/admin" className="hover:text-white text-sky-400 font-semibold">Vendor Login</Link></li>
              <li><a href="#" className="hover:text-white">Partner Portal</a></li>
              <li><a href="#" className="hover:text-white">API / Integrations</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 Travel Planet. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-slate-400">Sitemap</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400">Terms</a>
            <span>•</span>
            <span className="text-slate-300 font-bold">INR (₹)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
