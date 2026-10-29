export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  terminal?: string;
  flag: string;
}

export const AIRPORTS: Airport[] = [
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', terminal: 'T1 / T2 / T3', flag: '🇦🇪' },
  { code: 'DWC', name: 'Al Maktoum International (Dubai World Central)', city: 'Dubai', country: 'United Arab Emirates', terminal: 'Main', flag: '🇦🇪' },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', terminal: 'Terminal A', flag: '🇦🇪' },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates', terminal: 'Main', flag: '🇦🇪' },
  { code: 'JED', name: 'King Abdulaziz International (Hajj/Umrah Terminal)', city: 'Jeddah', country: 'Saudi Arabia', terminal: 'Terminal 1 / Hajj Terminal', flag: '🇸🇦' },
  { code: 'MED', name: 'Prince Mohammad Bin Abdulaziz International', city: 'Madinah', country: 'Saudi Arabia', terminal: 'Main Terminal', flag: '🇸🇦' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', terminal: 'T3 / T4 / T5', flag: '🇸🇦' },
  { code: 'DMM', name: 'King Fahd International Airport', city: 'Dammam', country: 'Saudi Arabia', terminal: 'Main', flag: '🇸🇦' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', terminal: 'T2 / T3 / T4', flag: '🇬🇧' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', terminal: 'T2 / T3', flag: '🇪🇬' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', terminal: 'Main', flag: '🇹🇷' },
  { code: 'KHI', name: 'Jinnah International Airport', city: 'Karachi', country: 'Pakistan', terminal: 'Jinnah Terminal', flag: '🇵🇰' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', terminal: 'T2', flag: '🇮🇳' },
  { code: 'DAC', name: 'Hazrat Shahjalal International', city: 'Dhaka', country: 'Bangladesh', terminal: 'T1 / T2', flag: '🇧🇩' },
];

export interface FlightCabinOption {
  cabinClass: 'Economy Saver' | 'Economy Flex' | 'Business Class' | 'Umrah Special';
  baseFareSAR: number;
  taxesSAR: number;
  availableSeats: number;
  groupSeatsRemaining: number;
  baggageAllowance: string;
  cancellationPolicy: string;
  mealIncluded: boolean;
  zamzamIncluded: boolean;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  logoColor: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  aircraft: string;
  isDirect: boolean;
  isUmrahSpecialRoute: boolean;
  cabins: FlightCabinOption[];
  liveStatus: 'ON_TIME' | 'BOARDING_SOON' | 'DELAYED_15M' | 'SEATS_DISAPPEARING';
}

export const INITIAL_FLIGHTS: Flight[] = [
  {
    id: 'fl-sv-592',
    flightNumber: 'SV 592',
    airline: 'Saudia',
    airlineCode: 'SV',
    logoColor: 'bg-emerald-900 border-emerald-700 text-emerald-100',
    origin: AIRPORTS[0], // DXB
    destination: AIRPORTS[4], // JED
    departureTime: '08:45',
    arrivalTime: '11:00',
    duration: '3h 15m',
    stops: 0,
    aircraft: 'Boeing 777-300ER',
    isDirect: true,
    isUmrahSpecialRoute: true,
    liveStatus: 'SEATS_DISAPPEARING',
    cabins: [
      {
        cabinClass: 'Economy Saver',
        baseFareSAR: 750,
        taxesSAR: 220,
        availableSeats: 4, // low
        groupSeatsRemaining: 0,
        baggageAllowance: '1x 23kg',
        cancellationPolicy: 'SAR 150 penalty',
        mealIncluded: true,
        zamzamIncluded: false,
      },
      {
        cabinClass: 'Economy Flex',
        baseFareSAR: 980,
        taxesSAR: 220,
        availableSeats: 16,
        groupSeatsRemaining: 12,
        baggageAllowance: '2x 23kg',
        cancellationPolicy: 'Free changes before 24h',
        mealIncluded: true,
        zamzamIncluded: false,
      },
      {
        cabinClass: 'Umrah Special',
        baseFareSAR: 1120,
        taxesSAR: 220,
        availableSeats: 32,
        groupSeatsRemaining: 28,
        baggageAllowance: '2x 23kg + 1x 5L Zamzam Water Box Free',
        cancellationPolicy: 'Flexible group changes, Zamzam seal included',
        mealIncluded: true,
        zamzamIncluded: true,
      },
      {
        cabinClass: 'Business Class',
        baseFareSAR: 2450,
        taxesSAR: 350,
        availableSeats: 6,
        groupSeatsRemaining: 4,
        baggageAllowance: '2x 32kg + Alfursan Lounge Access',
        cancellationPolicy: 'Fully refundable',
        mealIncluded: true,
        zamzamIncluded: true,
      },
    ],
  },
  {
    id: 'fl-ek-803',
    flightNumber: 'EK 803',
    airline: 'Emirates',
    airlineCode: 'EK',
    logoColor: 'bg-red-900 border-red-700 text-red-100',
    origin: AIRPORTS[0], // DXB
    destination: AIRPORTS[4], // JED
    departureTime: '14:20',
    arrivalTime: '16:45',
    duration: '3h 25m',
    stops: 0,
    aircraft: 'Airbus A380-800 (Double Decker)',
    isDirect: true,
    isUmrahSpecialRoute: true,
    liveStatus: 'ON_TIME',
    cabins: [
      {
        cabinClass: 'Economy Saver',
        baseFareSAR: 840,
        taxesSAR: 240,
        availableSeats: 8,
        groupSeatsRemaining: 6,
        baggageAllowance: '1x 25kg',
        cancellationPolicy: 'AED 200 fee',
        mealIncluded: true,
        zamzamIncluded: false,
      },
      {
        cabinClass: 'Economy Flex',
        baseFareSAR: 1090,
        taxesSAR: 240,
        availableSeats: 48,
        groupSeatsRemaining: 35,
        baggageAllowance: '2x 23kg',
        cancellationPolicy: 'Free date change',
        mealIncluded: true,
        zamzamIncluded: true,
      },
      {
        cabinClass: 'Umrah Special',
        baseFareSAR: 1180,
        taxesSAR: 240,
        availableSeats: 25,
        groupSeatsRemaining: 22,
        baggageAllowance: '2x 23kg + 5L Zamzam Certified',
        cancellationPolicy: 'Priority Umrah handling at JED Terminal',
        mealIncluded: true,
        zamzamIncluded: true,
      },
      {
        cabinClass: 'Business Class',
        baseFareSAR: 3200,
        taxesSAR: 420,
        availableSeats: 12,
        groupSeatsRemaining: 8,
        baggageAllowance: '40kg + Onboard Lounge Bar',
        cancellationPolicy: 'Fully refundable & priority fast track',
        mealIncluded: true,
        zamzamIncluded: true,
      },
    ],
  },
  {
    id: 'fl-fz-841',
    flightNumber: 'FZ 841',
    airline: 'flydubai',
    airlineCode: 'FZ',
    logoColor: 'bg-blue-900 border-blue-700 text-blue-100',
    origin: AIRPORTS[0], // DXB
    destination: AIRPORTS[5], // MED
    departureTime: '07:15',
    arrivalTime: '09:55',
    duration: '3h 40m',
    stops: 0,
    aircraft: 'Boeing 737 MAX 8',
    isDirect: true,
    isUmrahSpecialRoute: true,
    liveStatus: 'ON_TIME',
    cabins: [
      {
        cabinClass: 'Economy Saver',
        baseFareSAR: 620,
        taxesSAR: 180,
        availableSeats: 14,
        groupSeatsRemaining: 10,
        baggageAllowance: '1x 20kg',
        cancellationPolicy: 'Non-refundable',
        mealIncluded: false,
        zamzamIncluded: false,
      },
      {
        cabinClass: 'Economy Flex',
        baseFareSAR: 790,
        taxesSAR: 180,
        availableSeats: 30,
        groupSeatsRemaining: 24,
        baggageAllowance: '1x 30kg + Meal',
        cancellationPolicy: 'Change fee SAR 100',
        mealIncluded: true,
        zamzamIncluded: true,
      },
      {
        cabinClass: 'Umrah Special',
        baseFareSAR: 890,
        taxesSAR: 180,
        availableSeats: 40,
        groupSeatsRemaining: 36,
        baggageAllowance: '2x 23kg + 5L Zamzam direct to Madinah',
        cancellationPolicy: 'Group seat swap allowed up to 48h prior',
        mealIncluded: true,
        zamzamIncluded: true,
      },
      {
        cabinClass: 'Business Class',
        baseFareSAR: 1850,
        taxesSAR: 280,
        availableSeats: 4,
        groupSeatsRemaining: 2,
        baggageAllowance: '40kg + Lie-flat seat',
        cancellationPolicy: 'Refundable with SAR 100 fee',
        mealIncluded: true,
        zamzamIncluded: true,
      },
    ],
  },
  {
    id: 'fl-xy-224',
    flightNumber: 'XY 224',
    airline: 'Flynas',
    airlineCode: 'XY',
    logoColor: 'bg-teal-900 border-teal-700 text-teal-100',
    origin: AIRPORTS[6], // RUH
    destination: AIRPORTS[4], // JED
    departureTime: '10:30',
    arrivalTime: '12:10',
    duration: '1h 40m',
    stops: 0,
    aircraft: 'Airbus A320neo',
    isDirect: true,
    isUmrahSpecialRoute: false,
    liveStatus: 'ON_TIME',
    cabins: [
      {
        cabinClass: 'Economy Saver',
        baseFareSAR: 320,
        taxesSAR: 90,
        availableSeats: 9,
        groupSeatsRemaining: 6,
        baggageAllowance: '1x 20kg',
        cancellationPolicy: 'SAR 120 fee',
        mealIncluded: false,
        zamzamIncluded: false,
      },
      {
        cabinClass: 'Economy Flex',
        baseFareSAR: 490,
        taxesSAR: 90,
        availableSeats: 26,
        groupSeatsRemaining: 20,
        baggageAllowance: '1x 30kg',
        cancellationPolicy: 'Free change up to 12h',
        mealIncluded: true,
        zamzamIncluded: true,
      },
      {
        cabinClass: 'Business Class',
        baseFareSAR: 980,
        taxesSAR: 150,
        availableSeats: 6,
        groupSeatsRemaining: 4,
        baggageAllowance: '2x 32kg + Fast track',
        cancellationPolicy: 'Refundable',
        mealIncluded: true,
        zamzamIncluded: true,
      },
    ],
  },
  {
    id: 'fl-g9-152',
    flightNumber: 'G9 152',
    airline: 'Air Arabia',
    airlineCode: 'G9',
    logoColor: 'bg-rose-900 border-rose-700 text-rose-100',
    origin: AIRPORTS[3], // SHJ
    destination: AIRPORTS[5], // MED
    departureTime: '16:00',
    arrivalTime: '18:40',
    duration: '3h 40m',
    stops: 0,
    aircraft: 'Airbus A321neo LR',
    isDirect: true,
    isUmrahSpecialRoute: true,
    liveStatus: 'ON_TIME',
    cabins: [
      {
        cabinClass: 'Economy Saver',
        baseFareSAR: 580,
        taxesSAR: 160,
        availableSeats: 18,
        groupSeatsRemaining: 15,
        baggageAllowance: '1x 20kg',
        cancellationPolicy: 'Sharjah rebooking credit',
        mealIncluded: false,
        zamzamIncluded: false,
      },
      {
        cabinClass: 'Umrah Special',
        baseFareSAR: 760,
        taxesSAR: 160,
        availableSeats: 35,
        groupSeatsRemaining: 30,
        baggageAllowance: '1x 30kg + Free Zamzam water handling',
        cancellationPolicy: 'Group name correction free up to 3 days',
        mealIncluded: true,
        zamzamIncluded: true,
      },
    ],
  },
  {
    id: 'fl-sv-116',
    flightNumber: 'SV 116',
    airline: 'Saudia',
    airlineCode: 'SV',
    logoColor: 'bg-emerald-900 border-emerald-700 text-emerald-100',
    origin: AIRPORTS[8], // LHR
    destination: AIRPORTS[4], // JED
    departureTime: '11:15',
    arrivalTime: '19:40',
    duration: '6h 25m',
    stops: 0,
    aircraft: 'Boeing 787-9 Dreamliner',
    isDirect: true,
    isUmrahSpecialRoute: true,
    liveStatus: 'ON_TIME',
    cabins: [
      {
        cabinClass: 'Economy Saver',
        baseFareSAR: 1950,
        taxesSAR: 620,
        availableSeats: 6,
        groupSeatsRemaining: 4,
        baggageAllowance: '2x 23kg',
        cancellationPolicy: 'SAR 350 fee',
        mealIncluded: true,
        zamzamIncluded: false,
      },
      {
        cabinClass: 'Umrah Special',
        baseFareSAR: 2350,
        taxesSAR: 620,
        availableSeats: 22,
        groupSeatsRemaining: 18,
        baggageAllowance: '2x 23kg + 5L Zamzam official',
        cancellationPolicy: 'Umrah pilgrim visa delay waiver',
        mealIncluded: true,
        zamzamIncluded: true,
      },
      {
        cabinClass: 'Business Class',
        baseFareSAR: 5600,
        taxesSAR: 850,
        availableSeats: 8,
        groupSeatsRemaining: 6,
        baggageAllowance: '2x 32kg + SkyTeam Lounge Heathrow',
        cancellationPolicy: 'Fully flexible',
        mealIncluded: true,
        zamzamIncluded: true,
      },
    ],
  },
];

export interface GroupAllotmentBlock {
  id: string;
  blockCode: string;
  airline: string;
  airlineCode: string;
  route: string;
  flightNumbers: string;
  seasonName: string;
  totalSeatsContracted: number;
  allocatedSeats: number;
  remainingSeats: number;
  baseFareSAR: number;
  taxesSAR: number;
  depositPaidPct: number;
  nextPaymentDeadline: string;
  ticketingCutoff: string;
  status: 'ACTIVE' | 'WARNING_DEADLINE_APPROACHING' | 'FULLY_SOLD' | 'TICKETED';
  isUmrahBlock: boolean;
}

export const INITIAL_ALLOTMENTS: GroupAllotmentBlock[] = [
  {
    id: 'block-001',
    blockCode: 'SV-UMR-BLK-26A',
    airline: 'Saudia',
    airlineCode: 'SV',
    route: 'DXB ➔ JED (Return)',
    flightNumbers: 'SV 592 / SV 593',
    seasonName: 'Shaban & Pre-Ramadan Umrah Block',
    totalSeatsContracted: 120,
    allocatedSeats: 94,
    remainingSeats: 26,
    baseFareSAR: 880,
    taxesSAR: 220,
    depositPaidPct: 50,
    nextPaymentDeadline: '3 days remaining',
    ticketingCutoff: '2026-11-15',
    status: 'WARNING_DEADLINE_APPROACHING',
    isUmrahBlock: true,
  },
  {
    id: 'block-002',
    blockCode: 'EK-CORP-DXB-99',
    airline: 'Emirates',
    airlineCode: 'EK',
    route: 'LHR ➔ DXB (Return)',
    flightNumbers: 'EK 001 / EK 002',
    seasonName: 'Dubai Corporate & GITEX Delegation',
    totalSeatsContracted: 60,
    allocatedSeats: 48,
    remainingSeats: 12,
    baseFareSAR: 2150,
    taxesSAR: 540,
    depositPaidPct: 25,
    nextPaymentDeadline: '8 days remaining',
    ticketingCutoff: '2026-11-20',
    status: 'ACTIVE',
    isUmrahBlock: false,
  },
  {
    id: 'block-003',
    blockCode: 'FZ-MED-CHARTER-04',
    airline: 'flydubai',
    airlineCode: 'FZ',
    route: 'DXB ➔ MED (Return)',
    flightNumbers: 'FZ 841 / FZ 842',
    seasonName: 'Madinah Direct Pilgrims Block',
    totalSeatsContracted: 90,
    allocatedSeats: 72,
    remainingSeats: 18,
    baseFareSAR: 750,
    taxesSAR: 180,
    depositPaidPct: 100,
    nextPaymentDeadline: 'Manifest Due',
    ticketingCutoff: '2026-11-08',
    status: 'ACTIVE',
    isUmrahBlock: true,
  },
  {
    id: 'block-004',
    blockCode: 'XY-UMR-RAMADAN-10',
    airline: 'Flynas',
    airlineCode: 'XY',
    route: 'RUH ➔ JED (Return)',
    flightNumbers: 'XY 224 / XY 225',
    seasonName: 'Ramadan Final 10 Nights Allotment',
    totalSeatsContracted: 150,
    allocatedSeats: 142,
    remainingSeats: 8,
    baseFareSAR: 520,
    taxesSAR: 90,
    depositPaidPct: 50,
    nextPaymentDeadline: '12 days remaining',
    ticketingCutoff: '2026-11-28',
    status: 'ACTIVE',
    isUmrahBlock: true,
  },
];

export interface PassengerManifestItem {
  id: string;
  title: 'Mr' | 'Mrs' | 'Ms' | 'Master';
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  passportExpiry: string;
  seatPreference: string;
  meal: string;
  specialAssistance: string;
  zamzamTag: boolean;
  visaStatus: 'APPROVED' | 'IN_PROCESS' | 'NOT_REQUIRED' | 'NEEDS_ACTION';
}

export const SAMPLE_UMRAH_MANIFEST: PassengerManifestItem[] = [
  {
    id: 'pax-1',
    title: 'Mr',
    firstName: 'Tariq',
    lastName: 'Al-Mansoor',
    passportNumber: 'N98124501',
    nationality: 'United Arab Emirates',
    dob: '1978-05-14',
    passportExpiry: '2029-08-10',
    seatPreference: '12A (Window)',
    meal: 'Halal Standard',
    specialAssistance: 'None',
    zamzamTag: true,
    visaStatus: 'NOT_REQUIRED', // GCC citizen
  },
  {
    id: 'pax-2',
    title: 'Mrs',
    firstName: 'Amina',
    lastName: 'Al-Mansoor',
    passportNumber: 'N98124502',
    nationality: 'United Arab Emirates',
    dob: '1982-11-20',
    passportExpiry: '2029-08-10',
    seatPreference: '12B (Middle)',
    meal: 'Halal Standard',
    specialAssistance: 'None',
    zamzamTag: true,
    visaStatus: 'NOT_REQUIRED',
  },
  {
    id: 'pax-3',
    title: 'Mr',
    firstName: 'Farhan',
    lastName: 'Siddiqui',
    passportNumber: 'P20948114',
    nationality: 'Pakistan',
    dob: '1965-03-12',
    passportExpiry: '2028-04-18',
    seatPreference: '14C (Aisle)',
    meal: 'Asian Vegetarian',
    specialAssistance: 'Wheelchair (Ramp/Steps)',
    zamzamTag: true,
    visaStatus: 'APPROVED',
  },
  {
    id: 'pax-4',
    title: 'Mrs',
    firstName: 'Zainab',
    lastName: 'Siddiqui',
    passportNumber: 'P20948115',
    nationality: 'Pakistan',
    dob: '1968-07-09',
    passportExpiry: '2028-04-18',
    seatPreference: '14D (Aisle)',
    meal: 'Asian Vegetarian',
    specialAssistance: 'None',
    zamzamTag: true,
    visaStatus: 'APPROVED',
  },
  {
    id: 'pax-5',
    title: 'Mr',
    firstName: 'Bilal',
    lastName: 'Khan',
    passportNumber: 'P33019827',
    nationality: 'Pakistan',
    dob: '1992-09-30',
    passportExpiry: '2027-10-15',
    seatPreference: '15A (Window)',
    meal: 'Halal Muslim',
    specialAssistance: 'None',
    zamzamTag: true,
    visaStatus: 'APPROVED',
  },
  {
    id: 'pax-6',
    title: 'Mr',
    firstName: 'Mohammed',
    lastName: 'Rahman',
    passportNumber: 'B0019284',
    nationality: 'Bangladesh',
    dob: '1985-01-19',
    passportExpiry: '2027-09-22',
    seatPreference: '15B',
    meal: 'Halal Standard',
    specialAssistance: 'None',
    zamzamTag: true,
    visaStatus: 'IN_PROCESS',
  },
  {
    id: 'pax-7',
    title: 'Mr',
    firstName: 'Rashid',
    lastName: 'Hussain',
    passportNumber: 'P8819203',
    nationality: 'United Kingdom',
    dob: '1989-12-04',
    passportExpiry: '2030-01-05',
    seatPreference: '16C',
    meal: 'Low Sodium',
    specialAssistance: 'None',
    zamzamTag: true,
    visaStatus: 'APPROVED',
  },
  {
    id: 'pax-8',
    title: 'Mrs',
    firstName: 'Fatima',
    lastName: 'Hussain',
    passportNumber: 'P8819204',
    nationality: 'United Kingdom',
    dob: '1991-04-16',
    passportExpiry: '2030-01-05',
    seatPreference: '16D',
    meal: 'Halal Standard',
    specialAssistance: 'None',
    zamzamTag: true,
    visaStatus: 'APPROVED',
  },
];

export interface BookingPnr {
  pnr: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  route: string;
  travelDate: string;
  returnDate?: string;
  groupName: string;
  paxCount: number;
  totalClientPriceSAR: number;
  agencyNetSAR: number;
  markupSAR: number;
  depositPaidSAR: number;
  status: 'CONFIRMED' | 'ON_HOLD' | 'DEPOSIT_PAID' | 'TICKETED' | 'CANCELLED';
  expiresAt: string;
  passengers: PassengerManifestItem[];
  hasZamzamPackage: boolean;
  eTicketNumbers: string[];
}

export const INITIAL_PNRS: BookingPnr[] = [
  {
    pnr: 'SV-GRP-9821',
    airline: 'Saudia',
    airlineCode: 'SV',
    flightNumber: 'SV 592',
    route: 'DXB ➔ JED',
    travelDate: '2026-11-12',
    returnDate: '2026-11-22',
    groupName: 'Al-Noor Umrah Delegation (8 Pax)',
    paxCount: 8,
    totalClientPriceSAR: 12400,
    agencyNetSAR: 10800,
    markupSAR: 1600,
    depositPaidSAR: 12400,
    status: 'TICKETED',
    expiresAt: '2026-11-12 05:00',
    hasZamzamPackage: true,
    passengers: SAMPLE_UMRAH_MANIFEST,
    eTicketNumbers: [
      '065-49201948201', '065-49201948202', '065-49201948203', '065-49201948204',
      '065-49201948205', '065-49201948206', '065-49201948207', '065-49201948208',
    ],
  },
  {
    pnr: 'EK-DXB-4412',
    airline: 'Emirates',
    airlineCode: 'EK',
    flightNumber: 'EK 803',
    route: 'DXB ➔ JED',
    travelDate: '2026-11-18',
    returnDate: '2026-11-25',
    groupName: 'Apex Gulf Corporate Summit (24 Pax)',
    paxCount: 24,
    totalClientPriceSAR: 32600,
    agencyNetSAR: 28200,
    markupSAR: 4400,
    depositPaidSAR: 6520, // 20% deposit
    status: 'ON_HOLD',
    expiresAt: '2026-11-05 18:00',
    hasZamzamPackage: false,
    passengers: SAMPLE_UMRAH_MANIFEST.slice(0, 4),
    eTicketNumbers: [],
  },
  {
    pnr: 'FZ-MED-2209',
    airline: 'flydubai',
    airlineCode: 'FZ',
    flightNumber: 'FZ 841',
    route: 'DXB ➔ MED',
    travelDate: '2026-11-20',
    returnDate: '2026-11-30',
    groupName: 'Madinah Direct Spiritual Group',
    paxCount: 16,
    totalClientPriceSAR: 18400,
    agencyNetSAR: 16200,
    markupSAR: 2200,
    depositPaidSAR: 4600,
    status: 'DEPOSIT_PAID',
    expiresAt: '2026-11-10 12:00',
    hasZamzamPackage: true,
    passengers: SAMPLE_UMRAH_MANIFEST.slice(0, 5),
    eTicketNumbers: [],
  },
];

export interface VisaApplicationRecord {
  id: string;
  applicationNumber: string;
  applicantName: string;
  country: 'Saudi Arabia' | 'United Arab Emirates';
  visaCategoryName: string;
  passportNumber: string;
  nationality: string;
  status: 'APPROVED' | 'IN_REVIEW' | 'REQUIRES_DOCUMENTS' | 'TASHEER_APPOINTMENT';
  submittedDate: string;
  issuedDate?: string;
  expiryDate?: string;
  governmentReference: string;
  qrCodeData: string;
  insurancePolicyNumber: string;
  feePaidSAR: number;
  express: boolean;
}

export const INITIAL_VISA_APPLICATIONS: VisaApplicationRecord[] = [
  {
    id: 'visa-001',
    applicationNumber: 'VIS-SA-2026-881',
    applicantName: 'Tariq Al-Mansoor',
    country: 'Saudi Arabia',
    visaCategoryName: 'Saudi GCC Resident eVisa',
    passportNumber: 'N98124501',
    nationality: 'United Arab Emirates',
    status: 'APPROVED',
    submittedDate: '2026-10-24 09:30',
    issuedDate: '2026-10-24 10:45',
    expiryDate: '2027-10-24',
    governmentReference: 'MOFA-SA-982184-KSA',
    qrCodeData: 'https://visa.mofa.gov.sa/verify/MOFA-SA-982184-KSA',
    insurancePolicyNumber: 'TAWUNIYA-UMR-884102',
    feePaidSAR: 500,
    express: false,
  },
  {
    id: 'visa-002',
    applicationNumber: 'VIS-UAE-2026-442',
    applicantName: 'Sarah Jenkins',
    country: 'United Arab Emirates',
    visaCategoryName: 'Dubai / UAE 30-Day Tourist Visa',
    passportNumber: 'UK-78901234',
    nationality: 'United Kingdom',
    status: 'APPROVED',
    submittedDate: '2026-10-25 14:10',
    issuedDate: '2026-10-26 08:20',
    expiryDate: '2026-12-25',
    governmentReference: 'GDRFA-DXB-2026-90123',
    qrCodeData: 'https://smartservices.icp.gov.ae/verify/GDRFA-DXB-2026-90123',
    insurancePolicyNumber: 'DAMAN-TRAVEL-002914',
    feePaidSAR: 420,
    express: false,
  },
  {
    id: 'visa-003',
    applicationNumber: 'VIS-SA-2026-903',
    applicantName: 'Farhan Siddiqui & Group (12 Pax)',
    country: 'Saudi Arabia',
    visaCategoryName: 'Nusuk Umrah Package Visa',
    passportNumber: 'P20948114',
    nationality: 'Pakistan',
    status: 'IN_REVIEW',
    submittedDate: '2026-10-26 07:15',
    governmentReference: 'NUSUK-GRP-2026-4481',
    qrCodeData: 'https://nusuk.sa/verify/NUSUK-GRP-2026-4481',
    insurancePolicyNumber: 'PENDING_POLICY_ISSUANCE',
    feePaidSAR: 6000,
    express: false,
  },
  {
    id: 'visa-004',
    applicationNumber: 'VIS-UAE-2026-512',
    applicantName: 'Michael Chang',
    country: 'United Arab Emirates',
    visaCategoryName: 'Dubai 4-Hour Urgent Express Visa',
    passportNumber: 'US-55441982',
    nationality: 'United States',
    status: 'IN_REVIEW',
    submittedDate: '2026-10-26 09:20',
    governmentReference: 'GDRFA-EXPRESS-9921',
    qrCodeData: 'https://smartservices.icp.gov.ae/verify/GDRFA-EXPRESS-9921',
    insurancePolicyNumber: 'ALLIANZ-EXP-0192',
    feePaidSAR: 800,
    express: true,
  },
  {
    id: 'visa-005',
    applicationNumber: 'VIS-SA-2026-309',
    applicantName: 'Dr. Arshad Mehmood',
    country: 'Saudi Arabia',
    visaCategoryName: 'Saudi Business & Commercial Visit Visa',
    passportNumber: 'P1992044',
    nationality: 'Pakistan',
    status: 'TASHEER_APPOINTMENT',
    submittedDate: '2026-10-25 11:00',
    governmentReference: 'MOFA-COMM-44109',
    qrCodeData: 'https://tasheer.com/appointment/MOFA-COMM-44109',
    insurancePolicyNumber: 'BUPA-SA-COMM-1120',
    feePaidSAR: 830,
    express: false,
  },
];

export const LIVE_INDUSTRY_ALERTS = [
  {
    id: 'alt-1',
    timestamp: '10 mins ago',
    type: 'REGULATION',
    badge: 'Saudi MOFA',
    title: 'Umrah Visa Validity Confirmed at 90 Days',
    message: 'The Saudi Ministry of Foreign Affairs reminds all accredited B2B agencies that Umrah eVisas allow a full 90-day stay from entry date, with entry permitted through all international air, sea, and land ports.',
  },
  {
    id: 'alt-2',
    timestamp: '25 mins ago',
    type: 'AIRLINE',
    badge: 'Saudia & Flynas',
    title: 'Free 5L Zamzam Allowance Enforcement at JED Terminal 1',
    message: 'All group booking allotments must have the Zamzam barcode voucher attached to the booking PNR. Passengers can pick up their certified box at the dedicated conveyor belt before check-in.',
  },
  {
    id: 'alt-3',
    timestamp: '42 mins ago',
    type: 'VISA',
    badge: 'Dubai GDRFA',
    title: 'GCC Residents eVisa Direct Approval Window Operating at 2-Hour SLA',
    message: 'Dubai Smart Services confirms electronic tourist visa processing for GCC residency holders is operating at accelerated speed. Ensure 3-month remaining validity on residency card.',
  },
  {
    id: 'alt-4',
    timestamp: '1 hour ago',
    type: 'SCHEDULE',
    badge: 'Emirates Airline',
    title: 'Additional A380 Scheduled on Dubai (DXB) to Jeddah (JED) for Umrah Peak',
    message: 'Flight EK 803 upgraded to Airbus A380 High Density configuration, releasing 45 additional group allocation seats.',
  },
];
