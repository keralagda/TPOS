'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Users, FileText, Send, CheckCircle2, Clock, Plus, Phone, 
  MessageSquare, ArrowRight, UserPlus, Sparkles, MapPin, DollarSign 
} from 'lucide-react';
import Link from 'next/link';

interface Inquiry {
  id: string;
  client: string;
  phone: string;
  destination: string;
  travelers: number;
  budget: string;
  stage: 'NEW' | 'QUOTED' | 'CONFIRMED' | 'TRAVELING';
  dates: string;
}

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'NEW_INQUIRY'>('KANBAN');
  const [notice, setNotice] = useState<string | null>(null);

  const [inquiries, setInquiries] = useState<Inquiry[]>([
    { id: 'INQ-401', client: 'Vikram & Priya Oberoi', phone: '+91 9820011223', destination: 'Dubai, UAE', travelers: 2, budget: '₹1.5L', stage: 'NEW', dates: '12 Nov - 17 Nov' },
    { id: 'INQ-402', client: 'Arjun Mehta Family', phone: '+91 9819922334', destination: 'Bali, Indonesia', travelers: 4, budget: '₹2.8L', stage: 'QUOTED', dates: '24 Dec - 30 Dec' },
    { id: 'INQ-403', client: 'Rohit Kulkarni', phone: '+91 9821033445', destination: 'Maldives', travelers: 2, budget: '₹3.2L', stage: 'CONFIRMED', dates: '10 Oct - 14 Oct' },
    { id: 'INQ-404', client: 'Sunita Rao', phone: '+91 9833044556', destination: 'Paris, France', travelers: 1, budget: '₹1.8L', stage: 'TRAVELING', dates: '22 Sep - 28 Sep' },
  ]);

  // Form state
  const [newClient, setNewClient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newPax, setNewPax] = useState('2');
  const [newBudget, setNewBudget] = useState('₹2,00,000');
  const [newDates, setNewDates] = useState('');

  const stages: ('NEW' | 'QUOTED' | 'CONFIRMED' | 'TRAVELING')[] = ['NEW', 'QUOTED', 'CONFIRMED', 'TRAVELING'];

  const stageLabels = {
    NEW: 'New Inquiries',
    QUOTED: 'Quotations Sent',
    CONFIRMED: 'Bookings Confirmed',
    TRAVELING: 'Currently Traveling'
  };

  const advanceStage = (id: string) => {
    setInquiries(prev => prev.map(inq => {
      if (inq.id === id) {
        const next = inq.stage === 'NEW' ? 'QUOTED' : inq.stage === 'QUOTED' ? 'CONFIRMED' : inq.stage === 'CONFIRMED' ? 'TRAVELING' : 'TRAVELING';
        return { ...inq, stage: next };
      }
      return inq;
    }));
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newDest.trim()) return;

    const newId = `INQ-${Math.floor(400 + Math.random() * 500)}`;
    const created: Inquiry = {
      id: newId,
      client: newClient,
      phone: newPhone || '+91 98000 00000',
      destination: newDest,
      travelers: parseInt(newPax) || 2,
      budget: newBudget,
      stage: 'NEW',
      dates: newDates || 'Flexible / Upcoming'
    };

    setInquiries([created, ...inquiries]);
    setNotice(`Inquiry ${newId} logged for ${newClient}. Added to New Inquiries column.`);
    setNewClient('');
    setNewPhone('');
    setNewDest('');
    setNewDates('');
    setActiveTab('KANBAN');
  };

  return (
    <InternalLayout
      headerTitle="Travel Consultant Workspace"
      headerSubtitle="Consultant Desk: Priya Sharma • Team Sales Scope"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('KANBAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'KANBAN' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Pipeline Board ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('NEW_INQUIRY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'NEW_INQUIRY' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Client Inquiry</span>
          </button>
          <Link
            href="/crm/quotes"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-xl transition"
          >
            Build Quote →
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Notice Banner */}
        {notice && (
          <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-emerald-400 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Active Inquiries</div>
            <div className="text-2xl font-black text-white mt-1">{inquiries.length} Leads</div>
            <div className="text-[11px] text-emerald-400 mt-1">68% historical conversion</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Confirmed Bookings (MTD)</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹14,80,000</div>
            <div className="text-[11px] text-slate-400 mt-1">11 Completed Itineraries</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Accrued Commission</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">₹1,18,400</div>
            <div className="text-[11px] text-slate-400 mt-1">Average 8% commission earned</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Customer CSAT</div>
            <div className="text-2xl font-black text-amber-400 mt-1">4.95 / 5.0</div>
            <div className="text-[11px] text-slate-400 mt-1">Based on 32 traveler reviews</div>
          </div>
        </div>

        {/* Tab 1: Kanban */}
        {activeTab === 'KANBAN' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Inquiry Pipeline & Follow-Up Board
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stages.map(stage => {
                const stageInqs = inquiries.filter(i => i.stage === stage);
                return (
                  <div key={stage} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-200 uppercase">{stageLabels[stage]}</span>
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center">
                        {stageInqs.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageInqs.map(inq => (
                        <div key={inq.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono text-indigo-400 font-bold">{inq.id}</span>
                            <span className="text-[10px] font-bold text-emerald-400">{inq.budget}</span>
                          </div>
                          <div className="font-bold text-xs text-white">{inq.client}</div>
                          <div className="text-[11px] text-slate-400">
                            {inq.destination} • {inq.travelers} Pax
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Dates: {inq.dates}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                            <div className="flex gap-2">
                              <a href={`tel:${inq.phone}`} className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white transition">
                                <Phone className="w-3 h-3" />
                              </a>
                              <a href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white transition">
                                <MessageSquare className="w-3 h-3" />
                              </a>
                            </div>

                            {inq.stage !== 'TRAVELING' && (
                              <button
                                onClick={() => advanceStage(inq.id)}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: New Inquiry Form */}
        {activeTab === 'NEW_INQUIRY' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Log Inbound Inquiry
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Direct consultant inquiry intake for fast quotation turnaround.
              </p>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Vikram Singhania"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98111 22233"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination *</label>
                  <input
                    type="text"
                    required
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    placeholder="e.g. Switzerland Alps & Paris"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Passenger Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newPax}
                    onChange={(e) => setNewPax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Budget</label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="₹2,50,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Travel Dates</label>
                  <input
                    type="text"
                    value={newDates}
                    onChange={(e) => setNewDates(e.target.value)}
                    placeholder="e.g. 15 Dec - 22 Dec 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('KANBAN')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
                >
                  Save Inquiry & Add to Kanban
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
