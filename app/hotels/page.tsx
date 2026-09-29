'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { Building, Star, MapPin, Wifi, Coffee, ShieldCheck, ArrowRight, Check, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

interface Hotel {
  id: string;
  name: string;
  location: string;
  country: string;
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  originalPrice: number;
  image: string;
  badge: string;
  amenities: string[];
  refundable: boolean;
  type: 'Resort' | 'Villa' | 'Boutique' | 'Hotel';
}

const HOTELS: Hotel[] = [
  {
    id: 'htl-1',
    name: 'Atlantis The Royal & Residences',
    location: 'Palm Jumeirah, Dubai',
    country: 'United Arab Emirates',
    rating: 4.95,
    reviewsCount: 1420,
    pricePerNight: 48500,
    originalPrice: 56000,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    badge: 'LUXURY ICON',
    amenities: ['Private Beach', 'Michelin Dining', 'Infinity Sky Pool', 'Butler Service'],
    refundable: true,
    type: 'Resort'
  },
  {
    id: 'htl-2',
    name: 'Viceroy Bali Valley Sanctuary',
    location: 'Ubud, Bali',
    country: 'Indonesia',
    rating: 4.92,
    reviewsCount: 880,
    pricePerNight: 32000,
    originalPrice: 38000,
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6',
    badge: 'RAINFOREST VILLA',
    amenities: ['Private Heated Pool', 'Helipad', 'Valley Views', 'Spa Pavilion'],
    refundable: true,
    type: 'Villa'
  },
  {
    id: 'htl-3',
    name: 'Soneva Jani Overwater Retreat',
    location: 'Noonu Atoll',
    country: 'Maldives',
    rating: 4.98,
    reviewsCount: 640,
    pricePerNight: 125000,
    originalPrice: 145000,
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
    badge: 'ULTRA LUXURY',
    amenities: ['Retractable Roof', 'Water Slide', 'Private Lagoon', 'Personal Barefoot Butler'],
    refundable: true,
    type: 'Resort'
  },
  {
    id: 'htl-4',
    name: 'Marina Bay Sands Landmark Suites',
    location: 'Bayfront Subzone',
    country: 'Singapore',
    rating: 4.88,
    reviewsCount: 4210,
    pricePerNight: 42000,
    originalPrice: 49000,
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    badge: 'SKYLINE ICON',
    amenities: ['57th Floor Infinity Pool', 'Banyan Tree Spa', 'Casino Access', 'Club Lounge'],
    refundable: false,
    type: 'Hotel'
  },
  {
    id: 'htl-5',
    name: 'Le Meurice Palace Heritage',
    location: '1st Arrondissement, Paris',
    country: 'France',
    rating: 4.94,
    reviewsCount: 750,
    pricePerNight: 89000,
    originalPrice: 102000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    badge: 'PALACE DISTINCTION',
    amenities: ['Tuileries Views', 'Ducasse Gastronomy', 'Valmont Spa', 'Historic Suites'],
    refundable: true,
    type: 'Boutique'
  },
  {
    id: 'htl-6',
    name: 'Kumarakom Lake Heritage Sanctuary',
    location: 'Kottayam, Kerala',
    country: 'India',
    rating: 4.91,
    reviewsCount: 1120,
    pricePerNight: 18500,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
    badge: 'HERITAGE RETREAT',
    amenities: ['Ayurvedic Center', 'Meandering Pool', 'Backwater Cruises', 'Traditional Manas'],
    refundable: true,
    type: 'Resort'
  }
];

export default function HotelsPage() {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHotels = HOTELS.filter((hotel) => {
    const matchesType = selectedType === 'All' || hotel.type === selectedType;
    const matchesQuery =
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Building className="w-4 h-4" /> Global Hospitality Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curated Luxury Stays & Villas
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Direct-contracted rates, verified room inventory, transparent GST breakdown, and automated traveler concierge.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Guaranteed Lowest Direct Rate Policy
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Resort', 'Villa', 'Boutique', 'Hotel'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedType === type
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type === 'All' ? 'All Stays' : `${type}s`}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by hotel name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Hotel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image banner */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                  {hotel.badge}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{hotel.rating}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({hotel.reviewsCount})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{hotel.location}, {hotel.country}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {hotel.name}
                  </h3>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hotel.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="border-t border-slate-100 pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 line-through">
                      ₹{hotel.originalPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-lg font-black text-slate-900 leading-none">
                      ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500"> / night</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-1">
                      {hotel.refundable ? 'Free cancellation available' : 'Non-refundable rate'}
                    </div>
                  </div>

                  <Link
                    href={`/checkout?type=hotel&id=${hotel.id}&price=${hotel.pricePerNight}`}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>Reserve</span>
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
