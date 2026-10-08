'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Compass, MapPin, Calendar, Users, Sparkles, 
  ArrowRight, Plus, Search, Filter, Clock, Activity
} from 'lucide-react';
import Link from 'next/link';

interface JourneyItem {
  id: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  theme: string;
  paxCount: number;
  status: 'ACTIVE' | 'UPCOMING' | 'DRAFT';
  season: string;
  highlights: string[];
}

export default function JourneysHubPage() {
  const [search, setSearch] = useState('');

  const journeys: JourneyItem[] = [
    {
      id: 'JRN-DXB-01',
      slug: 'dubai-luxury-skyline',
      title: 'Dubai Luxury Skyline & Desert Safari',
      destination: 'Dubai, UAE',
      duration: '5 Days / 4 Nights',
      theme: 'Luxury & Adventure',
      paxCount: 24,
      status: 'ACTIVE',
      season: 'Winter Peak',
      highlights: ['Burj Khalifa At The Top', 'Private Dunes Dinner', 'Atlantis Aquaventure', 'Marina Yacht Cruise'],
    },
    {
      id: 'JRN-KL-02',
      slug: 'kerala-backwaters-mist',
      title: 'Kerala Backwaters & Munnar Tea Highlands',
      destination: 'Kerala, India',
      duration: '6 Days / 5 Nights',
      theme: 'Ayurveda & Nature',
      paxCount: 18,
      status: 'ACTIVE',
      season: 'Monsoon / Autumn',
      highlights: ['Alleppey Houseboat Stay', 'Munnar Tea Plantation', 'Periyar Wildlife Sanctuary', 'Kochi Fort Heritage'],
    },
    {
      id: 'JRN-BALI-03',
      slug: 'bali-spiritual-escapes',
      title: 'Bali Spiritual Stays & Hidden Waterfalls',
      destination: 'Bali, Indonesia',
      duration: '7 Days / 6 Nights',
      theme: 'Wellness & Cultural',
      paxCount: 32,
      status: 'ACTIVE',
      season: 'Dry Season',
      highlights: ['Ubud Rice Terraces', 'Tegenungan Waterfall', 'Uluwatu Sunset Temple', 'Nusa Penida Day Trip'],
    },
    {
      id: 'JRN-SWISS-04',
      slug: 'swiss-alps-panoramic-express',
      title: 'Swiss Alps Glacier Express & Zurich Explorer',
      destination: 'Switzerland',
      duration: '8 Days / 7 Nights',
      theme: 'Scenic Rail & Mountain',
      paxCount: 12,
      status: 'UPCOMING',
      season: 'Winter Ski / Spring',
      highlights: ['Glacier Express Rail', 'Jungfraujoch Top of Europe', 'Lake Geneva Cruise', 'Zermatt Matterhorn'],
    },
  ];

  const filtered = journeys.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.destination.toLowerCase().includes(search.toLowerCase()) ||
      j.theme.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <InternalLayout
      headerTitle="Trips & Journeys"
      headerSubtitle="Living Journey Engine • Powered by Voyage8"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/journey-studio"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Journey Studio</span>
          </Link>
          <Link
            href="/trip-planner"
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Journey</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search journeys by destination, title, theme..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Total Curated Journeys: <strong className="text-white">{journeys.length}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">100% Sensor-Ready</span>
          </div>
        </div>

        {/* Journeys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((j) => (
            <div
              key={j.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-sky-500/50 transition group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {j.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">{j.season}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {j.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition tracking-tight">
                    {j.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      {j.destination}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {j.duration}
                    </span>
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {j.highlights.map((h, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>{j.paxCount}</strong> Travelers Enrolled</span>
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/journeys/${j.slug}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>View Living Itinerary</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}
