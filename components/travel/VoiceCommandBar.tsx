'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Sparkles, AlertTriangle, ArrowRight, X, Volume2 } from 'lucide-react';

interface VoiceCommandBarProps {
  userRole?: string;
}

export function VoiceCommandBar({ userRole = 'CUSTOMER' }: VoiceCommandBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [resolution, setResolution] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('Click microphone and speak a command (en, ml, hi)');
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
          setStatusMessage('Listening... speak now');
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceInput(text);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setStatusMessage('Microphone error or permission denied. You can type below.');
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
      setStatusMessage('Voice recognition not supported in this browser. Please type below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setResolution(null);
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
      }
    }
  };

  const processVoiceInput = async (text: string) => {
    setStatusMessage('Resolving governed voice intent...');
    try {
      const res = await fetch('/api/v1/voice/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, userRole }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        setResolution(data);

        if (data.matched && !data.permissionDenied && !data.confirmationRequired && data.intent?.targetRoute) {
          setStatusMessage(`Routing to ${data.intent.actionTitle}...`);
          setTimeout(() => {
            setIsOpen(false);
            router.push(data.intent.targetRoute);
          }, 1200);
        } else if (data.permissionDenied) {
          setStatusMessage(data.message);
        } else if (data.confirmationRequired) {
          setStatusMessage('High-Risk Operation detected. Confirmation required.');
        } else {
          setStatusMessage(data.message);
        }
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleExecuteConfirmed = () => {
    if (resolution?.intent?.targetRoute) {
      setIsOpen(false);
      router.push(resolution.intent.targetRoute);
    }
  };

  return (
    <>
      {/* Microphone Trigger Button for Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 transition-all text-xs font-semibold"
        title="Voice Navigation & Operations (§19)"
      >
        <Mic className="w-3.5 h-3.5 text-sky-600" />
        <span>Voice OS</span>
      </button>

      {/* Voice Command Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              VN8 / VO8 Voice Navigation & Operations
            </div>
            <h3 className="text-xl font-bold text-white">Voice Command Center</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports English, Malayalam, and Hindi. Governed by the Function Registry.
            </p>

            {/* Visualizer & Mic Button */}
            <div className="my-8 flex flex-col items-center justify-center">
              <button
                onClick={toggleListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-600 shadow-lg shadow-rose-500/50 scale-110 animate-pulse'
                    : 'bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-500/30'
                }`}
              >
                {isListening ? (
                  <Mic className="w-8 h-8 text-white animate-bounce" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>

              <p className="mt-4 text-sm font-medium text-slate-300 text-center">
                {statusMessage}
              </p>

              {transcript && (
                <div className="mt-3 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
                  "{transcript}"
                </div>
              )}
            </div>

            {/* Intent Resolution Feedback */}
            {resolution?.matched && (
              <div
                className={`p-4 rounded-2xl border text-xs mb-4 ${
                  resolution.permissionDenied
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : resolution.confirmationRequired
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {resolution.permissionDenied ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  ) : resolution.confirmationRequired ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  ) : (
                    <Volume2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-bold mb-0.5">
                      {resolution.intent?.actionTitle}
                    </strong>
                    <span>{resolution.message}</span>
                  </div>
                </div>

                {/* Consequential Action Confirmation Gate (§19) */}
                {resolution.confirmationRequired && (
                  <div className="mt-3 pt-3 border-t border-amber-500/30 flex justify-end gap-2">
                    <button
                      onClick={() => setResolution(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteConfirmed}
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                    >
                      Confirm Consequential Execution
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Text Input Fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (transcript) processVoiceInput(transcript);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Or type: 'open circles', 'plan my trip', 'open leads'..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                Run
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
