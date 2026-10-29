'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { LiveAlertTicker } from '@/components/LiveAlertTicker';
import { FlightSearchBox, SearchFilters } from '@/components/FlightSearchBox';
import { FlightResultsList } from '@/components/FlightResultsList';
import { SeatMapModal } from '@/components/SeatMapModal';
import { GroupAllotmentsDesk } from '@/components/GroupAllotmentsDesk';
import { VisaAssistanceDesk } from '@/components/VisaAssistanceDesk';
import { PnrManagerDesk } from '@/components/PnrManagerDesk';
import { PassengerManifestDesk } from '@/components/PassengerManifestDesk';
import { BookingModal } from '@/components/BookingModal';
import { BackOfficeFinancialsDesk } from '@/components/BackOfficeFinancialsDesk';
import { B2cHeroSection } from '@/components/B2cHeroSection';
import { PortalMode } from '@/components/Header';
import {
  INITIAL_FLIGHTS,
  INITIAL_ALLOTMENTS,
  INITIAL_PNRS,
  Flight,
  FlightCabinOption,
  BookingPnr,
  GroupAllotmentBlock,
} from '@/lib/mock-data';
import { Currency, convertCurrency, formatPrice } from '@/lib/travel-engine';
import {
  Plane,
  Users,
  ShieldCheck,
  FileText,
  DollarSign,
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

export default function Home() {
  const [portalMode, setPortalMode] = useState<PortalMode>('B2C');
  const [currentTab, setCurrentTab] = useState<'flights' | 'allotments' | 'visas' | 'pnrs' | 'manifest' | 'backoffice'>('flights');
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [markupPercent, setMarkupPercent] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Core Data States
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [allotments, setAllotments] = useState<GroupAllotmentBlock[]>(INITIAL_ALLOTMENTS);
  const [pnrs, setPnrs] = useState<BookingPnr[]>(INITIAL_PNRS);

  // Search Filters
  const [filters, setFilters] = useState<SearchFilters>({
    origin: 'DXB',
    destination: 'JED',
    tripType: 'round-trip',
    departureDate: '2026-11-15',
    returnDate: '2026-11-25',
    paxCount: 2, // Consumer friendly default (adjustable up to large groups)
    cabinClass: 'All',
    isUmrahSpecialOnly: false,
    directOnly: true,
  });

  // Seat Map Modal
  const [seatMapFlight, setSeatMapFlight] = useState<Flight | null>(null);
  const [seatLockNotice, setSeatLockNotice] = useState<string | null>(null);

  // Booking Checkout Modal
  const [bookingFlight, setBookingFlight] = useState<{
    flight: Flight;
    cabin: FlightCabinOption;
    isGroupHold: boolean;
  } | null>(null);

  // Filter flights based on search filters
  const filteredFlights = flights.filter((fl) => {
    // If user selected origin/destination
    const matchOrigin = !filters.origin || fl.origin.code === filters.origin;
    const matchDest = !filters.destination || fl.destination.code === filters.destination;
    const matchUmrah = !filters.isUmrahSpecialOnly || fl.isUmrahSpecialRoute;
    return matchOrigin && matchDest && matchUmrah;
  });

  // Simulated live seat availability fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights((prev) =>
        prev.map((f) => {
          if (f.id === 'fl-sv-592') {
            // Randomly simulate seat booking or release
            const delta = Math.random() > 0.6 ? -1 : 0;
            const updatedCabins = f.cabins.map((c) =>
              c.cabinClass === 'Economy Saver'
                ? { ...c, availableSeats: Math.max(1, c.availableSeats + delta) }
                : c
            );
            return { ...f, cabins: updatedCabins };
          }
          return f;
        })
      );
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshGds = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Shuffle or reset availability
      setFlights([...INITIAL_FLIGHTS]);
    }, 1200);
  };

  const handleSearchClick = () => {
    setCurrentTab('flights');
  };

  const handleHoldOrBook = (flight: Flight, cabin: FlightCabinOption, isGroupHold: boolean) => {
    setBookingFlight({ flight, cabin, isGroupHold });
  };

  const handleBookingConfirmed = (newPnr: BookingPnr) => {
    setPnrs([newPnr, ...pnrs]);
    setCurrentTab('pnrs');
  };

  const handleRequestBookingFromBlock = (block: GroupAllotmentBlock) => {
    // Locate corresponding flight or create one
    const matchingFlight = flights.find((f) => f.airlineCode === block.airlineCode) || flights[0];
    const defaultCabin = matchingFlight.cabins.find((c) => c.cabinClass === 'Umrah Special') || matchingFlight.cabins[0];
    setBookingFlight({
      flight: matchingFlight,
      cabin: defaultCabin,
      isGroupHold: true,
    });
  };

  const handleSelectPackageRoute = (origin: string, destination: string, isUmrah: boolean) => {
    setFilters((prev) => ({
      ...prev,
      origin,
      destination,
      isUmrahSpecialOnly: isUmrah,
    }));
    setCurrentTab('flights');
  };

  // KPI Calculations
  const activeHolds = pnrs.filter((p) => p.status === 'ON_HOLD' || p.status === 'DEPOSIT_PAID');
  const ticketedPnrs = pnrs.filter((p) => p.status === 'TICKETED');
  const totalMarginSAR = pnrs.reduce((acc, p) => acc + p.markupSAR, 0);
  const totalMarginConverted = convertCurrency(totalMarginSAR, 'SAR', currency);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        portalMode={portalMode}
        setPortalMode={setPortalMode}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currency={currency}
        setCurrency={setCurrency}
        markupPercent={markupPercent}
        setMarkupPercent={setMarkupPercent}
        activeHoldsCount={activeHolds.length}
        issuedPnrsCount={ticketedPnrs.length}
        onRefreshData={handleRefreshGds}
        isRefreshing={isRefreshing}
      />

      {/* Live circular alert ticker */}
      <LiveAlertTicker />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Agent Operational KPIs Bar - Shown exclusively in B2B Mode */}
        {portalMode === 'B2B' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Active Group Blocks
                </span>
                <span className="text-xl font-black text-white font-mono">
                  {allotments.reduce((acc, b) => acc + b.remainingSeats, 0)} Seats
                </span>
                <span className="text-[10px] text-amber-400 block">Across 4 GCC Allotments</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Issued Group PNRs
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {ticketedPnrs.length} Confirmed
                </span>
                <span className="text-[10px] text-slate-400 block">{activeHolds.length} Holds Pending</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Agency Gross Margin
                </span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {formatPrice(totalMarginConverted, currency)}
                </span>
                <span className="text-[10px] text-emerald-400 block">Realized B2B Commission</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  GCC Visa Gateway
                </span>
                <span className="text-xl font-black text-white font-mono">99.4% Pass</span>
                <span className="text-[10px] text-emerald-400 block">Saudi &amp; Dubai GDRFA Direct</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Flights & Group Search */}
        {currentTab === 'flights' && (
          <div className="space-y-6">
            {/* Consumer Holiday & Umrah Showcase Hero (B2C Mode) */}
            {portalMode === 'B2C' && (
              <B2cHeroSection
                currency={currency}
                onSelectPackageRoute={handleSelectPackageRoute}
                onApplyVisaClick={() => setCurrentTab('visas')}
              />
            )}

            <FlightSearchBox
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearchClick}
            />

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Plane className="w-4 h-4 text-amber-400" />
                  Scheduled Airline Flights &amp; Live Seat Inventory
                </h2>
                <p className="text-xs text-slate-400">
                  Showing real-time availability for {filters.origin} ➔ {filters.destination} • {filters.paxCount} {filters.paxCount === 1 ? 'Passenger' : 'Passengers'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
                <span className="text-xs font-semibold text-amber-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                  Direct &amp; Group Availability First
                </span>
              </div>
            </div>

            <FlightResultsList
              flights={filteredFlights.length > 0 ? filteredFlights : flights}
              paxCount={filters.paxCount}
              currency={currency}
              markupPercent={markupPercent}
              portalMode={portalMode}
              onOpenSeatMap={(fl) => setSeatMapFlight(fl)}
              onHoldOrBook={handleHoldOrBook}
            />
          </div>
        )}

        {/* Tab 2: Group Allotments Desk */}
        {currentTab === 'allotments' && (
          <GroupAllotmentsDesk
            allotments={allotments}
            currency={currency}
            markupPercent={markupPercent}
            onRequestBookingFromBlock={handleRequestBookingFromBlock}
          />
        )}

        {/* Tab 3: Saudi & Dubai Visa Desk */}
        {currentTab === 'visas' && (
          <VisaAssistanceDesk currency={currency} />
        )}

        {/* Tab 4: PNRs Desk */}
        {currentTab === 'pnrs' && (
          <PnrManagerDesk
            pnrs={pnrs}
            currency={currency}
            onUpdatePnr={(updated) => {
              setPnrs(pnrs.map((p) => (p.pnr === updated.pnr ? updated : p)));
            }}
          />
        )}

        {/* Tab 5: Manifest Desk */}
        {currentTab === 'manifest' && (
          <PassengerManifestDesk />
        )}

        {/* Tab 6: Back-Office & Financials */}
        {currentTab === 'backoffice' && (
          <BackOfficeFinancialsDesk currency={currency} />
        )}
      </main>

      {/* Interactive Aircraft Seat Map Modal */}
      {seatMapFlight && (
        <SeatMapModal
          flight={seatMapFlight}
          paxCount={filters.paxCount}
          currency={currency}
          isOpen={true}
          onClose={() => setSeatMapFlight(null)}
          onConfirmSeats={(selectedSeats) => {
            setSeatLockNotice(`Selected ${selectedSeats.length} seats (${selectedSeats.join(', ')}) locked for 15 minutes!`);
            setTimeout(() => setSeatLockNotice(null), 5000);
          }}
        />
      )}

      {/* Booking Checkout Modal */}
      {bookingFlight && (
        <BookingModal
          flight={bookingFlight.flight}
          cabin={bookingFlight.cabin}
          paxCount={filters.paxCount}
          currency={currency}
          isOpen={true}
          isGroupHoldOnly={bookingFlight.isGroupHold}
          portalMode={portalMode}
          onClose={() => setBookingFlight(null)}
          onConfirmBooking={handleBookingConfirmed}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">
              AL-RAWABI TRAVEL &amp; TOURS • {portalMode === 'B2C' ? 'DIRECT TRAVELER BOOKINGS & PACKAGES' : 'B2B WHOLESALE & GDS DESK'}
            </span>
            <span>•</span>
            <span>Specialized Dubai &amp; Saudi Arabia Travel Solutions</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Amadeus &amp; NDC Direct Connected</span>
            <span>•</span>
            <span>Saudi Nusuk Integrated</span>
            <span>•</span>
            <span>Dubai GDRFA Approved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
