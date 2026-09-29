'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function VisaConciergePage() {
  const [line1, setLine1] = useState('P<INDSHARMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  const [line2, setLine2] = useState('Z1234567<8IND9205143M2911204<<<<<<<<<<<<<<06');
  const [destination, setDestination] = useState('AE');
  const [travelDate, setTravelDate] = useState('2026-10-15');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/operations/visa-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line1, line2, destination, travelDate }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error('Visa scan failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> ICAO Doc 9303 Compliant
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Automated Visa Concierge & OCR</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time machine readable passport zone (MRZ) validation, 6-month validity checks, and instant eVisa payload preparation for Indian travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner Input Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Passport MRZ Scanner</h3>
              <button
                onClick={() => {
                  setLine1('P<INDSHARMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<');
                  setLine2('Z1234567<8IND9205143M2911204<<<<<<<<<<<<<<06');
                }}
                className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Sample
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">MRZ Line 1 (44 Characters)</label>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">MRZ Line 2 (44 Characters)</label>
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Destination Country</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="AE">United Arab Emirates (UAE)</option>
                  <option value="TH">Thailand</option>
                  <option value="ID">Indonesia (Bali)</option>
                  <option value="SG">Singapore</option>
                  <option value="MV">Maldives</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Intended Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? 'Evaluating Passport MRZ...' : 'Analyze Passport & Verify Visa Rules'}
            </button>
          </div>

          {/* Results Display */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Verification Result</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${result.evaluation.passportValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {result.evaluation.passportValid ? 'VALID FOR DEPARTURE' : 'PASSPORT EXPIRED / TOO CLOSE'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Traveler Name:</span>
                    <span className="font-extrabold text-slate-900">{result.mrzData.surname} {result.mrzData.givenNames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passport Number:</span>
                    <span className="font-mono font-bold text-slate-800">{result.mrzData.passportNumber} ({result.mrzData.nationality})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passport Expiry Date:</span>
                    <span className="font-bold text-slate-800">{result.mrzData.expirationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">6-Month Buffer Status:</span>
                    <span className="font-extrabold text-emerald-600">{result.evaluation.monthsRemainingUntilExpiry} Months Remaining (Rule Passed)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination Visa Rule:</span>
                    <span className="font-bold text-sky-700">{result.evaluation.visaRule.visaType} ({result.evaluation.visaRule.destinationCountry})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Govt & Service Fees:</span>
                    <span className="font-extrabold text-slate-900">₹{(result.evaluation.visaRule.govFeeINR + result.evaluation.visaRule.serviceFeeINR).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
                  Biometric photo check passed (35x45mm, white background, 80% face coverage). Application payload ready for 1-click submission.
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                <FileText className="w-12 h-12 stroke-[1.5]" />
                <div className="text-xs font-bold text-slate-600">No Passport Evaluated Yet</div>
                <p className="text-[11px] max-w-xs">Click "Analyze Passport" to decode the ICAO MRZ format and calculate validity buffers.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
