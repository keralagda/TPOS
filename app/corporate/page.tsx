'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Briefcase, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, ArrowRight, Building2, UserCheck, Plane, FileCheck, Layers
} from 'lucide-react';
import { DEFAULT_CORPORATE_POLICY } from '@/lib/corporate/policy-service';

export default function CorporateTravelPage() {
  const [activeTab, setActiveTab] = useState<'EVALUATE' | 'POLICY' | 'APPROVALS'>('EVALUATE');
  const [destination, setDestination] = useState('Dubai');
  const [cabin, setCabin] = useState<'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS'>('ECONOMY');
  const [totalCost, setTotalCost] = useState(65000);
  const [hotelNightly, setHotelNightly] = useState(7500);
  const [advanceDays, setAdvanceDays] = useState(10);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const departure = new Date();
      departure.setDate(departure.getDate() + advanceDays);

      const res = await fetch('/api/v1/corporate/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          flightCabin: cabin,
          totalCostInr: totalCost,
          hotelRatePerNightInr: hotelNightly,
          departureDate: departure.toISOString(),
          employeeRole: 'STAFF',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InternalLayout
      headerTitle="Corporate Travel OS"
      headerSubtitle="Enterprise Policy, Per Diem Rules & Multi-Tier Approvals (§25)"
      actions={
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Enterprise Policy Active
          </span>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('EVALUATE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'EVALUATE' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>Booking Evaluation Simulator</span>
        </button>
        <button
          onClick={() => setActiveTab('POLICY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'POLICY' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Policy Limits &amp; Per Diems</span>
        </button>
        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'APPROVALS' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Approval Chain &amp; Cost Centers</span>
        </button>
      </div>

      {/* Tab 2: Policy Grid */}
      {activeTab === 'POLICY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Max Trip Budget</div>
              <div className="text-2xl font-black text-white mt-1">₹{DEFAULT_CORPORATE_POLICY.maxBudgetInr.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-400 mt-1">Standard domestic &amp; short-haul limit</div>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Hotel Nightly Cap</div>
              <div className="text-2xl font-black text-white mt-1">₹{DEFAULT_CORPORATE_POLICY.maxHotelPerNightInr.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-400 mt-1">Tier-1 metro city allowance</div>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Allowed Flight Cabin</div>
              <div className="text-2xl font-black text-white mt-1">Economy</div>
              <div className="text-[11px] text-slate-400 mt-1">Business requires Director exception</div>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Advance Booking Window</div>
              <div className="text-2xl font-black text-white mt-1">{DEFAULT_CORPORATE_POLICY.minAdvanceBookingDays} Days</div>
              <div className="text-[11px] text-slate-400 mt-1">Mandatory notice to prevent surge pricing</div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <h3 className="font-bold text-white text-sm">Policy Governance Hierarchy</h3>
            <p className="text-slate-400 leading-relaxed">
              In accordance with Heuris8 Section 25, automated policy rules evaluate corporate bookings prior to GDS/NDC ticket issuance.
              Any booking exceeding ₹1,00,000 or submitted with less than 7 days notice triggers a Director Approval exception gate.
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Evaluate Simulator */}
      {activeTab === 'EVALUATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 p-7 rounded-3xl border border-slate-800 shadow-sm">
            <h2 className="text-base font-extrabold text-white mb-1">Corporate Booking Request Pre-check</h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              Submit travel parameters to test real-time policy compliance and approval routing.
            </p>

            <form onSubmit={handleEvaluate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Flight Cabin</label>
                  <select
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business Class</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Total Trip Cost (₹)</label>
                  <input
                    type="number"
                    value={totalCost}
                    onChange={(e) => setTotalCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Hotel / Night (₹)</label>
                  <input
                    type="number"
                    value={hotelNightly}
                    onChange={(e) => setHotelNightly(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Advance Days</label>
                  <input
                    type="number"
                    value={advanceDays}
                    onChange={(e) => setAdvanceDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 mt-4 shadow-md shadow-sky-600/20"
              >
                <span>{isSubmitting ? 'Evaluating Policy...' : 'Evaluate Policy Compliance'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            {evaluationResult ? (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Request: {evaluationResult.request?.requestId}</span>
                  {evaluationResult.compliance?.isCompliant ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold flex items-center gap-1 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Compliant
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold flex items-center gap-1 border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" /> Policy Exception
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">Approval Workflow Routing:</div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-400">Current Assigned Stage:</span>
                    <strong className="text-sky-400 font-mono">{evaluationResult.request?.status}</strong>
                  </div>
                </div>

                {evaluationResult.compliance?.violations?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-amber-400">Detected Policy Violations:</div>
                    {evaluationResult.compliance.violations.map((v: string, idx: number) => (
                      <div key={idx} className="p-2.5 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-200 font-medium">
                        • {v}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                  Cost Center: <strong className="text-slate-200 font-mono">{evaluationResult.request?.costCenter}</strong>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 p-8 rounded-3xl border border-dashed border-slate-800 text-center text-slate-500 space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto text-slate-600" />
                <div className="text-xs font-bold text-slate-300">No Request Evaluated Yet</div>
                <p className="text-[11px]">Fill the form on the left to see the instant policy evaluation result and approval routing.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Approvals & Cost Centers */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-1">Corporate Cost Centers</h3>
            <p className="text-xs text-slate-400 mb-4">Allocated budget and expenditure tracking by department.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">CC-ENGINEERING-402</div>
                <div className="text-lg font-black text-white mt-1">₹18,50,000</div>
                <div className="text-[10px] text-emerald-400">₹12,40,000 remaining</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">CC-SALES-EXPANSION-101</div>
                <div className="text-lg font-black text-white mt-1">₹35,00,000</div>
                <div className="text-[10px] text-emerald-400">₹21,80,000 remaining</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">CC-EXECUTIVE-BOARD-001</div>
                <div className="text-lg font-black text-white mt-1">₹50,00,000</div>
                <div className="text-[10px] text-purple-400">Active Audit Ready</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </InternalLayout>
  );
}
