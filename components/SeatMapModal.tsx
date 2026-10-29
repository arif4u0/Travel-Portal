'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Lock, Users, Clock, AlertTriangle, Shield, Sparkles, Info } from 'lucide-react';
import { Flight } from '@/lib/mock-data';
import { AircraftLayout, AircraftSeat, generateAircraftSeatMap, SeatStatus } from '@/lib/seat-map';
import { Currency, convertCurrency, formatPrice } from '@/lib/travel-engine';

interface SeatMapModalProps {
  flight: Flight;
  paxCount: number;
  currency: Currency;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSeats: (selectedSeats: string[], totalSeatFeeSAR: number) => void;
}

export const SeatMapModal: React.FC<SeatMapModalProps> = ({
  flight,
  paxCount,
  currency,
  isOpen,
  onClose,
  onConfirmSeats,
}) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60); // 15 mins lock timer

  // Generate aircraft layout deterministically with useMemo
  const layout = React.useMemo(() => {
    return generateAircraftSeatMap(flight.aircraft, 45);
  }, [flight.aircraft]);

  // Countdown timer for seat hold
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !layout) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timerFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const toggleSeat = (seat: AircraftSeat) => {
    if (seat.status === 'occupied' || seat.status === 'blocked') return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= paxCount) {
        // Replace or inform
        setSelectedSeatIds((prev) => [...prev.slice(1), seat.id]);
      } else {
        setSelectedSeatIds((prev) => [...prev, seat.id]);
      }
    }
  };

  // Calculate total seat supplement
  let totalSeatFeeSAR = 0;
  layout.rows.forEach((row) => {
    row.seats.forEach((st) => {
      if (st && selectedSeatIds.includes(st.id)) {
        totalSeatFeeSAR += st.priceSAR;
      }
    });
  });

  const totalFeeConverted = convertCurrency(totalSeatFeeSAR, 'SAR', currency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              {flight.airlineCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Live Aircraft Seat Map: {flight.flightNumber} ({flight.aircraft})
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  GDS NDC Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {flight.origin.city} ({flight.origin.code}) ➔ {flight.destination.city} ({flight.destination.code}) • Selecting seats for {paxCount} {paxCount === 1 ? 'Passenger' : 'Passengers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 15m Lock Timer Badge */}
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Seat Lock: {timerFormatted}</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Seat Map"
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend and cabin filters */}
        <div className="bg-slate-950/60 px-6 py-2.5 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-500 font-semibold text-[11px]">Legend:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-400"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-500 border border-amber-300"></div>
              <span className="font-semibold text-amber-300">Your Selection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-blue-600/60 border border-blue-400/40"></div>
              <span>Group Held Block</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-slate-700 opacity-60"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-purple-900 border border-purple-500"></div>
              <span>Extra Legroom / Exit</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 mr-2">Selected:</span>
            <span className="font-bold text-amber-400 font-mono">
              {selectedSeatIds.length} / {paxCount} Seats
            </span>
          </div>
        </div>

        {/* Interactive Cabin Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50 flex flex-col items-center">
          {/* Airplane Fuselage Outline */}
          <div className="w-full max-w-xl bg-slate-950 border-2 border-slate-800 rounded-[60px] p-6 shadow-inner relative">
            {/* Cockpit indicator */}
            <div className="text-center pb-4 mb-4 border-b border-slate-800">
              <div className="inline-block px-4 py-1 rounded-full bg-slate-800/80 text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
                Cockpit / Front of Aircraft
              </div>
            </div>

            {/* Seat Grid Rows */}
            <div className="space-y-2">
              {layout.rows.map((row) => (
                <div key={row.rowNumber} className="relative">
                  {/* Exit Row Indicator */}
                  {row.isExitRow && (
                    <div className="text-center my-1.5">
                      <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✈ Emergency Exit Row (Extra Legroom)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {/* Row Number Left */}
                    <span className="w-5 text-right text-[11px] font-mono text-slate-500 font-semibold">
                      {row.rowNumber}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-1">
                      {row.seats.map((seat, seatIdx) => {
                        if (seat === null) {
                          // Aisle
                          return <div key={`aisle-${seatIdx}`} className="w-4 sm:w-6" />;
                        }

                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isAvailable = seat.status === 'available' || seat.status === 'group_hold';
                        const isGroupHold = seat.status === 'group_hold';

                        let seatBg = 'bg-slate-700/60 text-slate-500 cursor-not-allowed';
                        if (isSelected) {
                          seatBg = 'bg-amber-500 text-slate-950 border-2 border-amber-300 shadow-md scale-105 font-bold';
                        } else if (seat.status === 'available') {
                          if (seat.isExitRow) {
                            seatBg = 'bg-purple-900 hover:bg-purple-800 text-purple-200 border border-purple-600 cursor-pointer';
                          } else if (seat.cabin === 'business' || seat.cabin === 'first') {
                            seatBg = 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-600 cursor-pointer';
                          } else {
                            seatBg = 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600 cursor-pointer';
                          }
                        } else if (isGroupHold) {
                          seatBg = 'bg-blue-900/70 hover:bg-blue-800 text-blue-200 border border-blue-500 cursor-pointer';
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                            onClick={() => toggleSeat(seat)}
                            title={`${seat.id} (${seat.cabin.toUpperCase()}) - ${
                              seat.status === 'occupied'
                                ? 'Occupied'
                                : seat.priceSAR > 0
                                ? `+${formatPrice(convertCurrency(seat.priceSAR, 'SAR', currency), currency)}`
                                : 'Complimentary'
                            }`}
                            aria-label={`Seat ${seat.id}`}
                            className={`w-7 h-8 sm:w-8 sm:h-9 rounded-md text-[10px] font-mono flex flex-col items-center justify-center transition-all ${seatBg}`}
                          >
                            <span>{seat.letter}</span>
                            {seat.priceSAR > 0 && !isSelected && (
                              <span className="text-[8px] opacity-75 font-sans leading-none">
                                +{seat.priceSAR}
                              </span>
                            )}
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Row Number Right */}
                    <span className="w-5 text-left text-[11px] font-mono text-slate-500 font-semibold">
                      {row.rowNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Galley & Restrooms */}
            <div className="text-center pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-500">
              Aft Galley & Lavatories
            </div>
          </div>
        </div>

        {/* Modal Footer with summary & confirm */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Selected Seats:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedSeatIds.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">None selected (Auto-assigned at check-in)</span>
                ) : (
                  selectedSeatIds.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-mono font-bold"
                    >
                      {id}
                    </span>
                  ))
                )}
              </div>
            </div>

            {totalSeatFeeSAR > 0 && (
              <div className="border-l border-slate-800 pl-4">
                <span className="text-xs text-slate-400 block">Seat Supplement:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  +{formatPrice(totalFeeConverted, currency)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmSeats(selectedSeatIds, totalSeatFeeSAR);
                onClose();
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              Confirm {selectedSeatIds.length} Seats & Lock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
