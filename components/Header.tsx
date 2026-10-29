'use client';

import React from 'react';
import { Plane, ShieldCheck, RefreshCw, DollarSign, Users, FileText, Globe, Clock, ChevronDown, CheckCircle2, Building2 } from 'lucide-react';
import { Currency, CURRENCY_RATES } from '@/lib/travel-engine';

export type PortalMode = 'B2C' | 'B2B';

interface HeaderProps {
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  currentTab: 'flights' | 'allotments' | 'visas' | 'pnrs' | 'manifest' | 'backoffice';
  setCurrentTab: (tab: 'flights' | 'allotments' | 'visas' | 'pnrs' | 'manifest' | 'backoffice') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  markupPercent: number;
  setMarkupPercent: (m: number) => void;
  activeHoldsCount: number;
  issuedPnrsCount: number;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  portalMode,
  setPortalMode,
  currentTab,
  setCurrentTab,
  currency,
  setCurrency,
  markupPercent,
  setMarkupPercent,
  activeHoldsCount,
  issuedPnrsCount,
  onRefreshData,
  isRefreshing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner / Ticker bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {portalMode === 'B2C'
              ? 'Guaranteed Live Airline Seats • Saudia • Emirates • flydubai • Flynas'
              : 'Direct NDC & GDS Live: Saudia • Emirates • flydubai • Flynas'}
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-amber-400 font-medium">
            IATA Reg: 24-81902 • KSA Umrah License: U-9941 • Dubai DTCM: 88120
          </span>
        </div>

        <div className="flex items-center gap-4">
          {portalMode === 'B2B' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Agent Credit:</span>
              <span className="text-emerald-400 font-bold font-mono">SAR 184,500</span>
              <span className="text-slate-500 text-[11px]">(Limit: 250k)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 Support Hotline:
              </span>
              <span className="font-mono text-amber-400">+971 4 800-RAWABI</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>KSA/UAE Time: 13:00 GMT+3</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Plane className="w-6 h-6 rotate-[-25deg] text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AL-RAWABI <span className="text-amber-400 font-light">TRAVEL & TOURS</span>
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  portalMode === 'B2C'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                }`}
              >
                {portalMode === 'B2C' ? 'Traveler Direct' : 'B2B Partner Portal'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {portalMode === 'B2C'
                ? 'Direct Flights, Umrah Packages & Dubai Visas'
                : 'Dubai & Saudi Arabia Group Ticketing & Visa Concierge'}
            </p>
          </div>
        </div>

        {/* Global Controls: B2C/B2B Switcher, Currency, Markup, Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Dual-Mode B2C ⇄ B2B Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => {
                setPortalMode('B2C');
                if (currentTab === 'allotments' || currentTab === 'manifest' || currentTab === 'backoffice') {
                  setCurrentTab('flights');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                portalMode === 'B2C'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👤</span>
              <span>Traveler (B2C)</span>
            </button>
            <button
              onClick={() => setPortalMode('B2B')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                portalMode === 'B2B'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Agent Desk (B2B)</span>
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <span className="text-slate-400 mr-2">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Select Portal Currency"
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              {(Object.keys(CURRENCY_RATES) as Currency[]).map((cur) => (
                <option key={cur} value={cur} className="bg-slate-900 text-white">
                  {cur} ({CURRENCY_RATES[cur].symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Agency Retail Markup Slider (Only in B2B Mode) */}
          {portalMode === 'B2B' && (
            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-3 py-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 mr-1" />
              <span className="text-slate-400 mr-2">Agent Markup:</span>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(Number(e.target.value))}
                className="w-16 accent-amber-500 cursor-pointer"
                title={`Agency Markup: ${markupPercent}%`}
              />
              <span className="ml-2 font-mono font-bold text-amber-400 w-8 text-right">
                +{markupPercent}%
              </span>
            </div>
          )}

          {/* Live GDS refresh button */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 disabled:opacity-50"
            title="Poll Live Airline GDS Inventories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh GDS</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setCurrentTab('flights')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentTab === 'flights'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>{portalMode === 'B2C' ? 'Book Flights & Umrah' : 'Flight & Group Search'}</span>
          </button>

          {portalMode === 'B2B' && (
            <button
              onClick={() => setCurrentTab('allotments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                currentTab === 'allotments'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Group Block Allotments</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/60 text-amber-300 border border-amber-400/20">
                4 Active
              </span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('visas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentTab === 'visas'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{portalMode === 'B2C' ? 'Apply Dubai & Saudi Visa' : 'Saudi & Dubai Visa Desk'}</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Instant Check
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('pnrs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentTab === 'pnrs'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{portalMode === 'B2C' ? 'My Bookings & E-Tickets' : 'Bookings & PNR Desk'}</span>
            {activeHoldsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-mono">
                {activeHoldsCount} Holds
              </span>
            )}
          </button>

          {portalMode === 'B2B' && (
            <>
              <button
                onClick={() => setCurrentTab('manifest')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  currentTab === 'manifest'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Passenger Roster &amp; Manifest</span>
              </button>

              <button
                onClick={() => setCurrentTab('backoffice')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  currentTab === 'backoffice'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Back-Office &amp; Financials</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/80 text-emerald-400 border border-emerald-500/30">
                  BSP Live
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
