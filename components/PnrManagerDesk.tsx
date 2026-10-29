'use client';

import React, { useState } from 'react';
import { Search, FileText, Printer, CheckCircle2, Clock, Split, Users, Plane, AlertTriangle, X, Shield, QrCode } from 'lucide-react';
import { BookingPnr } from '@/lib/mock-data';
import { Currency, convertCurrency, formatPrice } from '@/lib/travel-engine';

interface PnrManagerDeskProps {
  pnrs: BookingPnr[];
  currency: Currency;
  onUpdatePnr: (updated: BookingPnr) => void;
}

export const PnrManagerDesk: React.FC<PnrManagerDeskProps> = ({
  pnrs,
  currency,
  onUpdatePnr,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPnrForVoucher, setSelectedPnrForVoucher] = useState<BookingPnr | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const filteredPnrs = pnrs.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.pnr.toLowerCase().includes(q) ||
      item.groupName.toLowerCase().includes(q) ||
      item.airline.toLowerCase().includes(q) ||
      item.flightNumber.toLowerCase().includes(q) ||
      item.passengers.some((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
    );
  });

  const handleIssueTicket = (pnrItem: BookingPnr) => {
    const generatedTickets = Array.from({ length: pnrItem.paxCount }).map(
      (_, i) => `${pnrItem.airlineCode === 'SV' ? '065' : '176'}-${Math.floor(10000000000 + Math.random() * 90000000000)}`
    );

    const updated: BookingPnr = {
      ...pnrItem,
      status: 'TICKETED',
      eTicketNumbers: generatedTickets,
      depositPaidSAR: pnrItem.totalClientPriceSAR,
    };
    onUpdatePnr(updated);
    setSelectedPnrForVoucher(updated);
    setFeedbackMessage(`E-Tickets successfully issued for PNR ${pnrItem.pnr}!`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleExtendHold = (pnrItem: BookingPnr) => {
    const updated: BookingPnr = {
      ...pnrItem,
      expiresAt: 'Extended +48h (Airline Waiver Approved)',
    };
    onUpdatePnr(updated);
    setFeedbackMessage(`Hold for PNR ${pnrItem.pnr} extended by 48 hours under Gulf Airline B2B Agreement.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Agency PNR &amp; E-Ticket Issuance Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Manage live airline reservations, track group deposit milestones, issue official 13-digit e-tickets, and print branded B2B travel vouchers.
          </p>
        </div>

        {/* PNR Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PNR (e.g. SV-GRP-9821), Pax Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* PNR Cards List */}
      <div className="space-y-4">
        {filteredPnrs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No PNR records found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredPnrs.map((pnrItem) => {
            const isTicketed = pnrItem.status === 'TICKETED';
            const isHold = pnrItem.status === 'ON_HOLD';
            const isDepositPaid = pnrItem.status === 'DEPOSIT_PAID';

            const clientTotal = formatPrice(convertCurrency(pnrItem.totalClientPriceSAR, 'SAR', currency), currency);
            const depositPaid = formatPrice(convertCurrency(pnrItem.depositPaidSAR, 'SAR', currency), currency);
            const balanceDue = formatPrice(
              convertCurrency(pnrItem.totalClientPriceSAR - pnrItem.depositPaidSAR, 'SAR', currency),
              currency
            );

            return (
              <div
                key={pnrItem.pnr}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  {/* PNR Code & Airline */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-amber-400 text-sm font-mono shadow">
                      {pnrItem.airlineCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-amber-400">
                          {pnrItem.pnr}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isTicketed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : isDepositPaid
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                          }`}
                        >
                          {pnrItem.status}
                        </span>
                        {pnrItem.hasZamzamPackage && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-semibold">
                            Zamzam 5L Tagged
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-white block mt-0.5">
                        {pnrItem.groupName}
                      </span>
                    </div>
                  </div>

                  {/* Flight Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Flight &amp; Sector</span>
                      <span className="font-bold text-white">
                        {pnrItem.flightNumber} ({pnrItem.route})
                      </span>
                    </div>

                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Travel Date</span>
                      <span className="font-bold text-white">{pnrItem.travelDate}</span>
                    </div>

                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Group Size</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {pnrItem.paxCount} Pax
                      </span>
                    </div>
                  </div>

                  {/* Financials & Balance */}
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-400 block">Client Total Fare</span>
                    <span className="text-base font-black text-white font-mono">{clientTotal}</span>
                    {!isTicketed && (
                      <span className="text-[11px] text-amber-400 block font-medium">
                        Balance Due: {balanceDue}
                      </span>
                    )}
                  </div>
                </div>

                {/* Passenger list snippet & actions */}
                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 font-semibold text-[11px]">Passengers:</span>
                    {pnrItem.passengers.slice(0, 4).map((p, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300 font-medium text-[11px]"
                      >
                        {p.firstName} {p.lastName}
                      </span>
                    ))}
                    {pnrItem.paxCount > 4 && (
                      <span className="text-slate-500 text-[11px]">
                        +{pnrItem.paxCount - 4} more
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isHold && (
                      <button
                        onClick={() => handleExtendHold(pnrItem)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs"
                      >
                        Extend 48h Hold
                      </button>
                    )}

                    {!isTicketed && (
                      <button
                        onClick={() => handleIssueTicket(pnrItem)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
                      >
                        Issue E-Tickets Now
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedPnrForVoucher(pnrItem)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      View Travel Voucher
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Official Agency Travel Voucher & Invoice Modal */}
      {selectedPnrForVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Official Travel Itinerary &amp; Agency Voucher
                </h3>
              </div>
              <button
                onClick={() => setSelectedPnrForVoucher(null)}
                aria-label="Close Voucher Modal"
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher printable view */}
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-950/60">
              <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-md">
                {/* Agency header */}
                <div className="flex items-start justify-between border-b pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-950 tracking-tight">
                      AL-RAWABI TRAVEL &amp; TOURS L.L.C
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      IATA Accredited Agent No: 24-81902 • DTCM Dubai: 88120 • Ministry of Hajj &amp; Umrah: U-9941
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Level 14, Al-Saada Tower, Sheikh Zayed Road, Dubai, UAE / King Fahd Road, Riyadh, KSA
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block">PNR REFERENCE</span>
                    <span className="text-xl font-black font-mono text-amber-700">
                      {selectedPnrForVoucher.pnr}
                    </span>
                  </div>
                </div>

                {/* Booking status badge & Flight schedule */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-4 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">
                      Flight: {selectedPnrForVoucher.airline} ({selectedPnrForVoucher.flightNumber})
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      STATUS: {selectedPnrForVoucher.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span>Sector: </span>
                      <strong className="text-slate-900">{selectedPnrForVoucher.route}</strong>
                    </div>
                    <div>
                      <span>Departure Date: </span>
                      <strong className="text-slate-900">{selectedPnrForVoucher.travelDate}</strong>
                    </div>
                    <div>
                      <span>Group Reference: </span>
                      <strong className="text-slate-900">{selectedPnrForVoucher.groupName}</strong>
                    </div>
                    <div>
                      <span>Passengers: </span>
                      <strong className="text-slate-900">{selectedPnrForVoucher.paxCount} Persons</strong>
                    </div>
                  </div>
                </div>

                {/* Passenger list & eTicket numbers */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    Passenger Manifest &amp; E-Ticket Roster
                  </span>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 border-b">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Passenger Name</th>
                          <th className="p-2">Passport No</th>
                          <th className="p-2">E-Ticket Number</th>
                          <th className="p-2">Zamzam Voucher</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPnrForVoucher.passengers.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{idx + 1}</td>
                            <td className="p-2 font-bold">{p.firstName} {p.lastName}</td>
                            <td className="p-2 font-mono">{p.passportNumber}</td>
                            <td className="p-2 font-mono text-emerald-800 font-semibold">
                              {selectedPnrForVoucher.eTicketNumbers[idx] || 'PENDING ISSUANCE'}
                            </td>
                            <td className="p-2 font-semibold text-emerald-700">
                              {selectedPnrForVoucher.hasZamzamPackage ? '5L SEALED INCL' : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial invoice summary */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Total Group Invoice Amount:</span>
                    <strong className="text-slate-900 font-mono">
                      {formatPrice(convertCurrency(selectedPnrForVoucher.totalClientPriceSAR, 'SAR', currency), currency)}
                    </strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Total Paid:</span>
                    <strong className="text-emerald-700 font-mono">
                      {formatPrice(convertCurrency(selectedPnrForVoucher.depositPaidSAR, 'SAR', currency), currency)}
                    </strong>
                  </div>
                </div>

                {/* Signature & Agency stamp */}
                <div className="flex items-center justify-between pt-2 border-t text-[10px] text-slate-500">
                  <div>
                    This is an electronically generated IATA agent document. Verified at airport gate.
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-black text-amber-800 border-2 border-amber-800/50 px-2 py-1 rounded inline-block rotate-[-3deg]">
                      AL-RAWABI OFFICIAL STAMP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
              <button
                onClick={() => {
                  setSelectedPnrForVoucher(null);
                  setFeedbackMessage(`Travel pack exported for PNR ${selectedPnrForVoucher.pnr}.`);
                  setTimeout(() => setFeedbackMessage(null), 3500);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Download PDF Travel Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
