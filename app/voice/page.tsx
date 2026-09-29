'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Mic, MicOff, Sparkles, AlertTriangle, ArrowRight, 
  Volume2, ShieldCheck, CheckCircle2, History, Radio, Terminal 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VoiceConsolePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'VN8' | 'VO8' | 'HISTORY'>('VN8');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [resolution, setResolution] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('Click "Start Voice Recognition" and speak in English, Malayalam, or Hindi.');
  const [history, setHistory] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage('Listening... speak now in English, Malayalam, or Hindi.');
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceInput(text);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setStatusMessage('Microphone access unavailable. You can type in the prompt bar below.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setStatusMessage('Voice recognition is not natively supported in this browser. Please type below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setResolution(null);
      recognitionRef.current.start();
    }
  };

  const processVoiceInput = async (spokenText: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/voice/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText,
          userRole: 'SUPER_ADMIN',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResolution(data.data);
        setStatusMessage(data.data.message);
        setHistory((prev) => [
          {
            id: Date.now(),
            transcript: spokenText,
            timestamp: new Date().toLocaleTimeString(),
            resolution: data.data,
            aiEnhanced: data.aiEnhanced,
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      setStatusMessage(`Resolution error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecute = () => {
    if (resolution?.intent?.targetRoute) {
      router.push(resolution.intent.targetRoute);
    }
  };

  return (
    <InternalLayout
      headerTitle="Voice AI Command Center"
      headerSubtitle="VN8 Navigation & VO8 Governed Operations (§19)"
      actions={
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> NVIDIA NIM Voice Engine
          </span>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('VN8')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'VN8' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Navigation (VN8)</span>
        </button>
        <button
          onClick={() => setActiveTab('VO8')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'VO8' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Governed Operations (VO8)</span>
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'HISTORY' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Transcript History ({history.length})</span>
        </button>
      </div>

      {/* Main Interactive Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Microphone & Input Studio */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                Audio Telemetry Input
              </span>
              <span className="text-xs text-slate-400">Supported: en-IN, ml-IN, hi-IN</span>
            </div>

            {/* Mic Pulse Button */}
            <div className="flex flex-col items-center justify-center py-8">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition duration-500 relative ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/20 shadow-rose-600/50'
                    : 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white hover:scale-105 shadow-sky-600/30'
                }`}
              >
                {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
              </button>

              <div className="mt-4 text-center">
                <div className="text-sm font-extrabold text-white">
                  {isListening ? 'Listening for speech...' : 'Microphone Ready'}
                </div>
                <p className="text-xs text-slate-400 mt-1">{statusMessage}</p>
              </div>
            </div>

            {/* Fallback Text Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (transcript.trim()) processVoiceInput(transcript);
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Or type voice command... (e.g. 'plan my trip to Switzerland')"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition"
              >
                {isProcessing ? 'Resolving...' : 'Process'}
              </button>
            </form>
          </div>

          {/* Preset Prompts */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Try governed commands:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTranscript('open circles');
                  processVoiceInput('open circles');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px]"
              >
                "open circles"
              </button>
              <button
                type="button"
                onClick={() => {
                  setTranscript('യാത്ര കമ്മ്യൂണിറ്റി');
                  processVoiceInput('യാത്ര കമ്മ്യൂണിറ്റി');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px]"
              >
                "യാത്ര കമ്മ്യൂണിറ്റി" (ML)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTranscript('लीड्स दिखाओ');
                  processVoiceInput('लीड्स दिखाओ');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px]"
              >
                "लीड्स दिखाओ" (HI)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTranscript('plan my honeymoon trip to Maldives');
                  processVoiceInput('plan my honeymoon trip to Maldives');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px]"
              >
                "honeymoon to Maldives" (NVIDIA NIM)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Resolution Payload & Execution Action */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">Resolved Intent Payload</span>
              {resolution?.aiEnhanced && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NVIDIA Enhanced
                </span>
              )}
            </div>

            {resolution ? (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Intent Key</div>
                  <div className="text-sm font-bold text-white font-mono">{resolution.intent?.intentKey}</div>

                  <div className="text-[10px] font-mono text-slate-500 uppercase pt-2">Action Title</div>
                  <div className="text-xs font-bold text-sky-400">{resolution.intent?.actionTitle}</div>

                  <div className="text-[10px] font-mono text-slate-500 uppercase pt-2">Target Route</div>
                  <div className="text-xs font-mono text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    {resolution.intent?.targetRoute || 'N/A'}
                  </div>
                </div>

                {resolution.confirmationRequired ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>Consequential Operation Gate: User confirmation required before execution.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>RBAC Validation Cleared for Current Operator Role</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Terminal className="w-8 h-8 mx-auto text-slate-600" />
                <div className="text-xs font-bold text-slate-400">No Intent Processed</div>
                <p className="text-[11px]">Speak or type a command to inspect resolution metadata.</p>
              </div>
            )}
          </div>

          {resolution && resolution.intent?.targetRoute && (
            <button
              type="button"
              onClick={handleExecute}
              className="mt-6 w-full py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
            >
              <span>Execute Voice Command & Navigate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </InternalLayout>
  );
}
