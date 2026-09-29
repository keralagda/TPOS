'use client';

import React, { useState } from 'react';
import { 
  Radio, AlertTriangle, Plane, CheckCircle2, ShieldAlert, 
  MapPin, Clock, Users, ArrowRight, RefreshCw, Send, Plus, 
  Sparkles, Check
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { TravelControlTowerService, OperationalEvent, IncidentSeverity } from '@/lib/operations/control-tower-service';

export default function TravelControlTowerPage() {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'INCIDENTS' | 'DISPATCH' | 'BROADCAST'>('RADAR');
  const [events, setEvents] = useState<OperationalEvent[]>(() => TravelControlTowerService.getLiveEvents());
  const [metrics, setMetrics] = useState(() => TravelControlTowerService.getMetrics());

  // Incident resolution state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Event broadcast state
  const [newType, setNewType] = useState<any>('FLIGHT_DELAYED');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('HIGH');
  const [newBookingRef, setNewBookingRef] = useState('');
  const [newTraveler, setNewTraveler] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newSummary, setNewSummary] = useState('');

  const handleResolve = (id: string) => {
    if (!resolutionNote) return;
    TravelControlTowerService.resolveIncident(id, resolutionNote);
    setEvents([...TravelControlTowerService.getLiveEvents()]);
    setMetrics(TravelControlTowerService.getMetrics());
    setResolvingId(null);
    setResolutionNote('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary || !newTraveler) return;

    TravelControlTowerService.broadcastEvent({
      type: newType,
      severity: newSeverity,
      bookingRef: newBookingRef || 'TP-EMERGENCY',
      travelerName: newTraveler,
      destination: newDest || 'Global',
      summary: newSummary
    });

    setEvents([...TravelControlTowerService.getLiveEvents()]);
    setMetrics(TravelControlTowerService.getMetrics());
    setActiveTab('RADAR');
    setNewSummary('');
    setNewTraveler('');
  };

  return (
    <InternalLayout
      headerTitle="Travel Control Tower: 24/7 Operations Radar"
      headerSubtitle="Real-Time Flight & Hotel Sensors • Live Incident Resolution • Traveler Dispatch & Concierge Escort"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcast Incident</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly No Modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('RADAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'RADAR'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Mission Radar ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'INCIDENTS'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Disruptions ({events.filter(e => !e.resolved).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DISPATCH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'DISPATCH'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Concierge & Chauffeur Dispatch ({metrics.dispatchedConciergesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'BROADCAST'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Log Sensor Alert</span>
          </button>
        </div>

        {/* Top 4 Mission Control KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active In-Flight Trips</span>
            <div className="text-2xl font-black text-white">{metrics.activeTripsInFlight}</div>
            <span className="text-xs text-sky-400 font-mono">Real-time GPS Tracking</span>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Flight Delays</span>
            <div className="text-2xl font-black text-amber-400">{metrics.flightDelayAlerts}</div>
            <span className="text-xs text-amber-300 font-mono">Automatic Chauffeur Reschedule</span>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Critical Disruptions</span>
            <div className="text-2xl font-black text-rose-400">{metrics.criticalIncidentsCount}</div>
            <span className="text-xs text-emerald-400 font-bold">SLA: &lt; 5m response</span>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Concierges</span>
            <div className="text-2xl font-black text-emerald-400">{metrics.dispatchedConciergesCount}</div>
            <span className="text-xs text-slate-400 font-mono">On-Ground Support</span>
          </div>
        </div>

        {/* TAB 1: RADAR */}
        {activeTab === 'RADAR' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Live Operations Feed (Real-Time Voyage8 Stream)
            </span>

            <div className="space-y-3">
              {events.map(evt => (
                <div 
                  key={evt.id}
                  className={`p-4 rounded-xl border space-y-2 transition ${
                    evt.severity === 'HIGH' || evt.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${evt.resolved ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
                      <span className="font-extrabold text-white text-xs font-mono">{evt.type}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 text-sky-400 rounded">
                        {evt.bookingRef}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.severity === 'HIGH' || evt.severity === 'CRITICAL' ? 'bg-rose-900/60 text-rose-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {evt.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200">{evt.summary}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 gap-2">
                    <div className="flex items-center gap-3">
                      <span>Traveler: <strong className="text-white">{evt.travelerName}</strong></span>
                      <span>•</span>
                      <span>Dest: <strong className="text-sky-400">{evt.destination}</strong></span>
                    </div>

                    {evt.resolved ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved: {evt.actionTaken || 'Action logged'}
                      </span>
                    ) : (
                      <button
                        onClick={() => setResolvingId(evt.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                      >
                        Resolve Disruption
                      </button>
                    )}
                  </div>

                  {resolvingId === evt.id && (
                    <div className="pt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Action taken (e.g. Chauffeur rescheduled to 4 PM)"
                        value={resolutionNote}
                        onChange={e => setResolutionNote(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white"
                      />
                      <button
                        onClick={() => handleResolve(evt.id)}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INCIDENTS */}
        {activeTab === 'INCIDENTS' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Unresolved Incidents
            </span>
            <div className="space-y-3">
              {events.filter(e => !e.resolved).map(evt => (
                <div key={evt.id} className="bg-slate-950 p-4 rounded-xl border border-rose-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-xs">{evt.summary}</span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">{evt.severity}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Traveler: {evt.travelerName} • Booking: {evt.bookingRef}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DISPATCH */}
        {activeTab === 'DISPATCH' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Active Chauffeur & Local Concierge Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Maya Nair (Resident Concierge)</span>
                  <span className="text-emerald-400">ON-SITE</span>
                </div>
                <p className="text-slate-400">Assigned: Kumarakom & Alleppey Luxury Backwater Trail</p>
                <div className="text-[11px] text-sky-400 font-mono">Mobile: +91-9876543210 • Status: Accompanying Guest</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Rashid Al-Maktoum (Chauffeur Lead)</span>
                  <span className="text-amber-400">STANDBY (FLIGHT DELAY)</span>
                </div>
                <p className="text-slate-400">Assigned: Emirates EK-531 DXB Arrival (Rahul Kumar)</p>
                <div className="text-[11px] text-sky-400 font-mono">Vehicle: Mercedes V-Class • Tracking: Terminal 3</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BROADCAST */}
        {activeTab === 'BROADCAST' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Broadcast Real-Time Incident / Disruption</h3>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="FLIGHT_DELAYED">FLIGHT_DELAYED</option>
                  <option value="INCIDENT_RAISED">INCIDENT_RAISED</option>
                  <option value="SUPPLIER_CONFIRMED">SUPPLIER_CONFIRMED</option>
                </select>

                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Booking Ref (e.g. TP-DXB-99)"
                  value={newBookingRef}
                  onChange={e => setNewBookingRef(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Traveler Name"
                  required
                  value={newTraveler}
                  onChange={e => setNewTraveler(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={newDest}
                  onChange={e => setNewDest(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <textarea
                rows={3}
                required
                placeholder="Disruption summary & sensor triggers..."
                value={newSummary}
                onChange={e => setNewSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Broadcast to Control Tower
              </button>
            </form>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
