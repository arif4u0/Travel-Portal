'use client';

import React, { useState } from 'react';
import { Users, Plus, Download, Printer, ShieldCheck, AlertTriangle, Trash2, CheckCircle2, FileSpreadsheet, Droplets } from 'lucide-react';
import { PassengerManifestItem, SAMPLE_UMRAH_MANIFEST } from '@/lib/mock-data';
import { validatePassportExpiry } from '@/lib/travel-engine';
import { generateNextId } from '@/lib/id-generator';

export const PassengerManifestDesk: React.FC = () => {
  const [manifest, setManifest] = useState<PassengerManifestItem[]>(SAMPLE_UMRAH_MANIFEST);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding passenger
  const [title, setTitle] = useState<'Mr' | 'Mrs' | 'Ms'>('Mr');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('United Arab Emirates');
  const [dob, setDob] = useState('1985-05-15');
  const [passportExpiry, setPassportExpiry] = useState('2028-10-20');
  const [seatPref, setSeatPref] = useState('Aisle');
  const [meal, setMeal] = useState('Halal Standard');
  const [assistance, setAssistance] = useState('None');
  const [zamzamTag, setZamzamTag] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);

  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !passportNumber) {
      setFormError('Please fill out all mandatory passenger fields.');
      return;
    }
    setFormError(null);

    const newPax: PassengerManifestItem = {
      id: generateNextId('PAX'),
      title,
      firstName,
      lastName,
      passportNumber,
      nationality,
      dob,
      passportExpiry,
      seatPreference: seatPref,
      meal,
      specialAssistance: assistance,
      zamzamTag,
      visaStatus: nationality === 'United Arab Emirates' ? 'NOT_REQUIRED' : 'APPROVED',
    };

    setManifest([...manifest, newPax]);
    setIsAddModalOpen(false);
    setFirstName('');
    setLastName('');
    setPassportNumber('');
  };

  const handleRemovePassenger = (id: string) => {
    setManifest(manifest.filter((p) => p.id !== id));
  };

  const handleExportCsv = () => {
    const headers = ['Title', 'First Name', 'Last Name', 'Passport Number', 'Nationality', 'DOB', 'Passport Expiry', 'Meal', 'Assistance', 'Zamzam Tag'];
    const rows = manifest.map((p) => [
      p.title,
      p.firstName,
      p.lastName,
      p.passportNumber,
      p.nationality,
      p.dob,
      p.passportExpiry,
      p.meal,
      p.specialAssistance,
      p.zamzamTag ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `group-passenger-manifest-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Group Passenger Manifest &amp; Roster Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Centralized manifest roster for group block allocations, Umrah charters, and Dubai corporate delegations. Automatically validates passport expiry against Gulf 6-month validity immigration regulations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95 shadow"
          >
            <Plus className="w-4 h-4" />
            Add Passenger
          </button>
        </div>
      </div>

      {/* Manifest Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">
              Current Roster: <span className="text-amber-400 font-mono">{manifest.length} Passengers</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Passports Checked against 6-Month Expiry Rule
            </span>
          </div>

          <button
            onClick={() => setManifest(SAMPLE_UMRAH_MANIFEST)}
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            Reset to Sample Umrah Roster (8 Pax)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Passenger Name</th>
                <th className="p-3.5">Passport Number</th>
                <th className="p-3.5">Nationality</th>
                <th className="p-3.5">Passport Expiry</th>
                <th className="p-3.5">Validity Status</th>
                <th className="p-3.5">Meal / Seat</th>
                <th className="p-3.5">Special Assistance</th>
                <th className="p-3.5">Zamzam Tag</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {manifest.map((pax, idx) => {
                const validity = validatePassportExpiry(pax.passportExpiry, '2026-11-15');

                return (
                  <tr key={pax.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-white block">
                        {pax.title}. {pax.firstName} {pax.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400">DOB: {pax.dob}</span>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-amber-300">
                      {pax.passportNumber}
                    </td>
                    <td className="p-3.5 text-slate-300">{pax.nationality}</td>
                    <td className="p-3.5 font-mono">{pax.passportExpiry}</td>
                    <td className="p-3.5">
                      {validity.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Valid ({validity.monthsRemaining}m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          &lt;6 Months Expiry
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="block text-slate-300">{pax.meal}</span>
                      <span className="text-[10px] text-slate-500">{pax.seatPreference}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={pax.specialAssistance !== 'None' ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                        {pax.specialAssistance}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {pax.zamzamTag ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                          <Droplets className="w-3 h-3" /> 5L Voucher
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleRemovePassenger(pax.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Remove Passenger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Passenger Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Add Passenger to Group Manifest
            </h3>
            <p className="text-slate-400 mb-4">
              Enter passenger travel document credentials as shown on passport bio-page.
            </p>

            <form onSubmit={handleAddPassenger} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Title</label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-slate-400 font-semibold mb-1">First &amp; Middle Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Last Name / Surname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Mansoor"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Passport Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. N98124501"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nationality</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  >
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="India">India</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Egypt">Egypt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Passport Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Special Assistance</label>
                  <select
                    value={assistance}
                    onChange={(e) => setAssistance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  >
                    <option value="None">None</option>
                    <option value="Wheelchair (Ramp/Steps)">Wheelchair (Ramp/Steps)</option>
                    <option value="Wheelchair (Cabin)">Wheelchair (Cabin)</option>
                    <option value="Elderly Pilgrim Escort">Elderly Pilgrim Escort</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Meal Preference</label>
                  <select
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  >
                    <option value="Halal Standard">Halal Standard</option>
                    <option value="Asian Vegetarian">Asian Vegetarian</option>
                    <option value="Low Sodium">Low Sodium</option>
                    <option value="Diabetic Meal">Diabetic Meal</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={zamzamTag}
                  onChange={(e) => setZamzamTag(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-slate-300 font-medium">
                  Attach Official 5L Zamzam Water Barcode Voucher
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Passenger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
