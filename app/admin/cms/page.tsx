'use client';

import React, { useState } from 'react';
import { 
  Globe, Layers, Palette, FileText, CheckCircle2, 
  Sparkles, Filter, Plus, ArrowUpRight, Search, Eye, 
  RefreshCw, Check, Clock, ShieldCheck, Tag
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { VIBE8_CONTENT_TYPES, VIBE8_THEMES, VIBE8_COMPONENTS } from '@/lib/vibe8/registries';
import { TravelContentType } from '@/lib/vibe8/types';

export default function Vibe8CMSPage() {
  const [activeTab, setActiveTab] = useState<'CONTENT_ITEMS' | 'THEMES' | 'COMPONENTS' | 'CREATE_NEW'>('CONTENT_ITEMS');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample items
  const [contentItems, setContentItems] = useState([
    {
      id: 'cnt-01',
      title: 'Kerala Monsoon & Soul Awakening Living Itinerary',
      type: 'JOURNEY',
      status: 'PUBLISHED',
      slug: 'kerala-monsoon-soul-journey',
      updatedAt: '2026-09-28 21:40',
      author: 'Maya Nair (Curator)',
      seoScore: 94
    },
    {
      id: 'cnt-02',
      title: 'Royal Udaipur & Lake Pichola Starlit Cruise',
      type: 'TOUR_PACKAGE',
      status: 'PUBLISHED',
      slug: 'royal-udaipur-lake-pichola',
      updatedAt: '2026-09-28 18:15',
      author: 'Aman Rathore',
      seoScore: 91
    },
    {
      id: 'cnt-03',
      title: 'Chettinad Heritage & Culinary Secrets Blueprint',
      type: 'DESTINATION',
      status: 'SEO_CHECK',
      slug: 'chettinad-tamil-nadu',
      updatedAt: '2026-09-28 14:02',
      author: 'Dr. R. Alagappan',
      seoScore: 88
    },
    {
      id: 'cnt-04',
      title: 'Authentic 7-Day Ayurvedic Panchakarma Retreat',
      type: 'EXPERIENCE',
      status: 'AI_ASSISTED',
      slug: '7-day-ayurveda-rejuvenation',
      updatedAt: '2026-09-27 19:30',
      author: 'Vaidya Haridas',
      seoScore: 85
    }
  ]);

  // Form state for creating content inline in tab
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TravelContentType>('JOURNEY');
  const [newDestination, setNewDestination] = useState('');
  const [newLanguage, setNewLanguage] = useState<'en' | 'ml' | 'hi'>('en');
  const [newBody, setNewBody] = useState('');
  const [creationSuccess, setCreationSuccess] = useState(false);

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newItem = {
      id: `cnt-${Date.now()}`,
      title: newTitle,
      type: newType,
      status: 'EDITOR_REVIEW',
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      updatedAt: 'Just now',
      author: 'System Editor',
      seoScore: 86
    };

    setContentItems([newItem, ...contentItems]);
    setCreationSuccess(true);
    setTimeout(() => {
      setCreationSuccess(false);
      setActiveTab('CONTENT_ITEMS');
      setNewTitle('');
      setNewBody('');
    }, 1200);
  };

  const filteredItems = contentItems.filter(item => {
    const matchesType = selectedTypeFilter === 'ALL' || item.type === selectedTypeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <InternalLayout
      headerTitle="VIBE8 Travel CMS & Experience Hub"
      headerSubtitle="18 Travel-Native Content Types • 10 Curated Themes • Dynamic Visual Components"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('CREATE_NEW')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Experience</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly no modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('CONTENT_ITEMS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'CONTENT_ITEMS'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Content Items ({contentItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('THEMES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'THEMES'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Themes ({VIBE8_THEMES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPONENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'COMPONENTS'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Visual Components ({VIBE8_COMPONENTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATE_NEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'CREATE_NEW'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create In-Page</span>
          </button>
        </div>

        {/* TAB 1: CONTENT ITEMS */}
        {activeTab === 'CONTENT_ITEMS' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search journeys, tours, blogs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Type:</span>
                <select
                  value={selectedTypeFilter}
                  onChange={e => setSelectedTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All 18 Content Types</option>
                  {VIBE8_CONTENT_TYPES.map(t => (
                    <option key={t.type} value={t.type}>{t.displayName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Table */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-4">Title & Slug</th>
                    <th className="p-4">Content Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">SEO Health</th>
                    <th className="p-4">Updated</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{item.title}</div>
                        <div className="text-[11px] text-sky-400 font-mono">/{item.slug}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg font-mono text-[10px] font-bold">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                          item.status === 'SEO_CHECK' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                          'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-10 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.seoScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${item.seoScore}%` }} 
                            />
                          </div>
                          <span className="font-bold text-slate-300">{item.seoScore}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {item.updatedAt}
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={`/journeys/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TRAVEL THEMES */}
        {activeTab === 'THEMES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIBE8_THEMES.map(theme => (
              <div 
                key={theme.themeKey}
                className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{theme.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{theme.description}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-sky-400 rounded-lg text-[10px] font-mono font-bold">
                    {theme.themeKey}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Palette Colors:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                      <span className="text-[10px] font-mono text-slate-300">{theme.primaryColor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.surfaceColor }} />
                      <span className="text-[10px] font-mono text-slate-300">{theme.surfaceColor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                      <span className="text-[10px] font-mono text-slate-300">{theme.accentColor}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Font: {theme.fontFamily}</span>
                  <span className="text-emerald-400 font-bold">Active Theme</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: COMPONENT REGISTRY */}
        {activeTab === 'COMPONENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VIBE8_COMPONENTS.map(comp => (
              <div 
                key={comp.component_id}
                className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3 hover:border-sky-500/50 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-800/50 rounded-lg text-[10px] font-bold uppercase">
                      {comp.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">v{comp.version}</span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm">{comp.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{comp.variants.join(' · ')}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400">
                    Source: <span className="text-sky-400 font-semibold">{comp.data_source || 'STATIC'}</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Schema: {comp.seo_rules.emitSchema ? 'EMITTED' : 'NONE'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CREATE IN-PAGE (NO MODAL) */}
        {activeTab === 'CREATE_NEW' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-4xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white">Create Travel Content Item (In-Page Studio)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Directly author any of the 18 Travel Planet OS content types with multi-lingual tags and governed lifecycle verification.
              </p>
            </div>

            {creationSuccess && (
              <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Content Item successfully created in EDITOR_REVIEW queue! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleCreateContent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Content Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5-Day Silent Valley & Attappadi Tribal Storyteller Trail"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Content Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as TravelContentType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    {VIBE8_CONTENT_TYPES.map(t => (
                      <option key={t.type} value={t.type}>{t.displayName} ({t.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Destination Hub</label>
                  <input
                    type="text"
                    placeholder="e.g. Wayanad, Kerala or Udaipur, Rajasthan"
                    value={newDestination}
                    onChange={e => setNewDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Language</label>
                  <div className="flex items-center gap-2">
                    {(['en', 'ml', 'hi'] as const).map(lang => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => setNewLanguage(lang)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                          newLanguage === lang 
                            ? 'bg-sky-600 border-sky-500 text-white' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang === 'en' ? 'English (en-IN)' : lang === 'ml' ? 'Malayalam (മലയാളം)' : 'Hindi (हिन्दी)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Markdown Narrative & Highlights</label>
                <textarea
                  rows={6}
                  placeholder="Craft experiential itinerary details, day-by-day highlights, local secrets, and concierge notes..."
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('CONTENT_ITEMS')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish to Approval Pipeline</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
