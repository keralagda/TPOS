'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { ShieldCheck, CreditCard, Lock, CheckCircle, AlertTriangle, ArrowRight, User, FileText, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading secure checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const rawPrice = searchParams ? searchParams.get('price') : null;
  const initialBaseAmount = rawPrice ? parseInt(rawPrice, 10) : 59999;

  const [baseAmount, setBaseAmount] = useState<number>(initialBaseAmount || 59999);
  const [lrsAccumulated, setLrsAccumulated] = useState<number>(0);
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');
  const [isPanVerified, setIsPanVerified] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>('Rahul Sharma');
  const [email, setEmail] = useState<string>('rahul.sharma@example.com');
  const [phone, setPhone] = useState<string>('+91 9876543210');
  const [passportNumber, setPassportNumber] = useState<string>('Z9876543');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NET_BANKING' | 'B2B_CREDIT'>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // TCS Section 206C(1G) Logic:
  // LRS threshold = INR 7,00,000
  // Remittances up to 7L: 5% TCS
  // Remittances exceeding 7L: 20% TCS
  const threshold = 700000;
  const effectivePrevious = lrsAccumulated;
  let tcsAmount = 0;
  let tcsRateText = '5%';

  if (effectivePrevious >= threshold) {
    tcsAmount = Math.round(baseAmount * 0.20);
    tcsRateText = '20% (LRS threshold exceeded)';
  } else if (effectivePrevious + baseAmount > threshold) {
    const belowThresholdPortion = threshold - effectivePrevious;
    const aboveThresholdPortion = baseAmount - belowThresholdPortion;
    tcsAmount = Math.round((belowThresholdPortion * 0.05) + (aboveThresholdPortion * 0.20));
    tcsRateText = 'Split (5% up to ₹7L, 20% above)';
  } else {
    tcsAmount = Math.round(baseAmount * 0.05);
    tcsRateText = '5% (Within ₹7L LRS threshold)';
  }

  const gstAmount = Math.round(baseAmount * 0.05); // 5% GST on outbound package
  const totalPayable = baseAmount + gstAmount + tcsAmount;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1 mb-2">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout OS
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Your Reservation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Compliant with RBI Liberalised Remittance Scheme (LRS) & Indian Income Tax Act Section 206C(1G).
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-10 text-center shadow-lg max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Booking Confirmed!</h2>
            <p className="text-sm text-slate-600">
              Your reservation reference <strong className="text-slate-900 font-mono">TP-892401</strong> has been confirmed. E-ticket vouchers and statutory TCS certificates have been dispatched to <strong className="text-slate-900">{email}</strong>.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">TXN_7749210492</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-slate-900">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TCS Deposited to PAN:</span>
                <span className="font-mono font-bold text-sky-700">{panNumber} (₹{tcsAmount.toLocaleString('en-IN')})</span>
              </div>
            </div>
            <div className="pt-4 flex gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
              >
                Return to Directory
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <form onSubmit={handleCheckout} className="lg:col-span-7 space-y-6">
              {/* Traveler Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" /> Primary Traveler & Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Legal Name (as per Passport)</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number (with country code)</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Passport Number</label>
                    <input
                      type="text"
                      required
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-mono focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory PAN & FEMA Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" /> Mandatory PAN & LRS Verification
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    NSDL Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Permanent Account Number (PAN)</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-mono tracking-widest font-bold focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Required by RBI for LRS outward remittances
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prior FY 2024-25 LRS Remittance (INR)</label>
                    <input
                      type="number"
                      value={lrsAccumulated}
                      onChange={(e) => setLrsAccumulated(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                      placeholder="0"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Exceeding ₹7,00,000 threshold transitions TCS to 20%
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-600" /> Select Payment Method
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { id: 'UPI', label: 'Instant UPI', desc: 'GPay, PhonePe, Paytm' },
                    { id: 'CARD', label: 'Credit / Debit', desc: 'Visa, Mastercard, Amex' },
                    { id: 'NET_BANKING', label: 'Net Banking', desc: 'All Indian Banks' },
                    { id: 'B2B_CREDIT', label: 'Agency Credit', desc: 'Partner Wallet' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        paymentMethod === m.id
                          ? 'border-sky-600 bg-sky-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{m.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
              >
                <span>{isProcessing ? 'Authorizing Payment & Filing TCS...' : `Pay ₹${totalPayable.toLocaleString('en-IN')}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Price Breakdown Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-28">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fare & Tax Computation</h3>
                  <p className="text-xs text-slate-500">Itemized statutory breakdown for Indian travellers.</p>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-slate-100 py-4">
                  <div className="flex justify-between text-slate-700">
                    <span>Base Travel Inventory</span>
                    <span className="font-semibold text-slate-900">₹{baseAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span className="flex items-center gap-1">
                      <span>GST (5% Outbound Tour)</span>
                      <span className="text-[10px] text-slate-400">SAC 99855</span>
                    </span>
                    <span className="font-semibold text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span className="flex flex-col">
                      <span className="font-semibold text-sky-800">TCS under Sec 206C(1G)</span>
                      <span className="text-[10px] text-slate-400">{tcsRateText}</span>
                    </span>
                    <span className="font-bold text-sky-700">₹{tcsAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Total Net Payable</div>
                      <div className="text-[10px] text-emerald-600 font-medium">TCS is claimable in your Annual ITR</div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ₹{totalPayable.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Instant Form 27D Tax Credit certificate issued</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>PCI-DSS Level 1 Encrypted Payment Gateway</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
