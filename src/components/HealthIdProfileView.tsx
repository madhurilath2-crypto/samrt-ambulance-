import React, { useState } from 'react';
import {
  QrCode,
  Shield,
  Download,
  Share2,
  AlertOctagon,
  Heart,
  Pill,
  FileText,
  Clock,
  PhoneCall,
  Lock,
  Edit3,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { HealthProfile, MedicalRecord } from '../types';
import { generateQrSvgString } from '../utils/qr';
import { vitalxStore } from '../services/vitalxStore';

interface HealthIdProfileViewProps {
  profile: HealthProfile;
  medicalRecords: MedicalRecord[];
  onSimulateAmbulanceScan?: (healthId: string) => void;
  onEditProfile?: () => void;
}

export const HealthIdProfileView: React.FC<HealthIdProfileViewProps> = ({
  profile,
  medicalRecords,
  onSimulateAmbulanceScan,
}) => {
  const [activeTab, setActiveTab] = useState<'idcard' | 'history' | 'emergency' | 'security'>('idcard');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable local draft
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [allergies, setAllergies] = useState(profile.allergies.join(', '));
  const [conditions, setConditions] = useState(profile.existingConditions.join(', '));
  const [medications, setMedications] = useState(profile.medications.join(', '));
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyContacts[0]?.phone || '+1 (555) 234-8901');

  const qrSvg = generateQrSvgString(profile.qrToken, 240);

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    vitalxStore.updateHealthProfile(profile.healthId, {
      bloodGroup,
      allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
      existingConditions: conditions.split(',').map((s) => s.trim()).filter(Boolean),
      medications: medications.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyContacts: [
        { name: profile.emergencyContacts[0]?.name || 'Primary Contact', relationship: 'Next of kin', phone: emergencyPhone },
      ],
    });
    setIsEditing(false);
  };

  const downloadQrSvg = () => {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VitalX_${profile.healthId}_QR.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Identity Card Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800">
                Official Digital Health Profile
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>{profile.status}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile.patientName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>Health ID: <strong className="text-blue-400 font-mono text-sm tracking-wider">{profile.healthId}</strong></span>
              <span>·</span>
              <span>Blood Group: <strong className="text-white">{profile.bloodGroup}</strong></span>
              <span>·</span>
              <span>Registered: {profile.registrationDate}</span>
            </div>
          </div>

          {/* QR Code Quick Badge & Actions */}
          <div className="flex items-center gap-3 self-stretch md:self-auto bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div
              className="bg-white p-1 rounded-lg cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowQrModal(true)}
              title="Click to view high-res QR code"
              dangerouslySetInnerHTML={{ __html: generateQrSvgString(profile.qrToken, 72) }}
            />
            <div className="space-y-1 text-xs">
              <span className="block font-semibold text-slate-200">Emergency Access Token</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Show QR
                </button>
                <span className="text-slate-500">|</span>
                <button
                  onClick={downloadQrSvg}
                  className="text-blue-400 hover:text-blue-300 underline font-medium flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Paramedic Simulation Trigger Button */}
        {onSimulateAmbulanceScan && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400">
              Testing emergency scenario with this Health ID?
            </span>
            <button
              onClick={() => onSimulateAmbulanceScan(profile.healthId)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Simulate Ambulance Pickup with {profile.healthId}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Security Architecture Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">Security & Encryption Architecture:</p>
          <p className="text-slate-600 leading-relaxed">
            The QR code does <strong>NOT</strong> contain raw unencrypted medical records. It contains a cryptographic token (<code className="font-mono text-slate-800">{profile.qrToken.slice(0, 24)}...</code>). When scanned by authorized ambulance or hospital units, the backend verifies credentials before delivering emergency medical data.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab('idcard')}
            className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'idcard'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Digital ID Card</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Medical History ({medicalRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'emergency'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Emergency Contacts</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Biometric Linkage</span>
          </button>
        </div>

        <div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Medical Info'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ID CARD & CLINICAL OVERVIEW */}
      {activeTab === 'idcard' && (
        <div className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSaveEdits} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">Update Emergency Health Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as HealthProfile['bloodGroup'])}
                    className="w-full border rounded-lg p-2 font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Severe Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Existing Conditions</label>
                  <input
                    type="text"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Current Medications</label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Critical Alert Warning Card (e.g. Anaphylaxis risk) */}
              <div className="md:col-span-3 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-900 text-xs uppercase tracking-wider block">
                    Critical Emergency Alert
                  </span>
                  <p className="text-xs text-red-800 mt-0.5 leading-relaxed font-medium">
                    Allergies: {profile.allergies.join(' · ')}
                  </p>
                </div>
              </div>

              {/* Personal Clinical Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Personal Information</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-semibold text-slate-900">{profile.patientName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Health ID</span>
                    <span className="font-mono font-bold text-blue-700">{profile.healthId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="text-slate-800">{profile.dateOfBirth || '1988-06-14'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Blood Group</span>
                    <span className="font-bold text-red-700">{profile.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Registry Status</span>
                    <span className="text-emerald-700 font-semibold">{profile.status}</span>
                  </div>
                </div>
              </div>

              {/* Existing Conditions & Diagnoses */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Existing Conditions</h3>
                <ul className="space-y-2 text-xs">
                  {profile.existingConditions.map((cond, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span className="font-medium text-slate-800">{cond}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 pt-2">Baseline Readings</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Baseline BP</span>
                    <span className="font-mono font-semibold text-slate-800">{profile.bloodPressureBaseline || '120/80 mmHg'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Baseline Glucose</span>
                    <span className="font-mono font-semibold text-slate-800">{profile.bloodSugarBaseline || '95 mg/dL'}</span>
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Prescriptions</h3>
                <ul className="space-y-2 text-xs">
                  {profile.medications.map((med, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <Pill className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span className="font-medium text-slate-800">{med}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 block mb-1">Emergency Medical Directive</span>
                  <p className="text-xs text-slate-600 italic bg-amber-50 p-2 rounded border border-amber-200">
                    {profile.notes || 'Full code. No unverified penicillin derivatives under any circumstances.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICAL HISTORY & REPORTS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Chronological Medical Records</h3>
              <p className="text-xs text-slate-500">Authorized medical encounters, diagnoses, and lab tests</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {medicalRecords.map((rec) => (
              <div key={rec.recordId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rec.recordType === 'Allergy' ? 'bg-red-100 text-red-800' :
                        rec.recordType === 'Diagnosis' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rec.recordType}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {rec.description}
                    </p>
                    {rec.attachmentName && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium pt-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Attachment: {rec.attachmentName}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 text-xs text-slate-500 space-y-0.5">
                    <div className="flex items-center gap-1 justify-end font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{rec.date}</span>
                    </div>
                    <span className="block text-[11px] text-slate-600">{rec.hospital}</span>
                    <span className="block text-[10px] text-slate-400">{rec.createdBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY CONTACTS */}
      {activeTab === 'emergency' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Emergency Contacts & Next of Kin</h3>
          <p className="text-xs text-slate-500">First responders and trauma staff will attempt contact via these verified numbers.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {profile.emergencyContacts.map((contact, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{contact.name}</span>
                  <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                    {contact.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <a href={`tel:${contact.phone}`} className="font-mono hover:underline font-medium">
                    {contact.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BIOMETRIC LINKAGE & AUDIT */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Biometric & Identity Audit</h3>
          <p className="text-slate-600">
            Mathematical representation of registered identity credentials.
          </p>

          <div className="space-y-3 font-mono">
            <div className="bg-slate-950 text-slate-200 p-3 rounded-lg overflow-x-auto text-[11px]">
              <span className="text-slate-500 block font-sans text-xs mb-1">Face Biometric Hash:</span>
              <code>{profile.faceReference}</code>
            </div>
            <div className="bg-slate-950 text-slate-200 p-3 rounded-lg overflow-x-auto text-[11px]">
              <span className="text-slate-500 block font-sans text-xs mb-1">Encrypted QR Access Token:</span>
              <code>{profile.qrToken}</code>
            </div>
          </div>
        </div>
      )}

      {/* High-Resolution QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">VitalX Health ID QR</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
              <div
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                className="shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="font-mono text-base font-bold text-blue-700 tracking-wider">
                {profile.healthId}
              </div>
              <p className="text-xs text-slate-600 font-semibold">{profile.patientName}</p>
              <p className="text-[11px] text-slate-500">
                Scan using any VitalX Ambulance or Hospital Terminal.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={downloadQrSvg}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Save SVG</span>
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2 px-4 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
