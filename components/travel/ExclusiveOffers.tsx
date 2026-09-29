'use client';

import React from 'react';
import { Star, ArrowRight } from 'lucide-react';

const DEALS = [
  {
    title: 'Bali Escape',
    duration: '5 Days / 4 Nights',
    rating: 4.8,
    price: '₹39,999',
    originalPrice: '₹49,999',
    badge: 'Exclusive',
    badgeColor: 'bg-red-500',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: 'Dubai Highlights',
    duration: '4 Days / 3 Nights',
    rating: 4.7,
    price: '₹49,999',
    originalPrice: '₹62,000',
    badge: 'Best Value',
    badgeColor: 'bg-purple-600',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: 'Singapore Getaway',
    duration: '4 Days / 3 Nights',
    rating: 4.6,
    price: '₹44,999',
    originalPrice: '₹55,000',
    badge: 'Limited Offer',
    badgeColor: 'bg-sky-500',
    img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: 'Thailand Explorer',
    duration: '5 Days / 4 Nights',
    rating: 4.5,
    price: '₹37,999',
    originalPrice: '₹47,000',
    badge: 'Last Minute',
    badgeColor: 'bg-amber-500',
    img: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=400&auto=format&fit=crop',
  },
];

export const ExclusiveOffers: React.FC = () => {
  return (
    <section id="offers" className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Travel more. Pay less.</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Exclusive offers on stays, packages, flights and experiences.</p>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {['All', 'Hotels', 'Packages', 'Flights', 'Experiences', 'Last Minute'].map((tab, idx) => (
              <button
                key={tab}
                className={`px-3.5 py-1.5 rounded-full transition ${
                  idx === 0
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DEALS.map((d) => (
            <div key={d.title} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-slate-100 flex flex-col group">
              <div className="relative h-44 overflow-hidden">
                <img src={d.img} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className={`absolute top-3 left-3 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow ${d.badgeColor}`}>
                  {d.badge}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-base">{d.title}</h3>
                    <div className="flex items-center text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mr-0.5" /> {d.rating}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{d.duration}</p>
                  <div className="mt-3">
                    <span className="text-xl font-extrabold text-slate-900">{d.price}</span>
                    <span className="text-xs text-slate-400 line-through ml-1.5">{d.originalPrice}</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1">
                  View Deal <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
