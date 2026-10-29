'use client';

import React, { useState } from 'react';
import { Search, ArrowRightLeft, Users, Calendar, Sparkles, Check, ChevronDown, MapPin, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { AIRPORTS, Airport } from '@/lib/mock-data';
import { getGroupTier } from '@/lib/travel-engine';

export interface SearchFilters {
  origin: string;
  destination: string;
  tripType: 'one-way' | 'round-trip' | 'group-block';
  departureDate: string;
  returnDate: string;
  paxCount: number;
  cabinClass: 'All' | 'Economy Saver' | 'Economy Flex' | 'Umrah Special' | 'Business Class';
  isUmrahSpecialOnly: boolean;
  directOnly: boolean;
}

interface FlightSearchBoxProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: () => void;
}

export const FlightSearchBox: React.FC<FlightSearchBoxProps> = ({
  filters,
  setFilters,
  onSearch,
}) => {
  const groupTier = getGroupTier(filters.paxCount);

  const handleSwapAirports = () => {
    setFilters((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  const handleQuickRoute = (orig: string, dest: string, isUmrah: boolean = false) => {
    setFilters((prev) => ({
      ...prev,
      origin: orig,
      destination: dest,
      isUmrahSpecialOnly: isUmrah ? true : prev.isUmrahSpecialOnly,
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trip Type Tabs & Umrah Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, tripType: 'round-trip' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filters.tripType === 'round-trip'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Round Trip
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, tripType: 'one-way' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filters.tripType === 'one-way'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            One Way
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, tripType: 'group-block', paxCount: Math.max(prev.paxCount, 15) }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filters.tripType === 'group-block'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-amber-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Group Block Allotment (10-300+ Pax)
          </button>
        </div>

        {/* Umrah Special Feature Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition">
          <input
            type="checkbox"
            checked={filters.isUmrahSpecialOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, isUmrahSpecialOnly: e.target.checked }))}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Umrah Fares Only (Includes 5L Zamzam & Visa Support)
          </span>
        </label>
      </div>

      {/* Main Search Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        {/* Origin */}
        <div className="md:col-span-3 relative">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <PlaneTakeoff className="w-3.5 h-3.5 text-amber-400" /> From (Origin)
          </label>
          <select
            value={filters.origin}
            onChange={(e) => setFilters((prev) => ({ ...prev, origin: e.target.value }))}
            aria-label="Departure Airport"
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-amber-400 transition"
          >
            {AIRPORTS.map((apt) => (
              <option key={apt.code} value={apt.code} className="bg-slate-900 text-white">
                {apt.flag} {apt.city} ({apt.code}) - {apt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div className="hidden md:flex md:col-span-1 items-end justify-center pb-2">
          <button
            onClick={handleSwapAirports}
            title="Swap Origin and Destination"
            aria-label="Swap Origin and Destination"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 flex items-center justify-center transition active:rotate-180"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Destination */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <PlaneLanding className="w-3.5 h-3.5 text-emerald-400" /> To (Destination)
          </label>
          <select
            value={filters.destination}
            onChange={(e) => setFilters((prev) => ({ ...prev, destination: e.target.value }))}
            aria-label="Arrival Airport"
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-amber-400 transition"
          >
            {AIRPORTS.map((apt) => (
              <option key={apt.code} value={apt.code} className="bg-slate-900 text-white">
                {apt.flag} {apt.city} ({apt.code}) - {apt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Departure
            </label>
            <input
              type="date"
              value={filters.departureDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, departureDate: e.target.value }))}
              aria-label="Departure Date"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Return
            </label>
            <input
              type="date"
              disabled={filters.tripType === 'one-way'}
              value={filters.returnDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, returnDate: e.target.value }))}
              aria-label="Return Date"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Passengers & Group Tier */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Passengers
            </span>
            {groupTier.discountPercentage > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-1.5 rounded">
                -{groupTier.discountPercentage}%
              </span>
            )}
          </label>
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5">
            <input
              type="number"
              min="1"
              max="350"
              value={filters.paxCount}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setFilters((prev) => ({ ...prev, paxCount: val }));
              }}
              aria-label="Number of Passengers"
              className="w-16 bg-transparent text-white font-bold text-sm text-center focus:outline-none"
            />
            <span className="text-xs text-slate-400">Pax</span>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, paxCount: Math.max(1, prev.paxCount - 1) }))}
                aria-label="Decrease Passengers"
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, paxCount: prev.paxCount + 1 }))}
                aria-label="Increase Passengers"
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Tier & Filter Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        {/* Quick Route Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Popular Gulf Corridors:</span>
          <button
            type="button"
            onClick={() => handleQuickRoute('DXB', 'JED', true)}
            className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition"
          >
            DXB ➔ JED (Umrah)
          </button>
          <button
            type="button"
            onClick={() => handleQuickRoute('DXB', 'MED', true)}
            className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition"
          >
            DXB ➔ MED (Madinah Direct)
          </button>
          <button
            type="button"
            onClick={() => handleQuickRoute('RUH', 'JED')}
            className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition"
          >
            RUH ➔ JED (Domestic)
          </button>
          <button
            type="button"
            onClick={() => handleQuickRoute('LHR', 'DXB')}
            className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition"
          >
            LHR ➔ DXB (Europe Trunk)
          </button>
        </div>

        {/* Group Tier Status Notice & Submit Search Button */}
        <div className="flex items-center gap-3">
          {filters.paxCount >= 10 && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong>{groupTier.tierName}</strong>: {groupTier.depositRequiredPct}% deposit to lock PNR
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer text-sm"
          >
            <Search className="w-4 h-4" />
            Search Flights & Allotments
          </button>
        </div>
      </div>
    </div>
  );
};
