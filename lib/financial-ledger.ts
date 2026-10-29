// Financial Ledger, Rule Matrix Engine, and BSP Reconciliation Engine

export type TransactionType =
  | 'DEPOSIT_TOPUP'
  | 'TICKET_ISSUANCE_DEBIT'
  | 'SEAT_HOLD_ESCROW'
  | 'HOLD_RELEASE_CREDIT'
  | 'TICKET_VOID_REFUND'
  | 'ADM_DEBIT_PENALTY'
  | 'GDS_INCENTIVE_CREDIT';

export interface LedgerEntry {
  id: string;
  idempotencyKey: string;
  agentId: string;
  type: TransactionType;
  amountSAR: number;
  balanceBeforeSAR: number;
  balanceAfterSAR: number;
  currency: string;
  pnrReference?: string;
  ticketNumber?: string;
  airlineCode?: string;
  description: string;
  timestamp: string;
}

export interface AgentAccount {
  agentId: string;
  agencyName: string;
  iataCode: string;
  walletBalanceSAR: number;
  creditLimitSAR: number;
  tier: 'TIER_1_CONSOLIDATOR' | 'TIER_2_SUB_AGENT' | 'TIER_3_AFFILIATE';
}

export interface WalletOperationResult {
  success: boolean;
  entry?: LedgerEntry;
  updatedAccount: AgentAccount;
  errorMessage?: string;
}

export function executeWalletTransaction(params: {
  account: AgentAccount;
  type: TransactionType;
  amountSAR: number;
  idempotencyKey: string;
  pnrReference?: string;
  ticketNumber?: string;
  airlineCode?: string;
  description: string;
  existingLedgerKeys?: Set<string>;
}): WalletOperationResult {
  const {
    account,
    type,
    amountSAR,
    idempotencyKey,
    pnrReference,
    ticketNumber,
    airlineCode,
    description,
    existingLedgerKeys = new Set(),
  } = params;

  // Idempotency check to prevent duplicate debits during network retries
  if (existingLedgerKeys.has(idempotencyKey)) {
    return {
      success: false,
      updatedAccount: account,
      errorMessage: `Duplicate transaction detected with idempotency key: ${idempotencyKey}`,
    };
  }

  const isDebit =
    type === 'TICKET_ISSUANCE_DEBIT' ||
    type === 'SEAT_HOLD_ESCROW' ||
    type === 'ADM_DEBIT_PENALTY';

  const totalAvailableCredit = account.walletBalanceSAR + account.creditLimitSAR;

  if (isDebit && amountSAR > totalAvailableCredit) {
    return {
      success: false,
      updatedAccount: account,
      errorMessage: `Insufficient funds. Required: SAR ${amountSAR}, Available (Wallet + Credit Limit): SAR ${totalAvailableCredit}`,
    };
  }

  const balanceBeforeSAR = account.walletBalanceSAR;
  const balanceAfterSAR = isDebit ? balanceBeforeSAR - amountSAR : balanceBeforeSAR + amountSAR;

  const entry: LedgerEntry = {
    id: `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    idempotencyKey,
    agentId: account.agentId,
    type,
    amountSAR,
    balanceBeforeSAR,
    balanceAfterSAR,
    currency: 'SAR',
    pnrReference,
    ticketNumber,
    airlineCode,
    description,
    timestamp: new Date().toISOString(),
  };

  const updatedAccount: AgentAccount = {
    ...account,
    walletBalanceSAR: balanceAfterSAR,
  };

  return {
    success: true,
    entry,
    updatedAccount,
  };
}

export interface BspReconciliationReport {
  period: string;
  cycleNumber: string;
  airlineCode: string;
  totalGrossAirfareSAR: number;
  totalCarrierSurchargesYQ_SAR: number;
  totalAirportTaxesSAR: number;
  totalStandardCommissionSAR: number;
  totalGdsSegmentIncentiveSAR: number;
  totalAdmDisputedSAR: number;
  netBspRemittanceSAR: number;
  ticketCount: number;
}

export function calculateBspSettlement(params: {
  airlineCode: string;
  tickets: Array<{
    ticketNumber: string;
    baseFareSAR: number;
    carrierSurchargeYQ_SAR: number;
    airportTaxesSAR: number;
    standardCommissionPct: number;
    gdsSegments: number;
  }>;
  cycleNumber?: string;
}): BspReconciliationReport {
  const { airlineCode, tickets, cycleNumber = '2026-10-B2' } = params;

  let totalGross = 0;
  let totalYQ = 0;
  let totalAirport = 0;
  let totalCommission = 0;
  let totalIncentive = 0;

  tickets.forEach((t) => {
    totalGross += t.baseFareSAR;
    totalYQ += t.carrierSurchargeYQ_SAR;
    totalAirport += t.airportTaxesSAR;

    // Standard commission on base fare
    const comm = t.baseFareSAR * (t.standardCommissionPct / 100);
    totalCommission += comm;

    // GDS incentive (approx SAR 9.50 / $2.50 per booked flown sector)
    totalIncentive += t.gdsSegments * 9.5;
  });

  // Net Remit to BSP Clearing House: Gross Base + Taxes - Commission
  const totalPayableToAirline = totalGross + totalYQ + totalAirport;
  const netBspRemittanceSAR = Math.round(totalPayableToAirline - totalCommission);

  return {
    period: '2026-10-16 to 2026-10-31',
    cycleNumber,
    airlineCode,
    totalGrossAirfareSAR: totalGross,
    totalCarrierSurchargesYQ_SAR: totalYQ,
    totalAirportTaxesSAR: totalAirport,
    totalStandardCommissionSAR: Math.round(totalCommission),
    totalGdsSegmentIncentiveSAR: Math.round(totalIncentive),
    totalAdmDisputedSAR: 0,
    netBspRemittanceSAR,
    ticketCount: tickets.length,
  };
}

export interface MarkupRule {
  id: string;
  airlineCode: string; // 'ALL' or 'SV', 'EK', etc.
  routeType: 'DOMESTIC' | 'GULF_GCC' | 'UMRAH_TRUNK' | 'INTERCONTINENTAL' | 'ALL';
  cabinClass: 'ECONOMY' | 'BUSINESS' | 'ALL';
  markupType: 'PERCENT' | 'FLAT';
  value: number; // e.g. 5 for 5% or 75 for SAR 75 flat
  agentTier: 'ALL' | 'TIER_1_CONSOLIDATOR' | 'TIER_2_SUB_AGENT';
}

export function evaluateMarkup(params: {
  baseFareSAR: number;
  taxesSAR: number;
  airlineCode: string;
  routeType: 'DOMESTIC' | 'GULF_GCC' | 'UMRAH_TRUNK' | 'INTERCONTINENTAL';
  cabinClass: 'ECONOMY' | 'BUSINESS';
  agentTier: 'TIER_1_CONSOLIDATOR' | 'TIER_2_SUB_AGENT';
  rules: MarkupRule[];
}): { markupAmountSAR: number; appliedRuleId: string } {
  const { baseFareSAR, airlineCode, routeType, cabinClass, agentTier, rules } = params;

  // Find most specific rule first
  const matched = rules.find((r) => {
    const matchAirline = r.airlineCode === 'ALL' || r.airlineCode === airlineCode;
    const matchRoute = r.routeType === 'ALL' || r.routeType === routeType;
    const matchCabin = r.cabinClass === 'ALL' || r.cabinClass === cabinClass;
    const matchTier = r.agentTier === 'ALL' || r.agentTier === agentTier;
    return matchAirline && matchRoute && matchCabin && matchTier;
  });

  if (!matched) {
    return { markupAmountSAR: 0, appliedRuleId: 'DEFAULT_ZERO' };
  }

  if (matched.markupType === 'PERCENT') {
    const amount = Math.round(baseFareSAR * (matched.value / 100));
    return { markupAmountSAR: amount, appliedRuleId: matched.id };
  }

  return { markupAmountSAR: matched.value, appliedRuleId: matched.id };
}

export interface TimaticDocumentCheckInput {
  passengerNationality: string;
  destinationCountry: 'Saudi Arabia' | 'United Arab Emirates';
  departureDate: string;
  returnDate: string;
  passportExpiryDate: string;
  transitAirports: string[]; // e.g. ['DOH', 'DXB']
}

export interface TimaticDocumentCheckResult {
  isBoardingCleared: boolean;
  passportValidityMonthsPastReturn: number;
  okToBoardRequired: boolean;
  transitVisaRequired: boolean;
  warnings: string[];
  mandatoryRequirements: string[];
}

export function evaluateTimaticCompliance(
  input: TimaticDocumentCheckInput
): TimaticDocumentCheckResult {
  const {
    passengerNationality,
    destinationCountry,
    returnDate,
    passportExpiryDate,
  } = input;

  const retDate = new Date(returnDate);
  const expDate = new Date(passportExpiryDate);

  const diffTime = expDate.getTime() - retDate.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  const monthsPastReturn = Math.floor(diffDays / 30.4375);

  const warnings: string[] = [];
  const mandatoryRequirements: string[] = [];
  let isBoardingCleared = true;

  // TIMATIC Mandatory Rule: Passports must be valid for at least 6 months after arrival/return
  if (monthsPastReturn < 6) {
    isBoardingCleared = false;
    warnings.push(
      `Passport expires in ${monthsPastReturn} months after return date. Minimum 6 months validity required by ${destinationCountry} Immigration.`
    );
  } else {
    mandatoryRequirements.push(`Passport validity confirmed (${monthsPastReturn} months remaining past return date).`);
  }

  // South Asian passport feeder routes into UAE / KSA frequently require OK-to-Board verification
  const isSouthAsianNationality = ['Pakistan', 'India', 'Bangladesh', 'Nepal', 'Sri Lanka'].includes(
    passengerNationality
  );

  let okToBoardRequired = false;
  if (destinationCountry === 'United Arab Emirates' && isSouthAsianNationality) {
    okToBoardRequired = true;
    mandatoryRequirements.push(
      'OK-to-Board (OTB) verification message must be inserted into GDS PNR segment before airport departure.'
    );
  }

  if (destinationCountry === 'Saudi Arabia') {
    mandatoryRequirements.push(
      'Confirmed return or onward ticket required for all non-GCC passport holders upon check-in.'
    );
    mandatoryRequirements.push(
      'Ministry of Hajj/Umrah Nusuk platform barcode permit required for Rawdah al-Sharifah visitation.'
    );
  }

  return {
    isBoardingCleared,
    passportValidityMonthsPastReturn: Math.max(0, monthsPastReturn),
    okToBoardRequired,
    transitVisaRequired: false,
    warnings,
    mandatoryRequirements,
  };
}
