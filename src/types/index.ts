/**
 * VitalX - Smart Ambulance & Emergency Health ID System
 * Core Data Models & Type Definitions
 */

export type Role = 'AMBULANCE_STAFF' | 'HOSPITAL_STAFF' | 'DEMO_USER';

export interface User {
  userId: string;
  name: string;
  accountName: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface AmbulanceStaff {
  staffId: string;
  name: string;
  ambulanceId: string;
  phone?: string;
  status: 'ON_DUTY' | 'DISPATCHED' | 'STANDBY';
}

export interface HospitalStaff {
  staffId: string;
  name: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  roleTitle: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface HealthProfile {
  healthId: string; // Format: VX-XXXX-XXXX
  userId: string;
  patientName: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  existingConditions: string[];
  medications: string[];
  emergencyContacts: EmergencyContact[];
  bloodPressureBaseline?: string;
  bloodSugarBaseline?: string;
  faceReference: string; // Token / biometric hash reference
  qrToken: string; // Secure token for QR verification
  registrationDate: string;
  status: 'ACTIVE' | 'SUSPENDED';
  notes?: string;
}

export type VitalStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface Vitals {
  vitalId: string;
  healthId: string;
  ambulanceId: string;
  heartRate: number; // bpm
  spo2: number; // %
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  temperature: number; // °C (e.g. 37.1)
  respiratoryRate: number; // breaths/min
  bloodGlucose: number; // mg/dL
  ecgStatus: 'Normal Sinus Rhythm' | 'Sinus Tachycardia' | 'Sinus Bradycardia' | 'ST Elevation' | 'Arrhythmia';
  timestamp: string;
  source: 'SENSOR' | 'MANUAL';
  enteredBy?: string;
}

export interface SensorStatus {
  ecgConnected: boolean;
  pulseOximeterConnected: boolean;
  bpMonitorConnected: boolean;
  tempSensorConnected: boolean;
  glucometerConnected: boolean;
  gatewayStatus: 'ONLINE' | 'STANDBY' | 'OFFLINE';
  gpsLock: boolean;
}

export type AmbulanceTripStatus = 'IDLE' | 'INCOMING' | 'APPROACHING' | 'REACHED';

export interface AmbulanceTrip {
  tripId: string;
  ambulanceId: string;
  paramedicStaffId: string;
  paramedicName: string;
  healthId: string;
  patientName: string;
  isTemporary: boolean;
  status: AmbulanceTripStatus;
  latitude: number;
  longitude: number;
  destinationHospitalId: string;
  destinationHospitalName: string;
  distanceKm: number;
  etaMinutes: number;
  speedKmh: number;
  startTime: string;
  arrivalTime?: string;
  patientCondition: string;
  emergencyCategory: 'Accident' | 'Sudden illness' | 'Breathing difficulty' | 'Chest discomfort' | 'Unconscious patient' | 'Other';
  additionalNotes: string;
  handoverSent: boolean;
  handoverTimestamp?: string;
  currentVitals: Vitals;
  vitalHistory: Vitals[];
}

export interface EmergencyAlert {
  alertId: string;
  tripId: string;
  ambulanceId: string;
  healthId: string;
  patientName: string;
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  etaMinutes: number;
  locationText: string;
}

export interface TemporaryPatient {
  temporaryId: string; // Format: TEMP-VX-XXXXX
  createdAt: string;
  ambulanceId: string;
  currentVitals: Vitals;
  condition: string;
  emergencyCategory: string;
  notes: string;
  linkedHealthId?: string;
  linkedAt?: string;
  linkedBy?: string;
}

export interface MedicalRecord {
  recordId: string;
  healthId: string;
  recordType: 'Diagnosis' | 'Medical Report' | 'Prescription' | 'Blood Test' | 'Blood Sugar' | 'Blood Pressure' | 'Allergy' | 'Doctor Notes';
  title: string;
  description: string;
  date: string;
  time: string;
  createdBy: string;
  hospital: string;
  attachmentName?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}
