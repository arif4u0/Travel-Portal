// Travel Engine: Core business logic, pricing, visa calculations, and passenger validation

export type Currency = 'SAR' | 'AED' | 'USD' | 'EUR' | 'GBP' | 'PKR' | 'INR';

export const CURRENCY_RATES: Record<Currency, { rateToUSD: number; symbol: string; name: string }> = {
  USD: { rateToUSD: 1, symbol: '$', name: 'US Dollar' },
  SAR: { rateToUSD: 0.2667, symbol: 'SAR', name: 'Saudi Riyal' }, // ~3.75 SAR = 1 USD
  AED: { rateToUSD: 0.2723, symbol: 'AED', name: 'UAE Dirham' },   // ~3.67 AED = 1 USD
  EUR: { rateToUSD: 1.08, symbol: '€', name: 'Euro' },
  GBP: { rateToUSD: 1.28, symbol: '£', name: 'British Pound' },
  PKR: { rateToUSD: 0.0036, symbol: '₨', name: 'Pakistani Rupee' },
  INR: { rateToUSD: 0.012, symbol: '₹', name: 'Indian Rupee' },
};

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  const inUSD = amount * CURRENCY_RATES[from].rateToUSD;
  const inTarget = inUSD / CURRENCY_RATES[to].rateToUSD;
  return Math.round(inTarget * 100) / 100;
}

export function formatPrice(amount: number, currency: Currency): string {
  const meta = CURRENCY_RATES[currency];
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${meta.symbol} ${formatted}`;
}

export interface GroupDiscountTier {
  minPax: number;
  maxPax: number;
  discountPercentage: number;
  tierName: string;
  depositRequiredPct: number;
}

export const GROUP_DISCOUNT_TIERS: GroupDiscountTier[] = [
  { minPax: 1, maxPax: 9, discountPercentage: 0, tierName: 'Standard FIT (1-9 Pax)', depositRequiredPct: 100 },
  { minPax: 10, maxPax: 24, discountPercentage: 8, tierName: 'Small Group Tier (10-24 Pax)', depositRequiredPct: 25 },
  { minPax: 25, maxPax: 49, discountPercentage: 14, tierName: 'Medium Group / Corporate (25-49 Pax)', depositRequiredPct: 20 },
  { minPax: 50, maxPax: 500, discountPercentage: 20, tierName: 'Mega Group / Umrah Charter (50+ Pax)', depositRequiredPct: 15 },
];

export function getGroupTier(paxCount: number): GroupDiscountTier {
  const tier = GROUP_DISCOUNT_TIERS.find(t => paxCount >= t.minPax && paxCount <= t.maxPax);
  return tier || GROUP_DISCOUNT_TIERS[0];
}

export interface GroupPricingBreakdown {
  paxCount: number;
  baseFarePerPax: number;
  discountPercentage: number;
  discountedFarePerPax: number;
  subtotalFares: number;
  taxesAndSurchargesTotal: number;
  markupAmountTotal: number;
  zamzamWaterFeeTotal: number;
  totalClientPrice: number;
  totalAgencyNet: number;
  depositDueNow: number;
  depositPercentage: number;
  balanceDueLater: number;
}

export function calculateGroupPricing(params: {
  baseFarePerPax: number;
  taxesPerPax: number;
  paxCount: number;
  markupPercent?: number; // e.g., 10 for 10%
  fixedMarkupPerPax?: number;
  includesZamzamWater?: boolean;
}): GroupPricingBreakdown {
  const {
    baseFarePerPax,
    taxesPerPax,
    paxCount,
    markupPercent = 0,
    fixedMarkupPerPax = 0,
    includesZamzamWater = false,
  } = params;

  const tier = getGroupTier(paxCount);
  const discountMultiplier = 1 - (tier.discountPercentage / 100);
  const discountedFarePerPax = Math.round(baseFarePerPax * discountMultiplier);
  const subtotalFares = discountedFarePerPax * paxCount;
  const taxesAndSurchargesTotal = taxesPerPax * paxCount;

  // Zamzam water official Saudi airport packaging & seal fee: ~SAR 15 per pax
  const zamzamWaterFeeTotal = includesZamzamWater ? 15 * paxCount : 0;

  const totalAgencyNet = subtotalFares + taxesAndSurchargesTotal + zamzamWaterFeeTotal;

  // Calculate agency markup
  const percentMarkup = totalAgencyNet * (markupPercent / 100);
  const fixedMarkup = fixedMarkupPerPax * paxCount;
  const markupAmountTotal = Math.round(percentMarkup + fixedMarkup);

  const totalClientPrice = totalAgencyNet + markupAmountTotal;

  // Deposit calculation
  const depositDueNow = Math.round(totalClientPrice * (tier.depositRequiredPct / 100));
  const balanceDueLater = totalClientPrice - depositDueNow;

  return {
    paxCount,
    baseFarePerPax,
    discountPercentage: tier.discountPercentage,
    discountedFarePerPax,
    subtotalFares,
    taxesAndSurchargesTotal,
    markupAmountTotal,
    zamzamWaterFeeTotal,
    totalClientPrice,
    totalAgencyNet,
    depositDueNow,
    depositPercentage: tier.depositRequiredPct,
    balanceDueLater,
  };
}

export interface PassportValidationResult {
  isValid: boolean;
  monthsRemaining: number;
  error?: string;
}

export function validatePassportExpiry(
  expiryDateString: string,
  travelDateString: string
): PassportValidationResult {
  const expiry = new Date(expiryDateString);
  const travel = new Date(travelDateString);

  if (isNaN(expiry.getTime())) {
    return { isValid: false, monthsRemaining: 0, error: 'Invalid passport expiration date format.' };
  }
  if (isNaN(travel.getTime())) {
    return { isValid: false, monthsRemaining: 0, error: 'Invalid travel departure date format.' };
  }

  // Calculate difference in months
  const diffTime = expiry.getTime() - travel.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  const monthsRemaining = Math.floor(diffDays / 30.4375);

  if (diffDays <= 0) {
    return {
      isValid: false,
      monthsRemaining: 0,
      error: 'Passport has already expired or expires before the departure date.',
    };
  }

  // UAE & Saudi Arabia mandatory rule: Passports must be valid for at least 6 months (180 days)
  if (monthsRemaining < 6) {
    return {
      isValid: false,
      monthsRemaining,
      error: `Passport validity is ${monthsRemaining} months. Minimum 6 months validity required for UAE & Saudi Arabia entry.`,
    };
  }

  return {
    isValid: true,
    monthsRemaining,
  };
}

export type DestinationCountry = 'Saudi Arabia' | 'United Arab Emirates';

export interface VisaCategory {
  id: string;
  name: string;
  country: DestinationCountry;
  durationDays: number;
  processingTimeHours: number;
  governmentFeeSAR: number;
  insuranceFeeSAR: number;
  agencyFeeSAR: number;
  isInstantEvisa: boolean;
  requiresBiometrics: boolean;
  allowedPurposes: string[];
  description: string;
}

export const SAUDI_VISA_CATEGORIES: VisaCategory[] = [
  {
    id: 'sa-evisa-tourist',
    name: 'Saudi Tourist eVisa (1-Year Multiple Entry)',
    country: 'Saudi Arabia',
    durationDays: 90,
    processingTimeHours: 1, // Instant online
    governmentFeeSAR: 300,
    insuranceFeeSAR: 140,
    agencyFeeSAR: 75,
    isInstantEvisa: true,
    requiresBiometrics: false,
    allowedPurposes: ['Tourism', 'Umrah', 'Events', 'Family Visit'],
    description: 'Valid for 1 year with multiple entries. Total stay up to 90 days. Eligible for 66+ countries, US/UK/Schengen visa holders, and GCC residents.',
  },
  {
    id: 'sa-gcc-resident',
    name: 'Saudi GCC Resident eVisa',
    country: 'Saudi Arabia',
    durationDays: 90,
    processingTimeHours: 2,
    governmentFeeSAR: 300,
    insuranceFeeSAR: 140,
    agencyFeeSAR: 60,
    isInstantEvisa: true,
    requiresBiometrics: false,
    allowedPurposes: ['Umrah', 'Tourism', 'Business Meetings'],
    description: 'Special fast-track eVisa for valid UAE, Qatar, Kuwait, Bahrain, and Oman residency holders with valid Iqama/residency card.',
  },
  {
    id: 'sa-umrah-dedicated',
    name: 'Nusuk Umrah Package Visa',
    country: 'Saudi Arabia',
    durationDays: 90,
    processingTimeHours: 24,
    governmentFeeSAR: 350,
    insuranceFeeSAR: 150,
    agencyFeeSAR: 100,
    isInstantEvisa: false,
    requiresBiometrics: false,
    allowedPurposes: ['Umrah Pilgrimage', 'Ziyarah Makkah & Madinah', 'Rawdah Permit Included'],
    description: 'Official Ministry of Hajj & Umrah package visa with integrated Nusuk Rawdah booking authorization and Zamzam allowance permit.',
  },
  {
    id: 'sa-commercial-visit',
    name: 'Saudi Business & Commercial Visit Visa',
    country: 'Saudi Arabia',
    durationDays: 90,
    processingTimeHours: 48,
    governmentFeeSAR: 500,
    insuranceFeeSAR: 180,
    agencyFeeSAR: 150,
    isInstantEvisa: false,
    requiresBiometrics: true,
    allowedPurposes: ['Business Negotiations', 'Conference', 'Contract Signing', 'Corporate Client Visit'],
    description: 'Requires electronic Chamber of Commerce invitation letter from Saudi host company. Processed via Ministry of Foreign Affairs (MOFA).',
  },
  {
    id: 'sa-transit-stopover',
    name: 'Saudi 96-Hour Free Transit Stopover Visa',
    country: 'Saudi Arabia',
    durationDays: 4,
    processingTimeHours: 1,
    governmentFeeSAR: 0,
    insuranceFeeSAR: 45,
    agencyFeeSAR: 35,
    isInstantEvisa: true,
    requiresBiometrics: false,
    allowedPurposes: ['Transit', 'Umrah (quick)', 'Tourism'],
    description: 'Free stopover visa valid for passengers transiting via Saudia or Flynas with onward boarding pass within 96 hours.',
  },
];

export const UAE_VISA_CATEGORIES: VisaCategory[] = [
  {
    id: 'uae-tourist-30',
    name: 'Dubai / UAE 30-Day Single Entry Tourist Visa',
    country: 'United Arab Emirates',
    durationDays: 30,
    processingTimeHours: 24,
    governmentFeeSAR: 320, // ~310 AED
    insuranceFeeSAR: 50,
    agencyFeeSAR: 50,
    isInstantEvisa: false,
    requiresBiometrics: false,
    allowedPurposes: ['Leisure', 'Tourism', 'Visiting Friends/Family', 'Corporate Events'],
    description: 'Standard tourist visa processed through GDRFA Dubai or ICP Federal Authority. Includes COVID/Health insurance.',
  },
  {
    id: 'uae-tourist-60',
    name: 'Dubai / UAE 60-Day Single Entry Tourist Visa',
    country: 'United Arab Emirates',
    durationDays: 60,
    processingTimeHours: 24,
    governmentFeeSAR: 550, // ~535 AED
    insuranceFeeSAR: 60,
    agencyFeeSAR: 75,
    isInstantEvisa: false,
    requiresBiometrics: false,
    allowedPurposes: ['Extended Leisure', 'Job Search', 'Winter Stay', 'Family Vacation'],
    description: 'Extended 60-day single entry tourist visa for longer stays in Dubai, Abu Dhabi, and Northern Emirates.',
  },
  {
    id: 'uae-tourist-60-multiple',
    name: 'Dubai / UAE 60-Day Multiple Entry Visa',
    country: 'United Arab Emirates',
    durationDays: 60,
    processingTimeHours: 24,
    governmentFeeSAR: 780, // ~760 AED
    insuranceFeeSAR: 80,
    agencyFeeSAR: 100,
    isInstantEvisa: false,
    requiresBiometrics: false,
    allowedPurposes: ['Regional Business', 'Multiple Cruise Excursions', 'Frequent GCC Visits'],
    description: 'Allows multiple entries into the UAE within the 60-day validity window. Ideal for travelers taking cruise tours or visiting Saudi Arabia and returning.',
  },
  {
    id: 'uae-transit-96',
    name: 'Dubai 96-Hour Transit Visa',
    country: 'United Arab Emirates',
    durationDays: 4,
    processingTimeHours: 12,
    governmentFeeSAR: 180, // ~175 AED
    insuranceFeeSAR: 30,
    agencyFeeSAR: 30,
    isInstantEvisa: false,
    requiresBiometrics: false,
    allowedPurposes: ['Layover', 'Brief City Tour', 'Stopover Meetings'],
    description: 'For travelers transiting through Dubai (DXB/DWC) with confirmed outbound ticket to a 3rd country within 96 hours.',
  },
  {
    id: 'uae-express-urgent',
    name: 'Dubai 4-Hour Urgent Express Visa',
    country: 'United Arab Emirates',
    durationDays: 30,
    processingTimeHours: 4,
    governmentFeeSAR: 620, // ~600 AED
    insuranceFeeSAR: 50,
    agencyFeeSAR: 130,
    isInstantEvisa: false,
    requiresBiometrics: false,
    allowedPurposes: ['Emergency Travel', 'Last-minute Corporate Meetings', 'Urgent Family Visit'],
    description: 'Expedited processing through direct GDRFA VIP channel with decision delivered within 4-8 business hours.',
  },
];

export interface VisaEligibilityInput {
  destination: DestinationCountry;
  passportNationality: string;
  hasGccResidency: boolean;
  hasUsUkSchengenVisa: boolean;
  purpose: 'Umrah' | 'Tourism' | 'Business' | 'Transit';
}

export interface VisaEligibilityOutput {
  recommendedCategory: VisaCategory;
  alternativeCategories: VisaCategory[];
  isEligibleForInstantEvisa: boolean;
  estimatedHours: number;
  totalCostSAR: number;
  notes: string[];
}

export function determineVisaEligibility(input: VisaEligibilityInput): VisaEligibilityOutput {
  const { destination, passportNationality, hasGccResidency, hasUsUkSchengenVisa, purpose } = input;

  if (destination === 'Saudi Arabia') {
    // Check instant eVisa tier
    // Eligible tier 1: 66 nationalities, OR any nationality with active GCC residency OR US/UK/Schengen visa
    const tier1Nationalities = [
      'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
      'Italy', 'Spain', 'Switzerland', 'Japan', 'South Korea', 'Singapore', 'China',
      'Malaysia', 'New Zealand', 'Turkey', 'Russia', 'Norway', 'Sweden', 'Netherlands'
    ];

    const isDirectTier1 = tier1Nationalities.includes(passportNationality);
    const isQualifyingHolders = hasGccResidency || hasUsUkSchengenVisa;

    if (purpose === 'Transit') {
      const stopover = SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-transit-stopover')!;
      return {
        recommendedCategory: stopover,
        alternativeCategories: [SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-evisa-tourist')!],
        isEligibleForInstantEvisa: true,
        estimatedHours: stopover.processingTimeHours,
        totalCostSAR: stopover.governmentFeeSAR + stopover.insuranceFeeSAR + stopover.agencyFeeSAR,
        notes: [
          'Requires booking through Saudia or Flynas flight inventory.',
          'Free government visa with mandatory insurance coverage.',
          'Umrah permits can be booked directly in Nusuk app with this visa.'
        ],
      };
    }

    if (hasGccResidency) {
      const gccCat = SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-gcc-resident')!;
      return {
        recommendedCategory: gccCat,
        alternativeCategories: [SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-umrah-dedicated')!],
        isEligibleForInstantEvisa: true,
        estimatedHours: gccCat.processingTimeHours,
        totalCostSAR: gccCat.governmentFeeSAR + gccCat.insuranceFeeSAR + gccCat.agencyFeeSAR,
        notes: [
          'Valid GCC residency (minimum 3 months validity required).',
          'Covers Umrah pilgrimage and travel throughout the Kingdom.',
          'Instant digital issuance via MOFA platform.'
        ],
      };
    }

    if (isDirectTier1 || hasUsUkSchengenVisa) {
      const tourist = SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-evisa-tourist')!;
      return {
        recommendedCategory: tourist,
        alternativeCategories: [SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-umrah-dedicated')!],
        isEligibleForInstantEvisa: true,
        estimatedHours: tourist.processingTimeHours,
        totalCostSAR: tourist.governmentFeeSAR + tourist.insuranceFeeSAR + tourist.agencyFeeSAR,
        notes: [
          isDirectTier1
            ? 'Passport nationality is eligible for Instant Saudi Tourist eVisa.'
            : 'Qualifies for instant eVisa via US/UK/Schengen visa holder concession.',
          'Allows performing Umrah anytime outside of the official Hajj season.',
          'Multiple entry valid for 1 full year.'
        ],
      };
    }

    // Default for other nationalities needing standard Umrah or Business
    if (purpose === 'Business') {
      const biz = SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-commercial-visit')!;
      return {
        recommendedCategory: biz,
        alternativeCategories: [SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-umrah-dedicated')!],
        isEligibleForInstantEvisa: false,
        estimatedHours: biz.processingTimeHours,
        totalCostSAR: biz.governmentFeeSAR + biz.insuranceFeeSAR + biz.agencyFeeSAR,
        notes: [
          'Requires commercial invitation letter authenticated by Saudi Chamber of Commerce.',
          'Biometrics verification at Tasheer Visa Center required before travel.',
        ],
      };
    }

    const umrah = SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-umrah-dedicated')!;
    return {
      recommendedCategory: umrah,
      alternativeCategories: [SAUDI_VISA_CATEGORIES.find(c => c.id === 'sa-evisa-tourist')!],
      isEligibleForInstantEvisa: false,
      estimatedHours: umrah.processingTimeHours,
      totalCostSAR: umrah.governmentFeeSAR + umrah.insuranceFeeSAR + umrah.agencyFeeSAR,
      notes: [
        'Dedicated Umrah Visa issued through licensed Saudi Umrah Ministry operator.',
        'Includes ground transport coordination and Rawdah permit slot allotment.',
        'Requires confirmed return airfare and hotel booking in Makkah/Madinah.'
      ],
    };
  }

  // UAE / Dubai
  if (purpose === 'Transit') {
    const transit = UAE_VISA_CATEGORIES.find(c => c.id === 'uae-transit-96')!;
    return {
      recommendedCategory: transit,
      alternativeCategories: [UAE_VISA_CATEGORIES.find(c => c.id === 'uae-tourist-30')!],
      isEligibleForInstantEvisa: false,
      estimatedHours: transit.processingTimeHours,
      totalCostSAR: transit.governmentFeeSAR + transit.insuranceFeeSAR + transit.agencyFeeSAR,
      notes: [
        'Valid for 96 hours from entry timestamp.',
        'Requires confirmed onward ticket from DXB or DWC.',
      ],
    };
  }

  // Standard UAE Tourist 30 vs 60
  const standard30 = UAE_VISA_CATEGORIES.find(c => c.id === 'uae-tourist-30')!;
  return {
    recommendedCategory: standard30,
    alternativeCategories: [
      UAE_VISA_CATEGORIES.find(c => c.id === 'uae-tourist-60')!,
      UAE_VISA_CATEGORIES.find(c => c.id === 'uae-express-urgent')!,
    ],
    isEligibleForInstantEvisa: false,
    estimatedHours: standard30.processingTimeHours,
    totalCostSAR: standard30.governmentFeeSAR + standard30.insuranceFeeSAR + standard30.agencyFeeSAR,
    notes: [
      'GDRFA Dubai electronic tourist visa.',
      'Requires passport bio page copy + white background passport photo.',
      'Express 4-hour processing available for urgent flight schedules.'
    ],
  };
}

export interface SplitPnrResult {
  originalPnr: string;
  newPnr: string;
  remainingPaxCount: number;
  splitPaxCount: number;
  splitPaxNames: string[];
}

export function splitGroupPnr(params: {
  originalPnr: string;
  allPassengers: string[];
  passengerIndicesToSplit: number[];
}): SplitPnrResult {
  const { originalPnr, allPassengers, passengerIndicesToSplit } = params;

  if (passengerIndicesToSplit.length === 0) {
    throw new Error('At least one passenger must be selected to split PNR.');
  }
  if (passengerIndicesToSplit.length >= allPassengers.length) {
    throw new Error('Cannot split all passengers out of the original PNR.');
  }

  const splitPaxNames = passengerIndicesToSplit.map(idx => allPassengers[idx]).filter(Boolean);
  const remainingCount = allPassengers.length - splitPaxNames.length;

  // Generate child PNR code
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newPnr = `${originalPnr.slice(0, 3)}-SPLIT-${randomSuffix}`;

  return {
    originalPnr,
    newPnr,
    remainingPaxCount: remainingCount,
    splitPaxCount: splitPaxNames.length,
    splitPaxNames,
  };
}
