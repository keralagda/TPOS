'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Users, Filter, Search, Plus, Phone, MessageSquare, 
  ArrowRight, Flame, Clock, CheckCircle2, ChevronDown,
  Sparkles, Mail, MapPin, DollarSign, UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface LeadItem {
  id: string;
  name: string;
  source: string;
  destination: string;
  budget: string;
  pax: number;
  score: number;
  status: string;
  agent: string;
  date: string;
}

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'CREATE'>('PIPELINE');
  const [filterSource, setFilterSource] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [leads, setLeads] = useState<LeadItem[]>([
    { id: 'LD-901', name: 'Kavita Patel', source: 'WEBSITE', destination: 'Dubai, UAE', budget: '₹2,50,000', pax: 2, score: 88, status: 'QUALIFIED', agent: 'Priya Sharma', date: 'Today' },
    { id: 'LD-902', name: 'Dr. Anand Verma', source: 'GOOGLE', destination: 'Dubai & Maldives Combo', budget: '₹6,50,000', pax: 4, score: 96, status: 'QUOTED', agent: 'Priya Sharma', date: 'Today' },
    { id: 'LD-903', name: 'Rohan Mehra', source: 'WHATSAPP', destination: 'Bali Island Hopping', budget: '₹1,80,000', pax: 2, score: 78, status: 'CONTACTED', agent: 'David Roy', date: 'Yesterday' },
    { id: 'LD-904', name: 'Meera Singhania', source: 'INSTAGRAM', destination: 'Paris & Swiss Alps', budget: '₹8,20,000', pax: 2, score: 94, status: 'NEGOTIATION', agent: 'David Roy', date: 'Yesterday' },
    { id: 'LD-905', name: 'Vikram Malhotra', source: 'REFERRAL', destination: 'Maldives Overwater Retreat', budget: '₹5,00,000', pax: 2, score: 85, status: 'REQUIREMENT_CAPTURED', agent: 'Sarah Khan', date: '2 days ago' },
    { id: 'LD-906', name: 'Sanjay Reddy', source: 'PHONE', destination: 'Singapore & Sentosa', budget: '₹3,40,000', pax: 3, score: 72, status: 'NEW', agent: 'Unassigned', date: '3 days ago' },
  ]);

  // Form state for creating new lead
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSource, setFormSource] = useState('WEBSITE');
  const [formDest, setFormDest] = useState('');
  const [formPax, setFormPax] = useState('2');
  const [formBudget, setFormBudget] = useState('₹3,00,000');
  const [formAgent, setFormAgent] = useState('Priya Sharma');
  const [formNotes, setFormNotes] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDest.trim()) return;

    const newId = `LD-${Math.floor(100 + Math.random() * 900)}`;
    const newLead: LeadItem = {
      id: newId,
      name: formName,
      source: formSource,
      destination: formDest,
      budget: formBudget,
      pax: parseInt(formPax) || 2,
      score: 85,
      status: 'QUALIFIED',
      agent: formAgent,
      date: 'Just now'
    };

    setLeads([newLead, ...leads]);
    setSuccessBanner(`Lead ${newId} (${formName}) successfully registered and assigned to ${formAgent}!`);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormDest('');
    setFormNotes('');
    setActiveTab('PIPELINE');
  };

  const filteredLeads = leads.filter(l => {
    const matchesSource = filterSource === 'ALL' || l.source === filterSource;
    const matchesQuery = searchQuery === '' || 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesQuery;
  });

  return (
    <InternalLayout
      headerTitle="Lead Pipeline & Qualification Board"
      headerSubtitle="CRM & Sales Pipeline Management"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PIPELINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'PIPELINE' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Pipeline Board ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'CREATE' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Lead</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button onClick={() => setSuccessBanner(null)} className="text-emerald-400 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Pipeline View */}
        {activeTab === 'PIPELINE' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter by Source:
                </span>
                {['ALL', 'WEBSITE', 'GOOGLE', 'WHATSAPP', 'INSTAGRAM', 'REFERRAL', 'PHONE'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterSource(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      filterSource === s ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads by name or city..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Lead Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Lead ID & Prospect</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Destination & Pax</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">AI Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assigned Agent</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <Link href={`/crm/customers/usr_cust_rahul`} className="font-bold text-white hover:text-sky-400">
                          {lead.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.id} • {lead.date}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-semibold bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
                          {lead.source}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="font-medium text-slate-200">{lead.destination}</div>
                        <div className="text-[10px] text-slate-500">{lead.pax} Travelers</div>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">{lead.budget}</td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px]">
                          {lead.score}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{lead.agent}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/crm/quotes?lead=${lead.id}`}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Build Quote</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Create Lead Form (Converted from Modal) */}
        {activeTab === 'CREATE' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-400" />
                Capture & Qualify New Lead
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter prospect intelligence for automated scoring, CRM tracking, and agent workflow assignment.
              </p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Prospect Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Khanna"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="rajesh.khanna@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Lead Source
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="WEBSITE">Website Form / Inquiry</option>
                    <option value="GOOGLE">Google Ads Search</option>
                    <option value="WHATSAPP">WhatsApp Direct Business</option>
                    <option value="INSTAGRAM">Instagram / Meta Ads</option>
                    <option value="REFERRAL">Client Referral</option>
                    <option value="PHONE">Inbound Direct Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDest}
                    onChange={(e) => setFormDest(e.target.value)}
                    placeholder="e.g. Switzerland & Paris 7D Luxury"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pax Count (Travelers)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formPax}
                    onChange={(e) => setFormPax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="₹4,50,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assigned Travel Consultant
                  </label>
                  <select
                    value={formAgent}
                    onChange={(e) => setFormAgent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Priya Sharma">Priya Sharma (Senior Consultant)</option>
                    <option value="David Roy">David Roy (Europe Specialist)</option>
                    <option value="Sarah Khan">Sarah Khan (Island & Maldives Specialist)</option>
                    <option value="Unassigned">Unassigned (Queue Pool)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Prospect Requirements & Itinerary Notes
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Specific room requests, business class flights, visa assistance, dietary preferences..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('PIPELINE')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-sky-600/20"
                >
                  Register Lead & Open Pipeline
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
