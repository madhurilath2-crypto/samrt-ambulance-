import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, Shield, Scan, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { User, HealthProfile } from '../types';
import { vitalxStore } from '../services/vitalxStore';

interface FaceRegistrationProps {
  user: User;
  onCompleted: (profile: HealthProfile) => void;
  onCancel: () => void;
}

export const FaceRegistration: React.FC<FaceRegistrationProps> = ({
  user,
  onCompleted,
  onCancel,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [bloodGroup, setBloodGroup] = useState<HealthProfile['bloodGroup']>('O+');
  const [allergiesInput, setAllergiesInput] = useState('Severe Penicillin Allergy, Aspirin');
  const [conditionsInput, setConditionsInput] = useState('Stage 1 Hypertension, Mild Asthma');
  const [medicationsInput, setMedicationsInput] = useState('Lisinopril 10mg PO Daily');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize camera if accessible, or fallback to high-tech biometric canvas simulation
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'user', width: 480, height: 480 } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        setHasCamera(true);
      })
      .catch(() => {
        setHasCamera(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartScan = () => {
    setScanState('scanning');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanState('success');
          return 100;
        }
        return prev + 10;
      });
    }, 180);
  };

  const handleFinalize = () => {
    // Generate secure biometric hash reference
    const biometricHash = `BIO-HASH-${user.name.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const profile = vitalxStore.createHealthProfile({
      userId: user.userId,
      patientName: user.name,
      faceReference: biometricHash,
      bloodGroup,
      allergies: allergiesInput.split(',').map((s) => s.trim()).filter(Boolean),
      existingConditions: conditionsInput.split(',').map((s) => s.trim()).filter(Boolean),
      medications: medicationsInput.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyContacts: [
        { name: 'Elena (Family Contact)', relationship: 'Next of kin', phone: '+1 (555) 234-8901' },
      ],
    });

    onCompleted(profile);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Scan className="w-4 h-4" />
            <span>Biometric Setup Phase</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Set Up Face Recognition
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Enrolling Demo Patient: <span className="font-semibold text-white">{user.name}</span>
          </p>
        </div>

        {/* Security & Privacy Notice */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-start gap-3 text-xs text-blue-900">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Zero-Knowledge Biometric Token:</strong> Your face is used only as a secure identity lookup method for this demonstration. Your medical information is <span className="underline font-bold">NOT</span> stored inside the face scan or QR code.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Scanner Viewport */}
          <div className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80 rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Real video if available */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${
                hasCamera ? 'opacity-80' : 'hidden'
              }`}
            />

            {/* Biometric Avatar Silhouette if no webcam */}
            {!hasCamera && (
              <div className="relative flex flex-col items-center justify-center text-slate-600">
                <div className="w-36 h-36 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center mb-2">
                  <div className="w-24 h-24 rounded-full bg-slate-800/80 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-slate-400" />
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Biometric Simulator Mode
                </span>
              </div>
            )}

            {/* Oval Face Guide Frame */}
            <div className="absolute inset-6 rounded-[48%] border-2 border-blue-400/60 pointer-events-none flex items-center justify-center">
              {/* Corner Targets */}
              <div className="absolute top-2 left-10 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
              <div className="absolute top-2 right-10 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
              <div className="absolute bottom-2 left-10 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
              <div className="absolute bottom-2 right-10 w-4 h-4 border-b-2 border-r-2 border-blue-400" />

              {/* Scanning Laser Beam */}
              {scanState === 'scanning' && (
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse shadow-[0_0_12px_#38bdf8]" />
              )}
            </div>

            {/* Overlay Status Badge */}
            <div className="absolute bottom-4 inset-x-4 text-center">
              {scanState === 'idle' && (
                <span className="inline-block px-3 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-slate-200 text-xs font-medium border border-slate-700">
                  Position your face inside the frame
                </span>
              )}
              {scanState === 'scanning' && (
                <div className="bg-slate-900/90 backdrop-blur-xs p-2 rounded-lg border border-blue-500/40 text-left">
                  <div className="flex justify-between text-xs text-blue-300 font-mono mb-1">
                    <span>Scanning facial landmarks...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              {scanState === 'success' && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Face registered successfully</span>
                </div>
              )}
            </div>
          </div>

          {/* Preliminary Demo Medical Info Configuration (Editable for realistic demo) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800">Demo Medical Record Setup</span>
              <span className="text-[11px] text-slate-500">Stored on encrypted secure database</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as HealthProfile['bloodGroup'])}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="O+">O+ (Universal RBC Donor)</option>
                  <option value="O-">O- (Universal Emergency)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Severe Allergies</label>
                <input
                  type="text"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs"
                  placeholder="e.g. Penicillin, Aspirin"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Existing Conditions</label>
                <input
                  type="text"
                  value={conditionsInput}
                  onChange={(e) => setConditionsInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs"
                  placeholder="e.g. Hypertension, Asthma"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Current Medications</label>
                <input
                  type="text"
                  value={medicationsInput}
                  onChange={(e) => setMedicationsInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs"
                  placeholder="e.g. Lisinopril 10mg"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            {scanState !== 'success' ? (
              <button
                onClick={handleStartScan}
                disabled={scanState === 'scanning'}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <Scan className="w-4 h-4" />
                <span>{scanState === 'scanning' ? 'Scanning...' : 'Scan & Register Face'}</span>
              </button>
            ) : (
              <button
                onClick={handleFinalize}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Health ID & QR Code</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
