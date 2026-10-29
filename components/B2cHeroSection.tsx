'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Headphones,
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowRight,
  Plane,
  Clock,
  Star,
} from 'lucide-react';
import { Currency, formatPrice, convertCurrency } from '@/lib/travel-engine';

interface B2cHeroSectionProps {
  currency: Currency;
  onSelectPackageRoute: (origin: string, destination: string, isUmrah: boolean) => void;
  onApplyVisaClick: () => void;
}

export const B2cHeroSection: React.FC<B2cHeroSectionProps> = ({
  currency,
  onSelectPackageRoute,
  onApplyVisaClick,
}) => {
  const featuredPackages = [
    {
      id: 'pkg-1',
      title: 'Umrah Premium Direct Family Package',
      tag: 'Most Popular',
      tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      duration: '10 Days / 9 Nights',
      route: 'Dubai ➔ Madinah (Direct) / Return Jeddah',
      origin: 'DXB',
      dest: 'MED',
      isUmrah: true,
      priceSAR: 1850,
      rating: '4.9',
      reviews: '1,420+ Pilgrims',
      features: [
        'Direct flydubai or Saudia flights',
        'Free 5L certified Zamzam water box included',
        'Nusuk Rawdah permit assistance',
        'Official Saudi Umrah eVisa guidance',
      ],
    },
    {
      id: 'pkg-2',
      title: 'Dubai Winter City & Desert Holiday',
      tag: 'Family Special',
      tagColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      duration: '6 Days / 5 Nights',
      route: 'Riyadh or Jeddah ➔ Dubai (DXB)',
      origin: 'RUH',
      dest: 'DXB',
      isUmrah: false,
      priceSAR: 1420,
      rating: '4.8',
      reviews: '890+ Travelers',
      features: [
        'Emirates or Saudia direct flights',
        'Dubai 30-Day Tourist Visa assistance',
        'Free 2x 23kg checked baggage allowance',
        '24/7 Airport transfer & concierge support',
      ],
    },
    {
      id: 'pkg-3',
      title: 'UK & Europe to Makkah & Madinah Spiritual Journey',
      tag: 'International',
      tagColor: 'bg-blue-950 text-blue-300 border-blue-500/40',
      duration: '12 Days / 11 Nights',
      route: 'London Heathrow (LHR) ➔ Jeddah (JED)',
      origin: 'LHR',
      dest: 'JED',
      isUmrah: true,
      priceSAR: 2980,
      rating: '5.0',
      reviews: '640+ Pilgrims',
      features: [
        'Saudia Boeing 787 Dreamliner direct',
        'Instant 1-Year Multiple Entry eVisa processing',
        'Full Haramain High-Speed Train coordination',
        '5L Zamzam official baggage allowance',
      ],
    },
  ];

  return (
    <section className="space-y-6">
      {/* Consumer Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Specialized Travel Concierge: Dubai &amp; Saudi Arabia
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Book Flights, Umrah Pilgrimages &amp; Visas with Guaranteed Ease.
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Direct airline ticket search, live seat selection, transparent family &amp; group fares, and fast-track electronic visa clearance for Dubai (UAE) and Saudi Arabia (KSA).
          </p>

          {/* Consumer Trust Badges */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">IATA Certified</span>
                <span className="text-[10px] text-slate-400">Accredited Agency</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">100% Visa Support</span>
                <span className="text-[10px] text-slate-400">GDRFA &amp; MOFA Direct</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Free 5L Zamzam</span>
                <span className="text-[10px] text-slate-400">Official Box Included</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
              <Headphones className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">24/7 Concierge</span>
                <span className="text-[10px] text-slate-400">UAE &amp; KSA Toll-Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Holiday & Umrah Packages for Customers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Featured Traveler Packages &amp; Group Departures
            </h2>
            <p className="text-xs text-slate-400">
              Hand-picked flight and visa bundles with free Zamzam water and seat assignments.
            </p>
          </div>

          <button
            onClick={onApplyVisaClick}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition"
          >
            <span>Need Only a Visa? Apply Online</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredPackages.map((pkg) => {
            const convertedPrice = convertCurrency(pkg.priceSAR, 'SAR', currency);

            return (
              <div
                key={pkg.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pkg.tagColor}`}
                    >
                      {pkg.tag}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{pkg.rating}</span>
                      <span className="text-slate-500 text-[10px]">({pkg.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {pkg.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {pkg.duration}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium truncate">{pkg.route}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300 mb-4 border-t border-slate-800/80 pt-3">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">From (All-Inclusive)</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {formatPrice(convertedPrice, currency)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">/person</span>
                  </div>

                  <button
                    onClick={() => onSelectPackageRoute(pkg.origin, pkg.dest, pkg.isUmrah)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition active:scale-95 shadow flex items-center gap-1"
                  >
                    <span>View Flights</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
