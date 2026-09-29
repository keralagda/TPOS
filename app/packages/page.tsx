'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { Compass, Calendar, Users, Star, CheckCircle, XCircle, ArrowRight, ShieldCheck, Plane, Hotel, Car } from 'lucide-react';
import Link from 'next/link';

interface TourPackage {
  id: string;
  title: string;
  duration: string;
  destination: string;
  groupSize: string;
  rating: number;
  reviewsCount: number;
  pricePerPerson: number;
  originalPrice: number;
  image: string;
  tag: string;
  highlights: string[];
  inclusions: string[];
  flightIncluded: boolean;
  visaStatus: string;
  pacing: string;
}

const PACKAGES: TourPackage[] = [
  {
    id: 'pkg-1',
    title: '5D/4N Dubai Futuristic Skyline & Desert Oasis',
    duration: '5 Days / 4 Nights',
    destination: 'Dubai & Abu Dhabi, UAE',
    groupSize: 'Private / Small Group',
    rating: 4.96,
    reviewsCount: 320,
    pricePerPerson: 59999,
    originalPrice: 72000,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    tag: 'BESTSELLER',
    highlights: ['Burj Khalifa Level 148', 'Private Red Dune Desert Safari', 'Louvre Abu Dhabi VIP Tour'],
    inclusions: ['5-Star Luxury Stay', 'Daily Gourmet Breakfast', 'Private Chauffeur Transfers', 'All Entry Tickets'],
    flightIncluded: true,
    visaStatus: '3-Day eVisa Included',
    pacing: 'Moderate'
  },
  {
    id: 'pkg-2',
    title: '7D/6N Bali Island Odyssey: Ubud & Seminyak',
    duration: '7 Days / 6 Nights',
    destination: 'Ubud, Nusa Penida & Seminyak, Indonesia',
    groupSize: 'Private Tour',
    rating: 4.93,
    reviewsCount: 245,
    pricePerPerson: 68500,
    originalPrice: 84000,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    tag: 'EXPERIENTIAL',
    highlights: ['Tegalalang Rice Terraces', 'Nusa Penida Private Catamaran', 'Mount Batur Sunrise Trek'],
    inclusions: ['Private Pool Villas', 'Floating Breakfast', 'Dedicated Local Host & Guide', 'Internal Speedboat'],
    flightIncluded: true,
    visaStatus: 'Visa on Arrival Assist',
    pacing: 'Relaxed'
  },
  {
    id: 'pkg-3',
    title: '4D/3N Maldives Coral Haven: All-Inclusive Overwater',
    duration: '4 Days / 3 Nights',
    destination: 'South Malé Atoll, Maldives',
    groupSize: 'Couple / Honeymoon',
    rating: 4.98,
    reviewsCount: 410,
    pricePerPerson: 115000,
    originalPrice: 138000,
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
    tag: 'ULTRA LUXURY',
    highlights: ['Overwater Villa with Pool', 'Manta Ray Snorkeling Safari', 'Sunset Champagne Cruise'],
    inclusions: ['All-Inclusive Dining & Premium Beverages', 'Roundtrip Seaplane Transfer', 'Spa Treatment Credit'],
    flightIncluded: true,
    visaStatus: 'Free 30-Day VoA',
    pacing: 'Leisure'
  },
  {
    id: 'pkg-4',
    title: '6D/5N Paris Grandeur & Champagne Vineyards',
    duration: '6 Days / 5 Nights',
    destination: 'Paris & Reims, France',
    groupSize: 'Curated Small Group',
    rating: 4.91,
    reviewsCount: 180,
    pricePerPerson: 129000,
    originalPrice: 155000,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    tag: 'CULTURE & WINE',
    highlights: ['Skip-the-Line Louvre Private Curator', 'Eiffel Tower Gourmet Lunch', 'Moët & Chandon Private Cellars'],
    inclusions: ['4-Star Historic Boutique Stays', 'TGV First-Class Rail', 'English Speaking Historian Guides'],
    flightIncluded: false,
    visaStatus: 'Schengen Concierge Assist',
    pacing: 'Active'
  },
  {
    id: 'pkg-5',
    title: '5D/4N Kerala Backwaters & Munnar Tea Hills',
    duration: '5 Days / 4 Nights',
    destination: 'Kochi, Munnar & Alleppey, India',
    groupSize: 'Family / Private',
    rating: 4.89,
    reviewsCount: 512,
    pricePerPerson: 29500,
    originalPrice: 36000,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
    tag: 'HERITAGE NATURE',
    highlights: ['Private Houseboat Cruise', 'Munnar Organic Tea Estate Tour', 'Kathakali Cultural Performance'],
    inclusions: ['Resort & Houseboat Stays', 'Traditional Sadhya & Kerala Meals', 'Air-Conditioned Private Cab'],
    flightIncluded: false,
    visaStatus: 'Domestic Travel',
    pacing: 'Relaxed'
  }
];

export default function PackagesPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const filteredPackages = PACKAGES.filter(
    (pkg) => selectedTag === 'All' || pkg.tag === selectedTag
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Compass className="w-4 h-4" /> Curated Multiday Itineraries
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mastercrafted Holiday Packages
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Transparent per-person pricing, verified DMC execution, transparent Indian Tax computation (TCS + GST), and round-the-clock emergency support.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-sky-600" /> 100% Guaranteed Departures
          </div>
        </div>

        {/* Filter tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All', 'BESTSELLER', 'EXPERIENTIAL', 'ULTRA LUXURY', 'CULTURE & WINE', 'HERITAGE NATURE'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tag === 'All' ? 'All Packages' : tag}
            </button>
          ))}
        </div>

        {/* Package Cards */}
        <div className="space-y-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row group"
            >
              {/* Left: Image */}
              <div className="relative lg:w-96 h-64 lg:h-auto overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                  {pkg.tag}
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              {/* Center: Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span>{pkg.destination}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {pkg.rating} ({pkg.reviewsCount} reviews)
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">Pacing: {pkg.pacing}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {pkg.title}
                  </h3>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      {pkg.flightIncluded ? 'Flights Included' : 'Flights Optional'}
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {pkg.visaStatus}
                    </span>
                    <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {pkg.groupSize}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Highlights</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {pkg.highlights.map((hl, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inclusions summary */}
                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Package Inclusions:</span>
                  {pkg.inclusions.map((inc, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {inc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Price & Action */}
              <div className="p-6 lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between items-center lg:items-end text-center lg:text-right bg-slate-50/50">
                <div>
                  <div className="text-xs text-slate-400 line-through">
                    ₹{pkg.originalPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">
                    ₹{pkg.pricePerPerson.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500">per person (Twin Sharing)</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                    GST & TCS calculated transparently at checkout
                  </div>
                </div>

                <div className="w-full space-y-2 mt-6">
                  <Link
                    href={`/checkout?type=package&id=${pkg.id}&price=${pkg.pricePerPerson}`}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <span>Book Itinerary</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/trip-planner"
                    className="w-full block bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs py-2.5 rounded-xl transition text-center"
                  >
                    Customize Plan
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
