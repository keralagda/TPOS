'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, Hotel, Compass, Car, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export const AITripPlanner: React.FC = () => {
  const [destination, setDestination] = useState('Bali');
  const [vibe, setVibe] = useState('Romantic getaway');
  const [travelers, setTravelers] = useState('2 people');
  const [duration, setDuration] = useState('5 days');
  const [budget, setBudget] = useState('₹75,000');
  const [origin, setOrigin] = useState('India');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const [suggestedTrip, setSuggestedTrip] = useState<{
    title: string;
    sub: string;
    price: string;
    photos: string[];
    aiNarrative?: string | null;
    visaAdvice?: string;
  }>({
    title: 'Bali Escape & Tropical Serenity',
    sub: '5 Days / 4 Nights • AI-Optimized',
    price: '₹74,900',
    photos: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=600&auto=format&fit=crop'
    ],
    aiNarrative: 'Curated by NVIDIA NIM AI: Balanced pacing between cultural temples, beach club sunsets, and lush rainforest villas.',
    visaAdvice: 'Visa on Arrival available for Indian passports (30 days).'
  });

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const daysCount = parseInt(duration) || 5;
      const count = travelers.includes('4') ? 4 : travelers.includes('1') ? 1 : 2;
      const style = vibe.toLowerCase().includes('romantic')
        ? 'ROMANCE'
        : vibe.toLowerCase().includes('adventure')
        ? 'ADVENTURE'
        : 'FAMILY';
      const tier = budget.includes('1,20,000') ? 'LUXURY' : budget.includes('50,000') ? 'BUDGET' : 'COMFORT';

      const res = await fetch('/api/v1/voyage8/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          originCity: origin,
          durationDays: daysCount,
          travelersCount: count,
          travelerStyle: style,
          budgetTier: tier,
        }),
      });

      if (res.ok) {
        const pexelsList = (payload.data?.photos || []).map((p: any) => typeof p === 'string' ? p : (p.src?.large || p.src?.medium)).filter(Boolean);
        const photos = pexelsList.length > 0 ? pexelsList : [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop'
        ];

        setSuggestedTrip({
          title: `${destination} AI Odyssey`,
          sub: `${daysCount} Days / ${daysCount - 1} Nights • ${vibe}`,
          price: budget,
          photos,
          aiNarrative: payload.data?.aiNarrative || 'Synthesized using NVIDIA NIM cognitive intelligence.',
          visaAdvice: payload.data?.destinationIntel?.visa?.requirement || 'Standard travel entry documentation required.',
        });
        setPhotoIndex(0);
      }
    } catch (e) {
      console.error('Synthesis failed:', e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleNextPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % suggestedTrip.photos.length);
  };

  const handlePrevPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + suggestedTrip.photos.length) % suggestedTrip.photos.length);
  };

  return (
    <section id="ai-planner" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-slate-50 border border-sky-100 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Form */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> AI Trip Planner • NVIDIA NIM & Pexels
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Don't know where to go?</h2>
              <p className="text-sm text-slate-600 mt-2 font-medium max-w-lg">
                Tell us what you're looking for. Travel Planet turns your preferences into a complete journey synthesized by NVIDIA NIM cognitive intelligence and enriched with Pexels visual assets.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Destination</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Bali">Bali</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Paris">Paris</option>
                    <option value="Tokyo">Tokyo</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Kerala">Kerala</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">I want a</label>
                  <select
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option>Romantic getaway</option>
                    <option>Adventure escape</option>
                    <option>Family holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">For</label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option>2 people</option>
                    <option>1 person</option>
                    <option>Family (4+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option>5 days</option>
                    <option>3 days</option>
                    <option>7 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option>₹75,000</option>
                    <option>₹50,000</option>
                    <option>₹1,20,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">From</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option>India</option>
                    <option>UAE</option>
                    <option>Singapore</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSynthesize}
                  disabled={isSynthesizing}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-sky-600/20 transition flex items-center gap-2"
                >
                  <span>{isSynthesizing ? 'Synthesizing with NVIDIA NIM...' : 'Build My Trip'}</span>
                  <Wand2 className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-xs text-slate-500 font-medium">Powered by NVIDIA NIM & Pexels Realtime API.</span>
              </div>
            </div>

            {/* Suggested Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 relative group">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={suggestedTrip.photos[photoIndex] || suggestedTrip.photos[0]}
                    alt={suggestedTrip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-sky-700 shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Pexels Photography
                  </div>
                  {suggestedTrip.photos.length > 1 && (
                    <>
                      <div className="absolute inset-y-0 left-2 flex items-center">
                        <button
                          type="button"
                          onClick={handlePrevPhoto}
                          className="w-7 h-7 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-2 flex items-center">
                        <button
                          type="button"
                          onClick={handleNextPhoto}
                          className="w-7 h-7 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-900">{suggestedTrip.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                      NVIDIA Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{suggestedTrip.sub}</p>

                  {suggestedTrip.aiNarrative && (
                    <div className="my-2.5 p-2.5 bg-sky-50/60 rounded-xl border border-sky-100/60 text-[11px] text-slate-700 italic">
                      "{suggestedTrip.aiNarrative}"
                    </div>
                  )}

                  <div className="flex items-center space-x-4 my-3 text-xs text-slate-600 font-semibold">
                    <span className="flex items-center gap-1 text-slate-700"><Hotel className="w-3.5 h-3.5 text-sky-600" /> Stay</span>
                    <span className="flex items-center gap-1 text-slate-700"><Compass className="w-3.5 h-3.5 text-sky-600" /> Experiences</span>
                    <span className="flex items-center gap-1 text-slate-700"><Car className="w-3.5 h-3.5 text-sky-600" /> Transport</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-slate-900">{suggestedTrip.price}</span>
                      <span className="text-xs text-slate-400 font-normal"> / {travelers}</span>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5">
                      Explore Journey <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
