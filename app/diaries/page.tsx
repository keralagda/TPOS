'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  BookOpen, Calendar, MapPin, User, Heart, 
  MessageSquare, ArrowRight, Image as ImageIcon, Sparkles, Plus 
} from 'lucide-react';
import Link from 'next/link';

interface DiaryItem {
  id: string;
  slug: string;
  title: string;
  author: string;
  destination: string;
  date: string;
  likesCount: number;
  commentsCount: number;
  excerpt: string;
  photosCount: number;
}

export default function DiariesHubPage() {
  const [search, setSearch] = useState('');

  const diaries: DiaryItem[] = [
    {
      id: 'DIR-01',
      slug: 'dubai-golden-memories-rahul',
      title: 'Dunes, Skydive & Skyline: Our 5 Days in Dubai',
      author: 'Rahul & Priya Sharma',
      destination: 'Dubai, UAE',
      date: 'September 2026',
      likesCount: 142,
      commentsCount: 28,
      excerpt: 'The sunset desert dinner under desert stars was unforgettable. Here is what we packed and what hotels had best views of the Palm.',
      photosCount: 24,
    },
    {
      id: 'DIR-02',
      slug: 'bali-waterfall-trail-arjun',
      title: 'Chasing Secret Waterfalls Across Northern Bali',
      author: 'Arjun Mehta',
      destination: 'Bali, Indonesia',
      date: 'August 2026',
      likesCount: 98,
      commentsCount: 14,
      excerpt: 'Renting a scooter from Ubud to Sekumpul waterfall: early morning fog, jungle canopy and lush green terraces.',
      photosCount: 18,
    },
    {
      id: 'DIR-03',
      slug: 'monsoon-munnar-tea-valleys',
      title: 'Monsoon in Munnar: Walking Through Mist and Cardamom',
      author: 'Sunita Rao',
      destination: 'Munnar, Kerala',
      date: 'July 2026',
      likesCount: 176,
      commentsCount: 35,
      excerpt: 'Waking up to the aroma of tea leaves and raindrops on cottage windows. A peaceful escape into nature.',
      photosCount: 32,
    },
  ];

  return (
    <InternalLayout
      headerTitle="Travel Diaries & Memories"
      headerSubtitle="Real Traveler Stories • Social8 Travel Graph"
      actions={
        <button
          onClick={() => alert('New Diary Creator modal opening...')}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Write Diary</span>
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {diaries.map((d) => (
            <div
              key={d.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-purple-500/50 transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{d.destination}</span>
                  </span>
                  <span>{d.date}</span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition tracking-tight">
                    {d.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>By {d.author}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {d.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
                    <span>{d.likesCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{d.photosCount} Photos</span>
                  </span>
                </div>

                <Link
                  href={`/diaries/${d.slug}`}
                  className="text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}
