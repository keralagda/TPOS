'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, MessageSquare, Compass, Sparkles, Plus, 
  Search, Shield, MapPin, Calendar, ArrowRight 
} from 'lucide-react';

interface CircleItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  privacy: string;
  coverImage?: string;
  memberCount: number;
  postCount: number;
  trips?: {
    id: string;
    title: string;
    status: string;
    confirmedCount: number;
  }[];
}

export default function CirclesPage() {
  const [circles, setCircles] = useState<CircleItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'CREATE'>('EXPLORE');
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [newCircleType, setNewCircleType] = useState('INTEREST');

  useEffect(() => {
    fetch('/api/v1/social8/circles')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCircles(data.data);
        }
      })
      .catch(() => {
        // Fallback default seeded circles for UI demo
        setCircles([
          {
            id: 'c-1',
            name: 'Dubai Luxury & Yachting Circle',
            slug: 'dubai-luxury-yachting',
            description: 'Curated experiences for luxury travelers, private desert safaris, and weekend marina charters in the UAE.',
            type: 'DESTINATION',
            privacy: 'PUBLIC',
            memberCount: 142,
            postCount: 28,
            coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
            trips: [
              { id: 't-1', title: 'New Year Marina Yacht Cruise 2026', status: 'PLANNING', confirmedCount: 6 }
            ]
          },
          {
            id: 'c-2',
            name: 'Bali Solo Explorers & Digital Nomads',
            slug: 'bali-solo-explorers',
            description: 'Connecting remote workers, villa sharers, and scooter road-trippers across Canggu, Ubud, and Uluwatu.',
            type: 'TRAVELER_STYLE',
            privacy: 'PUBLIC',
            memberCount: 310,
            postCount: 89,
            coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
            trips: [
              { id: 't-2', title: 'Mount Batur Sunrise Hike & Sidemen Coffee', status: 'PROPOSED', confirmedCount: 8 }
            ]
          },
          {
            id: 'c-3',
            name: 'Kerala Backwaters & Ayurveda Retreats',
            slug: 'kerala-backwaters-ayurveda',
            description: 'Slow travel, authentic houseboat journeys, organic farm stays, and classical wellness practitioners in God’s Own Country.',
            type: 'INTEREST',
            privacy: 'PUBLIC',
            memberCount: 88,
            postCount: 19,
            coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
            trips: []
          }
        ]);
      });
  }, []);

  const filteredCircles = circles.filter((circle) => {
    const matchesType = selectedType === 'ALL' || circle.type === selectedType;
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (circle.description && circle.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName) return;

    const slug = newCircleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      const res = await fetch('/api/v1/social8/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCircleName,
          slug,
          description: newCircleDesc,
          type: newCircleType,
          privacy: 'PUBLIC',
          creatorId: 'user-default-lead',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCircles([data.data, ...circles]);
        setActiveTab('EXPLORE');
        setNewCircleName('');
        setNewCircleDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              Social8 Travel Social Graph (§16)
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Travel Circles & Communities
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-2xl">
              Travel together, share unmapped destinations, and turn group discussions into real journeys.
            </p>
          </div>
        </div>

        {/* Tabs: Explore vs Create */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mt-8">
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'EXPLORE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Circles ({filteredCircles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'CREATE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch a Travel Circle</span>
          </button>
        </div>

        {/* Tab 2: Create Circle Form (Inline Tab, Not Modal) */}
        {activeTab === 'CREATE' && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-1">Launch a New Travel Circle</h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              Create an interest or destination circle. High-res cover imagery is auto-fetched from Pexels API.
            </p>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Circle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba Diving Goa & Andaman"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Circle Category</label>
                <select
                  value={newCircleType}
                  onChange={(e) => setNewCircleType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="INTEREST">Interest</option>
                  <option value="DESTINATION">Destination</option>
                  <option value="TRAVELER_STYLE">Traveler Style</option>
                  <option value="ACTIVITY">Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description & Purpose</label>
                <textarea
                  rows={3}
                  placeholder="What is this community about? Who should join?"
                  value={newCircleDesc}
                  onChange={(e) => setNewCircleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('EXPLORE')}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/20"
                >
                  Launch Circle
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 1: Explore Circles */}
        {activeTab === 'EXPLORE' && (
          <>
            {/* Search & Filter Bar */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search circles by destination or interest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {['ALL', 'DESTINATION', 'INTEREST', 'TRAVELER_STYLE', 'ACTIVITY'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

        {/* Circles Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCircles.map((circle) => (
            <div
              key={circle.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Circle Cover */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                  <img
                    src={circle.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
                    alt={circle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-300 border border-slate-700/60">
                    {circle.type.replace('_', ' ')}
                  </div>
                </div>

                {/* Circle Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white line-clamp-1">{circle.name}</h3>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {circle.description || 'A vibrant community of passionate travelers.'}
                  </p>

                  {/* Active Group Trip Intent (§16 Conversion Gate) */}
                  {circle.trips && circle.trips.length > 0 && (
                    <div className="mt-4 p-2.5 bg-blue-950/50 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center gap-1.5 text-xs text-blue-300 font-semibold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Active Group Journey Proposal
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        {circle.trips[0].title}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Status: <strong className="text-blue-400">{circle.trips[0].status}</strong></span>
                        <span>{circle.trips[0].confirmedCount} travelers interested</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Stats & Action */}
              <div className="p-5 pt-0 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {circle.memberCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    {circle.postCount}
                  </span>
                </div>

                <Link
                  href={`/circles/${circle.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Join Circle
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
