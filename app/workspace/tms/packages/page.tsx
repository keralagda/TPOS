import { Metadata } from 'next';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { Package8Manager } from '@/lib/packages/package8-manager';
import { Package, Plus, Sparkles, Layers, Sliders, CheckCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Package Studio & Hyper Configurator | Travel Planet OS',
  description: 'Design, cost, margin-analyze, and compose multi-day holiday packages with component rules and immutable snapshots.',
};

export default function PackageStudioPage() {
  const packages = Package8Manager.getAllPackages();

  return (
    <InternalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                PACKAGE8 & HYPER CONFIGURATOR
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.4 Kernel</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-sky-400" />
              Travel Package Studio
            </h1>
            <p className="text-sm text-slate-400">
              Compose coordinated journey itineraries with dynamic component costing, tax rules, markups, and immutable version snapshots.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-sky-600/20">
              <Plus className="w-4 h-4" />
              New Hyper Package
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Layers className="w-4 h-4 text-sky-400" />
              Component Composition
            </div>
            <div className="text-xl font-black text-white">Multi-Supplier</div>
            <p className="text-[11px] text-slate-400 mt-1">Flights, 5★ Hotels, Transfers, VIP Safaris & Add-ons</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Margin & Tax Engine
            </div>
            <div className="text-xl font-black text-white">Dynamic Markups</div>
            <p className="text-[11px] text-slate-400 mt-1">Real-time GST, TCS calculation, and partner commissions</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              Immutable Snapshot
            </div>
            <div className="text-xl font-black text-white">SHA-256 Locked</div>
            <p className="text-[11px] text-slate-400 mt-1">Bookings retain immutable price and inclusions copy</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Cross-Module Bindings
            </div>
            <div className="text-xl font-black text-white">VIBE8 + HESTIA8</div>
            <p className="text-[11px] text-slate-400 mt-1">Auto-sync to SEO graph, VIBE CMS pages & DMS vouchers</p>
          </div>
        </div>

        {/* Packages List */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Packaged Departures ({packages.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Channel: Omnichannel & B2B</span>
          </div>

          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.packageId} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {pkg.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {pkg.durationDays}D / {pkg.durationNights}N
                      </span>
                      <span className="text-xs text-slate-400">• Destination: {pkg.destination}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{pkg.title}</h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {pkg.components.map((c) => (
                        <span key={c.componentId} className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                          {c.type}: {c.title} ({c.supplierName})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/80">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Selling Price</div>
                      <div className="text-2xl font-black text-sky-400">
                        {pkg.pricing.currency} {pkg.pricing.finalSellingPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Net: ₹{pkg.pricing.totalNetCost.toLocaleString('en-IN')} + Markup: ₹{pkg.pricing.totalMarkup.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
