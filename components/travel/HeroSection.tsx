'use client';

import React, { useState } from 'react';
import { Compass, Layers, Plane, Building, Package, Sparkles, Car, MapPin, Calendar, Users, Search } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'flights' | 'hotels' | 'packages' | 'experiences' | 'transport'>('all');
  const [destination, setDestination] = useState('');

  return (
    <section className="relative min-h-[580px] flex items-center py-16 px-4 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(10, 25, 47, 0.45), rgba(10, 25, 47, 0.35)), url('https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2000&auto=format&fit=crop')" }}>
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Hero Tagline & Heading */}
        <div className="max-w-2xl text-white mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase mb-4">
            <Compass className="w-3.5 h-3.5 text-sky-300" />
            Your Next Journey Starts Here
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4 text-white drop-shadow-md">
            Go somewhere <br /><span className="text-sky-200">worth remembering.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-100 font-medium max-w-xl drop-shadow">
            Discover destinations, stays, experiences and travel deals from across the world.
          </p>
        </div>

        {/* Search Shell Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/40 max-w-5xl">
          
          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 border-b border-slate-200/80 text-xs sm:text-sm font-semibold">
            {[
              { id: 'all', label: 'All Travel', icon: Layers },
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'hotels', label: 'Hotels', icon: Building },
              { id: 'packages', label: 'Packages', icon: Package },
              { id: 'experiences', label: 'Experiences', icon: Sparkles },
              { id: 'transport', label: 'Transport', icon: Car },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 transition ${
                  activeTab === id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 bg-slate-50/90 rounded-xl p-2.5 border border-slate-200 hover:border-sky-500 transition">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Where do you want to go?</label>
              <div className="flex items-center space-x-2 mt-0.5">
                <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Destination, hotel or experience"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="md:col-span-3 bg-slate-50/90 rounded-xl p-2.5 border border-slate-200 hover:border-sky-500 transition">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Dates</label>
              <div className="flex items-center space-x-2 mt-0.5">
                <Calendar className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <input
                  type="text"
                  defaultValue="15 Oct - 20 Oct"
                  className="bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-50/90 rounded-xl p-2.5 border border-slate-200 hover:border-sky-500 transition">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Travellers</label>
              <div className="flex items-center space-x-2 mt-0.5">
                <Users className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <select className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none w-full">
                  <option>1 Traveller</option>
                  <option>2 Travellers</option>
                  <option>3 Travellers</option>
                  <option>Family (4+)</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-50/90 rounded-xl p-2.5 border border-slate-200 hover:border-sky-500 transition">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Type of travel</label>
              <div className="flex items-center space-x-2 mt-0.5">
                <Compass className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <select className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none w-full">
                  <option>Any</option>
                  <option>Leisure</option>
                  <option>Adventure</option>
                  <option>Honeymoon</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-1">
              <button
                type="button"
                className="w-full h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-sky-600/30 transition hover:scale-102"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Popular Destination Tags */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Popular:</span>
            {['Dubai', 'Bali', 'Singapore', 'Thailand', 'Kashmir', 'Kerala', 'Europe'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setDestination(city)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-600 font-semibold text-slate-700 transition"
              >
                {city}
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
