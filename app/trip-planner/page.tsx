'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { Sparkles, Calendar, DollarSign, Users, Compass, CheckCircle2, ArrowRight, ShieldAlert, Download, Share2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface DayPlan {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
}

export default function TripPlannerPage() {
  const [destination, setDestination] = useState('Dubai, UAE');
  const [duration, setDuration] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [pace, setPace] = useState<'Relaxed' | 'Balanced' | 'Fast-Paced'>('Balanced');
  const [vibe, setVibe] = useState<'Luxury' | 'Adventure' | 'Cultural' | 'Family'>('Luxury');
  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(true);

  const itinerary: DayPlan[] = [
    {
      day: 1,
      title: 'Arrival & Iconic Skyline Immersion',
      morning: 'Direct Emirates flight arrival at DXB Terminal 3. Fast-track VIP immigration and chauffeur transfer to Palm Jumeirah.',
      afternoon: 'Check-in at Atlantis The Royal. Leisure afternoon at the Cloud 22 infinity sky pool overlooking the Arabian Gulf.',
      evening: 'Private sunset yacht charter departing from Dubai Marina with champagne service and skyline panoramas.',
      stay: 'Atlantis The Royal, Palm Jumeirah'
    },
    {
      day: 2,
      title: 'Architectural Marvels & High-Fashion Gastronomy',
      morning: 'Private curator tour of the Museum of the Future followed by high tea at Atmosphere Burj Khalifa (Level 122).',
      afternoon: 'Exclusive VIP shopping lounge experience at Fashion Avenue, Dubai Mall with private stylist concierge.',
      evening: 'Dinner at Dinner by Heston Blumenthal (1 Michelin Star) followed by the Dubai Fountain choreography.',
      stay: 'Atlantis The Royal, Palm Jumeirah'
    },
    {
      day: 3,
      title: 'Heritage Al Fahidi & Lahbab Desert Oasis',
      morning: 'Guided walking tour through Al Fahidi Historic District, spice and gold souks, and private abra boat canal crossing.',
      afternoon: 'Private 4x4 Land Cruiser transfer into Lahbab Desert Conservation Reserve for dune driving and falconry photography.',
      evening: 'VIP Bedouin campfire feast under the stars with live oud melodies, astronomy stargazing, and luxury tent lounge.',
      stay: 'Al Maha, A Luxury Collection Desert Resort & Spa'
    },
    {
      day: 4,
      title: 'Abu Dhabi Cultural Odyssey & Louvre Masterpieces',
      morning: 'Private limousine transfer to Abu Dhabi. Architecture and spiritual tour of the Sheikh Zayed Grand Mosque with private historian.',
      afternoon: 'Louvre Abu Dhabi private docent tour exploring cross-cultural masterpieces under the rain of light dome.',
      evening: 'Sunset cocktails at Emirates Palace Mandarin Oriental and Michelin-starred dining at Hakkasan.',
      stay: 'Al Maha Desert Resort or Palm Jumeirah'
    },
    {
      day: 5,
      title: 'Sensory Wellness & Departure',
      morning: 'Holistic sunrise desert yoga and Ayurvedic wellness massage at the Timeless Spa.',
      afternoon: 'Last-minute artisanal perfumery workshop in Dubai Design District (d3).',
      evening: 'VIP airport transfer to DXB. Duty-Free shopping and departure flight back to India.',
      stay: 'Flight Departure'
    }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPlanGenerated(true);
    }, 800);
  };

  const estimatedBasePerPerson = 62000;
  const totalBase = estimatedBasePerPerson * travelers;
  const gst = Math.round(totalBase * 0.05);
  const tcs = Math.round(totalBase * 0.05); // 5% below 7L
  const totalEstimated = totalBase + gst + tcs;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Cognitive Itinerary Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              AI Trip Architect & Planner
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Synthesize verified flight schedules, direct-contract hotel inventory, curated local experiences, and Indian tax compliance into an actionable travel blueprint.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Itinerary PDF download queued.')}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => alert('Itinerary share link copied to clipboard.')}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Plan</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 bg-slate-50"
              >
                <option value="Dubai, UAE">Dubai, UAE</option>
                <option value="Bali, Indonesia">Bali, Indonesia</option>
                <option value="Singapore">Singapore</option>
                <option value="Maldives">Maldives</option>
                <option value="Paris, France">Paris, France</option>
                <option value="Kerala, India">Kerala, India</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Duration (Days)
              </label>
              <input
                type="number"
                min={2}
                max={21}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Travelers
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value) || 2)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Pacing
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 bg-slate-50"
              >
                <option value="Relaxed">Relaxed (1-2 stops/day)</option>
                <option value="Balanced">Balanced (Optimal)</option>
                <option value="Fast-Paced">Fast-Paced (Max sights)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Travel Style
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 bg-slate-50"
              >
                <option value="Luxury">Luxury & Comfort</option>
                <option value="Adventure">Adventure & Outdoors</option>
                <option value="Cultural">Culture & Heritage</option>
                <option value="Family">Family Friendly</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Itinerary...' : 'Regenerate Plan'}</span>
            </button>
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        {planGenerated && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Day-by-Day schedule */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" /> Day-by-Day Curated Schedule
                </h2>
                <span className="text-xs font-medium text-slate-500">
                  {duration} Days • {pace} Pacing
                </span>
              </div>

              <div className="space-y-4">
                {itinerary.map((item) => (
                  <div
                    key={item.day}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-sky-300 transition"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                          D{item.day}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      </div>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                        {item.stay}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <span className="sm:col-span-2 font-bold text-sky-700 uppercase tracking-wider text-[10px]">
                          Morning
                        </span>
                        <p className="sm:col-span-10 text-slate-600 leading-relaxed">{item.morning}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <span className="sm:col-span-2 font-bold text-amber-700 uppercase tracking-wider text-[10px]">
                          Afternoon
                        </span>
                        <p className="sm:col-span-10 text-slate-600 leading-relaxed">{item.afternoon}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <span className="sm:col-span-2 font-bold text-indigo-700 uppercase tracking-wider text-[10px]">
                          Evening
                        </span>
                        <p className="sm:col-span-10 text-slate-600 leading-relaxed">{item.evening}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Cost, Tax & Checkout */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Trip Quotation & Tax Summary</h3>
                  <p className="text-xs text-slate-500">
                    Transparent, itemized pricing conforming to Indian statutory TCS Section 206C(1G).
                  </p>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-slate-100 py-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Package ({travelers} Travelers)</span>
                    <span className="font-semibold text-slate-900">₹{totalBase.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5% on Outbound Tour Package)</span>
                    <span className="font-semibold text-slate-900">₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>TCS (5% under Section 206C(1G))</span>
                      <span className="text-[10px] text-sky-600" title="Adjustable against income tax return">ⓘ</span>
                    </span>
                    <span className="font-semibold text-slate-900">₹{tcs.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Net Amount</span>
                    <span className="text-xl font-black text-sky-600">
                      ₹{totalEstimated.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Passport & Visa Advisory
                  </div>
                  <p>
                    Indian passport holders require minimum 6-month passport validity and a 3-day UAE eVisa. Visa concierge included.
                  </p>
                </div>

                <Link
                  href={`/checkout?type=custom_itinerary&price=${totalEstimated}&dest=${encodeURIComponent(destination)}`}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <span>Book This Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
