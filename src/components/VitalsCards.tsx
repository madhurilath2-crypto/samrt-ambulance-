import React from 'react';
import {
  Heart,
  Wind,
  Activity,
  Thermometer,
  Droplet,
  Gauge,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Edit,
  WifiOff,
  Wifi
} from 'lucide-react';
import { Vitals, SensorStatus, VitalStatus } from '../types';

interface VitalsCardsProps {
  vitals: Vitals;
  sensorStatus: SensorStatus;
  onOpenManualEntry: () => void;
  onToggleSensor?: (sensorKey: keyof SensorStatus) => void;
}

export const VitalsCards: React.FC<VitalsCardsProps> = ({
  vitals,
  sensorStatus,
  onOpenManualEntry,
  onToggleSensor,
}) => {
  // Helper to determine status for accessibility
  const getHrStatus = (hr: number): { status: VitalStatus; text: string } => {
    if (hr < 50 || hr > 120) return { status: 'CRITICAL', text: 'Critical Rate' };
    if (hr < 60 || hr > 100) return { status: 'WARNING', text: 'Tachycardia / Elevated' };
    return { status: 'NORMAL', text: 'Normal Sinus' };
  };

  const getSpo2Status = (spo2: number): { status: VitalStatus; text: string } => {
    if (spo2 < 90) return { status: 'CRITICAL', text: 'Severe Hypoxia' };
    if (spo2 < 95) return { status: 'WARNING', text: 'Sub-Optimal' };
    return { status: 'NORMAL', text: 'Optimal' };
  };

  const getBpStatus = (sys: number, dia: number): { status: VitalStatus; text: string } => {
    if (sys > 160 || sys < 90 || dia > 100) return { status: 'CRITICAL', text: 'Critical Range' };
    if (sys > 130 || dia > 85) return { status: 'WARNING', text: 'Hypertensive' };
    return { status: 'NORMAL', text: 'Normal Range' };
  };

  const getTempStatus = (t: number): { status: VitalStatus; text: string } => {
    if (t > 38.5 || t < 35.0) return { status: 'CRITICAL', text: 'Hyper/Hypothermia' };
    if (t > 37.5) return { status: 'WARNING', text: 'Low-Grade Fever' };
    return { status: 'NORMAL', text: 'Normothermic' };
  };

  const getRrStatus = (rr: number): { status: VitalStatus; text: string } => {
    if (rr > 26 || rr < 10) return { status: 'CRITICAL', text: 'Respiratory Distress' };
    if (rr > 20) return { status: 'WARNING', text: 'Tachypnea' };
    return { status: 'NORMAL', text: 'Regular Rate' };
  };

  const getGlucoseStatus = (gl: number): { status: VitalStatus; text: string } => {
    if (gl > 250 || gl < 60) return { status: 'CRITICAL', text: 'Hyper/Hypoglycemia' };
    if (gl > 140) return { status: 'WARNING', text: 'Elevated' };
    return { status: 'NORMAL', text: 'Euglycemic' };
  };

  const hrInfo = getHrStatus(vitals.heartRate);
  const spo2Info = getSpo2Status(vitals.spo2);
  const bpInfo = getBpStatus(vitals.bloodPressureSys, vitals.bloodPressureDia);
  const tempInfo = getTempStatus(vitals.temperature);
  const rrInfo = getRrStatus(vitals.respiratoryRate);
  const glucoseInfo = getGlucoseStatus(vitals.bloodGlucose);

  const getStatusBadge = (state: VitalStatus, label: string) => {
    if (state === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
          <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
          <span>{label}</span>
        </span>
      );
    }
    if (state === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>{label}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3 sm:p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Patient Telemetry Stream</span>
              {vitals.source === 'MANUAL' ? (
                <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-600 font-medium">
                  Manual Entry Mode
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Sensor Live Feed</span>
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Last update: {new Date(vitals.timestamp).toLocaleTimeString()}</span>
              {vitals.enteredBy && <span>· By: {vitals.enteredBy}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManualEntry}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-blue-400" />
            <span>Manual Vital Entry</span>
          </button>
        </div>
      </div>

      {/* Sensor Vitals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Heart Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Heart className={`w-4 h-4 text-red-600 ${vitals.source === 'SENSOR' ? 'animate-pulse' : ''}`} />
              <span>Heart Rate</span>
            </span>
            {sensorStatus.pulseOximeterConnected ? (
              <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5" title="Sensor Connected">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                <WifiOff className="w-3 h-3" /> Disconnected
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {vitals.heartRate}
            </span>
            <span className="text-xs font-medium text-slate-500">bpm</span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(hrInfo.status, hrInfo.text)}
            {vitals.source === 'MANUAL' && (
              <span className="text-[10px] text-amber-700 font-medium">Manual</span>
            )}
          </div>
        </div>

        {/* SpO2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Wind className="w-4 h-4 text-sky-600" />
              <span>Oxygen (SpO2)</span>
            </span>
            {sensorStatus.pulseOximeterConnected ? (
              <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                <WifiOff className="w-3 h-3" /> Disconnected
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {vitals.spo2}
            </span>
            <span className="text-xs font-medium text-slate-500">%</span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(spo2Info.status, spo2Info.text)}
            {vitals.source === 'MANUAL' && (
              <span className="text-[10px] text-amber-700 font-medium">Manual</span>
            )}
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Gauge className="w-4 h-4 text-indigo-600" />
              <span>Blood Pressure</span>
            </span>
            {sensorStatus.bpMonitorConnected ? (
              <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5">
                <Wifi className="w-3 h-3" /> NIBP
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                <WifiOff className="w-3 h-3" /> Off
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {vitals.bloodPressureSys}/{vitals.bloodPressureDia}
            </span>
            <span className="text-xs font-medium text-slate-500">mmHg</span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(bpInfo.status, bpInfo.text)}
            {vitals.source === 'MANUAL' && (
              <span className="text-[10px] text-amber-700 font-medium">Manual</span>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span>Body Temp</span>
            </span>
            {sensorStatus.tempSensorConnected ? (
              <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-0.5">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                <WifiOff className="w-3 h-3" /> Off
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {vitals.temperature.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500">°C</span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(tempInfo.status, tempInfo.text)}
            {vitals.source === 'MANUAL' && (
              <span className="text-[10px] text-amber-700 font-medium">Manual</span>
            )}
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Resp. Rate</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">Impedance</span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {vitals.respiratoryRate}
            </span>
            <span className="text-xs font-medium text-slate-500">br/min</span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(rrInfo.status, rrInfo.text)}
            {vitals.source === 'MANUAL' && (
              <span className="text-[10px] text-amber-700 font-medium">Manual</span>
            )}
          </div>
        </div>

        {/* Blood Glucose */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Droplet className="w-4 h-4 text-purple-600" />
              <span>Blood Glucose</span>
            </span>
            {sensorStatus.glucometerConnected ? (
              <span className="text-[10px] text-emerald-700 font-mono">BLE Sync</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">Manual Strip</span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {vitals.bloodGlucose}
            </span>
            <span className="text-xs font-medium text-slate-500">mg/dL</span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(glucoseInfo.status, glucoseInfo.text)}
            {vitals.source === 'MANUAL' && (
              <span className="text-[10px] text-amber-700 font-medium">Manual</span>
            )}
          </div>
        </div>

        {/* ECG Telemetry Status */}
        <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-slate-900 text-white rounded-xl p-4 shadow-xs flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>12-Lead Rhythm Telemetry</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              LEAD II ACTIVE
            </span>
          </div>

          {/* Mini simulated ECG waveform */}
          <div className="py-2">
            <svg className="w-full h-10 text-emerald-400" viewBox="0 0 300 40" fill="none">
              <path
                d="M0,20 L50,20 L55,20 L60,10 L65,32 L70,5 L75,28 L80,20 L130,20 L135,20 L140,10 L145,32 L150,5 L155,28 L160,20 L210,20 L215,20 L220,10 L225,32 L230,5 L235,28 L240,20 L300,20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">{vitals.ecgStatus}</span>
            <span className="text-[11px] text-slate-400">ST Dev: +0.4mm (Borderline)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
