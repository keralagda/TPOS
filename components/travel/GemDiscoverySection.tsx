import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export interface GemDiscoveryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  classification: string;
  confidenceScore: number;
  bestTimeToVisit?: string;
  tags: string[];
  images: string[];
  provenanceEntries?: {
    sourceType: string;
    evidenceNote: string;
    confidence: number;
  }[];
}

interface GemDiscoveryProps {
  iconicPlaceName?: string;
  gems?: GemDiscoveryItem[];
}

export function GemDiscoverySection({ iconicPlaceName, gems = [] }: GemDiscoveryProps) {
  // Default fallback showcase gems if not yet loaded from DB
  const displayGems = gems.length > 0 ? gems : [
    {
      id: 'gem-1',
      name: 'Al Fahidi Traditional Windtower Quarter & Coffee Museum',
      slug: 'al-fahidi-windtower-quarter',
      description: 'Step behind Dubai’s ultra-modern skyline into quiet sand-colored alleyways, artisan perfumeries, and historic coffee roasting courtyards.',
      classification: 'LOCAL_FAVOURITE',
      confidenceScore: 0.94,
      bestTimeToVisit: 'November to March, early morning',
      tags: ['Heritage', 'Artisan Coffee', 'Architecture'],
      images: ['https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80'],
      provenanceEntries: [
        { sourceType: 'OFFICIAL_TOURISM', evidenceNote: 'Verified by Dubai Heritage & Tourism Authority archive', confidence: 0.95 }
      ]
    },
    {
      id: 'gem-2',
      name: 'Sidemen Secret Rice Terraces & River Caves',
      slug: 'sidemen-secret-terraces',
      description: 'An untouched alternative to crowded Ubud. Walk through misty bamboo bridges and organic clove plantations along Mount Agung’s slopes.',
      classification: 'OFFBEAT',
      confidenceScore: 0.91,
      bestTimeToVisit: 'April to October',
      tags: ['Trekking', 'Eco-Retreat', 'Scenic'],
      images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'],
      provenanceEntries: [
        { sourceType: 'LOCAL_CONTRIBUTOR', evidenceNote: 'Field research verified by Karangasem Eco-Guides', confidence: 0.92 }
      ]
    },
    {
      id: 'gem-3',
      name: 'Pulau Ubin Chek Jawa Coastal Wetlands',
      slug: 'pulau-ubin-chek-jawa',
      description: 'Travel back to 1960s Singapore. Hop on a wooden bumboat to cycle through granite quarries and explore rich intertidal mangroves.',
      classification: 'EMERGING',
      confidenceScore: 0.89,
      bestTimeToVisit: 'Year-round, low tide',
      tags: ['Nature', 'Cycling', 'Biodiversity'],
      images: ['https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80'],
      provenanceEntries: [
        { sourceType: 'EDITORIAL_RESEARCH', evidenceNote: 'Verified through National Parks Board field audits', confidence: 0.9 }
      ]
    }
  ];

  return (
    <section className="my-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            GEM8 Discovery Engine (§17)
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {iconicPlaceName ? `Beyond ${iconicPlaceName}: Local Gems` : 'Beyond The Icon: Hidden & Offbeat Places'}
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-1 max-w-2xl">
            Lesser-known, authentic discoveries paired with iconic landmarks. Every gem carries verified provenance and local evidence.
          </p>
        </div>
        <Link 
          href="/destinations"
          className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Explore All Destinations
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayGems.map((gem) => {
          const provenance = gem.provenanceEntries?.[0];
          return (
            <div 
              key={gem.id}
              className="group relative bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                <img 
                  src={gem.images[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
                  alt={gem.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Classification Tag */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-xs font-semibold text-emerald-300">
                  {gem.classification.replace('_', ' ')}
                </div>

                {/* Confidence Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/40 text-[11px] font-medium text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  {Math.round(gem.confidenceScore * 100)}% verified
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {gem.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {gem.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {gem.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Provenance Footer */}
                  {provenance && (
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong className="text-slate-300">{provenance.sourceType.replace('_', ' ')}:</strong> {provenance.evidenceNote}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
