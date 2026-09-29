'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { TOUR_REGISTRY, TourDefinition, TourStep } from '@/lib/help/tour-engine';

export const JoyrideWalkthrough: React.FC = () => {
  const [activeTour, setActiveTour] = useState<TourDefinition | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const startTour = (tourId: string = 'welcome-voyage8') => {
    const tour = TOUR_REGISTRY.find((t) => t.tourId === tourId) || TOUR_REGISTRY[0];
    setActiveTour(tour);
    setStepIndex(0);
    setIsOpen(true);
  };

  const currentStep: TourStep | undefined = activeTour?.steps[stepIndex];

  const handleNext = () => {
    if (!activeTour) return;
    if (stepIndex < activeTour.steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* Floating Tour Launch Button */}
      <button
        type="button"
        onClick={() => startTour('welcome-voyage8')}
        className="fixed bottom-6 left-6 z-40 bg-slate-900 hover:bg-sky-600 text-white p-3 rounded-full shadow-2xl transition duration-300 flex items-center gap-2 border border-slate-700/50 group"
        title="Start Guided Tour / Help"
        data-tour="help-center"
      >
        <HelpCircle className="w-5 h-5 text-sky-400 group-hover:rotate-12 transition" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">Guided Tour</span>
      </button>

      {/* Interactive Tour Modal */}
      {isOpen && currentStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative overflow-hidden animate-in zoom-in-95">
            {/* Header badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  Step {stepIndex + 1} of {activeTour?.steps.length}
                </span>
                <span className="text-xs font-bold text-slate-400">{activeTour?.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Content */}
            <div className="my-5">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">{currentStep.title}</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {currentStep.content}
              </p>
              {currentStep.target !== 'body' && (
                <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-mono text-slate-500 font-bold">
                  Target selector: {currentStep.target}
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={stepIndex === 0}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1">
                {activeTour?.steps.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === stepIndex ? 'w-5 bg-sky-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center gap-1.5"
              >
                {stepIndex === activeTour!.steps.length - 1 ? (
                  <>
                    <span>Finish Tour</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
