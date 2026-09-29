'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, MessageSquare, Compass, Sparkles, Send, 
  MapPin, Calendar, ArrowLeft, ShieldCheck, Heart 
} from 'lucide-react';

interface Discussion {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  likeCount: number;
  commentCount: number;
  intentDetected: boolean;
  createdAt: string;
  comments?: {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
  }[];
}

interface CircleDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  coverImage?: string;
  memberCount: number;
  rules?: string;
  discussions: Discussion[];
  trips: {
    id: string;
    title: string;
    status: string;
    confirmedCount: number;
    targetSize: number;
    startDate?: string;
  }[];
}

export default function CircleDetailPage({ params }: { params: { slug: string } }) {
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [activeTab, setActiveTab] = useState<'DISCUSSIONS' | 'TRIPS' | 'RULES'>('DISCUSSIONS');

  useEffect(() => {
    fetch(`/api/v1/social8/circles/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCircle(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle || !postTitle || !postContent) return;

    try {
      const res = await fetch('/api/v1/social8/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circleId: circle.id,
          authorId: 'current-user-id',
          title: postTitle,
          content: postContent,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCircle({
          ...circle,
          discussions: [data.data, ...circle.discussions],
        });
        setPostTitle('');
        setPostContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading Travel Circle...</span>
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-white">Circle Not Found</h1>
        <Link href="/circles" className="text-blue-400 hover:underline">
          Return to All Circles
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900 border-b border-slate-800">
        <img
          src={circle.coverImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'}
          alt={circle.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Link
            href="/circles"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Circles
          </Link>
        </div>

        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
              {circle.type.replace('_', ' ')}
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">{circle.name}</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl line-clamp-2">
              {circle.description}
            </p>
          </div>

          <button
            onClick={() => setIsMember(!isMember)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
              isMember
                ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
            }`}
          >
            {isMember ? 'Joined Circle ✓' : 'Join Circle'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('DISCUSSIONS')}
            className={`text-sm font-semibold pb-1 transition-all ${
              activeTab === 'DISCUSSIONS'
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Community Feed ({circle.discussions.length})
          </button>
          <button
            onClick={() => setActiveTab('TRIPS')}
            className={`text-sm font-semibold pb-1 transition-all ${
              activeTab === 'TRIPS'
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Group Trips ({circle.trips.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`text-sm font-semibold pb-1 transition-all ${
              activeTab === 'RULES'
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Circle Guidelines
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'DISCUSSIONS' && (
              <>
                {/* Post Input Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-3">Start a Travel Conversation</h3>
                  <form onSubmit={handleCreatePost} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title or question (e.g. Planning a weekend trip to Sidemen...)"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                      rows={2}
                      placeholder="Share recommendations, dates, ideas, or ask for local advice..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Mentioning travel dates automatically activates Journey Proposal detection (§16).
                      </span>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Post
                      </button>
                    </div>
                  </form>
                </div>

                {/* Discussions Feed */}
                <div className="space-y-4">
                  {circle.discussions.map((disc) => (
                    <div key={disc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-slate-400">Traveler</span>
                            <span className="text-xs text-slate-600">•</span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(disc.createdAt).toLocaleDateString()}
                            </span>
                            {disc.intentDetected && (
                              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3" />
                                Intent: Group Trip Forming
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white">{disc.title}</h4>
                          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{disc.content}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
                        <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                          <Heart className="w-4 h-4" />
                          {disc.likeCount} Likes
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          {disc.commentCount} Replies
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'TRIPS' && (
              <div className="space-y-4">
                {circle.trips.map((trip) => (
                  <div key={trip.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Status: {trip.status}
                      </div>
                      <h4 className="text-lg font-bold text-white">{trip.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Target group size: {trip.targetSize} travelers ({trip.confirmedCount} interested)
                      </p>
                    </div>

                    <Link
                      href="/trip-planner"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center"
                    >
                      View Proposed Itinerary
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'RULES' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-2">Community Code of Conduct</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {circle.rules || 'Be respectful, share honest travel experiences, respect local cultural sensitivities, and foster inclusive group exploration.'}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-white mb-3">Circle Details</h4>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <dt className="text-slate-400">Total Members</dt>
                  <dd className="text-white font-semibold">{circle.memberCount}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <dt className="text-slate-400">Classification</dt>
                  <dd className="text-blue-400 font-semibold">{circle.type}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-400">Verification</dt>
                  <dd className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Governed OS
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
