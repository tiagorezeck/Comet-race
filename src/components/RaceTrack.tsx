import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRaceStore } from '../stores/useRaceStore';
import { CarComponent } from './CarComponent';
import { TRACK_CONFIG, TRACK_NODES } from '../config/track.config';
import { PhysicsEngine } from '../engine/physicsEngine';
import { ZoomIn, ZoomOut, RefreshCw, Sun, CloudRain, Flame, Trophy, CloudSun } from 'lucide-react';

export const RaceTrack: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectVehicle,
    weather,
    pitBoxes,
    searchQuery,
  } = useRaceStore();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const assignedBox = selectedVehicle?.assignedBoxId
    ? pitBoxes.find((b) => b.id === selectedVehicle?.assignedBoxId)
    : null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Weather background styling
  const getWeatherBg = () => {
    switch (weather) {
      case 'SUNSET':
        return 'from-[#1A120B] via-[#2B1B10] to-[#0B0F17]';
      case 'RAINY':
        return 'from-[#0B1320] via-[#0F1C2E] to-[#0B0F17]';
      case 'VICTORY_FIREWORKS':
        return 'from-[#1C1204] via-[#2B1E06] to-[#0B0F17]';
      default:
        return 'from-[#0B0F17] via-[#141A24] to-[#0B0F17]';
    }
  };

  return (
    <div className={`relative w-full h-[540px] rounded-2xl border border-gray-800 bg-gradient-to-b ${getWeatherBg()} overflow-hidden shadow-2xl`}>
      {/* Racetrack Control Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white flex items-center gap-2 font-mono shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-[#FF6B00]">CIRCUITO COMET 2.5D</span>
          <span className="text-gray-400">| 8 SETORES</span>
        </div>

        {/* Weather Indicator */}
        <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-300 flex items-center gap-1.5 font-mono shadow-md">
          {weather === 'SUNNY' && <Sun className="w-4 h-4 text-amber-400" />}
          {weather === 'SUNSET' && <CloudSun className="w-4 h-4 text-orange-400" />}
          {weather === 'RAINY' && <CloudRain className="w-4 h-4 text-sky-400 animate-bounce" />}
          {weather === 'VICTORY_FIREWORKS' && <Flame className="w-4 h-4 text-yellow-400 animate-pulse" />}
          <span className="capitalize">{weather.toLowerCase()}</span>
        </div>
      </div>

      {/* Zoom / Pan Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-[#141A24]/90 backdrop-blur-md border border-gray-800 p-1 rounded-xl shadow-md">
        <button
          onClick={handleZoomIn}
          title="Zoom Aumentar"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Diminuir"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Resetar Visão"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Racetrack SVG Canvas */}
      <div className="w-full h-full flex items-center justify-center p-2">
        <svg
          viewBox={`0 0 ${TRACK_CONFIG.viewBoxWidth} ${TRACK_CONFIG.viewBoxHeight}`}
          className="w-full h-full max-h-[500px] transition-transform duration-300 ease-out select-none"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <defs>
            {/* Asphalt Pattern */}
            <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2F37" />
              <stop offset="100%" stopColor="#1E232B" />
            </linearGradient>

            {/* Neon Glow Filters */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Outer Grass / Escape Zones */}
          <rect width="1000" height="500" rx="20" fill="#0B0F17" />

          {/* Racetrack Outer Contour Loop (Isometric 2.5D Path) */}
          <path
            d="M 120,380 L 300,380 C 420,380 440,240 500,120 L 880,120 C 940,120 960,240 920,280 L 800,380 C 700,380 400,380 120,380 Z"
            fill="none"
            stroke="#1C5E35"
            strokeWidth="54"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Asphalt Track Main Surface */}
          <path
            d="M 120,380 L 300,380 C 420,380 440,240 500,120 L 880,120 C 940,120 960,240 920,280 L 800,380 C 700,380 400,380 120,380 Z"
            fill="none"
            stroke="url(#asphaltGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dashed Center Track Line */}
          <path
            d="M 120,380 L 300,380 C 420,380 440,240 500,120 L 880,120 C 940,120 960,240 920,280 L 800,380 C 700,380 400,380 120,380 Z"
            fill="none"
            stroke="#ECECEC"
            strokeWidth="2"
            strokeDasharray="8 8"
            opacity="0.6"
          />

          {/* Pit Lane Branch Line leading to Boxes */}
          <path
            d="M 520,120 L 880,120"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="3"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Render 8 Sector Landmarks */}
          {TRACK_NODES.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* Node Base Anchor Circle */}
              <circle r="8" fill="#141A24" stroke="#3B82F6" strokeWidth="2" />

              {/* Sector Name Tag */}
              <rect x="-35" y="12" width="70" height="14" rx="3" fill="#141A24" opacity="0.85" />
              <text x="0" y="22" textAnchor="middle" fill="#9CA3AF" fontSize="7" fontWeight="bold" fontFamily="monospace">
                {node.name.split(' ')[0]}
              </text>
            </g>

            
          ))}

          {/* Start / Finish Chequered Line */}
          <g transform="translate(720, 380)">
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFF" strokeWidth="4" strokeDasharray="3 3" />
            <text x="5" y="-22" fill="#FFF" fontSize="10" fontWeight="extrabold" fontFamily="monospace">
              FINISH 🏁
            </text>
          </g>

          {/* Podium Structure at Pódio Node */}
          <g transform="translate(450, 380)">
            <rect x="-25" y="-30" width="50" height="12" rx="3" fill="#F59E0B" opacity="0.3" stroke="#F59E0B" strokeWidth="1" />
            <text x="0" y="-22" textAnchor="middle" fill="#F59E0B" fontSize="9" fontWeight="bold">
              PÓDIO DE ENTREGA
            </text>
          </g>

          {/* Connection Neon Line from Selected Car to Assigned Box */}
          {selectedVehicle && assignedBox && (
            <path
              d={`M ${PhysicsEngine.getVehiclePosition(selectedVehicle.visualState).x},${PhysicsEngine.getVehiclePosition(selectedVehicle.visualState).y} L ${620 + (assignedBox.number - 1) * 120},120`}
              fill="none"
              stroke="#FF6B00"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              filter="url(#neonGlow)"
              className="animate-pulse"
            />
          )}

          {/* Render Vehicles on Track */}
          {vehicles.map((vehicle, idx) => {
            const pos = PhysicsEngine.getVehiclePosition(vehicle.visualState, idx, vehicle.progress);
            const isSelected = vehicle.id === selectedVehicleId;

            return (
              <CarComponent
                key={vehicle.id}
                vehicle={vehicle}
                x={pos.x}
                y={pos.y}
                rotation={pos.rotation}
                isSelected={isSelected}
                onSelect={(id) => selectVehicle(id)}
              />
            );
          })}
        </svg>
      </div>

      {/* MiniMap Overlay when Zoomed In (Doc 02) */}
      {zoom > 1.1 && (
        <div className="absolute bottom-4 right-4 z-30 w-36 h-20 bg-[#141A24]/90 border border-gray-700 rounded-xl p-1 shadow-2xl backdrop-blur-md">
          <p className="text-[9px] font-mono font-bold text-gray-400 mb-0.5 text-center">MINIMAPA</p>
          <svg viewBox="0 0 1000 500" className="w-full h-12">
            <path
              d="M 120,380 L 300,380 C 420,380 440,240 500,120 L 880,120 C 940,120 960,240 920,280 L 800,380 C 700,380 400,380 120,380 Z"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="20"
            />
            {vehicles.map((v, i) => {
              const p = PhysicsEngine.getVehiclePosition(v.visualState, i);
              return <circle key={v.id} cx={p.x} cy={p.y} r="25" fill={v.color} />;
            })}
          </svg>
        </div>
      )}
    </div>
  );
};
