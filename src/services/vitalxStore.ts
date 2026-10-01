/**
 * VitalX Central Store & Mock Backend Service
 * Handles persistence, live simulation, role authentication, and real-time state
 */

import {
  User,
  AmbulanceStaff,
  HospitalStaff,
  HealthProfile,
  MedicalRecord,
  Vitals,
  AmbulanceTrip,
  EmergencyAlert,
  TemporaryPatient,
  SensorStatus
} from '../types';

const STORAGE_KEY = 'vitalx_emergency_system_v1';

// Seed Initial Data
const SEED_USERS: User[] = [
  {
    userId: 'usr_amb_1',
    name: 'Marcus Vance',
    accountName: 'marcus.vance',
    passwordHash: 'demo123',
    role: 'AMBULANCE_STAFF',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    userId: 'usr_hosp_1',
    name: 'Dr. Sarah Chen',
    accountName: 'sarah.chen',
    passwordHash: 'demo123',
    role: 'HOSPITAL_STAFF',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    userId: 'usr_demo_1',
    name: 'Alex Rivera',
    accountName: 'alex.rivera',
    passwordHash: 'demo123',
    role: 'DEMO_USER',
    createdAt: '2026-02-01T10:00:00Z',
  },
];

const SEED_AMBULANCE_STAFF: AmbulanceStaff = {
  staffId: 'AMB-STAFF-104',
  name: 'Marcus Vance',
  ambulanceId: 'AMB-04',
  phone: '+1 (555) 789-0123',
  status: 'DISPATCHED',
};

const SEED_HOSPITAL_STAFF: HospitalStaff = {
  staffId: 'HOSP-ER-88',
  name: 'Dr. Sarah Chen',
  hospitalId: 'HOSP-STJUDE-01',
  hospitalName: 'St. Jude Metropolitan Trauma Center',
  department: 'Emergency & Critical Care',
  roleTitle: 'Attending Emergency Physician',
};

const SEED_HEALTH_PROFILES: HealthProfile[] = [
  {
    healthId: 'VX-4821-9034',
    userId: 'usr_demo_1',
    patientName: 'Alex Rivera',
    dateOfBirth: '1988-06-14',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: [
      'Severe Penicillin Allergy (Anaphylaxis risk)',
      'NSAID / Aspirin Sensitivity',
    ],
    existingConditions: [
      'Stage 1 Essential Hypertension',
      'Mild Exercise-Induced Asthma',
    ],
    medications: [
      'Lisinopril 10mg PO Daily',
      'Albuterol Inhaler 90mcg (2 puffs PRN)',
    ],
    emergencyContacts: [
      {
        name: 'Elena Rivera',
        relationship: 'Spouse',
        phone: '+1 (555) 234-8901',
      },
      {
        name: 'Dr. Robert Miller',
        relationship: 'Primary Care Physician',
        phone: '+1 (555) 890-4321',
      },
    ],
    bloodPressureBaseline: '128/84 mmHg',
    bloodSugarBaseline: '98 mg/dL (fasting)',
    faceReference: 'FACE-HASH-ALEX-RIVERA-4821',
    qrToken: 'SECURE-TOKEN-VX-4821-9034-AUTH',
    registrationDate: '2026-02-01',
    status: 'ACTIVE',
    notes: 'Patient carries medical alert card for penicillin anaphylaxis.',
  },
  {
    healthId: 'VX-7192-4402',
    userId: 'usr_demo_2',
    patientName: 'Maya Patel',
    dateOfBirth: '1995-11-22',
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: ['Sulfa Drugs', 'Peanut severe allergy'],
    existingConditions: ['Type 1 Diabetes Mellitus'],
    medications: ['Insulin Glargine 20 units nightly', 'Insulin Lispro with meals'],
    emergencyContacts: [
      {
        name: 'Dev Patel',
        relationship: 'Brother',
        phone: '+1 (555) 456-7890',
      },
    ],
    bloodPressureBaseline: '118/76 mmHg',
    bloodSugarBaseline: '124 mg/dL',
    faceReference: 'FACE-HASH-MAYA-PATEL-7192',
    qrToken: 'SECURE-TOKEN-VX-7192-4402-AUTH',
    registrationDate: '2026-01-20',
    status: 'ACTIVE',
  },
];

const SEED_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    recordId: 'rec_01',
    healthId: 'VX-4821-9034',
    recordType: 'Diagnosis',
    title: 'Essential Hypertension Grade 1',
    description: 'Diagnosed after continuous ambulatory BP monitoring showing persistent readings 135-142/86-90 mmHg. Commenced low-dose ACE inhibitor therapy.',
    date: '2025-08-14',
    time: '14:30',
    createdBy: 'Dr. Robert Miller',
    hospital: 'Metropolitan Ambulatory Care',
    severity: 'MEDIUM',
  },
  {
    recordId: 'rec_02',
    healthId: 'VX-4821-9034',
    recordType: 'Allergy',
    title: 'Penicillin-Induced Severe Anaphylaxis',
    description: 'Severe urticaria, bronchospasm, and facial edema requiring IM Epinephrine during dental procedure prophylaxis. Strictly contraindicated.',
    date: '2022-04-10',
    time: '11:15',
    createdBy: 'Dr. Linda Wu',
    hospital: 'St. Jude Emergency Dept',
    severity: 'HIGH',
  },
  {
    recordId: 'rec_03',
    healthId: 'VX-4821-9034',
    recordType: 'Medical Report',
    title: 'Comprehensive Metabolic & Lipid Panel',
    description: 'Fasting Blood Glucose: 98 mg/dL (Normal). HbA1c: 5.4%. Total Cholesterol: 182 mg/dL. LDL: 104 mg/dL. HDL: 52 mg/dL. Triglycerides: 130 mg/dL.',
    date: '2025-11-05',
    time: '09:00',
    createdBy: 'Clinical Pathology Lab',
    hospital: 'St. Jude Diagnostic Laboratories',
    attachmentName: 'metabolic_panel_nov2025.pdf',
    severity: 'LOW',
  },
  {
    recordId: 'rec_04',
    healthId: 'VX-4821-9034',
    recordType: 'Prescription',
    title: 'Lisinopril 10mg Tablets',
    description: 'Take 1 tablet by mouth daily in the morning with water. Monitor morning seated blood pressure. 90-day supply with 3 refills.',
    date: '2025-12-01',
    time: '16:00',
    createdBy: 'Dr. Robert Miller',
    hospital: 'Metropolitan Ambulatory Care',
    severity: 'LOW',
  },
];

const INITIAL_VITALS: Vitals = {
  vitalId: 'vit_init_01',
  healthId: 'VX-4821-9034',
  ambulanceId: 'AMB-04',
  heartRate: 94,
  spo2: 97,
  bloodPressureSys: 132,
  bloodPressureDia: 86,
  temperature: 37.1,
  respiratoryRate: 19,
  bloodGlucose: 114,
  ecgStatus: 'Sinus Tachycardia',
  timestamp: new Date().toISOString(),
  source: 'SENSOR',
};

const SEED_AMBULANCE_TRIP: AmbulanceTrip = {
  tripId: 'TRIP-2026-AMB04-01',
  ambulanceId: 'AMB-04',
  paramedicStaffId: 'AMB-STAFF-104',
  paramedicName: 'Marcus Vance',
  healthId: 'VX-4821-9034',
  patientName: 'Alex Rivera',
  isTemporary: false,
  status: 'INCOMING',
  latitude: 37.7749,
  longitude: -122.4194,
  destinationHospitalId: 'HOSP-STJUDE-01',
  destinationHospitalName: 'St. Jude Metropolitan Trauma Center',
  distanceKm: 4.8,
  etaMinutes: 8,
  speedKmh: 64,
  startTime: new Date(Date.now() - 600000).toISOString(),
  patientCondition: 'Acute retrosternal chest discomfort radiating to left arm. Conscious, oriented x3, mildly diaphoretic, no severe cyanosis.',
  emergencyCategory: 'Chest discomfort',
  additionalNotes: 'Sublingual nitroglycerin deferred due to baseline borderline pressure; oxygen 3L via nasal cannula initiated; 12-lead ECG transmitting.',
  handoverSent: true,
  handoverTimestamp: new Date(Date.now() - 300000).toISOString(),
  currentVitals: INITIAL_VITALS,
  vitalHistory: [
    { ...INITIAL_VITALS, heartRate: 102, bloodPressureSys: 140, timestamp: new Date(Date.now() - 480000).toISOString() },
    { ...INITIAL_VITALS, heartRate: 98, bloodPressureSys: 136, timestamp: new Date(Date.now() - 240000).toISOString() },
    INITIAL_VITALS,
  ],
};

export interface SystemState {
  users: User[];
  currentUser: User | null;
  currentRole: User['role'] | null;
  profiles: HealthProfile[];
  medicalRecords: MedicalRecord[];
  activeTrip: AmbulanceTrip;
  alerts: EmergencyAlert[];
  temporaryPatients: TemporaryPatient[];
  sensorStatus: SensorStatus;
  demoModeActive: boolean;
  demoStep: number;
}

class VitalXStore {
  private state: SystemState;
  private listeners: Set<() => void> = new Set();
  private timer: number | null = null;

  constructor() {
    this.state = this.loadState();
    this.startLiveSimulation();
  }

  private loadState(): SystemState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          // Always ensure valid references
          currentUser: parsed.currentUser || SEED_USERS[0],
          currentRole: parsed.currentRole || 'AMBULANCE_STAFF',
        };
      }
    } catch {
      // ignore
    }

    return {
      users: SEED_USERS,
      currentUser: SEED_USERS[0], // Default to Ambulance Staff on first load
      currentRole: 'AMBULANCE_STAFF',
      profiles: SEED_HEALTH_PROFILES,
      medicalRecords: SEED_MEDICAL_RECORDS,
      activeTrip: SEED_AMBULANCE_TRIP,
      alerts: [
        {
          alertId: 'ALT-8821',
          tripId: 'TRIP-2026-AMB04-01',
          ambulanceId: 'AMB-04',
          healthId: 'VX-4821-9034',
          patientName: 'Alex Rivera',
          message: 'Priority 1 Code Red: STEMI alert suspected with progressive chest pain. ETA 8 min.',
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 180000).toISOString(),
          etaMinutes: 8,
          locationText: 'Grand Blvd & 4th Ave, heading Northbound (Speed 64 km/h)',
        },
      ],
      temporaryPatients: [],
      sensorStatus: {
        ecgConnected: true,
        pulseOximeterConnected: true,
        bpMonitorConnected: true,
        tempSensorConnected: true,
        glucometerConnected: true,
        gatewayStatus: 'ONLINE',
        gpsLock: true,
      },
      demoModeActive: false,
      demoStep: 0,
    };
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore quota
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getState(): SystemState {
    return this.state;
  }

  // --- Authentication ---
  public setCurrentUser(user: User | null, role?: User['role']) {
    this.state.currentUser = user;
    this.state.currentRole = role || (user ? user.role : null);
    this.saveState();
  }

  public registerUser(name: string, accountName: string, passwordHash: string, role: User['role']): User {
    const newUser: User = {
      userId: `usr_${Date.now()}`,
      name,
      accountName,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    };
    this.state.users = [...this.state.users, newUser];
    this.saveState();
    return newUser;
  }

  public findUserByAccount(accountName: string): User | undefined {
    return this.state.users.find(u => u.accountName.toLowerCase() === accountName.toLowerCase());
  }

  public findUserById(staffId: string): User | undefined {
    return this.state.users.find(u => u.accountName.toLowerCase() === staffId.toLowerCase() || u.name.toLowerCase() === staffId.toLowerCase());
  }

  // --- Health Profiles & Identification ---
  public createHealthProfile(profileData: {
    userId: string;
    patientName: string;
    faceReference: string;
    bloodGroup?: HealthProfile['bloodGroup'];
    allergies?: string[];
    existingConditions?: string[];
    medications?: string[];
    emergencyContacts?: HealthProfile['emergencyContacts'];
  }): HealthProfile {
    // Generate unique Health ID format: VX-XXXX-XXXX
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    const healthId = `VX-${p1}-${p2}`;
    const qrToken = `SECURE-TOKEN-${healthId}-${Date.now()}`;

    const newProfile: HealthProfile = {
      healthId,
      userId: profileData.userId,
      patientName: profileData.patientName,
      bloodGroup: profileData.bloodGroup || 'O+',
      allergies: profileData.allergies || ['None known'],
      existingConditions: profileData.existingConditions || ['None recorded'],
      medications: profileData.medications || ['None'],
      emergencyContacts: profileData.emergencyContacts || [
        { name: 'Family Contact', relationship: 'Next of kin', phone: '+1 (555) 019-2834' }
      ],
      faceReference: profileData.faceReference,
      qrToken,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      bloodPressureBaseline: '120/80 mmHg',
      bloodSugarBaseline: '95 mg/dL',
    };

    this.state.profiles = [...this.state.profiles, newProfile];

    // Seed initial baseline health record
    const baseRecord: MedicalRecord = {
      recordId: `rec_${Date.now()}`,
      healthId,
      recordType: 'Medical Report',
      title: 'Initial Health ID Baseline Enrollment',
      description: 'Patient identity verified via simulated biometrics and assigned secure Health ID. Standard emergency contact information logged.',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdBy: 'VitalX Identity Registry',
      hospital: 'VitalX Digital Health Authority',
      severity: 'LOW',
    };
    this.state.medicalRecords = [...this.state.medicalRecords, baseRecord];

    this.saveState();
    return newProfile;
  }

  public updateHealthProfile(healthId: string, updates: Partial<HealthProfile>) {
    this.state.profiles = this.state.profiles.map(p => {
      if (p.healthId === healthId) {
        return { ...p, ...updates };
      }
      return p;
    });
    this.saveState();
  }

  public searchHealthProfileById(healthId: string): HealthProfile | undefined {
    const clean = healthId.trim().toUpperCase();
    return this.state.profiles.find(p => p.healthId.toUpperCase() === clean);
  }

  public searchHealthProfileByQr(qrTokenOrId: string): HealthProfile | undefined {
    const clean = qrTokenOrId.trim();
    return this.state.profiles.find(p => p.qrToken === clean || p.healthId.toUpperCase() === clean.toUpperCase());
  }

  public searchHealthProfileByFace(faceIdentifier: string): HealthProfile | undefined {
    // Exact or nearest match simulation
    return this.state.profiles.find(p =>
      p.faceReference.toLowerCase().includes(faceIdentifier.toLowerCase()) ||
      p.patientName.toLowerCase().includes(faceIdentifier.toLowerCase())
    );
  }

  // --- Temporary Emergency ID ---
  public createTemporaryPatient(ambulanceId: string, vitals: Vitals, condition: string, notes: string): TemporaryPatient {
    const randSuffix = Math.floor(10000 + Math.random() * 90000);
    const temporaryId = `TEMP-VX-${randSuffix}`;

    const tempPatient: TemporaryPatient = {
      temporaryId,
      createdAt: new Date().toISOString(),
      ambulanceId,
      currentVitals: vitals,
      condition: condition || 'Unconscious / Unresponsive patient',
      emergencyCategory: 'Unconscious patient',
      notes: notes || 'No physical ID or digital token found upon ambulance arrival. Temporary protocol initiated.',
    };

    this.state.temporaryPatients = [tempPatient, ...this.state.temporaryPatients];

    // Assign to active trip
    this.state.activeTrip = {
      ...this.state.activeTrip,
      healthId: temporaryId,
      patientName: `Temporary Patient (${temporaryId})`,
      isTemporary: true,
      patientCondition: tempPatient.condition,
      emergencyCategory: 'Unconscious patient',
      additionalNotes: tempPatient.notes,
      currentVitals: vitals,
      vitalHistory: [vitals],
    };

    this.saveState();
    return tempPatient;
  }

  public linkTemporaryPatient(tempId: string, permanentHealthId: string, linkedBy: string) {
    const profile = this.searchHealthProfileById(permanentHealthId);
    if (!profile) return false;

    this.state.temporaryPatients = this.state.temporaryPatients.map(tp => {
      if (tp.temporaryId === tempId) {
        return {
          ...tp,
          linkedHealthId: permanentHealthId,
          linkedAt: new Date().toISOString(),
          linkedBy,
        };
      }
      return tp;
    });

    if (this.state.activeTrip.healthId === tempId) {
      this.state.activeTrip = {
        ...this.state.activeTrip,
        healthId: permanentHealthId,
        patientName: profile.patientName,
        isTemporary: false,
      };
    }

    // Add linkage medical record to profile
    this.addMedicalRecord({
      healthId: permanentHealthId,
      recordType: 'Doctor Notes',
      title: `Emergency Admission Linked from ${tempId}`,
      description: `Hospital staff (${linkedBy}) confirmed identity and linked emergency transport record ${tempId} to permanent profile.`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdBy: linkedBy,
      hospital: 'St. Jude Metropolitan Trauma Center',
      severity: 'MEDIUM',
    });

    this.saveState();
    return true;
  }

  // --- Vitals & Manual Entry ---
  public updateCurrentVitals(vitals: Vitals) {
    this.state.activeTrip = {
      ...this.state.activeTrip,
      currentVitals: vitals,
      vitalHistory: [vitals, ...this.state.activeTrip.vitalHistory].slice(0, 30),
    };
    this.saveState();
  }

  public toggleSensorStatus(sensorName: keyof SensorStatus) {
    this.state.sensorStatus = {
      ...this.state.sensorStatus,
      [sensorName]: !this.state.sensorStatus[sensorName],
    };
    this.saveState();
  }

  // --- Handover & Emergency Alert ---
  public sendHandover(payload: Partial<AmbulanceTrip>) {
    this.state.activeTrip = {
      ...this.state.activeTrip,
      ...payload,
      handoverSent: true,
      handoverTimestamp: new Date().toISOString(),
    };
    this.saveState();
  }

  public triggerEmergencyAlert(message?: string): EmergencyAlert {
    const trip = this.state.activeTrip;
    const alert: EmergencyAlert = {
      alertId: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      tripId: trip.tripId,
      ambulanceId: trip.ambulanceId,
      healthId: trip.healthId,
      patientName: trip.patientName,
      message: message || `EMERGENCY ALERT: Priority resuscitation team required for ${trip.patientName}. ETA ${trip.etaMinutes} mins.`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      etaMinutes: trip.etaMinutes,
      locationText: `Lat: ${trip.latitude.toFixed(4)}, Lng: ${trip.longitude.toFixed(4)} heading to ${trip.destinationHospitalName}`,
    };

    this.state.alerts = [alert, ...this.state.alerts];
    this.saveState();
    return alert;
  }

  public acknowledgeAlert(alertId: string, staffName: string) {
    this.state.alerts = this.state.alerts.map(a => {
      if (a.alertId === alertId) {
        return {
          ...a,
          status: 'ACKNOWLEDGED',
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: staffName,
        };
      }
      return a;
    });
    this.saveState();
  }

  // --- Medical Records ---
  public addMedicalRecord(record: Omit<MedicalRecord, 'recordId'>) {
    const newRec: MedicalRecord = {
      ...record,
      recordId: `rec_${Date.now()}`,
    };
    this.state.medicalRecords = [newRec, ...this.state.medicalRecords];
    this.saveState();
    return newRec;
  }

  public getMedicalRecords(healthId: string): MedicalRecord[] {
    return this.state.medicalRecords
      .filter(r => r.healthId.toUpperCase() === healthId.toUpperCase())
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
  }

  // --- Trip Lifecycle ---
  public updateTripProgress(tripId: string, updates: Partial<AmbulanceTrip>) {
    this.state.activeTrip = {
      ...this.state.activeTrip,
      ...updates,
    };
    this.saveState();
  }

  public setTripStatus(status: AmbulanceTrip['status']) {
    this.state.activeTrip = {
      ...this.state.activeTrip,
      status,
      ...(status === 'REACHED' ? { arrivalTime: new Date().toISOString(), etaMinutes: 0, distanceKm: 0, speedKmh: 0 } : {}),
    };
    this.saveState();
  }

  public resetToDefaultScenario() {
    this.state.profiles = SEED_HEALTH_PROFILES;
    this.state.medicalRecords = SEED_MEDICAL_RECORDS;
    this.state.activeTrip = {
      ...SEED_AMBULANCE_TRIP,
      status: 'INCOMING',
      distanceKm: 4.8,
      etaMinutes: 8,
      startTime: new Date().toISOString(),
    };
    this.state.alerts = [
      {
        alertId: `ALT-${Date.now()}`,
        tripId: SEED_AMBULANCE_TRIP.tripId,
        ambulanceId: 'AMB-04',
        healthId: 'VX-4821-9034',
        patientName: 'Alex Rivera',
        message: 'Priority 1 Code Red: Acute chest discomfort with telemetry ST elevation suspected. Direct trauma bay dispatch requested.',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        etaMinutes: 8,
        locationText: 'Expressway Mile 14, approaching Medical Center Exit',
      },
    ];
    this.state.demoModeActive = true;
    this.state.demoStep = 1;
    this.saveState();
  }

  // --- Background Live Simulation ---
  private startLiveSimulation() {
    if (this.timer) clearInterval(this.timer);

    this.timer = window.setInterval(() => {
      const trip = this.state.activeTrip;
      if (trip.status === 'INCOMING' || trip.status === 'APPROACHING') {
        // Progress distance and ETA down realistically
        const newDistance = Math.max(0, +(trip.distanceKm - 0.15).toFixed(2));
        const newEta = Math.max(0, Math.ceil((newDistance / (trip.speedKmh || 50)) * 60));

        let newStatus: AmbulanceTrip['status'] = trip.status;
        if (newDistance <= 0.2) {
          newStatus = 'REACHED';
        } else if (newDistance <= 1.5) {
          newStatus = 'APPROACHING';
        }

        // Slight natural vital fluctuation if sensor connected
        const vit = trip.currentVitals;
        const hrDrift = Math.floor((Math.random() - 0.48) * 3);
        const spo2Drift = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;

        const updatedVitals: Vitals = {
          ...vit,
          heartRate: Math.max(60, Math.min(145, vit.heartRate + (vit.source === 'SENSOR' ? hrDrift : 0))),
          spo2: Math.max(90, Math.min(100, vit.spo2 + (vit.source === 'SENSOR' ? spo2Drift : 0))),
          timestamp: new Date().toISOString(),
        };

        this.state.activeTrip = {
          ...trip,
          distanceKm: newDistance,
          etaMinutes: newEta,
          status: newStatus,
          currentVitals: updatedVitals,
          latitude: trip.latitude + 0.0003,
          longitude: trip.longitude + 0.0002,
          arrivalTime: newStatus === 'REACHED' ? new Date().toISOString() : trip.arrivalTime,
        };

        // Update active alerts ETA
        this.state.alerts = this.state.alerts.map(a => {
          if (a.status === 'ACTIVE' && a.tripId === trip.tripId) {
            return { ...a, etaMinutes: newEta };
          }
          return a;
        });

        this.saveState();
      }
    }, 4000);
  }
}

export const vitalxStore = new VitalXStore();
