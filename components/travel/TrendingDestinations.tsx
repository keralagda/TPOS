'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

const DESTINATIONS = [
  { slug: 'dubai', name: 'Dubai', price: '₹18,299', season: 'Best time: Nov - Mar', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400&auto=format&fit=crop' },
  { slug: 'bali', name: 'Bali', price: '₹12,999', season: 'Best time: Apr - Oct', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=400&auto=format&fit=crop' },
  { slug: 'singapore', name: 'Singapore', price: '₹16,299', season: 'Best time: Feb - Apr', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=400&auto=format&fit=crop' },
  { slug: 'thailand', name: 'Thailand', price: '₹28,999', season: 'Best time: Nov - Apr', img: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=400&auto=format&fit=crop' },
  { slug: 'kashmir', name: 'Kashmir', price: '₹22,899', season: 'Best time: Mar - Jun', img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=400&auto=format&fit=crop' },
  { slug: 'kerala', name: 'Kerala', price: '₹20,999', season: 'Best time: Sep - Mar', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=400&auto=format&fit=crop' },
];

export const TrendingDestinations: React.FC = () => {
  return (
    <section id="explore" className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Where everyone wants to go</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Trending destinations, handpicked for your next journey.</p>
          </div>
          <a href="#" className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group">
            View all destinations <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DESTINATIONS.map((d) => (
            <div key={d.slug} className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition cursor-pointer group border border-slate-100 flex flex-col">
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative">
                <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">{d.name}</h3>
              <div className="text-xs text-slate-500 mt-0.5">
                From <strong className="text-slate-900 text-sm font-extrabold">{d.price}</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{d.season}</div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-sky-600 group-hover:text-white text-slate-400 flex items-center justify-center transition">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
