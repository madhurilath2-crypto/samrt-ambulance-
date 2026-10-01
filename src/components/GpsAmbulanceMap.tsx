import React from 'react';
import { Navigation, MapPin, Building, Gauge, Compass, Route } from 'lucide-react';
import { AmbulanceTrip } from '../types';

interface GpsAmbulanceMapProps {
  trip: AmbulanceTrip;
}

export const GpsAmbulanceMap: React.FC<GpsAmbulanceMapProps> = ({ trip }) => {
  // Map dimensions for vector rendering
  const width = 600;
  const height = 260;

  // Calculate percentage along route (initial was 4.8 km)
  const initialDist = 4.8;
  const progressRatio = Math.max(0, Math.min(1, 1 - trip.distanceKm / initialDist));

  // Route path coordinates: Start (50, 190) -> (180, 170) -> (280, 100) -> (420, 120) -> End (540, 60)
  // Let's interpolate position along the route
  const startX = 60;
  const startY = 200;
  const hX = 530;
  const hY = 60;

  // Curving waypoints
  const midX = 260;
  const midY = 120;

  // Approximate ambulance position
  let ambX = startX + (midX - startX) * (progressRatio * 1.6);
  let ambY = startY + (midY - startY) * (progressRatio * 1.6);

  if (progressRatio > 0.6) {
    const subProgress = (progressRatio - 0.6) / 0.4;
    ambX = midX + (hX - midX) * subProgress;
    ambY = midY + (hY - midY) * subProgress;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs text-white">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-xs font-bold tracking-tight text-white uppercase">
            Live GPS Route Telemetry
          </span>
          <span className="text-[10px] bg-blue-900/60 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-700">
            4G LTE-M Lock
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px]">DISTANCE: </span>
            <span className="text-white font-bold">{trip.distanceKm.toFixed(1)} km</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">SPEED: </span>
            <span className="text-blue-400 font-bold">{trip.status === 'REACHED' ? 0 : trip.speedKmh} km/h</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">ETA: </span>
            <span className={`font-bold ${trip.etaMinutes <= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {trip.status === 'REACHED' ? 'ARRIVED' : `${trip.etaMinutes} min`}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative bg-[#0b132b] h-56 sm:h-64 w-full overflow-hidden select-none">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Secondary road network grid */}
          <path d="M20,60 L580,60 M20,130 L580,130 M20,200 L580,200" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M120,20 L120,240 M300,20 L300,240 M460,20 L460,240" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />

          {/* Active Emergency Arterial Route */}
          <path
            d={`M${startX},${startY} Q${midX - 40},${midY + 40} ${midX},${midY} T${hX},${hY}`}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Pulsing Traveled Path */}
          <path
            d={`M${startX},${startY} Q${midX - 40},${midY + 40} ${midX},${midY} T${hX},${hY}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />

          {/* Incident Pickup Point */}
          <g transform={`translate(${startX}, ${startY})`}>
            <circle r="14" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
            <circle r="5" fill="#94a3b8" />
            <text x="18" y="4" fill="#94a3b8" fontSize="10" fontWeight="bold">Incident Origin</text>
          </g>

          {/* Hospital Destination Bay */}
          <g transform={`translate(${hX}, ${hY})`}>
            <circle r="18" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
            <circle r="8" fill="#ef4444" />
            <text x="-6" y="4" fill="#ffffff" fontSize="10" fontWeight="bold">H</text>
            <text x="-120" y="-12" fill="#38bdf8" fontSize="10" fontWeight="bold">St. Jude Trauma Bay</text>
          </g>

          {/* Moving Ambulance Vehicle Marker */}
          <g transform={`translate(${ambX}, ${ambY})`}>
            {/* Siren Radio Ring */}
            <circle r="22" fill="#ef4444" opacity="0.2" className="animate-ping" />
            <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <path
              d="M-5,-4 L5,-4 L7,1 L5,5 L-5,5 Z"
              fill="#ffffff"
            />
            <circle cx="-3" cy="5" r="1.5" fill="#0f172a" />
            <circle cx="3" cy="5" r="1.5" fill="#0f172a" />
            <text x="18" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" className="drop-shadow">
              AMB-04
            </text>
          </g>
        </svg>

        {/* Floating live coordinates HUD */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className="text-slate-500">LAT:</span> {trip.latitude.toFixed(5)}°N{' '}
          <span className="text-slate-500 ml-2">LNG:</span> {Math.abs(trip.longitude).toFixed(5)}°W
        </div>

        {/* Floating Destination Callout */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-right">
          <span className="text-slate-400 block text-[10px]">RECEIVING FACILITY</span>
          <span className="font-semibold text-blue-300">{trip.destinationHospitalName}</span>
        </div>
      </div>
    </div>
  );
};
