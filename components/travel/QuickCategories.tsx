'use client';

import React from 'react';
import Image from 'next/image';
import { Wand2 } from 'lucide-react';

const CATEGORIES = [
  { label: 'Flights', sub: 'Best fares worldwide', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=200&auto=format&fit=crop' },
  { label: 'Hotels', sub: 'Stays for every journey', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=200&auto=format&fit=crop' },
  { label: 'Packages', sub: 'Curated holiday deals', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=200&auto=format&fit=crop' },
  { label: 'Experiences', sub: 'Unforgettable moments', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop' },
  { label: 'Cars', sub: 'Drive your adventure', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=200&auto=format&fit=crop' },
  { label: 'Transfers', sub: 'Travel with ease', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=200&auto=format&fit=crop' },
  { label: 'Cruises', sub: 'Sail to new horizons', img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=200&auto=format&fit=crop' },
  { label: 'Visa', sub: 'Hassle-free travel', img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop' },
];

export const QuickCategories: React.FC = () => {
  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {CATEGORIES.map((c) => (
            <div key={c.label} className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition group">
              <div className="w-14 h-14 rounded-2xl overflow-hidden mb-2 shadow-sm group-hover:scale-105 transition relative">
                <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-slate-900">{c.label}</span>
              <span className="text-[10px] text-slate-400">{c.sub}</span>
            </div>
          ))}

          {/* Plan a Trip pill */}
          <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-sky-50 cursor-pointer transition group border border-dashed border-sky-200">
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
              <Wand2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-sky-600">Plan a Trip</span>
            <span className="text-[10px] text-slate-400">Build your journey</span>
          </div>
        </div>
      </div>
    </section>
  );
};
