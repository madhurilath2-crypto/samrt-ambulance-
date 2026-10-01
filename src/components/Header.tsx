import React from 'react';
import { Activity, ShieldAlert, User, LogOut, PlayCircle, RefreshCw, Radio } from 'lucide-react';
import { Role } from '../types';

interface HeaderProps {
  currentRole: Role | null;
  currentUserName?: string;
  activeAlertCount: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchRole: () => void;
  onOpenDemoRunner: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUserName,
  activeAlertCount,
  activeTab,
  onSelectTab,
  onSwitchRole,
  onOpenDemoRunner,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand Zone */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('home');
            }}
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span>VitalX</span>
          </a>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-400 border-l border-slate-700 pl-3">
            Emergency Health ID & Ambulance System
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean text links with active indicator) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'home' ? 'text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Portal Home
          </button>
          <button
            onClick={() => onSelectTab('ambulance')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ambulance' ? 'text-blue-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Ambulance Unit</span>
          </button>
          <button
            onClick={() => onSelectTab('hospital')}
            className={`transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
              activeTab === 'hospital' ? 'text-blue-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <span>Hospital ER</span>
            {activeAlertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('patient')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'patient' ? 'text-blue-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Health ID Portal
          </button>
          <button
            onClick={() => onSelectTab('architecture')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'architecture' ? 'text-blue-400 font-semibold' : 'hover:text-white'
            }`}
          >
            IoT Architecture
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Demo Scenario Launcher */}
          <button
            onClick={onOpenDemoRunner}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            title="Launch interactive 11-step Ideathon Scenario"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Demo Scenario</span>
          </button>

          {/* Alert Quick Counter for Hospital */}
          {activeAlertCount > 0 && (
            <button
              onClick={() => onSelectTab('hospital')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-100 bg-red-600 hover:bg-red-500 rounded-lg transition-colors animate-pulse whitespace-nowrap"
              title="Active Emergency Alerts"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{activeAlertCount} Alert</span>
            </button>
          )}

          {/* Current User Role Pill / Switcher */}
          {currentRole ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <button
                onClick={onSwitchRole}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                title="Switch active user or role"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline truncate max-w-[120px]">
                  {currentUserName || currentRole.replace('_', ' ')}
                </span>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">
                  ({currentRole === 'AMBULANCE_STAFF' ? 'Paramedic' : currentRole === 'HOSPITAL_STAFF' ? 'Hospital' : 'Patient'})
                </span>
                <LogOut className="w-3.5 h-3.5 ml-1 text-slate-400 hover:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSwitchRole}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={onResetDemo}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset system state to defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
