'use client';

import React, { useState } from 'react';
import { Users, Calendar, Clock, AlertTriangle, ShieldCheck, Plus, Split, FileText, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';
import { GroupAllotmentBlock } from '@/lib/mock-data';
import { Currency, convertCurrency, formatPrice, splitGroupPnr } from '@/lib/travel-engine';

interface GroupAllotmentsDeskProps {
  allotments: GroupAllotmentBlock[];
  currency: Currency;
  markupPercent: number;
  onRequestBookingFromBlock: (block: GroupAllotmentBlock) => void;
}

export const GroupAllotmentsDesk: React.FC<GroupAllotmentsDeskProps> = ({
  allotments,
  currency,
  markupPercent,
  onRequestBookingFromBlock,
}) => {
  // RFQ modal state
  const [isRfqOpen, setIsRfqOpen] = useState(false);
  const [rfqSector, setRfqSector] = useState('DXB-JED');
  const [rfqPax, setRfqPax] = useState(45);
  const [rfqSeason, setRfqSeason] = useState('Umrah Spring Season 2026');
  const [rfqSuccess, setRfqSuccess] = useState(false);

  // Split PNR simulation modal state
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitPnrCode, setSplitPnrCode] = useState('SV-GRP-9821');
  const [selectedSplitIndices, setSelectedSplitIndices] = useState<number[]>([2, 3]);
  const [splitResult, setSplitResult] = useState<string | null>(null);

  const samplePaxList = [
    'Tariq Al-Mansoor (Lead)',
    'Amina Al-Mansoor',
    'Farhan Siddiqui (Sub-Group B)',
    'Zainab Siddiqui (Sub-Group B)',
    'Bilal Khan',
    'Mohammed Rahman',
    'Rashid Hussain',
    'Fatima Hussain',
  ];

  const handleExecuteSplit = () => {
    try {
      const res = splitGroupPnr({
        originalPnr: splitPnrCode,
        allPassengers: samplePaxList,
        passengerIndicesToSplit: selectedSplitIndices,
      });
      setSplitResult(`Successfully split! Master PNR ${res.originalPnr} now holds ${res.remainingPaxCount} passengers. New Child PNR generated: ${res.newPnr} holding ${res.splitPaxCount} passengers (${res.splitPaxNames.join(', ')}).`);
    } catch (err: any) {
      setSplitResult(`Error: ${err.message}`);
    }
  };

  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSuccess(true);
    setTimeout(() => {
      setRfqSuccess(false);
      setIsRfqOpen(false);
    }, 2200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Contracted Group Allotments & Block Inventory
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Pre-purchased block allocations for Umrah seasons and Dubai corporate delegations. Lock group PNRs with staggered deposit milestones and protect inventory against airline general fare surges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsSplitModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
          >
            <Split className="w-4 h-4 text-amber-400" />
            PNR Splitting Tool
          </button>

          <button
            onClick={() => setIsRfqOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Request New Block Allotment (RFQ)
          </button>
        </div>
      </div>

      {/* Allotment Block Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {allotments.map((block) => {
          const totalFareNet = block.baseFareSAR + block.taxesSAR;
          const totalRetail = Math.round(totalFareNet * (1 + markupPercent / 100));
          const retailFormatted = formatPrice(convertCurrency(totalRetail, 'SAR', currency), currency);
          const percentUtilized = Math.round((block.allocatedSeats / block.totalSeatsContracted) * 100);

          return (
            <div
              key={block.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Block header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">
                        {block.blockCode}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{block.airline}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{block.seasonName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="text-slate-300 font-medium">{block.route}</span>
                      <span>• Flights: {block.flightNumbers}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      block.status === 'WARNING_DEADLINE_APPROACHING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {block.status === 'WARNING_DEADLINE_APPROACHING' ? 'Deadline Approaching' : 'Active Quota'}
                  </span>
                </div>

                {/* Progress bar of seats */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Inventory Status:</span>
                    <span className="text-white font-mono font-bold">
                      {block.allocatedSeats} / {block.totalSeatsContracted} Allocated ({percentUtilized}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentUtilized}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
                    <span className="text-emerald-400 font-bold">
                      {block.remainingSeats} Seats Available in Block
                    </span>
                    <span>Deposit Tier: {block.depositPaidPct}% Paid</span>
                  </div>
                </div>

                {/* Milestones & Deadlines */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Next Deposit Deadline</span>
                    <span className="font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> {block.nextPaymentDeadline}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Manifest Cutoff</span>
                    <span className="font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {block.ticketingCutoff}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Contracted Rate</span>
                  <div className="text-lg font-black text-white font-mono">
                    {retailFormatted}
                    <span className="text-xs font-normal text-slate-400 ml-1">/seat</span>
                  </div>
                </div>

                <button
                  onClick={() => onRequestBookingFromBlock(block)}
                  disabled={block.remainingSeats <= 0}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95 shadow"
                >
                  Allocate Seats to Group
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RFQ Request Modal */}
      {isRfqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Request Custom Airline Group Allotment (RFQ)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit your group requirements to our Gulf Airline Contracting desk (Saudia, Emirates, flydubai, Flynas).
            </p>

            {rfqSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-5 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">RFQ Submitted to Carrier Desk</h4>
                <p className="text-xs text-emerald-200 mt-1">
                  Reference # RFQ-GULF-2026-992. Our contracting team will return contracted fares within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRfqSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Route / Sector</label>
                  <select
                    value={rfqSector}
                    onChange={(e) => setRfqSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-medium"
                  >
                    <option value="DXB-JED">Dubai (DXB) ⇄ Jeddah (JED) - Umrah Special</option>
                    <option value="DXB-MED">Dubai (DXB) ⇄ Madinah (MED) - Direct Pilgrim</option>
                    <option value="LHR-JED">London (LHR) ⇄ Jeddah (JED) - European Pilgrims</option>
                    <option value="RUH-JED">Riyadh (RUH) ⇄ Jeddah (JED) - Domestic High Volume</option>
                    <option value="LHR-DXB">London (LHR) ⇄ Dubai (DXB) - Corporate GITEX</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Group Passenger Count</label>
                    <input
                      type="number"
                      min="10"
                      max="400"
                      value={rfqPax}
                      onChange={(e) => setRfqPax(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Travel Season</label>
                    <input
                      type="text"
                      value={rfqSeason}
                      onChange={(e) => setRfqSeason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                  <span className="text-amber-400 font-bold block mb-1">Group Contracting Terms:</span>
                  Initial deposit 20-25% required upon airline contract issuance. Manifest name changes allowed up to 72 hours prior to departure without fee.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRfqOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    Submit Allotment RFQ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PNR Splitting Tool Modal */}
      {isSplitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Split className="w-4 h-4 text-amber-400" /> Group PNR Splitting Desk
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Divide a master group booking PNR into sub-PNRs to allow separate ticketing deadlines, staggered payments, or individual client visa processing.
            </p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Master PNR Reference</label>
                <input
                  type="text"
                  value={splitPnrCode}
                  onChange={(e) => setSplitPnrCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Select Passengers to Split into Child PNR:
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {samplePaxList.map((pax, idx) => {
                    const isChecked = selectedSplitIndices.includes(idx);
                    return (
                      <label
                        key={idx}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSplitIndices((prev) => [...prev, idx]);
                            } else {
                              setSelectedSplitIndices((prev) => prev.filter((i) => i !== idx));
                            }
                          }}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span className="text-slate-200">{pax}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {splitResult && (
                <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-lg text-emerald-200">
                  {splitResult}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsSplitModalOpen(false);
                  setSplitResult(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExecuteSplit}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Execute PNR Split ({selectedSplitIndices.length} Pax)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
