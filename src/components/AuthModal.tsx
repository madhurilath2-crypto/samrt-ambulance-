import React, { useState } from 'react';
import { X, Lock, User, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Role, User as UserType } from '../types';
import { vitalxStore } from '../services/vitalxStore';

interface AuthModalProps {
  initialRole: Role;
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType, role: Role, isNewDemoUser?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialRole,
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [activeRole, setActiveRole] = useState<Role>(initialRole);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form fields
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setName('');
    setStaffId('');
    setAccountName('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  const fillDemoCredentials = () => {
    setError(null);
    if (activeRole === 'AMBULANCE_STAFF') {
      setName('Marcus Vance');
      setStaffId('AMB-STAFF-104');
      setPassword('demo123');
    } else if (activeRole === 'HOSPITAL_STAFF') {
      setName('Dr. Sarah Chen');
      setStaffId('HOSP-ER-88');
      setPassword('demo123');
    } else {
      setAccountName('alex.rivera');
      setPassword('demo123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signin') {
      if (activeRole === 'AMBULANCE_STAFF') {
        if (!name.trim() || !staffId.trim() || !password) {
          setError('Please provide Ambulance Staff Name, Staff ID, and Password.');
          return;
        }
        // In prototype, authenticate user
        const existing = vitalxStore.findUserById(staffId) || vitalxStore.getState().users.find(u => u.role === 'AMBULANCE_STAFF');
        if (existing) {
          onAuthSuccess(existing, 'AMBULANCE_STAFF');
          onClose();
        } else {
          setError('Staff ID or credentials not found.');
        }
      } else if (activeRole === 'HOSPITAL_STAFF') {
        if (!name.trim() || !staffId.trim() || !password) {
          setError('Please provide Staff Name, Staff ID, and Password.');
          return;
        }
        const existing = vitalxStore.findUserById(staffId) || vitalxStore.getState().users.find(u => u.role === 'HOSPITAL_STAFF');
        if (existing) {
          onAuthSuccess(existing, 'HOSPITAL_STAFF');
          onClose();
        } else {
          setError('Hospital Staff credentials not recognized.');
        }
      } else {
        // Demo user
        if (!accountName.trim() || !password) {
          setError('Please enter your Account Name and Password.');
          return;
        }
        const user = vitalxStore.findUserByAccount(accountName) || vitalxStore.getState().users.find(u => u.role === 'DEMO_USER');
        if (user) {
          onAuthSuccess(user, 'DEMO_USER');
          onClose();
        } else {
          setError('Account not found. Please Sign Up to enroll a new Health ID.');
        }
      }
    } else {
      // SIGN UP
      if (password.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (activeRole === 'AMBULANCE_STAFF') {
        if (!name.trim() || !staffId.trim()) {
          setError('Staff Name and Staff ID are required.');
          return;
        }
        const newUser = vitalxStore.registerUser(name, staffId, password, 'AMBULANCE_STAFF');
        setSuccessMessage('Ambulance Staff account created successfully! Please Sign In.');
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
      } else if (activeRole === 'HOSPITAL_STAFF') {
        if (!name.trim() || !accountName.trim()) {
          setError('Staff Name and Account Name are required.');
          return;
        }
        const newUser = vitalxStore.registerUser(name, accountName, password, 'HOSPITAL_STAFF');
        onAuthSuccess(newUser, 'HOSPITAL_STAFF');
        onClose();
      } else {
        // DEMO USER sign up -> Continue to face registration!
        if (!name.trim() || !accountName.trim()) {
          setError('Full Name and Account Name are required.');
          return;
        }
        const newUser = vitalxStore.registerUser(name, accountName, password, 'DEMO_USER');
        onAuthSuccess(newUser, 'DEMO_USER', true); // true = proceed to face registration!
        onClose();
      }
    }
  };

  const getTitle = () => {
    if (activeRole === 'AMBULANCE_STAFF') return 'Ambulance Staff Login';
    if (activeRole === 'HOSPITAL_STAFF') return 'Hospital Staff Login';
    return 'Create or Access Demo Health ID';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold tracking-tight">{getTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector bar inside modal */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 border-b border-slate-200 text-xs font-semibold text-center">
          <button
            onClick={() => { setActiveRole('AMBULANCE_STAFF'); handleReset(); }}
            className={`py-2 rounded-md transition-colors ${
              activeRole === 'AMBULANCE_STAFF' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ambulance
          </button>
          <button
            onClick={() => { setActiveRole('HOSPITAL_STAFF'); handleReset(); }}
            className={`py-2 rounded-md transition-colors ${
              activeRole === 'HOSPITAL_STAFF' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospital ER
          </button>
          <button
            onClick={() => { setActiveRole('DEMO_USER'); handleReset(); }}
            className={`py-2 rounded-md transition-colors ${
              activeRole === 'DEMO_USER' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demo Patient
          </button>
        </div>

        {/* Mode Toggle: Sign In / Sign Up */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${
              mode === 'signin'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Quick Demo Credentials Autofill button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 underline decoration-dotted"
            >
              Fill Demo Credentials
            </button>
          </div>

          {/* SIGN IN FIELDS */}
          {mode === 'signin' ? (
            <>
              {activeRole === 'AMBULANCE_STAFF' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Ambulance Staff Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Marcus Vance"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Ambulance Staff ID
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="e.g. AMB-STAFF-104"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeRole === 'HOSPITAL_STAFF' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Staff Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Sarah Chen"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Staff ID
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="e.g. HOSP-ER-88"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeRole === 'DEMO_USER' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Account Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. alex.rivera"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {activeRole === 'AMBULANCE_STAFF' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => alert('Demo recovery: Use password "demo123" with Staff ID AMB-STAFF-104')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* SIGN UP FIELDS */
            <>
              {activeRole === 'AMBULANCE_STAFF' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Staff Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Staff ID
                    </label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. AMB-STAFF-205"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </>
              )}

              {activeRole === 'HOSPITAL_STAFF' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Staff Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Daniel Hayes"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. daniel.hayes"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {activeRole === 'DEMO_USER' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Taylor"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. jordan.taylor"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>
                  {activeRole === 'AMBULANCE_STAFF'
                    ? 'Create Account'
                    : activeRole === 'HOSPITAL_STAFF'
                    ? 'Create Hospital Account'
                    : 'Continue to Face Scan'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
