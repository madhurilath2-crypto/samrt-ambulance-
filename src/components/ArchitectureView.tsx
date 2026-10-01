import React from 'react';
import { Cpu, Wifi, Radio, Server, Database, ShieldCheck, QrCode, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Technical Architecture & Specification
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          VitalX Real-Time IoT & Security Pipeline
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          End-to-end data pipeline connecting patient biometric identifiers, in-vehicle IoT telemetry, encrypted cloud services, and trauma center receivers.
        </p>
      </div>

      {/* 27. Real-Time Telemetry Flow Diagram */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
          Hardware & Telemetry Ingestion Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1: Medical Sensors */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-white text-sm">Medical Sensors</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Pulse Oximeter, 12-Lead ECG, NIBP Cuff, Skin Temp Probe, Continuous Blood Glucose Sensor.
            </p>
            <span className="inline-block text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
              BLE 5.2 / UART
            </span>
          </div>

          {/* Step 2: Ambulance IoT Gateway */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-white text-sm">Ambulance Gateway</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ESP32-S3 / Industrial Embedded Controller running FreeRTOS with cryptographic hardware acceleration.
            </p>
            <span className="inline-block text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono">
              Edge Filter & Sync
            </span>
          </div>

          {/* Step 3: Cellular Uplink */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
            <div className="w-8 h-8 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-white text-sm">Cellular Uplink</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Dual SIM 4G LTE-M / 5G Mobile Router with automatic failover and GPS satellite constellation receiver.
            </p>
            <span className="inline-block text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono">
              MQTT / TLS 1.3
            </span>
          </div>

          {/* Step 4: Secure Backend Service */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-white text-sm">VitalX Core Engine</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Role-Based Authentication, Health ID Registry, Real-Time WebSocket PubSub broker, and Handover validator.
            </p>
            <span className="inline-block text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              Postgres / Node.js
            </span>
          </div>

          {/* Step 5: Trauma Bay Terminal */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 text-red-400 flex items-center justify-center font-bold">
              5
            </div>
            <h3 className="font-bold text-white text-sm">Hospital ER Terminal</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Low-latency React console for attending emergency physicians, displaying live telemetry, radar & emergency alerts.
            </p>
            <span className="inline-block text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono">
              Sub-150ms Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* 26. Security & Tokenization Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Zero-Exposure QR & Face Security Model</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike legacy emergency bracelets that write raw medical histories or full names into physical barcodes, VitalX implements a <strong>zero-knowledge tokenized architecture</strong>:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
            <div className="text-slate-400">// Patient Scan Resolution Flow</div>
            <div>[QR or Face Scan] ➔ Secure Identifier Token (VX-Token)</div>
            <div>[Ambulance / Hospital] ➔ Transmits Bearer Staff Credential</div>
            <div>[Registry] ➔ Validates RBAC Permission & Audit Log</div>
            <div>[Result] ➔ Emergency Clinical Chart Permitted</div>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No personally identifiable health data stored in the QR code.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Biometric scans generate mathematical hashes, never storing raw face photos.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Strict Role-Based Access Control (RBAC) across Paramedics and Hospital Staff.</span>
            </li>
          </ul>
        </div>

        {/* 25. Database Schema Structure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Database className="w-5 h-5" />
            <span>Relational Entities & Schema Ready</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The data layer is structured for seamless plug-in into PostgreSQL, Cloud SQL, Firebase, or Supabase:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block font-sans">Users</span>
              <span className="text-slate-500 text-[10px]">userId, account, hash, role</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block font-sans">HealthProfiles</span>
              <span className="text-slate-500 text-[10px]">healthId, qrToken, faceRef</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block font-sans">Vitals</span>
              <span className="text-slate-500 text-[10px]">hr, bp, spo2, temp, source</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block font-sans">AmbulanceTrips</span>
              <span className="text-slate-500 text-[10px]">lat, lng, distance, eta, status</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block font-sans">EmergencyAlerts</span>
              <span className="text-slate-500 text-[10px]">alertId, status, ackTimestamp</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block font-sans">TemporaryPatients</span>
              <span className="text-slate-500 text-[10px]">tempId, linkPermanentHealthId</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
