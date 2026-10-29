'use client';

import React, { useState } from 'react';
import { Plane, Clock, Shield, Sparkles, Check, ChevronDown, ChevronUp, AlertCircle, Luggage, Coffee, Droplets, MapPin, Users } from 'lucide-react';
import { Flight, FlightCabinOption } from '@/lib/mock-data';
import { Currency, convertCurrency, formatPrice, getGroupTier } from '@/lib/travel-engine';

interface FlightResultsListProps {
  flights: Flight[];
  paxCount: number;
  currency: Currency;
  markupPercent: number;
  portalMode?: 'B2C' | 'B2B';
  onOpenSeatMap: (flight: Flight) => void;
  onHoldOrBook: (flight: Flight, cabin: FlightCabinOption, isGroupHold: boolean) => void;
}

export const FlightResultsList: React.FC<FlightResultsListProps> = ({
  flights,
  paxCount,
  currency,
  markupPercent,
  portalMode = 'B2C',
  onOpenSeatMap,
  onHoldOrBook,
}) => {
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(flights[0]?.id || null);
  const groupTier = getGroupTier(paxCount);

  if (flights.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
        <Plane className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No direct scheduled flights found</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Try expanding your search parameters or check our contracted Group Block Allotments tab for guaranteed group seats on this sector.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => {
        const isExpanded = expandedFlightId === flight.id;
        const lowestFareCabin = flight.cabins[0];

        // Calculate lowest fare with markup and group discount
        const discountMultiplier = 1 - groupTier.discountPercentage / 100;
        const discountedBase = Math.round(lowestFareCabin.baseFareSAR * discountMultiplier);
        const netTotalPerPax = discountedBase + lowestFareCabin.taxesSAR;
        const retailTotalPerPax = Math.round(netTotalPerPax * (1 + markupPercent / 100));
        const retailFormatted = formatPrice(convertCurrency(retailTotalPerPax, 'SAR', currency), currency);

        // Real-time seat inventory summary
        const totalAvailSeats = flight.cabins.reduce((acc, c) => acc + c.availableSeats, 0);

        return (
          <div
            key={flight.id}
            className={`bg-slate-900 border rounded-2xl transition-all shadow-xl overflow-hidden ${
              flight.isUmrahSpecialRoute
                ? 'border-amber-500/30 hover:border-amber-500/60'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Top Bar for Flight Card */}
            <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Airline & Aircraft details */}
              <div className="flex items-center gap-4 min-w-[220px]">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border shadow-md ${flight.logoColor}`}
                >
                  {flight.airlineCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{flight.airline}</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {flight.flightNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{flight.aircraft}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Direct Flight
                    </span>
                  </div>
                </div>
              </div>

              {/* Flight Timeline */}
              <div className="flex-1 max-w-xl">
                <div className="flex items-center justify-between gap-4">
                  {/* Origin */}
                  <div className="text-left">
                    <div className="text-xl font-black text-white font-mono">{flight.departureTime}</div>
                    <div className="text-xs font-bold text-amber-400">{flight.origin.code}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[120px]">{flight.origin.city}</div>
                  </div>

                  {/* Flight Duration Bar */}
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <span className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {flight.duration}
                    </span>
                    <div className="w-full flex items-center gap-1">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20 relative">
                        <Plane className="w-3.5 h-3.5 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium mt-1">Non-stop Scheduled</span>
                  </div>

                  {/* Destination */}
                  <div className="text-right">
                    <div className="text-xl font-black text-white font-mono">{flight.arrivalTime}</div>
                    <div className="text-xs font-bold text-emerald-400">{flight.destination.code}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[120px]">{flight.destination.city}</div>
                  </div>
                </div>
              </div>

              {/* Price, Live Seat Count & Action */}
              <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                {/* Live Real-Time Availability Indicator */}
                <div className="text-left lg:text-right">
                  <div className="flex items-center gap-1.5 lg:justify-end">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {totalAvailSeats} Live Seats
                    </span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">
                    {retailFormatted}
                    <span className="text-[11px] font-normal text-slate-400 ml-1">/pax</span>
                  </div>
                  {portalMode === 'B2B' && markupPercent > 0 ? (
                    <span className="text-[10px] text-amber-400 block">
                      Includes +{markupPercent}% Agency Markup
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 block font-medium">
                      All Airport Taxes &amp; Fees Included
                    </span>
                  )}
                </div>

                {/* Expand / View Cabins Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSeatMap(flight)}
                    className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition"
                  >
                    <span>Seat Map</span>
                  </button>

                  <button
                    onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95"
                  >
                    <span>{isExpanded ? 'Hide Cabins' : 'Select Cabin'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Umrah Special Feature Ribbon */}
            {flight.isUmrahSpecialRoute && (
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/70 px-5 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Official Umrah Pilgrim Route:</span>
                  <span className="text-slate-300">
                    Includes 5L sealed Zamzam water container allowance & Fast-Track Terminal Gate support
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-medium">
                    Saudi Tasheer & Nusuk Compatible
                  </span>
                </div>
              </div>
            )}

            {/* Expandable Cabin Options Grid */}
            {isExpanded && (
              <div className="p-5 bg-slate-950/70 border-t border-slate-800">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    Available Cabin Classes & Group Quotas
                  </h4>
                  <button
                    onClick={() => onOpenSeatMap(flight)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <span>View Interactive Aircraft Layout</span> ➔
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {flight.cabins.map((cabin) => {
                    const discountedBaseFare = Math.round(cabin.baseFareSAR * discountMultiplier);
                    const netPerPax = discountedBaseFare + cabin.taxesSAR;
                    const retailPerPax = Math.round(netPerPax * (1 + markupPercent / 100));
                    const priceDisplay = formatPrice(convertCurrency(retailPerPax, 'SAR', currency), currency);

                    const isLow = cabin.availableSeats <= 5;

                    return (
                      <div
                        key={cabin.cabinClass}
                        className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                          cabin.cabinClass === 'Umrah Special'
                            ? 'border-emerald-500/50 bg-emerald-950/20'
                            : cabin.cabinClass === 'Business Class'
                            ? 'border-amber-500/40 bg-amber-950/10'
                            : 'border-slate-800'
                        }`}
                      >
                        <div>
                          {/* Cabin Header */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-white">{cabin.cabinClass}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isLow
                                  ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {cabin.availableSeats} seats left
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mb-3">
                            <div className="text-xl font-black text-amber-400 font-mono">
                              {priceDisplay}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Base + Taxes included
                            </span>
                          </div>

                          {/* Features list */}
                          <ul className="text-xs text-slate-400 space-y-1.5 mb-4">
                            <li className="flex items-center gap-1.5">
                              <Luggage className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{cabin.baggageAllowance}</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Coffee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{cabin.mealIncluded ? 'Complimentary Meal' : 'Buy Onboard'}</span>
                            </li>
                            {cabin.zamzamIncluded && (
                              <li className="flex items-center gap-1.5 text-emerald-300 font-medium">
                                <Droplets className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Free 5L Zamzam certified box</span>
                              </li>
                            )}
                            <li className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Shield className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{cabin.cancellationPolicy}</span>
                            </li>
                          </ul>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          {paxCount >= 10 && (
                            <button
                              onClick={() => onHoldOrBook(flight, cabin, true)}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold py-2 rounded-lg transition active:scale-95"
                            >
                              Hold Group Block ({groupTier.depositRequiredPct}% Dep)
                            </button>
                          )}
                          <button
                            onClick={() => onHoldOrBook(flight, cabin, false)}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-2 rounded-lg transition active:scale-95"
                          >
                            {paxCount >= 10 ? `Book Group (${paxCount} Pax)` : 'Instant Book & Issue'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
