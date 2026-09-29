'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { Sparkles, Clock, MapPin, Star, ShieldCheck, ArrowRight, Anchor, Camera, Utensils, Compass } from 'lucide-react';
import Link from 'next/link';

interface Experience {
  id: string;
  title: string;
  category: 'Marine' | 'Adventure' | 'Culinary' | 'Culture' | 'Wellness';
  location: string;
  duration: string;
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice: number;
  image: string;
  tag: string;
  highlights: string[];
  instantConfirmation: boolean;
}

const EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    title: 'Private Sunset Yacht Charter along Dubai Marina & Palm Jumeirah',
    category: 'Marine',
    location: 'Dubai Marina, UAE',
    duration: '3 Hours',
    rating: 4.97,
    reviewsCount: 310,
    price: 18500,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    tag: 'PRIVATE CHARTER',
    highlights: ['56ft Luxury Yacht', 'Dedicated Captain & Crew', 'Gourmet Refreshments & BBQ Grill'],
    instantConfirmation: true
  },
  {
    id: 'exp-2',
    title: 'Nusa Penida Manta Point Guided Snorkeling & Drift Dive',
    category: 'Marine',
    location: 'Nusa Penida, Bali',
    duration: '5 Hours',
    rating: 4.94,
    reviewsCount: 420,
    price: 6800,
    originalPrice: 8500,
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c',
    tag: 'WILDLIFE',
    highlights: ['PADI Certified Master Guide', 'Full High-End Snorkel Gear', 'Underwater GoPro Footage'],
    instantConfirmation: true
  },
  {
    id: 'exp-3',
    title: 'VIP Red Dune Desert Safari with Falconry & Stargazing Dinner',
    category: 'Adventure',
    location: 'Lahbab Dunes, Dubai',
    duration: '6 Hours',
    rating: 4.95,
    reviewsCount: 890,
    price: 8999,
    originalPrice: 11000,
    image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3',
    tag: 'TOP RATED',
    highlights: ['Land Cruiser Dune Bashing', 'Bedouin Campfire Feast', 'Astronomer Stargazing Session'],
    instantConfirmation: true
  },
  {
    id: 'exp-4',
    title: 'Michelin Star Chef-Led Paris Gastronomy & Wine Cellar Tour',
    category: 'Culinary',
    location: 'Le Marais, Paris',
    duration: '4 Hours',
    rating: 4.98,
    reviewsCount: 165,
    price: 24500,
    originalPrice: 29000,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    tag: 'GOURMET',
    highlights: ['Exclusive Sommelier Pairings', 'Artisanal Cheese & Truffle Tasting', 'Private Historic Cellar Access'],
    instantConfirmation: false
  },
  {
    id: 'exp-5',
    title: 'Traditional Ayurvedic Marma Healing & Herbal Steam Ritual',
    category: 'Wellness',
    location: 'Kumarakom, Kerala',
    duration: '2.5 Hours',
    rating: 4.92,
    reviewsCount: 280,
    price: 5200,
    originalPrice: 6500,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef',
    tag: 'AYURVEDA',
    highlights: ['Vaidya Consultation', 'Warm Medicated Herbal Oil Massage', 'Holistic Dosha Balancing'],
    instantConfirmation: true
  }
];

export default function ExperiencesPage() {
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const filtered = EXPERIENCES.filter(
    (exp) => selectedCat === 'All' || exp.category === selectedCat
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" /> Destination Experiences
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Handcrafted Excursions & Activities
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Direct DMC contracts, certified expert guides, zero middleman markup, and automated digital voucher delivery.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-purple-600" /> Vetted & Insured Local Operators
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All', 'Marine', 'Adventure', 'Culinary', 'Culture', 'Wellness'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'All' ? 'All Activities' : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                  {item.tag}
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{item.duration}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {item.rating}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 mt-3">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 line-through">
                      ₹{item.originalPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-lg font-black text-slate-900 leading-none">
                      ₹{item.price.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500"> / guest</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-1">
                      {item.instantConfirmation ? 'Instant Voucher Confirmation' : 'Request On-Demand Slot'}
                    </div>
                  </div>

                  <Link
                    href={`/checkout?type=experience&id=${item.id}&price=${item.price}`}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
