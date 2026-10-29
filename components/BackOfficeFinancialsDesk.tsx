'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building2,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Plane,
} from 'lucide-react';
import {
  AgentAccount,
  LedgerEntry,
  BspReconciliationReport,
  MarkupRule,
  calculateBspSettlement,
  evaluateMarkup,
  evaluateTimaticCompliance,
  executeWalletTransaction,
} from '@/lib/financial-ledger';
import { Currency, convertCurrency, formatPrice } from '@/lib/travel-engine';
import { generateNextId } from '@/lib/id-generator';

interface BackOfficeFinancialsDeskProps {
  currency: Currency;
}

const INITIAL_ACCOUNT: AgentAccount = {
  agentId: 'AGT-RAWABI-9912',
  agencyName: 'Al-Rawabi Travel & Tours L.L.C',
  iataCode: '24-81902',
  walletBalanceSAR: 184500,
  creditLimitSAR: 250000,
  tier: 'TIER_1_CONSOLIDATOR',
};

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'TXN-901',
    idempotencyKey: 'IDEMP-901',
    agentId: 'AGT-RAWABI-9912',
    type: 'TICKET_ISSUANCE_DEBIT',
    amountSAR: 12400,
    balanceBeforeSAR: 196900,
    balanceAfterSAR: 184500,
    currency: 'SAR',
    pnrReference: 'SV-GRP-9821',
    ticketNumber: '065-49201948201',
    airlineCode: 'SV',
    description: 'Ticket Issuance Debit (8 Pax Umrah SV 592)',
    timestamp: '2026-10-26 08:30:00',
  },
  {
    id: 'TXN-900',
    idempotencyKey: 'IDEMP-900',
    agentId: 'AGT-RAWABI-9912',
    type: 'DEPOSIT_TOPUP',
    amountSAR: 50000,
    balanceBeforeSAR: 146900,
    balanceAfterSAR: 196900,
    currency: 'SAR',
    description: 'Bank Wire Deposit Top-Up (Riyad Bank ref: RB-98124)',
    timestamp: '2026-10-25 15:40:00',
  },
  {
    id: 'TXN-899',
    idempotencyKey: 'IDEMP-899',
    agentId: 'AGT-RAWABI-9912',
    type: 'GDS_INCENTIVE_CREDIT',
    amountSAR: 190,
    balanceBeforeSAR: 146710,
    balanceAfterSAR: 146900,
    currency: 'SAR',
    description: 'Amadeus NDC Segment Incentive Rebate (20 sectors @ 9.50 SAR)',
    timestamp: '2026-10-25 12:10:00',
  },
  {
    id: 'TXN-898',
    idempotencyKey: 'IDEMP-898',
    agentId: 'AGT-RAWABI-9912',
    type: 'SEAT_HOLD_ESCROW',
    amountSAR: 6520,
    balanceBeforeSAR: 153230,
    balanceAfterSAR: 146710,
    currency: 'SAR',
    pnrReference: 'EK-DXB-4412',
    airlineCode: 'EK',
    description: 'Group Allotment 20% Deposit Hold (24 Pax EK 803)',
    timestamp: '2026-10-24 11:00:00',
  },
];

const INITIAL_RULES: MarkupRule[] = [
  { id: 'RULE-01', airlineCode: 'SV', routeType: 'UMRAH_TRUNK', cabinClass: 'ALL', markupType: 'PERCENT', value: 8, agentTier: 'ALL' },
  { id: 'RULE-02', airlineCode: 'EK', routeType: 'GULF_GCC', cabinClass: 'BUSINESS', markupType: 'PERCENT', value: 12, agentTier: 'ALL' },
  { id: 'RULE-03', airlineCode: 'FZ', routeType: 'ALL', cabinClass: 'ECONOMY', markupType: 'FLAT', value: 45, agentTier: 'ALL' },
  { id: 'RULE-04', airlineCode: 'ALL', routeType: 'ALL', cabinClass: 'ALL', markupType: 'PERCENT', value: 6, agentTier: 'TIER_2_SUB_AGENT' },
];

export const BackOfficeFinancialsDesk: React.FC<BackOfficeFinancialsDeskProps> = ({ currency }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'bsp' | 'rules' | 'timatic'>('ledger');
  const [account, setAccount] = useState<AgentAccount>(INITIAL_ACCOUNT);
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [topupAmount, setTopupAmount] = useState<number>(25000);
  const [feedback, setFeedback] = useState<string | null>(null);

  // TIMATIC interactive tester
  const [timaticNationality, setTimaticNationality] = useState('Pakistan');
  const [timaticDestination, setTimaticDestination] = useState<'Saudi Arabia' | 'United Arab Emirates'>('Saudi Arabia');
  const [timaticReturnDate, setTimaticReturnDate] = useState('2026-11-20');
  const [timaticPassportExpiry, setTimaticPassportExpiry] = useState('2028-04-18');

  // Rule Matrix tester
  const [testAirline, setTestAirline] = useState('SV');
  const [testBaseFare, setTestBaseFare] = useState(1200);

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const idempKey = generateNextId('TOPUP');
    const result = executeWalletTransaction({
      account,
      type: 'DEPOSIT_TOPUP',
      amountSAR: topupAmount,
      idempotencyKey: idempKey,
      description: `Instant B2B Deposit Top-Up via Bank Payment Gateway`,
    });

    if (result.success && result.entry) {
      setAccount(result.updatedAccount);
      setLedger([result.entry, ...ledger]);
      setFeedback(`Wallet successfully credited with ${formatPrice(convertCurrency(topupAmount, 'SAR', currency), currency)}!`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // BSP Report calculation
  const bspReport: BspReconciliationReport = calculateBspSettlement({
    airlineCode: 'SV',
    tickets: [
      { ticketNumber: '065-49201948201', baseFareSAR: 750, carrierSurchargeYQ_SAR: 120, airportTaxesSAR: 100, standardCommissionPct: 5, gdsSegments: 2 },
      { ticketNumber: '065-49201948202', baseFareSAR: 750, carrierSurchargeYQ_SAR: 120, airportTaxesSAR: 100, standardCommissionPct: 5, gdsSegments: 2 },
      { ticketNumber: '065-49201948203', baseFareSAR: 980, carrierSurchargeYQ_SAR: 120, airportTaxesSAR: 100, standardCommissionPct: 5, gdsSegments: 2 },
      { ticketNumber: '065-49201948204', baseFareSAR: 980, carrierSurchargeYQ_SAR: 120, airportTaxesSAR: 100, standardCommissionPct: 5, gdsSegments: 2 },
      { ticketNumber: '065-49201948205', baseFareSAR: 2450, carrierSurchargeYQ_SAR: 200, airportTaxesSAR: 150, standardCommissionPct: 7, gdsSegments: 2 },
    ],
  });

  // Evaluate tested markup
  const ruleEvaluation = evaluateMarkup({
    baseFareSAR: testBaseFare,
    taxesSAR: 220,
    airlineCode: testAirline,
    routeType: 'UMRAH_TRUNK',
    cabinClass: 'ECONOMY',
    agentTier: 'TIER_1_CONSOLIDATOR',
    rules: INITIAL_RULES,
  });

  // TIMATIC compliance
  const timaticResult = evaluateTimaticCompliance({
    passengerNationality: timaticNationality,
    destinationCountry: timaticDestination,
    departureDate: '2026-11-10',
    returnDate: timaticReturnDate,
    passportExpiryDate: timaticPassportExpiry,
    transitAirports: ['DXB'],
  });

  const availableBalance = account.walletBalanceSAR + account.creditLimitSAR;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Agency Back-Office &amp; Financial Accounting Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Double-entry B2B sub-agent ledger, IATA BSP reconciliation register, dynamic markup matrix engine, and IATA TIMATIC document compliance.
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'ledger' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            B2B Agent Ledger
          </button>
          <button
            onClick={() => setActiveSubTab('bsp')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'bsp' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            IATA BSP Settlement
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'rules' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Markup Rule Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('timatic')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'timatic' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            TIMATIC Compliance
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sub-Tab 1: B2B Ledger */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          {/* Agent Balances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Prepaid Deposit Wallet</span>
              <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">
                {formatPrice(convertCurrency(account.walletBalanceSAR, 'SAR', currency), currency)}
              </span>
              <span className="text-[10px] text-slate-500">Unrestricted instant issuance cash</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">IATA Bank Guarantee / Credit Line</span>
              <span className="text-2xl font-black text-white font-mono block mt-1">
                {formatPrice(convertCurrency(account.creditLimitSAR, 'SAR', currency), currency)}
              </span>
              <span className="text-[10px] text-amber-400">Settled bi-weekly through BSP</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Available Issuance Power</span>
              <span className="text-2xl font-black text-amber-400 font-mono block mt-1">
                {formatPrice(convertCurrency(availableBalance, 'SAR', currency), currency)}
              </span>
              <span className="text-[10px] text-emerald-400">Wallet + Approved Credit Limit</span>
            </div>
          </div>

          {/* Top-up Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-white block">Simulate Wallet Top-Up Deposit</span>
              <span className="text-slate-400 text-[11px]">Instant credit to agency account with idempotency protection.</span>
            </div>
            <form onSubmit={handleTopup} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                min="1000"
                step="1000"
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 font-mono text-xs w-32"
              />
              <span className="text-slate-400">SAR</span>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition"
              >
                Top-Up Wallet
              </button>
            </form>
          </div>

          {/* Ledger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Immutable Double-Entry Transaction Ledger</span>
              <span className="text-slate-400 font-mono">{ledger.length} Recorded Entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Txn ID &amp; Ref</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {ledger.map((item) => {
                    const isDebit =
                      item.type === 'TICKET_ISSUANCE_DEBIT' ||
                      item.type === 'SEAT_HOLD_ESCROW' ||
                      item.type === 'ADM_DEBIT_PENALTY';

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {item.timestamp}
                        </td>
                        <td className="p-3 font-mono">
                          <span className="text-amber-400 font-bold block">{item.id}</span>
                          {item.pnrReference && (
                            <span className="text-[10px] text-slate-500">PNR: {item.pnrReference}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isDebit
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 max-w-xs truncate">{item.description}</td>
                        <td
                          className={`p-3 text-right font-mono font-bold ${
                            isDebit ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isDebit ? '-' : '+'}
                          {formatPrice(convertCurrency(item.amountSAR, 'SAR', currency), currency)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white">
                          {formatPrice(convertCurrency(item.balanceAfterSAR, 'SAR', currency), currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: BSP Settlement */}
      {activeSubTab === 'bsp' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 block font-bold">
                  IATA BSP CYCLE: {bspReport.cycleNumber} ({bspReport.period})
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Airline Billing &amp; Settlement Plan (BSP) Clearing Register
                </h3>
                <p className="text-xs text-slate-400">
                  Carrier: Saudia (SV / 065) • Accredited Agency: Al-Rawabi Travel (24-81902)
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Net BSP Remittance Due</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {formatPrice(convertCurrency(bspReport.netBspRemittanceSAR, 'SAR', currency), currency)}
                </span>
                <span className="text-[10px] text-emerald-400 block">Bank Direct Debit on Nov 15</span>
              </div>
            </div>

            {/* Financial Ledger breakdown cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Gross Base Airfare</span>
                <span className="text-base font-bold text-white font-mono">
                  {formatPrice(convertCurrency(bspReport.totalGrossAirfareSAR, 'SAR', currency), currency)}
                </span>
                <span className="text-[10px] text-slate-400">{bspReport.ticketCount} E-Tickets Issued</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">YQ/YR Fuel Surcharges</span>
                <span className="text-base font-bold text-white font-mono">
                  {formatPrice(convertCurrency(bspReport.totalCarrierSurchargesYQ_SAR, 'SAR', currency), currency)}
                </span>
                <span className="text-[10px] text-slate-400">Carrier Mandated</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Airport Departure Levies</span>
                <span className="text-base font-bold text-white font-mono">
                  {formatPrice(convertCurrency(bspReport.totalAirportTaxesSAR, 'SAR', currency), currency)}
                </span>
                <span className="text-[10px] text-slate-400">GACA / DAA Airport Fees</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold block">Standard Commission Deducted</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  -{formatPrice(convertCurrency(bspReport.totalStandardCommissionSAR, 'SAR', currency), currency)}
                </span>
                <span className="text-[10px] text-emerald-300">5% to 7% Agency Retained</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  ADM Audit Passed: No invalid Ticketing Time Limits (TTL) or fare class discrepancies detected.
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">0 Active ADMs</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Markup Rule Matrix */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">
              Dynamic B2B Markup &amp; Commission Rule Matrix
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time rule engine that prioritizes specific airline codes, route sectors (Umrah Trunk vs GCC Shuttle), and sub-agent tiers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Rules list */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block uppercase">Active Rules</span>
                {INITIAL_RULES.map((r) => (
                  <div
                    key={r.id}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-amber-400 block">{r.id}</span>
                      <span className="text-white font-semibold">
                        Carrier: {r.airlineCode} • Route: {r.routeType}
                      </span>
                      <span className="text-[11px] text-slate-500 block">Tier: {r.agentTier}</span>
                    </div>
                    <span className="font-mono font-black text-emerald-400 text-sm bg-emerald-950/80 border border-emerald-800 px-2 py-1 rounded">
                      {r.markupType === 'PERCENT' ? `+${r.value}%` : `+SAR ${r.value}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Tester */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <span className="text-xs font-bold text-amber-400 block uppercase mb-3">
                  Rule Evaluation Simulator
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Airline Code</label>
                    <select
                      value={testAirline}
                      onChange={(e) => setTestAirline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                    >
                      <option value="SV">Saudia (SV) - Umrah Trunk</option>
                      <option value="EK">Emirates (EK) - Gulf GCC</option>
                      <option value="FZ">flydubai (FZ) - Hybrid LCC</option>
                      <option value="XY">Flynas (XY)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Base Airfare (SAR)</label>
                    <input
                      type="number"
                      value={testBaseFare}
                      onChange={(e) => setTestBaseFare(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Matched Rule:</span>
                      <span className="font-mono font-bold text-amber-400">{ruleEvaluation.appliedRuleId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Calculated Margin:</span>
                      <span className="font-mono font-bold text-emerald-400">+SAR {ruleEvaluation.markupAmountSAR}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                      <span>Total Client Retail:</span>
                      <span className="font-mono text-amber-400">SAR {testBaseFare + 220 + ruleEvaluation.markupAmountSAR}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: TIMATIC Compliance */}
      {activeSubTab === 'timatic' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">
              IATA TIMATIC Document Compliance &amp; SSR Check
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Automated transit, visa, and passport expiry verification (minimum 6-month validity post return date) for Gulf destination entry.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Passenger Nationality</label>
                  <select
                    value={timaticNationality}
                    onChange={(e) => setTimaticNationality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                  >
                    <option value="Pakistan">Pakistan (Feeder pilgrim / OTB check)</option>
                    <option value="India">India (Feeder market)</option>
                    <option value="United Kingdom">United Kingdom (Visa exempt / eVisa)</option>
                    <option value="United States">United States</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Destination Country</label>
                  <select
                    value={timaticDestination}
                    onChange={(e) => setTimaticDestination(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                  >
                    <option value="Saudi Arabia">Saudi Arabia (JED / MED / RUH)</option>
                    <option value="United Arab Emirates">United Arab Emirates (DXB / AUH)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Return Date</label>
                    <input
                      type="date"
                      value={timaticReturnDate}
                      onChange={(e) => setTimaticReturnDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Passport Expiry</label>
                    <input
                      type="date"
                      value={timaticPassportExpiry}
                      onChange={(e) => setTimaticPassportExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>

              {/* TIMATIC Result */}
              <div
                className={`p-4 rounded-xl border ${
                  timaticResult.isBoardingCleared
                    ? 'bg-slate-950 border-emerald-500/40'
                    : 'bg-rose-950/40 border-rose-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">Boarding Clearance Status</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      timaticResult.isBoardingCleared
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : 'bg-rose-950 text-rose-300 border border-rose-600'
                    }`}
                  >
                    {timaticResult.isBoardingCleared ? 'CLEARED TO BOARD' : 'BOARDING DENIED'}
                  </span>
                </div>

                {timaticResult.okToBoardRequired && (
                  <div className="bg-amber-950/80 border border-amber-500/40 p-2.5 rounded-lg text-amber-200 text-[11px] mb-3">
                    ⚠️ <strong>OK-to-Board (OTB) Required:</strong> Must be inserted in GDS segment prior to check-in for this nationality corridor.
                  </div>
                )}

                <div className="space-y-1.5">
                  {timaticResult.mandatoryRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                  {timaticResult.warnings.map((warn, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
