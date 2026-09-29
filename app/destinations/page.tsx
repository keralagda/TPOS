'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { MapPin, Sparkles, ArrowRight, ShieldCheck, Search, Filter } from 'lucide-react';
import Link from 'next/link';

const DESTINATIONS = [
  { name: 'Dubai', country: 'United Arab Emirates', slug: 'dubai', price: '₹49,999', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', tag: 'TRENDING', visa: '3-Day eVisa', type: 'international' },
  { name: 'Bali', country: 'Indonesia', slug: 'bali', price: '₹54,500', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', tag: 'POPULAR', visa: 'Visa on Arrival', type: 'international' },
  { name: 'Singapore', country: 'Singapore', slug: 'singapore', price: '₹62,000', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', tag: 'LUXURY', visa: 'Quick eVisa', type: 'international' },
  { name: 'Thailand', country: 'Thailand', slug: 'thailand', price: '₹38,999', img: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa', tag: 'VALUE', visa: 'Visa Exemption', type: 'international' },
  { name: 'Maldives', country: 'Maldives', slug: 'maldives', price: '₹89,000', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8', tag: 'HONEYMOON', visa: 'Free 30-Day VoA', type: 'international' },
  { name: 'Paris', country: 'France', slug: 'paris', price: '₹95,000', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', tag: 'CULTURE', visa: 'Schengen Visa', type: 'international' },
  { name: 'London', country: 'United Kingdom', slug: 'london', price: '₹1,05,000', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', tag: 'HISTORIC', visa: 'Standard Visitor', type: 'international' },
  { name: 'New York', country: 'United States', slug: 'new-york', price: '₹1,20,000', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', tag: 'ICONIC', visa: 'US B1/B2 Visa', type: 'international' },
  { name: 'Kerala', country: 'India', slug: 'kerala', price: '₹24,999', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', tag: 'BACKWATERS', visa: 'Domestic', type: 'domestic' },
  { name: 'Goa', country: 'India', slug: 'goa', price: '₹18,500', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', tag: 'BEACHES', visa: 'Domestic', type: 'domestic' },
];

export default function DestinationsPage() {
  const [filter, setFilter] = useState<'all' | 'international' | 'domestic'>('all');
  const [search, setSearch] = useState('');

  const filtered = DESTINATIONS.filter(d => {
    const matchesFilter = filter === 'all' || d.type === filter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4" /> Global Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Explore World Destinations</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Curated destinations with real-time flight availability, vetted boutique stays, and automated Indian passport visa intelligence.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              All Destinations
            </button>
            <button
              onClick={() => setFilter('international')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === 'international' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              International
            </button>
            <button
              onClick={() => setFilter('domestic')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === 'domestic' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Incredible India
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-72 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search destination or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((d) => (
            <div key={d.name} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-md">
                    {d.tag}
                  </span>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> {d.visa}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">{d.country}</div>
                  <h3 className="text-base font-extrabold text-slate-900">{d.name}</h3>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Starting from</span>
                  <span className="text-sm font-black text-slate-900">{d.price}</span>
                </div>
                <Link
                  href={`/packages?dest=${d.slug}`}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  View Trips <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
