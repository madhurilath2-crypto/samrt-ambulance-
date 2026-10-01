import React from 'react';
import { Siren, Building2, UserCircle2, ArrowRight, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';
import { Role } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
  onDirectEnter: (role: Role) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  onSelectRole,
  onDirectEnter,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Title & Tagline */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-4">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Connected Emergency Coordination Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          Who are you?
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed text-balance">
          VitalX bridges paramedics in transit, patients via secure Health IDs, and hospital trauma centers in real time. Choose your operational portal below.
        </p>
      </div>

      {/* 3 Large Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ambulance Staff */}
        <div className="group relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Siren className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-slate-900">Ambulance Staff</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Unit AMB-04</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Manage emergency patients, vitals, location and hospital handover.
            </p>

            <ul className="mt-5 space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Health ID, QR & Face lookup</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Real-time sensor telemetry & manual entry</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live GPS route & 1-click hospital handover</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Priority Emergency Alert trigger</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => onDirectEnter('AMBULANCE_STAFF')}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Launch Ambulance Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectRole('AMBULANCE_STAFF')}
              className="w-full py-1.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors text-center"
            >
              Sign In with Staff ID
            </button>
          </div>
        </div>

        {/* Card 2: Hospital Staff */}
        <div className="group relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-slate-900">Hospital Staff</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">Trauma Center</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Monitor incoming ambulances, emergencies and patient information.
            </p>

            <ul className="mt-5 space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live radar of approaching ambulances</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Emergency red alert receiver with acknowledgment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Authorized Health ID history & report updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Link temporary emergency IDs to permanent records</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => onDirectEnter('HOSPITAL_STAFF')}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Open Hospital ER Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectRole('HOSPITAL_STAFF')}
              className="w-full py-1.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors text-center"
            >
              Sign In with Hospital ID
            </button>
          </div>
        </div>

        {/* Card 3: Demo User / Patient */}
        <div className="group relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <UserCircle2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-slate-900">Demo User</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">Patient Portal</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Create a demonstration Health ID and experience the patient system.
            </p>

            <ul className="mt-5 space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Set up simulated facial recognition</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Generate unique secure Health ID (VX-XXXX-XXXX)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Display & download tokenized QR code</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Manage medical history, allergies & emergency contacts</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => onDirectEnter('DEMO_USER')}
              className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Access Patient Health ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectRole('DEMO_USER')}
              className="w-full py-1.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors text-center"
            >
              Register New Health ID
            </button>
          </div>
        </div>
      </div>

      {/* Core Principle / Architecture Callout */}
      <div className="mt-12 bg-slate-900 text-slate-200 rounded-xl p-6 shadow-inner border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">VitalX Architectural Principle</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Identify the patient quickly. Capture emergency vitals. Monitor during transport. Track GPS in real-time. Alert the trauma bay before arrival. Authorize life-critical medical history. Complete a structured digital handover.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Encrypted Zero-Pill Architecture
          </span>
        </div>
      </div>
    </div>
  );
};
