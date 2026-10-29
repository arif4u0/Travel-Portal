import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AgentAccount,
  executeWalletTransaction,
  calculateBspSettlement,
  evaluateMarkup,
  evaluateTimaticCompliance,
  MarkupRule,
} from './financial-ledger.ts';

test('executeWalletTransaction debits wallet with idempotency enforcement', () => {
  const account: AgentAccount = {
    agentId: 'AGT-9912',
    agencyName: 'Al-Rawabi Travel & Tours',
    iataCode: '24-81902',
    walletBalanceSAR: 50000,
    creditLimitSAR: 25000,
    tier: 'TIER_1_CONSOLIDATOR',
  };

  const existingKeys = new Set<string>();

  // Successful debit
  const debitRes = executeWalletTransaction({
    account,
    type: 'TICKET_ISSUANCE_DEBIT',
    amountSAR: 12400,
    idempotencyKey: 'IDEMP-TX-001',
    pnrReference: 'SV-GRP-9821',
    ticketNumber: '065-49201948201',
    airlineCode: 'SV',
    description: 'Ticket issuance debit for 8 pax',
    existingLedgerKeys: existingKeys,
  });

  assert.equal(debitRes.success, true);
  assert.equal(debitRes.updatedAccount.walletBalanceSAR, 37600);
  assert.equal(debitRes.entry?.balanceBeforeSAR, 50000);
  assert.equal(debitRes.entry?.balanceAfterSAR, 37600);

  // Add idempotency key to set
  existingKeys.add('IDEMP-TX-001');

  // Duplicate replay should be blocked
  const replayRes = executeWalletTransaction({
    account: debitRes.updatedAccount,
    type: 'TICKET_ISSUANCE_DEBIT',
    amountSAR: 12400,
    idempotencyKey: 'IDEMP-TX-001',
    pnrReference: 'SV-GRP-9821',
    ticketNumber: '065-49201948201',
    airlineCode: 'SV',
    description: 'Replay attempt',
    existingLedgerKeys: existingKeys,
  });

  assert.equal(replayRes.success, false);
  assert.ok(replayRes.errorMessage?.includes('Duplicate transaction detected'));
});

test('executeWalletTransaction blocks overdraft beyond credit limit', () => {
  const account: AgentAccount = {
    agentId: 'AGT-002',
    agencyName: 'Sub-Agent Agency',
    iataCode: 'NON-IATA',
    walletBalanceSAR: 2000,
    creditLimitSAR: 5000,
    tier: 'TIER_2_SUB_AGENT',
  };

  // Attempting to debit SAR 10,000 when available is 7,000 (2k balance + 5k credit limit)
  const failRes = executeWalletTransaction({
    account,
    type: 'TICKET_ISSUANCE_DEBIT',
    amountSAR: 10000,
    idempotencyKey: 'IDEMP-OVERDRAFT',
    description: 'Large group ticket debit attempt',
  });

  assert.equal(failRes.success, false);
  assert.ok(failRes.errorMessage?.includes('Insufficient funds'));
});

test('calculateBspSettlement aggregates airline liability, commissions, and net remit', () => {
  const tickets = [
    { ticketNumber: '065-1', baseFareSAR: 2000, carrierSurchargeYQ_SAR: 300, airportTaxesSAR: 200, standardCommissionPct: 5, gdsSegments: 2 },
    { ticketNumber: '065-2', baseFareSAR: 3000, carrierSurchargeYQ_SAR: 400, airportTaxesSAR: 200, standardCommissionPct: 5, gdsSegments: 2 },
  ];

  const bsp = calculateBspSettlement({
    airlineCode: 'SV',
    tickets,
  });

  assert.equal(bsp.ticketCount, 2);
  assert.equal(bsp.totalGrossAirfareSAR, 5000);
  assert.equal(bsp.totalCarrierSurchargesYQ_SAR, 700);
  assert.equal(bsp.totalAirportTaxesSAR, 400);
  // Total Commission: 5% of 5000 = 250
  assert.equal(bsp.totalStandardCommissionSAR, 250);
  // Net Remit: (5000 + 700 + 400) - 250 = 5850
  assert.equal(bsp.netBspRemittanceSAR, 5850);
  // GDS segment incentive: 4 segments * 9.5 = 38
  assert.equal(bsp.totalGdsSegmentIncentiveSAR, 38);
});

test('evaluateMarkup applies specific rules by airline and route', () => {
  const rules: MarkupRule[] = [
    { id: 'R1', airlineCode: 'SV', routeType: 'UMRAH_TRUNK', cabinClass: 'ALL', markupType: 'PERCENT', value: 8, agentTier: 'ALL' },
    { id: 'R2', airlineCode: 'ALL', routeType: 'ALL', cabinClass: 'ALL', markupType: 'FLAT', value: 50, agentTier: 'ALL' },
  ];

  const matched = evaluateMarkup({
    baseFareSAR: 1000,
    taxesSAR: 200,
    airlineCode: 'SV',
    routeType: 'UMRAH_TRUNK',
    cabinClass: 'ECONOMY',
    agentTier: 'TIER_1_CONSOLIDATOR',
    rules,
  });

  assert.equal(matched.appliedRuleId, 'R1');
  assert.equal(matched.markupAmountSAR, 80); // 8% of 1000
});

test('evaluateTimaticCompliance flags passport expiring less than 6 months past return date', () => {
  const failCheck = evaluateTimaticCompliance({
    passengerNationality: 'United Kingdom',
    destinationCountry: 'Saudi Arabia',
    departureDate: '2026-11-01',
    returnDate: '2026-11-15',
    passportExpiryDate: '2027-02-15', // only 3 months past return date
    transitAirports: ['DXB'],
  });

  assert.equal(failCheck.isBoardingCleared, false);
  assert.ok(failCheck.warnings[0].includes('Minimum 6 months validity required'));

  const passCheck = evaluateTimaticCompliance({
    passengerNationality: 'Pakistan',
    destinationCountry: 'United Arab Emirates',
    departureDate: '2026-11-01',
    returnDate: '2026-11-15',
    passportExpiryDate: '2028-10-15',
    transitAirports: [],
  });

  assert.equal(passCheck.isBoardingCleared, true);
  assert.equal(passCheck.okToBoardRequired, true); // Pakistan to UAE requires OK-to-Board
});
