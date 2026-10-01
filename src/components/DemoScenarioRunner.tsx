import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Siren,
  Building2,
  User,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { vitalxStore } from '../services/vitalxStore';

interface DemoScenarioRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

interface StepInfo {
  number: number;
  title: string;
  desc: string;
  roleHint: string;
  actionButtonLabel?: string;
  action?: () => void;
  tabRedirect?: string;
}

export const DemoScenarioRunner: React.FC<DemoScenarioRunnerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutomating, setIsAutomating] = useState(false);

  if (!isOpen) return null;

  const steps: StepInfo[] = [
    {
      number: 1,
      title: 'Initialize Demo Patient & Health Profile',
      desc: 'Enrolls patient Alex Rivera with baseline profile: severe penicillin anaphylaxis, baseline hypertension, emergency contacts.',
      roleHint: 'Patient Registry',
      actionButtonLabel: 'Step 1: Enroll Patient',
      action: () => {
        vitalxStore.resetToDefaultScenario();
      },
      tabRedirect: 'patient',
    },
    {
      number: 2,
      title: 'Generate Tokenized Health ID & QR Code',
      desc: 'Issues unique Health ID: VX-4821-9034 and generates encrypted vector QR code access token.',
      roleHint: 'Security Token',
      actionButtonLabel: 'Step 2: Inspect QR Profile',
      tabRedirect: 'patient',
    },
    {
      number: 3,
      title: 'Dispatch Ambulance AMB-04 to Incident',
      desc: 'Paramedic Marcus Vance arrives on scene, identifies Alex Rivera via facial recognition, and begins transport to St. Jude Trauma Center.',
      roleHint: 'Ambulance Unit',
      actionButtonLabel: 'Step 3: Open Ambulance Console',
      action: () => {
        vitalxStore.setTripStatus('INCOMING');
      },
      tabRedirect: 'ambulance',
    },
    {
      number: 4,
      title: 'Stream Sensor Vitals Telemetry',
      desc: 'IoT Gateway connects SpO2, NIBP cuff, and 12-lead ECG monitor, streaming live tachycardia (98 bpm, BP 134/88 mmHg).',
      roleHint: 'IoT Sensors',
      actionButtonLabel: 'Step 4: View Live Vitals',
      tabRedirect: 'ambulance',
    },
    {
      number: 5,
      title: 'Update GPS Route & Calculate Live ETA',
      desc: 'Live 4G GPS lock transmits vehicle speed (64 km/h), distance (4.2 km), and calculated ETA (7 min) towards St. Jude Trauma Bay.',
      roleHint: 'GPS Telemetry',
      actionButtonLabel: 'Step 5: View GPS Radar',
      tabRedirect: 'ambulance',
    },
    {
      number: 6,
      title: 'Transmit Pre-Arrival Digital Handover',
      desc: 'Paramedic transmits structured clinical summary: suspected acute coronary syndrome, conscious, oxygen initiated.',
      roleHint: 'Pre-Hospital Protocol',
      actionButtonLabel: 'Step 6: Send Handover Payload',
      action: () => {
        vitalxStore.sendHandover({
          patientCondition: 'Acute retrosternal chest pain radiating to left jaw, mild diaphoresis.',
          emergencyCategory: 'Chest discomfort',
          additionalNotes: 'Oxygen 3L via cannula running, IV established. No penicillin administered.',
        });
      },
      tabRedirect: 'hospital',
    },
    {
      number: 7,
      title: 'Trigger Priority Code Red Emergency Alert',
      desc: 'Ambulance crew activates Emergency Alert for incoming trauma bay resuscitation team.',
      roleHint: 'Code Red',
      actionButtonLabel: 'Step 7: Trigger Alert',
      action: () => {
        vitalxStore.triggerEmergencyAlert(
          'PRIORITY 1 RESUSCITATION: Acute chest discomfort with telemetry ST deviation. ETA 6 min.'
        );
      },
      tabRedirect: 'hospital',
    },
    {
      number: 8,
      title: 'Hospital Emergency Physician Acknowledges Alert',
      desc: 'Attending physician Dr. Sarah Chen acknowledges the flashing Code Red banner on the trauma dashboard.',
      roleHint: 'Hospital ER',
      actionButtonLabel: 'Step 8: Acknowledge on Hospital ER',
      action: () => {
        const state = vitalxStore.getState();
        const active = state.alerts.find((a) => a.status === 'ACTIVE');
        if (active) {
          vitalxStore.acknowledgeAlert(active.alertId, 'Dr. Sarah Chen');
        }
      },
      tabRedirect: 'hospital',
    },
    {
      number: 9,
      title: 'Authorize & Inspect Historical Medical Records',
      desc: 'Hospital ER reviews chronological history, immediately spotting severe Penicillin Anaphylaxis and baseline medications.',
      roleHint: 'Clinical Safety',
      actionButtonLabel: 'Step 9: Review Anaphylaxis Chart',
      tabRedirect: 'hospital',
    },
    {
      number: 10,
      title: 'Ambulance Docks at Trauma Bay ("REACHED")',
      desc: 'Vehicle arrives at bay 1. Status transitions from INCOMING to REACHED. Tracking ceases, preserving arrival handover vitals.',
      roleHint: 'Arrival Phase',
      actionButtonLabel: 'Step 10: Complete Arrival',
      action: () => {
        vitalxStore.setTripStatus('REACHED');
      },
      tabRedirect: 'hospital',
    },
    {
      number: 11,
      title: 'Post-Arrival Clinical Documentation & Discharge',
      desc: 'Emergency physician logs acute cardiology consultation into the patient permanent Health ID record.',
      roleHint: 'Documentation',
      actionButtonLabel: 'Step 11: Document Encounter',
      action: () => {
        vitalxStore.addMedicalRecord({
          healthId: 'VX-4821-9034',
          recordType: 'Diagnosis',
          title: 'Acute Coronary Syndrome Treated',
          description: 'Patient successfully admitted directly to catheterization lab following pre-arrival VitalX ECG telemetry handover.',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          createdBy: 'Dr. Sarah Chen',
          hospital: 'St. Jude Metropolitan Trauma Center',
          severity: 'HIGH',
        });
      },
      tabRedirect: 'hospital',
    },
  ];

  const handleStepAction = (step: StepInfo, index: number) => {
    if (step.action) step.action();
    setCurrentStepIndex(index);
    if (step.tabRedirect) {
      onNavigateTab(step.tabRedirect);
    }
  };

  const handleRunAll = () => {
    setIsAutomating(true);
    vitalxStore.resetToDefaultScenario();
    setCurrentStepIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < steps.length) {
        const step = steps[idx];
        if (step.action) step.action();
        setCurrentStepIndex(idx);
        if (step.tabRedirect) onNavigateTab(step.tabRedirect);
      } else {
        clearInterval(interval);
        setIsAutomating(false);
      }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                VitalX Demo Scenario Controller
              </h2>
              <p className="text-xs text-slate-400">
                11-Stage Interactive Ideathon Evaluation Walkthrough
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAll}
              disabled={isAutomating}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAutomating ? 'Simulating All Stages...' : 'Auto-Run Complete Walkthrough'}</span>
            </button>

            <button
              onClick={() => {
                vitalxStore.resetToDefaultScenario();
                setCurrentStepIndex(0);
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset State</span>
            </button>
          </div>

          <span className="font-mono text-slate-500">
            Stage {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Steps List */}
        <div className="overflow-y-auto p-6 space-y-3 flex-1">
          {steps.map((step, idx) => {
            const isCurrent = currentStepIndex === idx;
            const isDone = currentStepIndex > idx;

            return (
              <div
                key={step.number}
                className={`p-4 rounded-xl border transition-all text-xs flex items-start justify-between gap-4 ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-400 shadow-xs'
                    : isDone
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                        {step.roleHint}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed max-w-lg">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleStepAction(step, idx)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors ${
                      isCurrent
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    <span>Execute</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            Close Controller
          </button>
        </div>
      </div>
    </div>
  );
};
