import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRaceStore } from '../stores/useRaceStore';
import { CarComponent } from './CarComponent';
import { TRACK_CONFIG, TRACK_NODES } from '../config/track.config';
import { PhysicsEngine } from '../engine/physicsEngine';
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sun,
  CloudRain,
  Flame,
  Trophy,
  CloudSun,
  Wrench,
  ShieldAlert,
  Flag,
  Search,
  Gauge,
  Sparkles,
  Building,
} from 'lucide-react';

export const RaceTrack: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectVehicle,
    weather,
    pitBoxes,
    mechanics,
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

  // Coordinates for the 10 Pit Boxes across x=270 to x=648 (spacing 42px)
  const pitBoxSlots = Array.from({ length: 10 }, (_, i) => {
    const boxNum = i + 1;
    const boxX = 270 + i * 42;
    const pBox = pitBoxes.find((b) => b.number === boxNum);
    const mech = pBox ? mechanics.find((m) => m.id === pBox.mechanicId) : null;
    const currentVehicle = vehicles.find(
      (v) => v.assignedBoxId === pBox?.id && v.visualState === 'BOX_RUNNING'
    );
    return { boxNum, boxX, pBox, mech, currentVehicle };
  });

  return (
    <div
      className={`relative w-full h-[580px] rounded-2xl border border-gray-800 bg-gradient-to-b ${getWeatherBg()} overflow-hidden shadow-2xl select-none`}
    >
      {/* Racetrack Control Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white flex items-center gap-2 font-mono shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-[#FF6B00]">RACE CONTROL ISOMÉTRICO 2.5D</span>
          <span className="text-gray-400">| 8 SETORES TÉCNICOS</span>
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
      <div className="w-full h-full flex items-center justify-center p-1">
        <svg
          viewBox={`0 0 ${TRACK_CONFIG.viewBoxWidth} ${TRACK_CONFIG.viewBoxHeight}`}
          className="w-full h-full max-h-[550px] transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <defs>
            {/* Asphalt Pattern & Gradients */}
            <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#252A34" />
              <stop offset="50%" stopColor="#1E222A" />
              <stop offset="100%" stopColor="#171A21" />
            </linearGradient>

            <linearGradient id="pitLaneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B212B" />
              <stop offset="100%" stopColor="#141821" />
            </linearGradient>

            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#133D25" />
              <stop offset="100%" stopColor="#0B2616" />
            </linearGradient>

            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2D3748" />
              <stop offset="100%" stopColor="#1A202C" />
            </linearGradient>

            {/* Neon Glow Filters */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Red & White Zebra Pattern */}
            <pattern id="zebraPattern" width="16" height="8" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="8" height="8" fill="#EF4444" />
              <rect x="8" y="0" width="8" height="8" fill="#FFFFFF" />
            </pattern>
          </defs>

          {/* 1. Base Canvas Background Terrain (Grass & Escape Run-offs) */}
          <rect width="1200" height="620" rx="24" fill="#0B0F17" />
          <path
            d="M 40,40 L 1160,40 L 1160,580 L 40,580 Z"
            fill="url(#grassGrad)"
            rx="16"
            opacity="0.95"
          />

          {/* Environmental Paddock Elements: Trees, Truck Transporters, Safety Bay */}
          {/* Team Transporters (Top Right Paddock) */}
          <g transform="translate(1000, 70)">
            <rect x="0" y="0" width="120" height="35" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <rect x="5" y="5" width="85" height="25" rx="2" fill="#FF6B00" opacity="0.8" />
            <text x="47" y="21" fill="#FFF" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              COMET RACE TEAM
            </text>
            <rect x="95" y="8" width="20" height="19" rx="3" fill="#0F172A" />
          </g>

          {/* Safety Car & Ambulance (Bottom Left Service Bay) */}
          <g transform="translate(60, 520)">
            <rect x="0" y="0" width="70" height="40" rx="6" fill="#141A24" stroke="#1E293B" strokeWidth="1" />
            <text x="35" y="14" fill="#94A3B8" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              SERVIÇO / GUINCHO
            </text>
            {/* Tow Truck icon */}
            <rect x="10" y="20" width="22" height="12" rx="2" fill="#EAB308" />
            <rect x="38" y="20" width="22" height="12" rx="2" fill="#EF4444" />
          </g>

          {/* Spectator Grandstands (Arquibancada Top Center) */}
          <g transform="translate(480, 50)">
            <rect x="0" y="0" width="160" height="22" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <text x="80" y="14" fill="#38BDF8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              ARQUIBANCADA VIP PADDOCK
            </text>
          </g>

          {/* 2. Racetrack Outer Curbs / Zebras (Red/White Edge Lines) */}
          <path
            d="M 120,160 L 220,190 C 300,220 320,110 400,110 L 800,110 C 920,110 960,200 940,320 L 920,490 C 900,550 820,540 700,540 L 220,540 C 100,540 60,450 80,360 L 100,220 Z"
            fill="none"
            stroke="url(#zebraPattern)"
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Asphalt Main Race Circuit Track */}
          <path
            d="M 120,160 L 220,190 C 300,220 320,110 400,110 L 800,110 C 920,110 960,200 940,320 L 920,490 C 900,550 820,540 700,540 L 220,540 C 100,540 60,450 80,360 L 100,220 Z"
            fill="none"
            stroke="url(#asphaltGrad)"
            strokeWidth="42"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dashed Center Track Line */}
          <path
            d="M 120,160 L 220,190 C 300,220 320,110 400,110 L 800,110 C 920,110 960,200 940,320 L 920,490 C 900,550 820,540 700,540 L 220,540 C 100,540 60,450 80,360 L 100,220 Z"
            fill="none"
            stroke="#ECECEC"
            strokeWidth="2"
            strokeDasharray="10 10"
            opacity="0.5"
          />

          {/* 4. Pit Lane Branch Loop (Entry from Diagnóstico -> Pit Complex -> Re-entry to Reta Final) */}
          <path
            d="M 230,220 L 250,288 L 680,288 L 740,490"
            fill="none"
            stroke="url(#pitLaneGrad)"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 230,220 L 250,288 L 680,288 L 740,490"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.6"
          />

          {/* ========================================================================= */}
          {/* SECTOR 1: ENTRADA DA OFICINA & GRID DE LARGADA (CHECK-IN) */}
          {/* ========================================================================= */}
          <g transform="translate(90, 130)">
            {/* Entrance Gate Portal Structure */}
            <rect x="0" y="0" width="110" height="50" rx="8" fill="#141A24" stroke="#3B82F6" strokeWidth="1.5" />
            <rect x="5" y="5" width="100" height="20" rx="4" fill="#1E293B" />
            <text x="55" y="19" fill="#3B82F6" fontSize="9" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              1. PORTÃO / CHECK-IN
            </text>
            <text x="55" y="38" fill="#94A3B8" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
              Recepção & Triagem
            </text>

            {/* Barrier Gate Arm (Cancela) */}
            <line x1="110" y1="25" x2="140" y2="25" stroke="#EF4444" strokeWidth="4" strokeDasharray="6 3" />
            <circle cx="110" cy="25" r="4" fill="#3B82F6" />

            {/* Start Lights (Semáforo) */}
            <g transform="translate(130, -20)">
              <rect x="0" y="0" width="24" height="12" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              <circle cx="6" cy="6" r="3" fill="#EF4444" />
              <circle cx="12" cy="6" r="3" fill="#EAB308" />
              <circle cx="18" cy="6" r="3" fill="#10B981" />
            </g>
          </g>

          {/* ========================================================================= */}
          {/* SECTOR 2: CURVA TÉCNICA / DIAGNÓSTICO */}
          {/* ========================================================================= */}
          <g transform="translate(320, 45)">
            <rect x="0" y="0" width="140" height="52" rx="8" fill="#141A24" stroke="#06B6D4" strokeWidth="1.5" />
            <rect x="5" y="5" width="130" height="20" rx="4" fill="#083344" />
            <text x="70" y="19" fill="#06B6D4" fontSize="9" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              2. DIAGNÓSTICO
            </text>
            <text x="70" y="38" fill="#94A3B8" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
              Análise Técnica & Scanner
            </text>
            {/* Diagnostic Scanner Bay Icon */}
            <circle cx="12" cy="38" r="5" fill="#06B6D4" opacity="0.3" />
          </g>

          {/* ========================================================================= */}
          {/* SECTOR 3: TORRE DE CONTROLE / ORÇAMENTO */}
          {/* ========================================================================= */}
          <g transform="translate(630, 30)">
            {/* Multi-tier Circular/Octagonal Tower Structure */}
            <path d="M 30,80 L 100,80 L 95,15 L 35,15 Z" fill="#1E293B" stroke="#EAB308" strokeWidth="1.5" />
            <rect x="25" y="35" width="80" height="22" rx="4" fill="#141A24" stroke="#EAB308" strokeWidth="1" />
            <text x="65" y="50" fill="#EAB308" fontSize="9" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              3. ORÇAMENTO
            </text>
            {/* Tower Observation Deck Glass */}
            <rect x="40" y="20" width="50" height="10" rx="2" fill="#38BDF8" opacity="0.6" />
            {/* Antenna Radar Dish */}
            <line x1="65" y1="15" x2="65" y2="2" stroke="#EAB308" strokeWidth="2" />
            <circle cx="65" cy="2" r="3" fill="#EAB308" className="animate-ping" />
            <text x="65" y="72" fill="#CBD5E1" fontSize="8" textAnchor="middle" fontFamily="sans-serif">
              Torre de Aprovação
            </text>
          </g>

          {/* ========================================================================= */}
          {/* SECTOR 4: COMPLEXO DOS BOXES (BOX 01 A 10) - EXECUÇÃO */}
          {/* ========================================================================= */}
          <g transform="translate(240, 210)">
            {/* Outer Pit Building Roof & Structure Frame */}
            <rect x="0" y="0" width="450" height="120" rx="12" fill="#141A24" stroke="#FF6B00" strokeWidth="2" />
            
            {/* Header Title Banner */}
            <rect x="10" y="6" width="430" height="20" rx="4" fill="#1B2330" />
            <text x="225" y="20" fill="#FF6B00" fontSize="10" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              4. EXECUÇÃO — COMPLEXO DOS BOXES (OFICINA PRINCIPAL)
            </text>

            {/* 10 Individual Pit Bays with Lifts */}
            {pitBoxSlots.map(({ boxNum, pBox, mech, currentVehicle }, idx) => {
              const bayX = 15 + idx * 42;
              const isOccupied = !!currentVehicle;

              return (
                <g key={boxNum} transform={`translate(${bayX}, 32)`}>
                  {/* Bay Container */}
                  <rect
                    x="0"
                    y="0"
                    width="38"
                    height="78"
                    rx="4"
                    fill={isOccupied ? '#1E293B' : '#0F172A'}
                    stroke={isOccupied ? '#FF6B00' : '#334155'}
                    strokeWidth={isOccupied ? '1.5' : '1'}
                  />

                  {/* Box Number Header */}
                  <rect x="2" y="2" width="34" height="12" rx="2" fill="#0B0F17" />
                  <text
                    x="19"
                    y="11"
                    fill={isOccupied ? '#FF6B00' : '#94A3B8'}
                    fontSize="8"
                    fontWeight="extrabold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {boxNum < 10 ? `0${boxNum}` : boxNum}
                  </text>

                  {/* Two-Post Automotive Hydraulic Lift (Elevador Automotivo) */}
                  <rect x="4" y="22" width="4" height="42" rx="1" fill="#475569" />
                  <rect x="30" y="22" width="4" height="42" rx="1" fill="#475569" />
                  {/* Lift Arms */}
                  <line x1="4" y1="42" x2="34" y2="42" stroke="#64748B" strokeWidth="2" />

                  {/* Workbench / Tool Cabinet */}
                  <rect x="10" y="66" width="18" height="8" rx="1" fill="#334155" />

                  {/* Mechanic Name Tag */}
                  {mech && (
                    <text
                      x="19"
                      y="60"
                      fill="#E2E8F0"
                      fontSize="6"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      className="truncate"
                    >
                      {mech.name.split(' ')[0]}
                    </text>
                  )}

                  {/* Status LED */}
                  <circle
                    cx="19"
                    cy="18"
                    r="2.5"
                    fill={isOccupied ? '#FF6B00' : '#10B981'}
                    className={isOccupied ? 'animate-pulse' : ''}
                  />
                </g>
              );
            })}
          </g>

          {/* ========================================================================= */}
          {/* SECTOR 5: ÁREA STAND BY (PÁTIO LATERAL) */}
          {/* ========================================================================= */}
          <g transform="translate(50, 330)">
            <rect x="0" y="0" width="120" height="80" rx="10" fill="#141A24" stroke="#EF4444" strokeWidth="1.5" />
            <rect x="5" y="5" width="110" height="20" rx="4" fill="#451A1A" />
            <text x="60" y="19" fill="#EF4444" fontSize="9" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              5. STAND BY
            </text>
            <text x="60" y="38" fill="#F87171" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
              Aguard. Peças / Autorização
            </text>

            {/* Hazard Traffic Cones Icons */}
            <polygon points="20,70 15,76 25,76" fill="#F97316" />
            <polygon points="100,70 95,76 105,76" fill="#F97316" />
            {/* Warning Light Beacon */}
            <circle cx="60" cy="55" r="8" fill="#EF4444" opacity="0.3" className="animate-ping" />
            <circle cx="60" cy="55" r="4" fill="#EF4444" />
          </g>

          {/* ========================================================================= */}
          {/* SECTOR 6: RETA DE PERFORMANCE / TESTE DE PISTA */}
          {/* ========================================================================= */}
          <g transform="translate(850, 240)">
            <rect x="0" y="0" width="140" height="50" rx="8" fill="#141A24" stroke="#A855F7" strokeWidth="1.5" />
            <rect x="5" y="5" width="130" height="20" rx="4" fill="#3B0764" />
            <text x="70" y="19" fill="#A855F7" fontSize="9" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              6. TESTE DE PISTA
            </text>
            <text x="70" y="38" fill="#C084FC" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
              Reta de Performance
            </text>
          </g>

          {/* ========================================================================= */}
          {/* SECTOR 7: FINALIZAÇÃO */}
          {/* ========================================================================= */}
          <g transform="translate(840, 460)">
            <rect x="0" y="0" width="130" height="50" rx="8" fill="#141A24" stroke="#10B981" strokeWidth="1.5" />
            <rect x="5" y="5" width="120" height="20" rx="4" fill="#064E3B" />
            <text x="65" y="19" fill="#10B981" fontSize="9" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              7. FINALIZAÇÃO
            </text>
            <text x="65" y="38" fill="#34D399" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
              Preparação & Lavagem
            </text>
          </g>

          {/* ========================================================================= */}
          {/* SECTOR 8: LINHA DE CHEGADA & PÓDIO (ENTREGA) */}
          {/* ========================================================================= */}
          {/* Chequered Finish Line Arch Gantry */}
          <g transform="translate(820, 520)">
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#FFF" strokeWidth="6" strokeDasharray="4 4" />
            <rect x="-25" y="-35" width="50" height="14" rx="3" fill="#0F172A" stroke="#FFF" strokeWidth="1" />
            <text x="0" y="-25" fill="#FFF" fontSize="8" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              CHEGADA 🏁
            </text>
          </g>

          {/* Podium Platform (3-Tier Steps) */}
          <g transform="translate(630, 480)">
            <rect x="0" y="0" width="160" height="65" rx="10" fill="#141A24" stroke="#F59E0B" strokeWidth="1.5" />
            <rect x="5" y="5" width="150" height="20" rx="4" fill="#451A03" />
            <text x="80" y="19" fill="#F59E0B" fontSize="9" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
              8. PÓDIO DE ENTREGA
            </text>

            {/* Podium Blocks: 2nd, 1st, 3rd */}
            {/* 2nd Place */}
            <rect x="35" y="40" width="25" height="18" fill="#94A3B8" rx="2" />
            <text x="47" y="52" fill="#0F172A" fontSize="8" fontWeight="extrabold" textAnchor="middle">2</text>
            {/* 1st Place */}
            <rect x="65" y="32" width="30" height="26" fill="#F59E0B" rx="2" />
            <text x="80" y="47" fill="#0F172A" fontSize="10" fontWeight="extrabold" textAnchor="middle">1</text>
            {/* 3rd Place */}
            <rect x="100" y="44" width="25" height="14" fill="#D97706" rx="2" />
            <text x="112" y="54" fill="#0F172A" fontSize="8" fontWeight="extrabold" textAnchor="middle">3</text>
          </g>

          {/* Connection Neon Line from Selected Car to Assigned Pit Box */}
          {selectedVehicle && assignedBox && (
            <path
              d={`M ${
                PhysicsEngine.getVehiclePosition(
                  selectedVehicle.visualState,
                  0,
                  selectedVehicle.progress,
                  assignedBox.number
                ).x
              },${
                PhysicsEngine.getVehiclePosition(
                  selectedVehicle.visualState,
                  0,
                  selectedVehicle.progress,
                  assignedBox.number
                ).y
              } L ${255 + (assignedBox.number - 1) * 42}, 242`}
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
            const boxNum = vehicle.assignedBoxId
              ? pitBoxes.find((b) => b.id === vehicle.assignedBoxId)?.number
              : undefined;
            const pos = PhysicsEngine.getVehiclePosition(
              vehicle.visualState,
              idx,
              vehicle.progress,
              boxNum
            );
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

      {/* MiniMap Overlay when Zoomed In */}
      {zoom > 1.1 && (
        <div className="absolute bottom-4 right-4 z-30 w-40 h-24 bg-[#141A24]/90 border border-gray-700 rounded-xl p-1.5 shadow-2xl backdrop-blur-md">
          <p className="text-[9px] font-mono font-bold text-gray-400 mb-0.5 text-center uppercase">
            MINIMAPA
          </p>
          <svg viewBox="0 0 1200 620" className="w-full h-16">
            <path
              d="M 120,160 L 220,190 C 300,220 320,110 400,110 L 800,110 C 920,110 960,200 940,320 L 920,490 C 900,550 820,540 700,540 L 220,540 C 100,540 60,450 80,360 L 100,220 Z"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="24"
            />
            {vehicles.map((v, i) => {
              const bNum = v.assignedBoxId ? pitBoxes.find((b) => b.id === v.assignedBoxId)?.number : undefined;
              const p = PhysicsEngine.getVehiclePosition(v.visualState, i, v.progress, bNum);
              return <circle key={v.id} cx={p.x} cy={p.y} r="28" fill={v.color} />;
            })}
          </svg>
        </div>
      )}
    </div>
  );
};

