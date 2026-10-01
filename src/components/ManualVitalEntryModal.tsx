import React, { useState } from 'react';
import { X, Check, AlertCircle, Radio, Wifi, WifiOff } from 'lucide-react';
import { Vitals, SensorStatus } from '../types';

interface ManualVitalEntryModalProps {
  currentVitals: Vitals;
  sensorStatus: SensorStatus;
  staffName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (manualVitals: Vitals) => void;
  onToggleSensor: (sensorKey: keyof SensorStatus) => void;
}

export const ManualVitalEntryModal: React.FC<ManualVitalEntryModalProps> = ({
  currentVitals,
  sensorStatus,
  staffName,
  isOpen,
  onClose,
  onSubmit,
  onToggleSensor,
}) => {
  const [hr, setHr] = useState(currentVitals.heartRate.toString());
  const [spo2, setSpo2] = useState(currentVitals.spo2.toString());
  const [sys, setSys] = useState(currentVitals.bloodPressureSys.toString());
  const [dia, setDia] = useState(currentVitals.bloodPressureDia.toString());
  const [temp, setTemp] = useState(currentVitals.temperature.toString());
  const [rr, setRr] = useState(currentVitals.respiratoryRate.toString());
  const [glucose, setGlucose] = useState(currentVitals.bloodGlucose.toString());
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Vitals = {
      vitalId: `man_vit_${Date.now()}`,
      healthId: currentVitals.healthId,
      ambulanceId: currentVitals.ambulanceId,
      heartRate: parseInt(hr, 10) || currentVitals.heartRate,
      spo2: parseInt(spo2, 10) || currentVitals.spo2,
      bloodPressureSys: parseInt(sys, 10) || currentVitals.bloodPressureSys,
      bloodPressureDia: parseInt(dia, 10) || currentVitals.bloodPressureDia,
      temperature: parseFloat(temp) || currentVitals.temperature,
      respiratoryRate: parseInt(rr, 10) || currentVitals.respiratoryRate,
      bloodGlucose: parseInt(glucose, 10) || currentVitals.bloodGlucose,
      ecgStatus: currentVitals.ecgStatus,
      timestamp: new Date().toISOString(),
      source: 'MANUAL',
      enteredBy: staffName,
    };

    onSubmit(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Manual Vital Sign Entry</h3>
            <p className="text-xs text-slate-400">
              Paramedic override for disconnected or calibrating IoT sensors
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning label */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Entered values will be audit-logged as <strong>"Manually Entered"</strong> with your paramedic credential tag.
          </span>
        </div>

        {/* Sensor hardware toggles */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Sensor Connection Status & Hardware Diagnostics
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onToggleSensor('pulseOximeterConnected')}
              className={`p-2 rounded-lg text-xs font-semibold border flex items-center justify-between transition-colors ${
                sensorStatus.pulseOximeterConnected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
            >
              <span>SpO2/HR</span>
              {sensorStatus.pulseOximeterConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onToggleSensor('bpMonitorConnected')}
              className={`p-2 rounded-lg text-xs font-semibold border flex items-center justify-between transition-colors ${
                sensorStatus.bpMonitorConnected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
            >
              <span>NIBP Cuff</span>
              {sensorStatus.bpMonitorConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onToggleSensor('tempSensorConnected')}
              className={`p-2 rounded-lg text-xs font-semibold border flex items-center justify-between transition-colors ${
                sensorStatus.tempSensorConnected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
            >
              <span>Temp Probe</span>
              {sensorStatus.tempSensorConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onToggleSensor('glucometerConnected')}
              className={`p-2 rounded-lg text-xs font-semibold border flex items-center justify-between transition-colors ${
                sensorStatus.glucometerConnected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
            >
              <span>Glucometer</span>
              {sensorStatus.glucometerConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                min="30"
                max="250"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Oxygen SpO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                min="50"
                max="100"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Body Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                min="30"
                max="45"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">BP Systolic (mmHg)</label>
              <input
                type="number"
                value={sys}
                onChange={(e) => setSys(e.target.value)}
                min="40"
                max="260"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">BP Diastolic (mmHg)</label>
              <input
                type="number"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                min="30"
                max="160"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Resp. Rate (br/min)</label>
              <input
                type="number"
                value={rr}
                onChange={(e) => setRr(e.target.value)}
                min="6"
                max="60"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
              />
            </div>

            <div className="col-span-2 sm:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Blood Glucose (mg/dL)</label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                min="20"
                max="800"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Clinical Observations / Reason for Manual Entry
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient moved violently, automated cuff failed cycle. Manual auscultation performed with sphygmomanometer."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save Manual Vitals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
