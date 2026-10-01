import React, { useState } from 'react';
import {
  Siren,
  Search,
  QrCode,
  Scan,
  UserPlus,
  Radio,
  Send,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Camera
} from 'lucide-react';
import {
  AmbulanceTrip,
  HealthProfile,
  SensorStatus,
  Vitals,
  User
} from '../types';
import { vitalxStore } from '../services/vitalxStore';
import { VitalsCards } from './VitalsCards';
import { ManualVitalEntryModal } from './ManualVitalEntryModal';
import { GpsAmbulanceMap } from './GpsAmbulanceMap';

interface AmbulanceDashboardProps {
  currentUser: User;
  trip: AmbulanceTrip;
  sensorStatus: SensorStatus;
  onNavigateHospital: () => void;
}

export const AmbulanceDashboard: React.FC<AmbulanceDashboardProps> = ({
  currentUser,
  trip,
  sensorStatus,
  onNavigateHospital,
}) => {
  // Identification method tabs
  const [identifyMethod, setIdentifyMethod] = useState<'ID' | 'QR' | 'FACE' | 'TEMP'>('ID');

  // Input states for patient identification
  const [healthIdInput, setHealthIdInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundPatient, setFoundPatient] = useState<HealthProfile | null>(null);

  // QR simulation states
  const [simulatedQrInput, setSimulatedQrInput] = useState('SECURE-TOKEN-VX-4821-9034-AUTH');
  const [qrScanning, setQrScanning] = useState(false);

  // Face scan states
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceResult, setFaceResult] = useState<'MATCHED' | 'NO_MATCH' | null>(null);

  // Manual vital entry modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Patient condition narrative states
  const [conditionText, setConditionText] = useState(trip.patientCondition);
  const [emergencyCategory, setEmergencyCategory] = useState<AmbulanceTrip['emergencyCategory']>(trip.emergencyCategory);
  const [additionalNotes, setAdditionalNotes] = useState(trip.additionalNotes);

  // Handover & Alert Confirmation States
  const [handoverSuccess, setHandoverSuccess] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Quick lookup of profile
  const handleSearchHealthId = () => {
    setSearchError(null);
    if (!healthIdInput.trim()) {
      setSearchError('Please enter a Health ID.');
      return;
    }

    const profile = vitalxStore.searchHealthProfileById(healthIdInput);
    if (profile) {
      setFoundPatient(profile);
      vitalxStore.updateTripProgress(trip.tripId, {
        healthId: profile.healthId,
        patientName: profile.patientName,
        isTemporary: false,
      });
    } else {
      setSearchError('Health ID not found in authorized registry.');
      setFoundPatient(null);
    }
  };

  const handleSimulateQrScan = () => {
    setQrScanning(true);
    setSearchError(null);
    setTimeout(() => {
      setQrScanning(false);
      const profile = vitalxStore.searchHealthProfileByQr(simulatedQrInput);
      if (profile) {
        setFoundPatient(profile);
        vitalxStore.updateTripProgress(trip.tripId, {
          healthId: profile.healthId,
          patientName: profile.patientName,
          isTemporary: false,
        });
      } else {
        setSearchError('Invalid or expired QR security token.');
      }
    }, 900);
  };

  const handleSimulateFaceScan = () => {
    setFaceScanning(true);
    setFaceResult(null);
    setTimeout(() => {
      setFaceScanning(false);
      // Match with active demo patient
      const profile = vitalxStore.getState().profiles[0];
      if (profile) {
        setFaceResult('MATCHED');
        setFoundPatient(profile);
        vitalxStore.updateTripProgress(trip.tripId, {
          healthId: profile.healthId,
          patientName: profile.patientName,
          isTemporary: false,
        });
      } else {
        setFaceResult('NO_MATCH');
      }
    }, 1200);
  };

  const handleCreateTemporaryId = () => {
    const temp = vitalxStore.createTemporaryPatient(
      trip.ambulanceId,
      trip.currentVitals,
      conditionText || 'Unconscious trauma patient with unknown identity',
      additionalNotes || 'Temporary emergency protocol initiated by Paramedic.'
    );
    setFoundPatient(null);
    setIdentifyMethod('ID');
  };

  const handleSendHandover = () => {
    vitalxStore.sendHandover({
      patientCondition: conditionText,
      emergencyCategory,
      additionalNotes,
    });
    setHandoverSuccess(true);
    setTimeout(() => setHandoverSuccess(false), 5000);
  };

  const handleConfirmEmergencyAlert = () => {
    vitalxStore.triggerEmergencyAlert(
      `CRITICAL CODE RED: Paramedic alert for ${trip.patientName}. Condition: ${emergencyCategory} - ${conditionText.slice(0, 70)}...`
    );
    setShowAlertModal(false);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* 8. AMBULANCE HEADER BAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  VITALX Smart Ambulance
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {trip.ambulanceId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                On-Duty Paramedic: <strong className="text-slate-200">{currentUser.name || trip.paramedicName}</strong> · Vehicle Unit ID: {trip.ambulanceId}
              </p>
            </div>
          </div>

          {/* Diagnostic Status Tickers (Clean, unboxed telemetry) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Connection:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>IoT Gateway Online</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">GPS:</span>
              <span className="text-blue-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Active 4G Lock</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sensors:</span>
              <span className="text-emerald-400 font-semibold">
                {Object.values(sensorStatus).filter(Boolean).length}/7 Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 9-12. IDENTIFY PATIENT SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Identify Patient</h2>
            <p className="text-xs text-slate-500">
              Select an identification method to retrieve authorized emergency health records
            </p>
          </div>

          {/* 4 Identification Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => { setIdentifyMethod('ID'); setSearchError(null); }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                identifyMethod === 'ID' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Enter Health ID</span>
            </button>
            <button
              onClick={() => { setIdentifyMethod('QR'); setSearchError(null); }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                identifyMethod === 'QR' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR Code</span>
            </button>
            <button
              onClick={() => { setIdentifyMethod('FACE'); setSearchError(null); }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                identifyMethod === 'FACE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Face Recognition</span>
            </button>
            <button
              onClick={() => { setIdentifyMethod('TEMP'); setSearchError(null); }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                identifyMethod === 'TEMP' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-600" />
              <span>Temporary ID</span>
            </button>
          </div>
        </div>

        {/* IDENTIFY TAB BODIES */}
        <div className="pt-5">
          {/* OPTION 1: ENTER HEALTH ID */}
          {identifyMethod === 'ID' && (
            <div className="space-y-4 max-w-xl">
              <label className="block text-xs font-semibold text-slate-700">
                Enter Patient Health ID (Format: VX-XXXX-XXXX)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={healthIdInput}
                  onChange={(e) => setHealthIdInput(e.target.value)}
                  placeholder="e.g. VX-4821-9034"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  onClick={handleSearchHealthId}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Search Patient
                </button>
              </div>

              {/* Suggestions for quick testing */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Quick Fill Demo IDs:</span>
                <button
                  onClick={() => setHealthIdInput('VX-4821-9034')}
                  className="font-mono text-blue-600 hover:underline"
                >
                  VX-4821-9034 (Alex Rivera)
                </button>
                <span>·</span>
                <button
                  onClick={() => setHealthIdInput('VX-7192-4402')}
                  className="font-mono text-blue-600 hover:underline"
                >
                  VX-7192-4402 (Maya Patel)
                </button>
              </div>

              {searchError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {searchError}
                </div>
              )}
            </div>
          )}

          {/* OPTION 2: SCAN QR CODE */}
          {identifyMethod === 'QR' && (
            <div className="space-y-4 max-w-xl">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Scan Patient Health ID QR</span>
                </div>
                <p className="text-xs text-slate-600">
                  Point the ambulance optical scanner at patient's digital Health ID card or emergency bracelet.
                </p>

                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Received QR Secure Token / Identifier:
                  </label>
                  <input
                    type="text"
                    value={simulatedQrInput}
                    onChange={(e) => setSimulatedQrInput(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSimulateQrScan}
                    disabled={qrScanning}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{qrScanning ? 'Verifying Token with Backend...' : 'Scan & Verify QR'}</span>
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {searchError}
                </div>
              )}
            </div>
          )}

          {/* OPTION 3: FACE RECOGNITION */}
          {identifyMethod === 'FACE' && (
            <div className="space-y-4 max-w-xl">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Scan className="w-4 h-4 text-blue-600" />
                    <span>Biometric Face Recognition</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Simulated Biometric Match</span>
                </div>

                <div className="w-full h-36 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-400" />
                  </div>
                  {faceScanning && (
                    <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center">
                      <div className="text-center text-xs text-blue-200 font-mono">
                        <span className="animate-spin inline-block mr-1">◐</span> Matching face vector with registry...
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleSimulateFaceScan}
                    disabled={faceScanning}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{faceScanning ? 'Searching...' : 'Scan Patient Face'}</span>
                  </button>

                  {faceResult === 'NO_MATCH' && (
                    <button
                      onClick={handleCreateTemporaryId}
                      className="text-xs text-amber-700 font-semibold hover:underline"
                    >
                      + Create Temporary ID Instead
                    </button>
                  )}
                </div>
              </div>

              {faceResult === 'MATCHED' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Face Match Found! Patient identified in registry.</span>
                </div>
              )}
              {faceResult === 'NO_MATCH' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                  No registered Health ID found for this biometric profile. Please create a Temporary ID.
                </div>
              )}
            </div>
          )}

          {/* OPTION 4: TEMPORARY ID */}
          {identifyMethod === 'TEMP' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <UserPlus className="w-4 h-4 text-amber-700" />
                <span>Create Temporary Emergency ID</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                If the patient is unconscious, disoriented, or unregistered, immediately generate a temporary emergency ID to capture vitals and send handover to the receiving hospital. Hospital staff can link this temporary record to their permanent Health ID upon identification.
              </p>
              <button
                onClick={handleCreateTemporaryId}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Generate Temporary ID (TEMP-VX-XXXXX)</span>
              </button>
            </div>
          )}

          {/* PATIENT FOUND BRIEF */}
          {foundPatient && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  Patient Identified & Authorized
                </span>
                <h3 className="text-base font-bold text-slate-900">{foundPatient.patientName}</h3>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600 font-mono">
                  <span>ID: <strong className="text-blue-700">{foundPatient.healthId}</strong></span>
                  <span>·</span>
                  <span>Blood: <strong className="text-red-700">{foundPatient.bloodGroup}</strong></span>
                  <span>·</span>
                  <span>Allergies: <strong className="text-red-700">{foundPatient.allergies.join(', ')}</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Records Synced</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 13. EMERGENCY PATIENT SCREEN - CENTRAL COMMAND */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
        {/* Emergency Patient Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Transport Assignment
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                {trip.patientName}
              </h2>
              {trip.isTemporary && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-300">
                  Temporary Unverified ID
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
              <span>Patient Ref: <strong className="text-blue-700">{trip.healthId}</strong></span>
              <span>·</span>
              <span>Ambulance Unit: <strong className="text-slate-900">{trip.ambulanceId}</strong></span>
              <span>·</span>
              <span>Paramedic: {trip.paramedicName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
              trip.status === 'REACHED'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              Status: {trip.status}
            </span>
          </div>
        </div>

        {/* Real-Time Sensor Telemetry Cards */}
        <VitalsCards
          vitals={trip.currentVitals}
          sensorStatus={sensorStatus}
          onOpenManualEntry={() => setIsManualModalOpen(true)}
          onToggleSensor={(key) => vitalxStore.toggleSensorStatus(key)}
        />

        {/* 15. GPS + Ambulance Tracking Map */}
        <GpsAmbulanceMap trip={trip} />

        {/* 16. PATIENT CONDITION & EMERGENCY NARRATIVE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Patient Condition & Incident Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Field 1: How did emergency occur? */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                How did the emergency occur?
              </label>
              <select
                value={emergencyCategory}
                onChange={(e) => setEmergencyCategory(e.target.value as AmbulanceTrip['emergencyCategory'])}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800 focus:bg-white"
              >
                <option value="Chest discomfort">Chest discomfort (Cardiac Protocol)</option>
                <option value="Accident">Accident / High-Speed Trauma</option>
                <option value="Sudden illness">Sudden illness / Stroke Signs</option>
                <option value="Breathing difficulty">Breathing difficulty / Anaphylaxis</option>
                <option value="Unconscious patient">Unconscious / Unresponsive</option>
                <option value="Other">Other Emergency</option>
              </select>
            </div>

            {/* Field 2: Describe current condition */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Describe the patient's current condition
              </label>
              <input
                type="text"
                value={conditionText}
                onChange={(e) => setConditionText(e.target.value)}
                placeholder="e.g. Sharp radiating chest discomfort, diaphoretic, conscious"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white"
              />
            </div>

            {/* Field 3: Additional paramedic notes */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Additional Paramedic Clinical Notes & Field Interventions
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Oxygen administered 3L nasal cannula, IV line 18G left antecubital, blood sample tube drawn."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 17 & 18. ACTION BUTTONS: SEND HANDOVER & EMERGENCY ALERT */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* 18. EMERGENCY ALERT BUTTON (RED, CONFIRMATION REQUIRED) */}
          <div>
            <button
              onClick={() => setShowAlertModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <AlertOctagon className="w-5 h-5 animate-pulse" />
              <span>EMERGENCY ALERT</span>
            </button>
            <span className="block text-[10px] text-slate-500 mt-1">
              Activates priority Trauma Team code red at receiving hospital
            </span>
          </div>

          {/* 17. SEND HANDOVER BUTTON */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSendHandover}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>SEND HANDOVER</span>
            </button>
          </div>
        </div>

        {/* Handover Success Toast */}
        {handoverSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Handover information sent successfully. Hospital Emergency Dept notified.</span>
            </div>
            <button
              onClick={onNavigateHospital}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              View on Hospital Screen →
            </button>
          </div>
        )}

        {/* Alert Triggered Toast */}
        {alertSuccess && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Priority Code Red Emergency Alert broadcasted to St. Jude Trauma Center!</span>
            </div>
            <button
              onClick={onNavigateHospital}
              className="text-xs font-bold text-red-800 underline"
            >
              Check Receiving Terminal →
            </button>
          </div>
        )}
      </div>

      {/* Manual Vital Entry Modal */}
      <ManualVitalEntryModal
        currentVitals={trip.currentVitals}
        sensorStatus={sensorStatus}
        staffName={currentUser.name || trip.paramedicName}
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={(manualVitals) => vitalxStore.updateCurrentVitals(manualVitals)}
        onToggleSensor={(k) => vitalxStore.toggleSensorStatus(k)}
      />

      {/* Accidental-Press Confirmation Modal for EMERGENCY ALERT */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertOctagon className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">
                Send Emergency Alert to Hospital?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will activate an immediate pulsing <strong className="text-red-700 font-bold">Priority Code Red</strong> alarm on the hospital emergency dashboard, dispatching the trauma resuscitation team to the ambulance bay.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-left text-xs font-mono text-slate-700 space-y-1">
              <div>Patient: <strong className="font-bold text-slate-900">{trip.patientName}</strong></div>
              <div>Ambulance: <strong>{trip.ambulanceId}</strong></div>
              <div>ETA: <strong>{trip.etaMinutes} min</strong></div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmergencyAlert}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Send Emergency Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
