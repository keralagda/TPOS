'use client';

import React from 'react';
import { Search, MapPin, Hotel, Utensils, Landmark, Sparkles, Briefcase, LifeBuoy, UserCheck, Bus, Activity } from 'lucide-react';

const DIRECTORY_ITEMS = [
  { label: 'Destinations', icon: MapPin },
  { label: 'Hotels', icon: Hotel },
  { label: 'Restaurants', icon: Utensils },
  { label: 'Attractions', icon: Landmark },
  { label: 'Experiences', icon: Sparkles },
  { label: 'Tour Operators', icon: Briefcase },
  { label: 'Travel Services', icon: LifeBuoy },
  { label: 'Local Guides', icon: UserCheck },
  { label: 'Transport', icon: Bus },
  { label: 'Activities', icon: Activity },
];

export const DirectoryBanner: React.FC = () => {
  return (
    <section className="py-16 px-4 text-white relative bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop')" }}>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything worth discovering, in one place.</h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium">Explore the Travel Planet directory</p>

        <div className="mt-6 max-w-2xl mx-auto bg-white rounded-full p-2 flex items-center shadow-xl">
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input
            type="text"
            placeholder="Search destinations, places, businesses and experiences"
            className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-full text-xs font-bold transition">
            Search
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 mt-10 text-center">
          {DIRECTORY_ITEMS.map(({ label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer transition group">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-sky-600 transition">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
