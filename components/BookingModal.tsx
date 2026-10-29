'use client';

import React, { useState } from 'react';
import { X, Check, Plane, Users, Clock, ShieldCheck, DollarSign, Droplets, Luggage, Sparkles, AlertCircle } from 'lucide-react';
import { Flight, FlightCabinOption, BookingPnr, SAMPLE_UMRAH_MANIFEST } from '@/lib/mock-data';
import { Currency, convertCurrency, formatPrice, calculateGroupPricing, getGroupTier } from '@/lib/travel-engine';
import { generatePnrCode, generateTicketNumber } from '@/lib/id-generator';

interface BookingModalProps {
  flight: Flight;
  cabin: FlightCabinOption;
  paxCount: number;
  currency: Currency;
  isOpen: boolean;
  isGroupHoldOnly: boolean;
  portalMode?: 'B2C' | 'B2B';
  onClose: () => void;
  onConfirmBooking: (newPnr: BookingPnr) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  flight,
  cabin,
  paxCount,
  currency,
  isOpen,
  isGroupHoldOnly,
  portalMode = 'B2C',
  onClose,
  onConfirmBooking,
}) => {
  const [markupPct, setMarkupPct] = useState(portalMode === 'B2B' ? 10 : 0);
  const [includeZamzam, setIncludeZamzam] = useState(cabin.zamzamIncluded || flight.isUmrahSpecialRoute);
  const [groupName, setGroupName] = useState(
    paxCount >= 10 ? 'Umrah Family Delegation' : 'Primary Traveler'
  );
  const [paymentMode, setPaymentMode] = useState<'deposit' | 'full'>(
    isGroupHoldOnly || (portalMode === 'B2B' && paxCount >= 10) ? 'deposit' : 'full'
  );
  const [consumerPaymentMethod, setConsumerPaymentMethod] = useState<'card' | 'apple_pay' | 'tabby'>('card');

  const groupTier = getGroupTier(paxCount);

  // Calculate pricing breakdown
  const pricing = calculateGroupPricing({
    baseFarePerPax: cabin.baseFareSAR,
    taxesPerPax: cabin.taxesSAR,
    paxCount,
    markupPercent: markupPct,
    includesZamzamWater: includeZamzam,
  });

  // Converted values
  const clientTotalConverted = convertCurrency(pricing.totalClientPrice, 'SAR', currency);
  const agencyNetConverted = convertCurrency(pricing.totalAgencyNet, 'SAR', currency);
  const agencyCommissionConverted = convertCurrency(pricing.markupAmountTotal, 'SAR', currency);
  const depositDueConverted = convertCurrency(pricing.depositDueNow, 'SAR', currency);

  if (!isOpen) return null;

  const handleCreateBooking = () => {
    const pnrCode = generatePnrCode(flight.airlineCode);

    const newBooking: BookingPnr = {
      pnr: pnrCode,
      airline: flight.airline,
      airlineCode: flight.airlineCode,
      flightNumber: flight.flightNumber,
      route: `${flight.origin.code} ➔ ${flight.destination.code}`,
      travelDate: '2026-11-20',
      returnDate: '2026-11-30',
      groupName,
      paxCount,
      totalClientPriceSAR: pricing.totalClientPrice,
      agencyNetSAR: pricing.totalAgencyNet,
      markupSAR: pricing.markupAmountTotal,
      depositPaidSAR: paymentMode === 'deposit' ? pricing.depositDueNow : pricing.totalClientPrice,
      status: paymentMode === 'deposit' ? 'DEPOSIT_PAID' : 'TICKETED',
      expiresAt: '2026-11-15 18:00',
      hasZamzamPackage: includeZamzam,
      passengers: SAMPLE_UMRAH_MANIFEST.slice(0, Math.min(paxCount, SAMPLE_UMRAH_MANIFEST.length)),
      eTicketNumbers:
        paymentMode === 'full'
          ? Array.from({ length: Math.min(paxCount, 8) }).map(
              (_, i) => generateTicketNumber(flight.airlineCode)
            )
          : [],
    };

    onConfirmBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              {flight.airlineCode}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isGroupHoldOnly || paymentMode === 'deposit' ? 'Hold Group Allotment PNR' : 'Confirm & Issue E-Tickets'}
              </h3>
              <p className="text-xs text-slate-400">
                {flight.airline} {flight.flightNumber} • {flight.origin.code} ➔ {flight.destination.code} • {cabin.cabinClass}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Checkout Modal"
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Flight Summary Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Departure Flight</span>
              <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{flight.origin.city} ({flight.origin.code})</span>
                <span className="text-amber-400">➔</span>
                <span>{flight.destination.city} ({flight.destination.code})</span>
              </div>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                {flight.departureTime} - {flight.arrivalTime} ({flight.duration}) • {flight.aircraft}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Cabin & Baggage</span>
              <span className="text-amber-300 font-semibold block">{cabin.cabinClass}</span>
              <span className="text-[11px] text-slate-400">{cabin.baggageAllowance}</span>
            </div>
          </div>

          {/* Group Name & Manifest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Group Booking Reference Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Total Passengers</label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-2 justify-between">
                <span className="font-bold text-white font-mono">{paxCount} Passengers</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                  {groupTier.tierName}
                </span>
              </div>
            </div>
          </div>

          {/* Special Services Toggle (Zamzam water box) */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-emerald-500/30 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Droplets className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white block">Official Saudi Zamzam 5L Certified Packaging</span>
                <span className="text-slate-400 text-[11px]">
                  Includes barcode baggage tag for direct airport conveyor pick up at Jeddah/Madinah
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeZamzam}
              onChange={(e) => setIncludeZamzam(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </label>

          {/* In B2B mode: Agency Markup Adjuster */}
          {portalMode === 'B2B' ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Agency Commission / Markup Adjustment
                </span>
                <span className="text-amber-400 font-mono font-bold">+{markupPct}% Markup</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={markupPct}
                onChange={(e) => setMarkupPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Wholesale Net Cost: {formatPrice(agencyNetConverted, currency)}</span>
                <span className="text-emerald-400 font-bold">
                  Agency Margin Profit: +{formatPrice(agencyCommissionConverted, currency)}
                </span>
              </div>
            </div>
          ) : (
            /* In B2C mode: Customer Payment Gateway */
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Select Payment Method (256-Bit SSL Encrypted)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">
                  Instant Confirmation
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConsumerPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    consumerPaymentMethod === 'card'
                      ? 'bg-amber-950/60 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-xs">Credit/Debit Card</span>
                  <span className="text-[10px] text-slate-400">Visa, Mastercard, Mada</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsumerPaymentMethod('apple_pay')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    consumerPaymentMethod === 'apple_pay'
                      ? 'bg-amber-950/60 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-xs">Apple Pay</span>
                  <span className="text-[10px] text-slate-400">One-touch checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsumerPaymentMethod('tabby')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    consumerPaymentMethod === 'tabby'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-xs text-emerald-300">Tabby (Split in 4)</span>
                  <span className="text-[10px] text-slate-400">0% Interest installments</span>
                </button>
              </div>
            </div>
          )}

          {/* Payment Milestone Selector for Groups (if B2B or customer group) */}
          {paxCount >= 10 && portalMode === 'B2B' && (
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 block">Select Booking Payment Option:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('deposit')}
                  className={`p-3 rounded-xl border text-left transition ${
                    paymentMode === 'deposit'
                      ? 'bg-amber-950/60 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Pay {groupTier.depositRequiredPct}% Deposit</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      Lock Hold
                    </span>
                  </div>
                  <div className="text-base font-black font-mono text-amber-400">
                    {formatPrice(depositDueConverted, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Balance due 14 days before flight
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('full')}
                  className={`p-3 rounded-xl border text-left transition ${
                    paymentMode === 'full'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Full Payment</span>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      Issue e-Tickets
                    </span>
                  </div>
                  <div className="text-base font-black font-mono text-emerald-400">
                    {formatPrice(clientTotalConverted, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Instant e-ticket vouchers generated
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Pricing Breakdown Card */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Base Airfare ({paxCount} Pax {groupTier.discountPercentage > 0 ? `@ -${groupTier.discountPercentage}% Group Tier` : ''}):</span>
              <span className="text-white font-mono">
                {formatPrice(convertCurrency(pricing.subtotalFares, 'SAR', currency), currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Airport Taxes &amp; Aviation Surcharges:</span>
              <span className="text-white font-mono">
                {formatPrice(convertCurrency(pricing.taxesAndSurchargesTotal, 'SAR', currency), currency)}
              </span>
            </div>
            {includeZamzam && (
              <div className="flex justify-between text-emerald-300">
                <span>Zamzam Official Certified Boxes (5L x {paxCount}):</span>
                <span className="font-mono">
                  {formatPrice(convertCurrency(pricing.zamzamWaterFeeTotal, 'SAR', currency), currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-slate-800">
              <span>Agency Margin / Client Markup:</span>
              <span className="font-mono">
                +{formatPrice(agencyCommissionConverted, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>Client Invoiced Total:</span>
              <span className="font-black font-mono text-amber-400 text-base">
                {formatPrice(clientTotalConverted, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Amount Payable Now</span>
            <span className="text-lg font-black text-white font-mono">
              {formatPrice(paymentMode === 'deposit' ? depositDueConverted : clientTotalConverted, currency)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBooking}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              {paymentMode === 'deposit' ? 'Confirm Hold & Issue PNR' : 'Issue Group E-Tickets'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
