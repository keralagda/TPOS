'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { Plane, ShieldCheck, ArrowRight, Clock, CheckCircle2, Zap } from 'lucide-react';

export default function FlightsPage() {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('DXB');
  const [carrier, setCarrier] = useState('ALL');

  const offers = [
    {
      carrier: 'IndiGo (6E)',
      flightNo: '6E-1453',
      route: `${origin} -> ${destination}`,
      departure: '08:20 AM',
      arrival: '10:45 AM',
      duration: '3h 55m (Non-stop)',
      ndcFare: 14500,
      gdsFare: 15650,
      surchargeSaved: 1150,
      ancillaries: ['Excess Baggage (10kg) +₹2,100', 'Window Seat Select +₹450', 'Hot Meal Combo +₹350'],
    },
    {
      carrier: 'Air India (AI)',
      flightNo: 'AI-995',
      route: `${origin} -> ${destination}`,
      departure: '14:15 PM',
      arrival: '16:50 PM',
      duration: '4h 05m (Non-stop)',
      ndcFare: 16200,
      gdsFare: 17700,
      surchargeSaved: 1500,
      ancillaries: ['Priority Check-in +₹600', 'Lounge Access +₹1,200'],
    },
    {
      carrier: 'Emirates (EK)',
      flightNo: 'EK-511',
      route: `${origin} -> ${destination}`,
      departure: '21:30 PM',
      arrival: '23:55 PM',
      duration: '3h 55m (A380)',
      ndcFare: 21500,
      gdsFare: 23200,
      surchargeSaved: 1700,
      ancillaries: ['Chauffeur Transfer +₹1,800', 'Extra Legroom +₹1,500'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" /> Direct NDC Carrier Network
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Direct Carrier Airline Fares</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Book directly through airline NDC APIs. Avoid legacy Global Distribution System (GDS) surcharges and unlock unbundled custom ancillaries.
          </p>
        </div>

        {/* Flight Search Control */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">From Airport</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                <option value="DEL">New Delhi (DEL)</option>
                <option value="BOM">Mumbai (BOM)</option>
                <option value="BLR">Bengaluru (BLR)</option>
                <option value="COK">Kochi (COK)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">To Destination</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                <option value="DXB">Dubai (DXB)</option>
                <option value="SIN">Singapore (SIN)</option>
                <option value="BKK">Bangkok (BKK)</option>
                <option value="DPS">Bali (DPS)</option>
                <option value="LHR">London (LHR)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Departure Date</label>
              <input type="date" defaultValue="2026-10-15" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Carrier Network</label>
              <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                <option value="ALL">All Direct Carriers</option>
                <option value="6E">IndiGo NDC</option>
                <option value="AI">Air India NDC</option>
                <option value="EK">Emirates NDC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live NDC Offer Results */}
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.flightNo} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-sky-300 transition space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{offer.carrier}</h3>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{offer.flightNo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">DIRECT NDC</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span>{offer.departure} - {offer.arrival}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {offer.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs line-through text-slate-400">Legacy GDS: ₹{offer.gdsFare.toLocaleString()}</div>
                  <div className="text-xl font-black text-emerald-700">₹{offer.ndcFare.toLocaleString()}</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Saves ₹{offer.surchargeSaved.toLocaleString()} Surcharge
                  </span>
                </div>
              </div>

              {/* Unbundled Ancillaries */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap gap-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block w-full mb-1">Direct Carrier Add-Ons (Zero Markup):</span>
                {offer.ancillaries.map((a) => (
                  <span key={a} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-[11px]">
                    {a}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Airline PNR Issuance
                </span>
                <button
                  onClick={() => alert(`⚡ NDC Flight Booking Confirmed!\n• Carrier: ${offer.carrier}\n• Flight: ${offer.flightNo}\n• Direct Net Fare: ₹${offer.ndcFare.toLocaleString()}\n• GDS Surcharge Avoided: ₹${offer.surchargeSaved}\n• PNR generated: 6E${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="px-5 py-2 bg-slate-900 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  Book NDC Direct <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
