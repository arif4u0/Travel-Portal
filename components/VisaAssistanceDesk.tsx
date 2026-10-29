'use client';

import React, { useState } from 'react';
import { ShieldCheck, FileCheck, Scan, AlertTriangle, Download, Printer, CheckCircle2, Clock, Globe, Search, UserCheck, Sparkles, X, ChevronRight, Info } from 'lucide-react';
import {
  DestinationCountry,
  SAUDI_VISA_CATEGORIES,
  UAE_VISA_CATEGORIES,
  VisaCategory,
  determineVisaEligibility,
  validatePassportExpiry,
  Currency,
  convertCurrency,
  formatPrice,
} from '@/lib/travel-engine';
import { INITIAL_VISA_APPLICATIONS, VisaApplicationRecord } from '@/lib/mock-data';
import { generateNextId } from '@/lib/id-generator';

interface VisaAssistanceDeskProps {
  currency: Currency;
}

export const VisaAssistanceDesk: React.FC<VisaAssistanceDeskProps> = ({ currency }) => {
  const [selectedCountry, setSelectedCountry] = useState<DestinationCountry>('Saudi Arabia');
  const [nationality, setNationality] = useState('United Kingdom');
  const [hasGccResidency, setHasGccResidency] = useState(false);
  const [hasUsUkSchengen, setHasUsUkSchengen] = useState(false);
  const [purpose, setPurpose] = useState<'Umrah' | 'Tourism' | 'Business' | 'Transit'>('Umrah');

  // Scanner state
  const [scannedResult, setScannedResult] = useState<{
    name: string;
    passportNumber: string;
    nationality: string;
    expiryDate: string;
    isValidExpiry: boolean;
    validityMessage: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Application desk records
  const [applications, setApplications] = useState<VisaApplicationRecord[]>(INITIAL_VISA_APPLICATIONS);
  const [viewingVisa, setViewingVisa] = useState<VisaApplicationRecord | null>(null);

  // Eligibility evaluation
  const eligibility = determineVisaEligibility({
    destination: selectedCountry,
    passportNationality: nationality,
    hasGccResidency,
    hasUsUkSchengenVisa: hasUsUkSchengen,
    purpose,
  });

  const costConverted = convertCurrency(eligibility.totalCostSAR, 'SAR', currency);
  const costFormatted = formatPrice(costConverted, currency);

  // Fast sample passport OCR simulator
  const handleSimulateScan = (sampleType: 'uk_valid' | 'uae_resident' | 'pak_umrah' | 'expired_sample') => {
    setIsScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      let sampleData = {
        name: 'John Alexander Smith',
        passportNumber: 'UK-8921094',
        nationality: 'United Kingdom',
        expiryDate: '2029-10-15',
      };

      if (sampleType === 'uae_resident') {
        sampleData = {
          name: 'Kareem Mansoor Al-Saleh',
          passportNumber: 'N-9912048',
          nationality: 'United Arab Emirates',
          expiryDate: '2028-06-30',
        };
      } else if (sampleType === 'pak_umrah') {
        sampleData = {
          name: 'Muhammad Tariq Siddiqui',
          passportNumber: 'PK-4491028',
          nationality: 'Pakistan',
          expiryDate: '2027-11-20',
        };
      } else if (sampleType === 'expired_sample') {
        sampleData = {
          name: 'David Miller',
          passportNumber: 'US-1029482',
          nationality: 'United States',
          expiryDate: '2026-11-05', // only a few days from now -> triggers invalid validity rule
        };
      }

      const val = validatePassportExpiry(sampleData.expiryDate, '2026-11-15');
      setScannedResult({
        ...sampleData,
        isValidExpiry: val.isValid,
        validityMessage: val.isValid
          ? `Passport is valid for travel (${val.monthsRemaining} months validity remaining).`
          : val.error || 'Passport fails 6-month validity check.',
      });
    }, 800);
  };

  const handleApplyFromScan = () => {
    if (!scannedResult) return;
    const uid = generateNextId('APP');
    const newRecord: VisaApplicationRecord = {
      id: `visa-${uid}`,
      applicationNumber: `VIS-${selectedCountry === 'Saudi Arabia' ? 'SA' : 'UAE'}-2026-${uid}`,
      applicantName: scannedResult.name,
      country: selectedCountry,
      visaCategoryName: eligibility.recommendedCategory.name,
      passportNumber: scannedResult.passportNumber,
      nationality: scannedResult.nationality,
      status: eligibility.isEligibleForInstantEvisa ? 'APPROVED' : 'IN_REVIEW',
      submittedDate: 'Just now',
      issuedDate: eligibility.isEligibleForInstantEvisa ? 'Instant Issue' : undefined,
      expiryDate: '2027-10-26',
      governmentReference: `${selectedCountry === 'Saudi Arabia' ? 'MOFA-SA' : 'GDRFA-DXB'}-${uid}`,
      qrCodeData: `https://verify.visa.portal/${scannedResult.passportNumber}`,
      insurancePolicyNumber: `POL-COV-${uid}`,
      feePaidSAR: eligibility.totalCostSAR,
      express: false,
    };

    setApplications([newRecord, ...applications]);
    setViewingVisa(newRecord);
    setScannedResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Country Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Dubai & Saudi Arabia Visa Assistance Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Streamlined visa eligibility checks, instant tourist & Umrah eVisa issuance, GCC resident fast-track clearance, and automated passport validity validation.
          </p>
        </div>

        {/* Country Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setSelectedCountry('Saudi Arabia');
              if (purpose === 'Tourism') setPurpose('Umrah');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              selectedCountry === 'Saudi Arabia'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🇸🇦</span>
            <span>Saudi Arabia (KSA)</span>
          </button>
          <button
            onClick={() => setSelectedCountry('United Arab Emirates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              selectedCountry === 'United Arab Emirates'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🇦🇪</span>
            <span>Dubai & UAE</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Eligibility & Document Wizard */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                Visa Eligibility & Requirements Wizard ({selectedCountry})
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                Updated MOFA/GDRFA Rules
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Passport Nationality</label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-400"
                >
                  <option value="United Kingdom">United Kingdom (Instant eVisa)</option>
                  <option value="United States">United States (Instant eVisa)</option>
                  <option value="Canada">Canada (Instant eVisa)</option>
                  <option value="Australia">Australia (Instant eVisa)</option>
                  <option value="Germany">Germany / EU (Instant eVisa)</option>
                  <option value="United Arab Emirates">United Arab Emirates (GCC Citizen)</option>
                  <option value="Pakistan">Pakistan (Umrah / eVisa)</option>
                  <option value="India">India (Umrah / GCC Resident)</option>
                  <option value="Bangladesh">Bangladesh (Umrah Package)</option>
                  <option value="Turkey">Turkey (Instant eVisa)</option>
                  <option value="Indonesia">Indonesia (Umrah Package)</option>
                  <option value="Egypt">Egypt (Umrah / Visit)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Travel Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 font-medium focus:outline-none focus:border-amber-400"
                >
                  {selectedCountry === 'Saudi Arabia' ? (
                    <>
                      <option value="Umrah">Umrah Pilgrimage & Ziyarah</option>
                      <option value="Tourism">Leisure & General Tourism</option>
                      <option value="Business">Commercial & Business Meetings</option>
                      <option value="Transit">96-Hour Stopover Transit</option>
                    </>
                  ) : (
                    <>
                      <option value="Tourism">Dubai Tourism & Leisure (30/60 Days)</option>
                      <option value="Business">Corporate Delegation & GITEX</option>
                      <option value="Transit">96-Hour Dubai Airport Layover</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Checkbox Qualifications */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 mb-5 space-y-2.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Passenger Exemptions & Qualifying Visas:
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGccResidency}
                  onChange={(e) => setHasGccResidency(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-slate-300">
                  Holds valid GCC Residency Card (UAE, Qatar, Bahrain, Kuwait, Oman) with &gt;3 months validity
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasUsUkSchengen}
                  onChange={(e) => setHasUsUkSchengen(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-slate-300">
                  Holds valid US, UK, or Schengen Business/Tourist visa (used at least once)
                </span>
              </label>
            </div>

            {/* Recommendation Result Card */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Recommended Visa Category
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {eligibility.recommendedCategory.name}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    eligibility.isEligibleForInstantEvisa
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {eligibility.isEligibleForInstantEvisa ? 'Instant Digital eVisa' : 'Electronic Processing'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                {eligibility.recommendedCategory.description}
              </p>

              {/* Breakdown Table */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">Est. Processing</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {eligibility.estimatedHours} {eligibility.estimatedHours === 1 ? 'Hour' : 'Hours'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Validity Stay</span>
                  <span className="font-semibold text-white">
                    {eligibility.recommendedCategory.durationDays} Days Stay
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Portal Rate</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {costFormatted}
                  </span>
                </div>
              </div>

              {/* Guidance Notes */}
              <div className="space-y-1 text-xs">
                {eligibility.notes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OCR Document Scanner Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scan className="w-4 h-4 text-emerald-400" />
                Intelligent Passport OCR &amp; Validity Scanner
              </h3>
              <span className="text-[10px] text-slate-400">Auto MRZ Reader</span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Simulate instant optical character recognition (OCR) of passport bio-pages. Tests for required 6-month validity compliance for Dubai and Saudi Arabia entry.
            </p>

            <div className="flex items-center gap-2 flex-wrap mb-4 text-xs">
              <span className="text-slate-500 text-[11px]">Load Sample Passport:</span>
              <button
                onClick={() => handleSimulateScan('uk_valid')}
                disabled={isScanning}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                🇬🇧 UK Citizen (Valid)
              </button>
              <button
                onClick={() => handleSimulateScan('uae_resident')}
                disabled={isScanning}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                🇦🇪 UAE Resident (Valid)
              </button>
              <button
                onClick={() => handleSimulateScan('pak_umrah')}
                disabled={isScanning}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                🇵🇰 Pakistani Pilgrim (Valid)
              </button>
              <button
                onClick={() => handleSimulateScan('expired_sample')}
                disabled={isScanning}
                className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 transition"
              >
                ⚠️ Expiring &lt;6 Months (Violation)
              </button>
            </div>

            {isScanning && (
              <div className="bg-slate-950 p-4 rounded-xl text-center text-xs text-amber-400 flex items-center justify-center gap-2">
                <span className="animate-spin">🔄</span>
                <span>Extracting Machine Readable Zone (MRZ) & verifying ICAO standards...</span>
              </div>
            )}

            {scannedResult && !isScanning && (
              <div
                className={`p-4 rounded-xl border ${
                  scannedResult.isValidExpiry
                    ? 'bg-slate-950 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-4 h-4 ${scannedResult.isValidExpiry ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <span className="font-bold text-white text-xs">{scannedResult.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      scannedResult.isValidExpiry
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {scannedResult.isValidExpiry ? 'VALID FOR TRAVEL' : 'INVALID VALIDITY'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Passport Number</span>
                    <span className="font-mono font-bold text-slate-200">{scannedResult.passportNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nationality</span>
                    <span className="text-slate-200">{scannedResult.nationality}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Expiration Date</span>
                    <span className={`font-mono font-bold ${scannedResult.isValidExpiry ? 'text-slate-200' : 'text-rose-400'}`}>
                      {scannedResult.expiryDate}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] mb-3 text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{scannedResult.validityMessage}</span>
                </div>

                {scannedResult.isValidExpiry && (
                  <button
                    onClick={handleApplyFromScan}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition active:scale-95 shadow"
                  >
                    Submit Visa Application with Scanned Bio-Data
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Applications Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Active Visa Applications Pipeline
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {applications.length} Records
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {applications.map((app) => {
                const isApproved = app.status === 'APPROVED';
                const isTasheer = app.status === 'TASHEER_APPOINTMENT';

                return (
                  <div
                    key={app.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all text-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-white font-bold block">{app.applicantName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {app.passportNumber} • {app.nationality}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isApproved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : isTasheer
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {isApproved ? 'APPROVED' : isTasheer ? 'TASHEER BIOMETRICS' : 'UNDER REVIEW'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 mb-2 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="text-slate-200 font-medium truncate max-w-[180px]">
                          {app.visaCategoryName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Govt Reference:</span>
                        <span className="font-mono text-amber-400">{app.governmentReference}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        Submitted: {app.submittedDate}
                      </span>
                      <button
                        onClick={() => setViewingVisa(app)}
                        className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <span>View Travel Voucher</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Official eVisa / Travel Voucher Preview Modal */}
      {viewingVisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Official Travel Authority &amp; eVisa Voucher
                </h3>
              </div>
              <button
                onClick={() => setViewingVisa(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Body (Print-ready look) */}
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-950/50">
              <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-md">
                {/* Authority Header */}
                <div className="flex items-center justify-between border-b pb-3 mb-3">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {viewingVisa.country === 'Saudi Arabia'
                        ? 'Kingdom of Saudi Arabia • Ministry of Foreign Affairs'
                        : 'Government of Dubai • General Directorate of Residency (GDRFA)'}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {viewingVisa.visaCategoryName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                      DIGITALLY VERIFIED
                    </span>
                  </div>
                </div>

                {/* Bio Data */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Applicant Full Name</span>
                    <span className="font-bold text-slate-900">{viewingVisa.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Passport Number</span>
                    <span className="font-mono font-bold text-slate-900">{viewingVisa.passportNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nationality</span>
                    <span className="font-semibold text-slate-800">{viewingVisa.nationality}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Visa Document Number</span>
                    <span className="font-mono font-bold text-slate-800">{viewingVisa.governmentReference}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Medical Insurance Policy</span>
                    <span className="font-mono text-slate-700">{viewingVisa.insurancePolicyNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Validity Expiry</span>
                    <span className="font-mono font-bold text-emerald-700">{viewingVisa.expiryDate || '90 Days'}</span>
                  </div>
                </div>

                {/* QR Code & Barcode */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-slate-900 rounded p-1 flex items-center justify-center text-[8px] text-white font-mono text-center">
                      [QR CODE]
                      <br />
                      VERIFIED
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Scan at airport boarding gate &amp; Smart Gates.
                      <br />
                      Issued via Al-Rawabi Travel B2B Agency API.
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block">Agency Stamp</span>
                    <span className="text-xs font-serif font-black text-amber-800 border-2 border-amber-800/40 p-1 rounded inline-block rotate-[-5deg]">
                      AL-RAWABI APPROVED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
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
                  setViewingVisa(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF Travel Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
