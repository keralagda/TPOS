'use client';

import React from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { HeroSection } from '@/components/travel/HeroSection';
import { QuickCategories } from '@/components/travel/QuickCategories';
import { TrendingDestinations } from '@/components/travel/TrendingDestinations';
import { AITripPlanner } from '@/components/travel/AITripPlanner';
import { ExclusiveOffers } from '@/components/travel/ExclusiveOffers';
import { DirectoryBanner } from '@/components/travel/DirectoryBanner';
import { GemDiscoverySection } from '@/components/travel/GemDiscoverySection';
import { JoyrideWalkthrough } from '@/components/help/JoyrideWalkthrough';
import { FloatingVoiceNav } from '@/components/travel/FloatingVoiceNav';
import { Footer } from '@/components/travel/Footer';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* 9 Quick Categories */}
        <QuickCategories />

        {/* Trending Destinations */}
        <TrendingDestinations />

        {/* AI Trip Planner Section */}
        <AITripPlanner />

        {/* Exclusive Deals */}
        <ExclusiveOffers />
        <section id="stays" className="py-14 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Find your place in the world</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">From city hotels to private villas and unique stays.</p>
              </div>
              <a href="#" className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group">
                Explore stays <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { title: 'Hotels', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop' },
                { title: 'Resorts', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=300&auto=format&fit=crop' },
                { title: 'Villas', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=300&auto=format&fit=crop' },
                { title: 'Homestays', img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=300&auto=format&fit=crop' },
                { title: 'Apartments', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=300&auto=format&fit=crop' },
                { title: 'Beach Stays', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop' },
                { title: 'Mountain Stays', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=300&auto=format&fit=crop' },
                { title: 'Luxury Stays', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=300&auto=format&fit=crop' },
              ].map((s) => (
                <div key={s.title} className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group border border-slate-100">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div className="p-2 text-center text-xs font-extrabold text-slate-800">
                    {s.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Directory Search Banner */}
        <DirectoryBanner />

        {/* GEM8 Beyond-The-Icon Discovery (§17) */}
        <div data-tour="gem-discovery">
          <GemDiscoverySection />
        </div>

        {/* Value Proposition ("More than a booking website") */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">More than a booking website.</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Discover, compare, book and manage — all in one place.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3 font-bold text-lg">🌐</div>
                <h3 className="font-extrabold text-slate-900 text-base">Discover</h3>
                <p className="text-xs text-slate-500 mt-1">Destinations, local guides & authentic experiences across 100+ countries.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3 font-bold text-lg">⚖️</div>
                <h3 className="font-extrabold text-slate-900 text-base">Compare</h3>
                <p className="text-xs text-slate-500 mt-1">Multi-provider rates with guaranteed price freshness metadata.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3 font-bold text-lg">🛡️</div>
                <h3 className="font-extrabold text-slate-900 text-base">Book</h3>
                <p className="text-xs text-slate-500 mt-1">Provider-neutral Payment Hub with server-verified instantaneous voucher issuance.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3 font-bold text-lg">🧭</div>
                <h3 className="font-extrabold text-slate-900 text-base">Manage</h3>
                <p className="text-xs text-slate-500 mt-1">Itinerary timeline, flight boarding passes, and visa documents in My Trips.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <JoyrideWalkthrough />
      <FloatingVoiceNav />
      <Footer />
    </div>
  );
}
