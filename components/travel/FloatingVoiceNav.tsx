'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mic, MicOff, Sparkles, ArrowRight, X, Volume2, 
  Compass, Radio, Package, Lightbulb, MapPin, Send 
} from 'lucide-react';
import Link from 'next/link';

interface FloatingVoiceNavProps {
  userRole?: string;
}

export function FloatingVoiceNav({ userRole = 'CUSTOMER' }: FloatingVoiceNavProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedCommand, setTypedCommand] = useState('');
  const [statusMessage, setStatusMessage] = useState('Tap microphone and speak a destination or command');
  const [selectedLang, setSelectedLang] = useState<'en-IN' | 'hi-IN' | 'ml-IN'>('en-IN');
  const [isRouting, setIsRouting] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLang;

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage('Listening... speak your destination');
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceInput(text);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setStatusMessage('Microphone access paused. Tap mic to retry or type below.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLang]);

  const toggleListening = () => {
    if (!isOpen) {
      setIsOpen(true);
    }

    if (!recognitionRef.current) {
      setStatusMessage('Voice recognition not supported in this browser. Please type below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setStatusMessage('Listening... speak now');
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
      }
    }
  };

  const processVoiceInput = async (text: string) => {
    if (!text.trim()) return;
    setStatusMessage('Resolving voice destination...');
    try {
      const res = await fetch('/api/v1/voice/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, userRole }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        const data = json.data;
        if (data.matched && data.intent?.targetRoute) {
          setIsRouting(true);
          setStatusMessage(`Navigating to ${data.intent.actionTitle}...`);
          setTimeout(() => {
            setIsRouting(false);
            setIsOpen(false);
            router.push(data.intent.targetRoute);
          }, 900);
        } else {
          setStatusMessage(data.message || 'Destination not found. Try one of the quick shortcuts below.');
        }
      } else {
        // Fallback local keyword routing
        handleFallbackRouting(text);
      }
    } catch (err: any) {
      handleFallbackRouting(text);
    }
  };

  const handleFallbackRouting = (text: string) => {
    const lower = text.toLowerCase();
    let target = '/destinations';
    let label = 'Destinations';

    if (lower.includes('circle') || lower.includes('group') || lower.includes('social')) {
      target = '/circles';
      label = 'Travel Circles';
    } else if (lower.includes('package') || lower.includes('deal') || lower.includes('offer')) {
      target = '/packages';
      label = 'Packages';
    } else if (lower.includes('idea') || lower.includes('innovation')) {
      target = '/ideas';
      label = 'Innovation';
    } else if (lower.includes('help') || lower.includes('doc') || lower.includes('support')) {
      target = '/help';
      label = 'Help & Docs';
    } else if (lower.includes('trip') || lower.includes('booking')) {
      target = '/trips';
      label = 'My Trips';
    } else if (lower.includes('voice') || lower.includes('console')) {
      target = '/voice';
      label = 'Voice Console';
    }

    setIsRouting(true);
    setStatusMessage(`Navigating to ${label}...`);
    setTimeout(() => {
      setIsRouting(false);
      setIsOpen(false);
      router.push(target);
    }, 800);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    setTranscript(typedCommand);
    processVoiceInput(typedCommand);
    setTypedCommand('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Expanded Voice Nav Dock */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">Voice Navigation</span>
              <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800">
                VN8
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-semibold px-2 py-1 focus:outline-none"
                title="Select Voice Language"
              >
                <option value="en-IN">English (IN)</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="ml-IN">Malayalam (മലയാളം)</option>
              </select>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Visualizer / Status Area */}
          <div className="py-4 text-center space-y-3">
            {/* Mic Activation Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-rose-600/40 animate-pulse scale-110'
                    : 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white hover:scale-105 shadow-sky-600/30'
                }`}
                title={isListening ? 'Stop listening' : 'Start listening'}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>
            </div>

            {/* Audio Wave Bars when listening */}
            {isListening && (
              <div className="flex items-center justify-center gap-1 h-5 pt-1">
                {[40, 70, 95, 60, 85, 50, 90, 65, 30].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-sky-400 rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Live Transcript Display */}
            {transcript ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1">
                  You said:
                </span>
                <p className="font-semibold text-white italic">"{transcript}"</p>
              </div>
            ) : null}

            {/* Status Message */}
            <p className="text-xs text-slate-300 font-medium px-2">
              {statusMessage}
            </p>
          </div>

          {/* Quick Voice Shortcuts */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Shortcuts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Explore Destinations', route: '/destinations', icon: Compass },
                { label: 'Travel Circles', route: '/circles', icon: Radio },
                { label: 'Packages', route: '/packages', icon: Package },
                { label: 'Plan a Trip', route: '#ai-planner', icon: MapPin },
                { label: 'Voice Console', route: '/voice', icon: Volume2 },
              ].map((sc) => {
                const Icon = sc.icon;
                return (
                  <button
                    key={sc.label}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(sc.route);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition"
                  >
                    <Icon className="w-3 h-3 text-sky-400" />
                    <span>{sc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fallback Text Input */}
          <form onSubmit={handleTextSubmit} className="mt-3 flex items-center gap-1.5">
            <input
              type="text"
              value={typedCommand}
              onChange={(e) => setTypedCommand(e.target.value)}
              placeholder="Or type a destination..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition shrink-0"
              title="Send Command"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-2 text-center">
            <Link
              href="/voice"
              className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Open Full Voice OS Command Center</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Floating Circular Voice Toggle Button (Bottom-Right) */}
      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            toggleListening();
          } else {
            toggleListening();
          }
        }}
        className={`group relative flex items-center justify-center p-3.5 rounded-full shadow-2xl transition-all duration-300 border ${
          isListening
            ? 'bg-rose-600 text-white border-rose-400 shadow-rose-600/50 scale-105'
            : 'bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white border-sky-400/40 shadow-sky-600/30 hover:scale-105'
        }`}
        title="Voice Navigation (Click to speak & navigate)"
        aria-label="Voice Navigation Toggle"
      >
        {/* Pulsing indicator ring */}
        <span className={`absolute -inset-1 rounded-full opacity-75 blur-sm transition ${
          isListening ? 'bg-rose-500 animate-ping' : 'bg-sky-500/50 group-hover:opacity-100'
        }`} />

        <div className="relative flex items-center gap-2">
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white group-hover:scale-110 transition" />
          )}
          <span className="text-xs font-bold pr-1 hidden sm:inline text-white">
            {isListening ? 'Listening...' : 'Voice Nav'}
          </span>
        </div>
      </button>
    </div>
  );
}
