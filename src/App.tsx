/**
 * VitalX - Smart Ambulance & Emergency Health ID System
 * Main Application Hub & State Orchestrator
 */

import React, { useState, useEffect } from 'react';
import {
  Role,
  User,
  HealthProfile,
  AmbulanceTrip,
  EmergencyAlert,
  MedicalRecord,
  TemporaryPatient,
  SensorStatus
} from './types';
import { vitalxStore, SystemState } from './services/vitalxStore';
import { Header } from './components/Header';
import { RoleSelector } from './components/RoleSelector';
import { AuthModal } from './components/AuthModal';
import { FaceRegistration } from './components/FaceRegistration';
import { HealthIdProfileView } from './components/HealthIdProfileView';
import { AmbulanceDashboard } from './components/AmbulanceDashboard';
import { HospitalDashboard } from './components/HospitalDashboard';
import { ArchitectureView } from './components/ArchitectureView';
import { DemoScenarioRunner } from './components/DemoScenarioRunner';

export default function App() {
  const [storeState, setStoreState] = useState<SystemState>(vitalxStore.getState());

  // Navigation tab: 'home' | 'ambulance' | 'hospital' | 'patient' | 'architecture'
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<Role>('AMBULANCE_STAFF');
  const [isDemoRunnerOpen, setIsDemoRunnerOpen] = useState<boolean>(false);
  const [newDemoUserForFace, setNewDemoUserForFace] = useState<User | null>(null);

  // Subscribe to central reactive store
  useEffect(() => {
    const unsubscribe = vitalxStore.subscribe(() => {
      setStoreState({ ...vitalxStore.getState() });
    });
    return unsubscribe;
  }, []);

  const {
    currentUser,
    currentRole,
    profiles,
    medicalRecords,
    activeTrip,
    alerts,
    temporaryPatients,
    sensorStatus,
  } = storeState;

  // Active unacknowledged alerts count
  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  // Active demo patient profile (default Alex Rivera)
  const activePatientProfile = profiles.find((p) => p.healthId === activeTrip.healthId) || profiles[0];

  const handleRoleSelection = (role: Role) => {
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleDirectEnter = (role: Role) => {
    // Direct shortcut for quick presentation testing
    if (role === 'AMBULANCE_STAFF') {
      const u = storeState.users.find((x) => x.role === 'AMBULANCE_STAFF') || storeState.users[0];
      vitalxStore.setCurrentUser(u, 'AMBULANCE_STAFF');
      setActiveTab('ambulance');
    } else if (role === 'HOSPITAL_STAFF') {
      const u = storeState.users.find((x) => x.role === 'HOSPITAL_STAFF') || storeState.users[1];
      vitalxStore.setCurrentUser(u, 'HOSPITAL_STAFF');
      setActiveTab('hospital');
    } else {
      const u = storeState.users.find((x) => x.role === 'DEMO_USER') || storeState.users[2];
      vitalxStore.setCurrentUser(u, 'DEMO_USER');
      setActiveTab('patient');
    }
  };

  const handleAuthSuccess = (user: User, role: Role, isNewDemoUser?: boolean) => {
    vitalxStore.setCurrentUser(user, role);

    if (isNewDemoUser) {
      setNewDemoUserForFace(user);
    } else {
      if (role === 'AMBULANCE_STAFF') {
        setActiveTab('ambulance');
      } else if (role === 'HOSPITAL_STAFF') {
        setActiveTab('hospital');
      } else {
        setActiveTab('patient');
      }
    }
  };

  const handleFaceRegistered = (newProfile: HealthProfile) => {
    setNewDemoUserForFace(null);
    setActiveTab('patient');
  };

  const handleSimulateAmbulanceScan = (healthId: string) => {
    const prof = vitalxStore.searchHealthProfileById(healthId);
    if (prof) {
      vitalxStore.updateTripProgress(activeTrip.tripId, {
        healthId: prof.healthId,
        patientName: prof.patientName,
        isTemporary: false,
      });
      setActiveTab('ambulance');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* 3-Zone Clean Header */}
      <Header
        currentRole={currentRole}
        currentUserName={currentUser?.name}
        activeAlertCount={activeAlertCount}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onSwitchRole={() => setIsAuthModalOpen(true)}
        onOpenDemoRunner={() => setIsDemoRunnerOpen(true)}
        onResetDemo={() => vitalxStore.resetToDefaultScenario()}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* Face Registration Flow for new Demo User */}
        {newDemoUserForFace ? (
          <FaceRegistration
            user={newDemoUserForFace}
            onCompleted={handleFaceRegistered}
            onCancel={() => setNewDemoUserForFace(null)}
          />
        ) : (
          <>
            {/* View 1: Home / Role Selector */}
            {activeTab === 'home' && (
              <RoleSelector
                onSelectRole={handleRoleSelection}
                onDirectEnter={handleDirectEnter}
              />
            )}

            {/* View 2: Ambulance Staff Dashboard */}
            {activeTab === 'ambulance' && (
              <AmbulanceDashboard
                currentUser={currentUser || storeState.users[0]}
                trip={activeTrip}
                sensorStatus={sensorStatus}
                onNavigateHospital={() => setActiveTab('hospital')}
              />
            )}

            {/* View 3: Hospital ER Dashboard */}
            {activeTab === 'hospital' && (
              <HospitalDashboard
                currentUser={currentUser || storeState.users[1]}
                activeTrip={activeTrip}
                alerts={alerts}
                profiles={profiles}
                temporaryPatients={temporaryPatients}
              />
            )}

            {/* View 4: Patient Health ID Portal */}
            {activeTab === 'patient' && (
              <HealthIdProfileView
                profile={activePatientProfile}
                medicalRecords={vitalxStore.getMedicalRecords(activePatientProfile.healthId)}
                onSimulateAmbulanceScan={handleSimulateAmbulanceScan}
              />
            )}

            {/* View 5: Technical IoT & System Architecture */}
            {activeTab === 'architecture' && <ArchitectureView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">VitalX</span>
            <span>·</span>
            <span>Smart Ambulance & Emergency Health ID System</span>
          </div>
          <div className="text-slate-500 text-center sm:text-right">
            <span>Connecting Ambulance, Patient and Hospital in Real Time.</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        initialRole={authModalRole}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 11-Step Ideathon Demo Walkthrough Modal */}
      <DemoScenarioRunner
        isOpen={isDemoRunnerOpen}
        onClose={() => setIsDemoRunnerOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
      />
    </div>
  );
}
