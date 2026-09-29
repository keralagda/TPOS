'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { Headphones, ShieldAlert, PhoneCall, MessageSquare, LifeBuoy, FileQuestion, Search, ArrowRight, CheckCircle2, Globe } from 'lucide-react';

interface EmergencyContact {
  country: string;
  embassy: string;
  phone: string;
  emergencySos: string;
  city: string;
}

const EMBASSIES: EmergencyContact[] = [
  { country: 'United Arab Emirates', city: 'Dubai / Abu Dhabi', embassy: 'Embassy / Consulate General of India', phone: '+971 4 397 1222', emergencySos: '+971 50 734 7676' },
  { country: 'Indonesia', city: 'Bali / Jakarta', embassy: 'Consulate General of India, Bali', phone: '+62 361 259 500', emergencySos: '+62 811 386 7272' },
  { country: 'Singapore', city: 'Singapore', embassy: 'High Commission of India, Singapore', phone: '+65 6737 6777', emergencySos: '+65 9171 9272' },
  { country: 'France', city: 'Paris', embassy: 'Embassy of India, Paris', phone: '+33 1 40 50 70 70', emergencySos: '+33 6 12 34 56 78' },
  { country: 'United Kingdom', city: 'London', embassy: 'High Commission of India, London', phone: '+44 20 7836 9147', emergencySos: '+44 776 876 1234' },
  { country: 'United States', city: 'Washington / New York', embassy: 'Embassy of India, Washington D.C.', phone: '+1 202 939 7000', emergencySos: '+1 202 550 8645' }
];

export default function SupportPage() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [pnr, setPnr] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <LifeBuoy className="w-4 h-4" /> Global Concierge & Assistance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Can We Assist Your Journey?
          </h1>
          <p className="text-sm text-slate-500">
            Dedicated 24x7 support desk for flight rebooking, emergency visa assistance, hotel coordination, and Indian consular liaison.
          </p>
        </div>

        {/* SOS Emergency Hotline Banner */}
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-700 uppercase tracking-wider">
                Emergency Ground Operations & SOS Dispatch
              </div>
              <div className="text-lg font-black text-slate-900">
                Stranded or Immediate Emergency Abroad?
              </div>
              <p className="text-xs text-slate-600">
                Immediate escalation to our 24/7 airport response and local DMC emergency duty team.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:+918005550199"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-5 py-3 rounded-xl flex items-center gap-2 transition shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>+91 800 555 0199</span>
            </a>
            <a
              href="https://wa.me/918005550199"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-3 rounded-xl flex items-center gap-2 transition shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp SOS</span>
            </a>
          </div>
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Support Form */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-sky-600" /> Submit a Service Request
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Our operations team resolves over 94% of passenger inquiries in under 15 minutes.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Inquiry Ticket #TP-SR-9182 Created</h3>
                <p className="text-xs text-slate-600">
                  Your ticket has been prioritized and dispatched to the on-duty concierge agent. An SMS and email acknowledgment have been sent.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-sky-600 hover:underline pt-2 block mx-auto"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Booking Reference / PNR</label>
                    <input
                      type="text"
                      placeholder="e.g. TP-892401 or 6-char Airline PNR"
                      value={pnr}
                      onChange={(e) => setPnr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Inquiry Category</label>
                    <select
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    >
                      <option value="">Select Category...</option>
                      <option value="FLIGHT_RESCHEDULE">Flight Reschedule / Cancellation</option>
                      <option value="HOTEL_VOUCHER">Hotel Check-in / Voucher Issue</option>
                      <option value="VISA_STATUS">Visa Application Status</option>
                      <option value="TCS_INVOICE">TCS / GST Invoice Query</option>
                      <option value="SPECIAL_ASSIST">Wheelchair / Dietary Special Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your request or issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-sm"
                >
                  <span>Dispatch Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right: Indian Consular & Embassy Quick Directory */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" /> Indian Consular Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct contacts for Indian Embassies & Consulates abroad for passport loss or consular emergencies.
              </p>
            </div>

            <div className="space-y-3">
              {EMBASSIES.map((emb, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>{emb.country} ({emb.city})</span>
                    <span className="text-[10px] text-sky-600 font-normal">MADAD Linked</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">{emb.embassy}</div>
                  <div className="pt-1 flex flex-wrap gap-3 text-[11px]">
                    <span className="text-slate-700 font-mono">Tel: {emb.phone}</span>
                    <span className="text-rose-600 font-mono font-bold">SOS: {emb.emergencySos}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
