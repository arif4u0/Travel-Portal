'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronRight, X, Bell, Shield, Sparkles } from 'lucide-react';
import { LIVE_INDUSTRY_ALERTS } from '@/lib/mock-data';

export const LiveAlertTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const currentAlert = LIVE_INDUSTRY_ALERTS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % LIVE_INDUSTRY_ALERTS.length);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/20 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shrink-0">
            <Bell className="w-3 h-3 text-amber-400 animate-pulse" />
            Live Circular
          </span>
          <span className="font-semibold text-white shrink-0">[{currentAlert.badge}]</span>
          <span className="text-amber-200 font-medium truncate">{currentAlert.title}:</span>
          <span className="text-slate-300 hidden md:inline truncate">{currentAlert.message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {currentAlert.timestamp} ({currentIndex + 1}/{LIVE_INDUSTRY_ALERTS.length})
          </span>
          <button
            onClick={handleNext}
            aria-label="Next circular alert"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss alert ticker"
            className="text-slate-400 hover:text-slate-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
