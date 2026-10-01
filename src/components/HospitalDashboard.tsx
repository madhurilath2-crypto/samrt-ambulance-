import React, { useState } from 'react';
import {
  Building2,
  AlertOctagon,
  CheckCircle2,
  Siren,
  Clock,
  Heart,
  Wind,
  Gauge,
  MapPin,
  Search,
  QrCode,
  FilePlus,
  Link as LinkIcon,
  ShieldCheck,
  Check,
  Calendar,
  User,
  Activity,
  ChevronRight,
  Download,
  FileText,
  AlertTriangle
} from 'lucide-react';
import {
  AmbulanceTrip,
  EmergencyAlert,
  HealthProfile,
  MedicalRecord,
  TemporaryPatient,
  User as UserType
} from '../types';
import { vitalxStore } from '../services/vitalxStore';

interface HospitalDashboardProps {
  currentUser: UserType;
  activeTrip: AmbulanceTrip;
  alerts: EmergencyAlert[];
  profiles: HealthProfile[];
  temporaryPatients: TemporaryPatient[];
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  currentUser,
  activeTrip,
  alerts,
  profiles,
  temporaryPatients,
}) => {
  // Navigation tabs: 'dashboard' | 'incoming' | 'healthid' | 'reports' | 'templink' | 'alerts'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'incoming' | 'healthid' | 'reports' | 'templink' | 'alerts'>('dashboard');

  // Search & Patient view
  const [searchHealthId, setSearchHealthId] = useState('');
  const [searchedProfile, setSearchedProfile] = useState<HealthProfile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // QR scan in hospital
  const [qrTokenInput, setQrTokenInput] = useState('SECURE-TOKEN-VX-4821-9034-AUTH');
  const [qrScannedSuccess, setQrScannedSuccess] = useState(false);

  // New Medical Record Form state
  const [recType, setRecType] = useState<MedicalRecord['recordType']>('Diagnosis');
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recSeverity, setRecSeverity] = useState<MedicalRecord['severity']>('MEDIUM');
  const [recAttachment, setRecAttachment] = useState('');
  const [recSuccessMessage, setRecSuccessMessage] = useState<string | null>(null);

  // Temp ID linking
  const [selectedTempId, setSelectedTempId] = useState<string>('');
  const [targetPermanentId, setTargetPermanentId] = useState<string>('VX-4821-9034');
  const [linkSuccessMessage, setLinkSuccessMessage] = useState<string | null>(null);

  // Get active priority emergency alert if any
  const activeAlert = alerts.find(a => a.status === 'ACTIVE');

  const handleAcknowledgeAlert = (alertId: string) => {
    vitalxStore.acknowledgeAlert(alertId, currentUser.name || 'Dr. Sarah Chen');
  };

  const handleSearchPatient = () => {
    setSearchError(null);
    if (!searchHealthId.trim()) {
      setSearchError('Please input a valid Health ID (e.g. VX-4821-9034)');
      return;
    }

    const profile = vitalxStore.searchHealthProfileById(searchHealthId);
    if (profile) {
      setSearchedProfile(profile);
    } else {
      setSearchError('Health ID not found in registry.');
      setSearchedProfile(null);
    }
  };

  const handleHospitalQrScan = () => {
    setQrScannedSuccess(false);
    const profile = vitalxStore.searchHealthProfileByQr(qrTokenInput);
    if (profile) {
      setSearchedProfile(profile);
      setSearchHealthId(profile.healthId);
      setQrScannedSuccess(true);
      setTimeout(() => setQrScannedSuccess(false), 4000);
    } else {
      setSearchError('Invalid QR Token.');
    }
  };

  const handleSaveMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim() || !recDesc.trim()) return;

    const targetId = searchedProfile ? searchedProfile.healthId : activeTrip.healthId;

    vitalxStore.addMedicalRecord({
      healthId: targetId,
      recordType: recType,
      title: recTitle,
      description: recDesc,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdBy: currentUser.name || 'Hospital ER Attending',
      hospital: 'St. Jude Metropolitan Trauma Center',
      attachmentName: recAttachment || undefined,
      severity: recSeverity,
    });

    setRecTitle('');
    setRecDesc('');
    setRecAttachment('');
    setRecSuccessMessage(`Medical record saved to patient file (${targetId})`);
    setTimeout(() => setRecSuccessMessage(null), 4000);
  };

  const handleLinkTempToPermanent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTempId || !targetPermanentId) return;

    const ok = vitalxStore.linkTemporaryPatient(selectedTempId, targetPermanentId, currentUser.name || 'Dr. Sarah Chen');
    if (ok) {
      setLinkSuccessMessage(`Temporary emergency file ${selectedTempId} successfully merged into ${targetPermanentId}`);
      setTimeout(() => setLinkSuccessMessage(null), 5000);
    }
  };

  // Get records for displayed patient
  const currentPatientRecords = searchedProfile
    ? vitalxStore.getMedicalRecords(searchedProfile.healthId)
    : vitalxStore.getMedicalRecords(activeTrip.healthId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* 20. EMERGENCY ALERT AREA */}
      {activeAlert ? (
        <div className="bg-red-600 text-white rounded-2xl p-5 shadow-lg border-2 border-red-400 animate-emergency">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white text-red-600 flex items-center justify-center shrink-0 shadow-md">
                <AlertOctagon className="w-7 h-7 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest bg-red-800 px-2.5 py-0.5 rounded text-red-100">
                    Priority Code Red
                  </span>
                  <span className="text-xs text-red-200 font-mono">
                    Received {new Date(activeAlert.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  EMERGENCY ALERT: {activeAlert.patientName}
                </h2>
                <p className="text-xs text-red-100 font-medium max-w-2xl leading-relaxed">
                  {activeAlert.message}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-red-200 font-mono pt-1">
                  <span>Ambulance: <strong className="text-white">{activeAlert.ambulanceId}</strong></span>
                  <span>·</span>
                  <span>ETA: <strong className="text-white text-sm underline">{activeAlert.etaMinutes} MIN</strong></span>
                  <span>·</span>
                  <span>Location: {activeAlert.locationText}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleAcknowledgeAlert(activeAlert.alertId)}
                className="w-full md:w-auto px-6 py-3 bg-white hover:bg-red-50 text-red-700 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <span>ACKNOWLEDGE ALERT</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normal State */
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
              Trauma Bay Status:
            </span>
            <span className="font-medium text-slate-700">No Active Emergency Alert · Monitoring Telemetry</span>
          </div>
          {alerts.length > 0 && alerts[0].status === 'ACKNOWLEDGED' && (
            <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
              Last alert acknowledged by {alerts[0].acknowledgedBy} at{' '}
              {alerts[0].acknowledgedAt ? new Date(alerts[0].acknowledgedAt).toLocaleTimeString() : 'Earlier'}
            </div>
          )}
        </div>
      )}

      {/* Hospital ER Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Hospital Emergency Dashboard
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  St. Jude Metropolitan Trauma Center
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff: <strong className="text-slate-200">{currentUser.name || 'Dr. Sarah Chen'}</strong> · Department: Emergency & Critical Care
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Incoming Ambulances: <strong className="text-white text-sm">{activeTrip.status !== 'REACHED' ? 1 : 0} Active</strong></span>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap items-center gap-1 sm:gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'dashboard'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'incoming'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Siren className="w-4 h-4" />
          <span>Incoming Ambulances ({activeTrip.status !== 'REACHED' ? 1 : 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('healthid')}
          className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'healthid'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Patient Health IDs</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FilePlus className="w-4 h-4" />
          <span>Update Medical Records</span>
        </button>

        <button
          onClick={() => setActiveTab('templink')}
          className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'templink'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Link Temporary ID</span>
        </button>
      </div>

      {/* 19. TAB 1: DASHBOARD OVERVIEW - INCOMING AMBULANCE CARDS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Active Inbound Emergency Transport
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Auto-refreshing via IoT WebSocket · High Frequency
            </span>
          </div>

          {/* Incoming Ambulance Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  <Siren className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Ambulance {activeTrip.ambulanceId}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                      activeTrip.status === 'REACHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeTrip.status === 'APPROACHING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {activeTrip.status}
                    </span>
                    {activeTrip.handoverSent && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border">
                        Handover: Received
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Patient: <strong className="text-slate-800 font-semibold">{activeTrip.patientName}</strong> · Health ID: <span className="font-mono text-blue-600">{activeTrip.healthId}</span>
                  </p>
                </div>
              </div>

              {/* Arrival indicator */}
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">ESTIMATED ARRIVAL</span>
                <span className={`text-2xl font-black font-mono tabular-nums ${
                  activeTrip.status === 'REACHED'
                    ? 'text-emerald-600'
                    : activeTrip.etaMinutes <= 2
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}>
                  {activeTrip.status === 'REACHED' ? 'REACHED' : `${activeTrip.etaMinutes} min`}
                </span>
              </div>
            </div>

            {/* Quick Live Vitals Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Heart Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {activeTrip.currentVitals.heartRate}
                  </span>
                  <span className="text-slate-500">bpm</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Oxygen (SpO2)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {activeTrip.currentVitals.spo2}%
                  </span>
                  <span className="text-emerald-700 text-[10px]">Optimal</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Blood Pressure</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {activeTrip.currentVitals.bloodPressureSys}/{activeTrip.currentVitals.bloodPressureDia}
                  </span>
                  <span className="text-slate-500">mmHg</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Location & Distance</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold font-mono text-slate-900">
                    {activeTrip.distanceKm.toFixed(1)} km away
                  </span>
                </div>
              </div>
            </div>

            {/* Condition and notes from Handover */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-700 block">Emergency Handover Assessment:</span>
              <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                <strong className="text-slate-900">{activeTrip.emergencyCategory}:</strong> {activeTrip.patientCondition}
              </p>
              {activeTrip.additionalNotes && (
                <p className="text-slate-500 italic pt-1 text-[11px]">
                  Paramedic Notes: {activeTrip.additionalNotes}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Handover time: {activeTrip.handoverTimestamp ? new Date(activeTrip.handoverTimestamp).toLocaleTimeString() : 'Transmitted'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prof = vitalxStore.searchHealthProfileById(activeTrip.healthId);
                    if (prof) setSearchedProfile(prof);
                    setActiveTab('healthid');
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Health ID History</span>
                </button>

                <button
                  onClick={() => setActiveTab('incoming')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Detailed Telemetry Radar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 21. TAB 2: DETAILED INCOMING AMBULANCE TRACKING */}
      {activeTab === 'incoming' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Tracking Ambulance {activeTrip.ambulanceId}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                  activeTrip.status === 'REACHED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {activeTrip.status === 'REACHED' ? 'Ambulance Reached Hospital' : 'INCOMING EN ROUTE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Destination: St. Jude Metropolitan Trauma Bay 1 · Lead Paramedic: {activeTrip.paramedicName}
              </p>
            </div>

            {/* If reached, preserve final metrics */}
            {activeTrip.status === 'REACHED' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ambulance Reached Hospital · Patient In Triage</span>
              </div>
            ) : (
              <button
                onClick={() => vitalxStore.setTripStatus('REACHED')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                title="Simulate ambulance docking at trauma bay"
              >
                Simulate Arrival ("REACHED")
              </button>
            )}
          </div>

          {/* Telemetry and Vital History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Transmitted Telemetry
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">HEART RATE</span>
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {activeTrip.currentVitals.heartRate} bpm
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                    Rhythm: {activeTrip.currentVitals.ecgStatus}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">BLOOD PRESSURE</span>
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {activeTrip.currentVitals.bloodPressureSys}/{activeTrip.currentVitals.bloodPressureDia}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                    MAP: {Math.round((activeTrip.currentVitals.bloodPressureSys + 2 * activeTrip.currentVitals.bloodPressureDia) / 3)} mmHg
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">PULSE OXIMETRY</span>
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {activeTrip.currentVitals.spo2}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Source: {activeTrip.currentVitals.source}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">BODY TEMPERATURE</span>
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {activeTrip.currentVitals.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Normothermic
                  </span>
                </div>
              </div>

              {/* Handover Payload Container */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Structured Digital Handover Payload:</span>
                <div className="space-y-1 text-slate-600">
                  <div><strong>Condition:</strong> {activeTrip.patientCondition}</div>
                  <div><strong>Emergency Category:</strong> {activeTrip.emergencyCategory}</div>
                  <div><strong>Additional Notes:</strong> {activeTrip.additionalNotes}</div>
                  <div><strong>GPS Coordinates:</strong> {activeTrip.latitude.toFixed(4)}, {activeTrip.longitude.toFixed(4)}</div>
                  <div><strong>ETA:</strong> {activeTrip.etaMinutes} minutes remaining</div>
                </div>
              </div>
            </div>

            {/* Vital Trend History Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pre-Hospital Vital Log (In-Transit Readings)
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">HR</th>
                      <th className="py-2.5 px-3">BP</th>
                      <th className="py-2.5 px-3">SpO2</th>
                      <th className="py-2.5 px-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {activeTrip.vitalHistory.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500">
                          {new Date(v.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">{v.heartRate}</td>
                        <td className="py-2 px-3">{v.bloodPressureSys}/{v.bloodPressureDia}</td>
                        <td className="py-2 px-3">{v.spo2}%</td>
                        <td className="py-2 px-3 font-sans text-[11px] text-slate-500">{v.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 22 & 23. TAB 3: SEARCH PATIENT HEALTH ID & QR ACCESS */}
      {activeTab === 'healthid' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Search Patient Health ID & QR Access</h2>
            <p className="text-xs text-slate-500">
              Verify authorized patient identification to access historical medical charts, anaphylaxis alerts, and prior encounters.
            </p>
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input 1: By Health ID */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Lookup by Health ID (VX-XXXX-XXXX)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchHealthId}
                  onChange={(e) => setSearchHealthId(e.target.value)}
                  placeholder="e.g. VX-4821-9034"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                />
                <button
                  onClick={handleSearchPatient}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm"
                >
                  Search
                </button>
              </div>

              {/* Sample IDs */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Quick lookup:</span>
                <button
                  onClick={() => { setSearchHealthId('VX-4821-9034'); }}
                  className="text-blue-600 underline font-mono"
                >
                  VX-4821-9034
                </button>
                <span>·</span>
                <button
                  onClick={() => { setSearchHealthId('VX-7192-4402'); }}
                  className="text-blue-600 underline font-mono"
                >
                  VX-7192-4402
                </button>
              </div>
            </div>

            {/* Input 2: Scan Health ID QR */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Scan Health ID QR Token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrTokenInput}
                  onChange={(e) => setQrTokenInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                />
                <button
                  onClick={handleHospitalQrScan}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Verify QR</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                Tokens are cryptographically verified against the Central Health ID Registry.
              </div>
            </div>
          </div>

          {searchError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {searchError}
            </div>
          )}

          {qrScannedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
              QR Token verified successfully! Hospital ER staff authorized for full emergency profile.
            </div>
          )}

          {/* Searched Patient Clinical View */}
          {searchedProfile && (
            <div className="border-t border-slate-200 pt-6 space-y-6">
              {/* Header profile */}
              <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                    Authorized Patient Health Record
                  </span>
                  <h3 className="text-xl font-bold">{searchedProfile.patientName}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                    <span>ID: <strong className="text-blue-300">{searchedProfile.healthId}</strong></span>
                    <span>·</span>
                    <span>DOB: {searchedProfile.dateOfBirth}</span>
                    <span>·</span>
                    <span>Blood: <strong className="text-white">{searchedProfile.bloodGroup}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded-lg border border-emerald-700 font-semibold">
                    Authorization: LEVEL-1 ER ACCESS
                  </span>
                </div>
              </div>

              {/* Critical Allergies & Conditions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Allergies */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-2">
                  <span className="font-bold text-red-900 uppercase block">Documented Allergies</span>
                  <ul className="space-y-1">
                    {searchedProfile.allergies.map((a, i) => (
                      <li key={i} className="text-red-800 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Existing Conditions */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <span className="font-bold text-slate-800 uppercase block">Existing Conditions</span>
                  <ul className="space-y-1">
                    {searchedProfile.existingConditions.map((c, i) => (
                      <li key={i} className="text-slate-700 font-medium">
                        • {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Active Medications */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <span className="font-bold text-slate-800 uppercase block">Current Medications</span>
                  <ul className="space-y-1">
                    {searchedProfile.medications.map((m, i) => (
                      <li key={i} className="text-slate-700 font-medium">
                        • {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Chronological Medical Records Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chronological Medical History & Previous Diagnostics
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Record Title & Findings</th>
                        <th className="py-2.5 px-3">Provider / Hospital</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentPatientRecords.map((r) => (
                        <tr key={r.recordId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">{r.date}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {r.recordType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{r.title}</div>
                            <p className="text-slate-600 mt-0.5 line-clamp-2">{r.description}</p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            <div>{r.hospital}</div>
                            <div className="text-[10px] text-slate-400">{r.createdBy}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 24. TAB 4: UPDATE MEDICAL RECORDS / REPORT UPLOAD */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">Update Medical Records</h2>
            <p className="text-xs text-slate-500">
              Add doctor clinical notes, post-emergency diagnosis, prescriptions, or laboratory reports.
            </p>
          </div>

          {recSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{recSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveMedicalRecord} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Patient Health ID</label>
                <input
                  type="text"
                  disabled
                  value={searchedProfile ? searchedProfile.healthId : activeTrip.healthId}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 font-mono text-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Record Type</label>
                <select
                  value={recType}
                  onChange={(e) => setRecType(e.target.value as MedicalRecord['recordType'])}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white font-semibold"
                >
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Medical Report">Medical Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Blood Sugar">Blood Sugar Log</option>
                  <option value="Blood Pressure">Blood Pressure Reading</option>
                  <option value="Allergy">Allergy Update</option>
                  <option value="Doctor Notes">Doctor Clinical Notes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Record Title / Headline</label>
              <input
                type="text"
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                placeholder="e.g. Non-STEMI Cardiac Event Confirmed, Troponin-I Peak 1.4 ng/mL"
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Clinical Description & Treatment Protocol</label>
              <textarea
                rows={3}
                value={recDesc}
                onChange={(e) => setRecDesc(e.target.value)}
                placeholder="Detailed documentation of findings, diagnostic results, medication orders, and disposition..."
                className="w-full border border-slate-300 rounded-lg p-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical Severity</label>
                <select
                  value={recSeverity}
                  onChange={(e) => setRecSeverity(e.target.value as MedicalRecord['severity'])}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="LOW">Routine / Low Severity</option>
                  <option value="MEDIUM">Moderate / Monitoring Required</option>
                  <option value="HIGH">High Severity / Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Attachment (Simulated PDF/DICOM)</label>
                <input
                  type="text"
                  value={recAttachment}
                  onChange={(e) => setRecAttachment(e.target.value)}
                  placeholder="e.g. ecg_12lead_st_jude.pdf"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                <span>Save Medical Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: LINK TEMPORARY ID TO PERMANENT HEALTH ID */}
      {activeTab === 'templink' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-slate-900">Link Temporary Emergency ID to Permanent Profile</h2>
            <p className="text-xs text-slate-500">
              When an unidentified patient arrives with a temporary ID (TEMP-VX-XXXXX), authorized hospital staff can attach their emergency vitals and handover record to their permanent Health ID.
            </p>
          </div>

          {linkSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{linkSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleLinkTempToPermanent} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Temporary Patient Record</label>
              {temporaryPatients.length > 0 ? (
                <select
                  value={selectedTempId}
                  onChange={(e) => setSelectedTempId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold bg-white"
                >
                  <option value="">-- Choose Temporary ID --</option>
                  {temporaryPatients.map((tp) => (
                    <option key={tp.temporaryId} value={tp.temporaryId}>
                      {tp.temporaryId} · Created {new Date(tp.createdAt).toLocaleTimeString()} ({tp.condition.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                  No temporary patients currently unlinked. (You can generate one from the Ambulance Console).
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Permanent Health ID</label>
              <input
                type="text"
                value={targetPermanentId}
                onChange={(e) => setTargetPermanentId(e.target.value)}
                placeholder="e.g. VX-4821-9034"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!selectedTempId || !targetPermanentId}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Merge & Link Emergency Encounter</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
