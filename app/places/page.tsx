'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  MapPin, Sparkles, Star, Compass, ArrowRight, 
  Search, Eye, ShieldCheck, Heart, Camera 
} from 'lucide-react';
import Link from 'next/link';

interface GemItem {
  id: string;
  slug: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  bestTime: string;
  secretTip: string;
  verifiedLocal: string;
}

export default function PlacesDiscoveryPage() {
  const [query, setQuery] = useState('');

  const places: GemItem[] = [
    {
      id: 'GEM-01',
      slug: 'al-qudra-lakes-sunset',
      name: 'Al Qudra Desert Oasis & Love Lake',
      location: 'Dubai, UAE',
      category: 'Desert Secret Viewpoint',
      rating: 4.9,
      bestTime: '5:30 PM (Sunset Golden Hour)',
      secretTip: 'Visit the inner lagoon trail by 4x4 for quiet flamingos away from tourist coaches.',
      verifiedLocal: 'Rashid Al-Maktoum (Bedouin Guide)',
    },
    {
      id: 'GEM-02',
      slug: 'munnar-kolukkumalai-sunrise',
      name: 'Kolukkumalai Tea Estate (Highest in World)',
      location: 'Munnar, Kerala',
      category: 'High-Altitude Ridge',
      rating: 5.0,
      bestTime: '4:45 AM (Sunrise Cloudbed)',
      secretTip: 'Take the rugged jeep trail from Suryanelli; sip orthodox orange pekoe right as mist breaks.',
      verifiedLocal: 'Mathew Varghese (Tea Planter)',
    },
    {
      id: 'GEM-03',
      slug: 'tibumana-hidden-waterfall',
      name: 'Tibumana Hidden Waterfall Ravine',
      location: 'Bangli, Bali',
      category: 'Jungle Swimming Hole',
      rating: 4.8,
      bestTime: '8:00 AM (Before crowds)',
      secretTip: 'The bamboo bridge path has natural coconut water vendors with fresh morning harvest.',
      verifiedLocal: 'Wayan Sudiarta (Ubud Local)',
    },
    {
      id: 'GEM-04',
      slug: 'blausee-crystal-lake-switzerland',
      name: 'Blausee Alpine Subterranean Lake',
      location: 'Kandersteg, Switzerland',
      category: 'Crystal Blue Alpine Sanctuary',
      rating: 4.9,
      bestTime: 'Early Autumn Morning',
      secretTip: 'Row the glass-bottom wooden boats to view sunken tree trunks preserved in glacial water.',
      verifiedLocal: 'Lukas Steiner (Alpine Ranger)',
    },
  ];

  const filtered = places.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.location.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <InternalLayout
      headerTitle="Places Discovery & Hidden Gems"
      headerSubtitle="Curated Destination Spots • Powered by GEM8"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            GEM8 Discovery Engine
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search offbeat places, viewpoints, secret waterfalls..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="text-xs text-slate-400">
            <span>Verified Gems: <strong className="text-white">{places.length}</strong></span>
          </div>
        </div>

        {/* Places Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((gem) => (
            <div
              key={gem.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-amber-500/50 transition group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {gem.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{gem.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition tracking-tight">
                    {gem.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{gem.location}</span>
                    <span>•</span>
                    <span className="text-slate-300">Best: {gem.bestTime}</span>
                  </div>
                </div>

                {/* Secret Tip Box */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Insider Secret</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{gem.secretTip}</p>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Verified by: {gem.verifiedLocal}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={`/places/${gem.slug}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Explore Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/packages"
                  className="text-xs font-bold text-sky-400 hover:text-sky-300"
                >
                  Find Packages Visiting Here →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}
