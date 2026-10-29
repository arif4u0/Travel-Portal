import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertCurrency,
  getGroupTier,
  calculateGroupPricing,
  validatePassportExpiry,
  determineVisaEligibility,
  splitGroupPnr,
} from './travel-engine.ts';

test('convertCurrency correctly converts SAR to AED and USD', () => {
  const sarAmount = 1000;
  // 1000 SAR is ~266.7 USD
  const inUSD = convertCurrency(sarAmount, 'SAR', 'USD');
  assert.ok(inUSD > 260 && inUSD < 270, `Expected inUSD around 266, got ${inUSD}`);

  // Same currency should return identical amount
  assert.equal(convertCurrency(500, 'AED', 'AED'), 500);
});

test('getGroupTier assigns correct tiers and discount percentages', () => {
  assert.equal(getGroupTier(5).discountPercentage, 0); // FIT
  assert.equal(getGroupTier(15).discountPercentage, 8); // Small group
  assert.equal(getGroupTier(30).discountPercentage, 14); // Medium group
  assert.equal(getGroupTier(60).discountPercentage, 20); // Mega group
});

test('calculateGroupPricing calculates group discounts, Zamzam fee, and deposits', () => {
  const pricing = calculateGroupPricing({
    baseFarePerPax: 2000,
    taxesPerPax: 400,
    paxCount: 20, // 8% discount -> 1840 discounted base fare
    markupPercent: 10,
    includesZamzamWater: true,
  });

  assert.equal(pricing.discountPercentage, 8);
  assert.equal(pricing.discountedFarePerPax, 1840);
  assert.equal(pricing.subtotalFares, 1840 * 20);
  assert.equal(pricing.taxesAndSurchargesTotal, 400 * 20);
  assert.equal(pricing.zamzamWaterFeeTotal, 15 * 20); // SAR 300
  assert.ok(pricing.depositDueNow > 0);
  assert.equal(pricing.depositPercentage, 25);
  assert.equal(pricing.depositDueNow + pricing.balanceDueLater, pricing.totalClientPrice);
});

test('validatePassportExpiry enforces 6-month validity rule', () => {
  const travelDate = '2026-12-01';

  // Expired before travel
  const expired = validatePassportExpiry('2026-11-01', travelDate);
  assert.equal(expired.isValid, false);
  assert.ok(expired.error?.includes('expired'));

  // Only 3 months validity (e.g. March 2027 vs Dec 2026) -> fails 6-month rule
  const shortValidity = validatePassportExpiry('2027-02-15', travelDate);
  assert.equal(shortValidity.isValid, false);
  assert.ok(shortValidity.error?.includes('Minimum 6 months validity'));

  // 12 months validity -> passes
  const valid = validatePassportExpiry('2027-12-15', travelDate);
  assert.equal(valid.isValid, true);
  assert.ok(valid.monthsRemaining >= 12);
});

test('determineVisaEligibility routes Saudi Arabian visas appropriately', () => {
  // US Citizen for Tourism -> Instant Tourist eVisa
  const usTourist = determineVisaEligibility({
    destination: 'Saudi Arabia',
    passportNationality: 'United States',
    hasGccResidency: false,
    hasUsUkSchengenVisa: false,
    purpose: 'Tourism',
  });
  assert.equal(usTourist.isEligibleForInstantEvisa, true);
  assert.equal(usTourist.recommendedCategory.id, 'sa-evisa-tourist');

  // GCC Resident with Indian Passport -> Saudi GCC Resident eVisa
  const gccResident = determineVisaEligibility({
    destination: 'Saudi Arabia',
    passportNationality: 'India',
    hasGccResidency: true,
    hasUsUkSchengenVisa: false,
    purpose: 'Umrah',
  });
  assert.equal(gccResident.isEligibleForInstantEvisa, true);
  assert.equal(gccResident.recommendedCategory.id, 'sa-gcc-resident');

  // Non-tier-1 nationality without GCC/US visa -> Dedicated Umrah Package Visa
  const pakistaniUmrah = determineVisaEligibility({
    destination: 'Saudi Arabia',
    passportNationality: 'Pakistan',
    hasGccResidency: false,
    hasUsUkSchengenVisa: false,
    purpose: 'Umrah',
  });
  assert.equal(pakistaniUmrah.isEligibleForInstantEvisa, false);
  assert.equal(pakistaniUmrah.recommendedCategory.id, 'sa-umrah-dedicated');
});

test('splitGroupPnr correctly carves child PNR for selected passengers', () => {
  const allPax = ['Ahmed Al-Mansoor', 'Fatima Al-Mansoor', 'Omar Al-Mansoor', 'Zaid Al-Mansoor'];
  const split = splitGroupPnr({
    originalPnr: 'SV-GRP-5501',
    allPassengers: allPax,
    passengerIndicesToSplit: [2, 3],
  });

  assert.equal(split.originalPnr, 'SV-GRP-5501');
  assert.equal(split.splitPaxCount, 2);
  assert.equal(split.remainingPaxCount, 2);
  assert.deepEqual(split.splitPaxNames, ['Omar Al-Mansoor', 'Zaid Al-Mansoor']);
  assert.ok(split.newPnr.startsWith('SV-'));
});
