import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Vehicle } from '../types/race';
import { SECTOR_CONFIGS } from '../config/track.config';
import { Clock, User, Sparkles, Wrench, ShieldAlert } from 'lucide-react';

interface CarComponentProps {
  vehicle: Vehicle;
  x: number;
  y: number;
  rotation: number;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: (id: string) => void;
  onDragStart?: (id: string, e: React.MouseEvent) => void;
}

export const CarComponent: React.FC<CarComponentProps> = ({
  vehicle,
  x,
  y,
  rotation,
  isSelected,
  isDragging = false,
  onSelect,
  onDragStart,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sector = SECTOR_CONFIGS[vehicle.visualState] || SECTOR_CONFIGS['GATE_PARKED'];
  const isDelayed = vehicle.elapsedMinutes > vehicle.estimatedHours * 60;
  const isCritical = vehicle.elapsedMinutes > vehicle.estimatedHours * 60 * 1.2;

  // Dynamic Neon Aura Glow Color based on priority, delay and state
  const getGlowColor = () => {
    if (isDragging) return '#00FFCC';
    if (isSelected) return '#FF6B00';
    if (isCritical) return '#EF4444';
    if (isDelayed) return '#F59E0B';
    if (vehicle.priority === 'VIP') return '#A855F7';
    return sector.color || '#38BDF8';
  };

  const glow = getGlowColor();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(vehicle.id);
    if (onDragStart) {
      onDragStart(vehicle.id, e);
    }
  };

  return (
    <motion.g
      initial={false}
      animate={{
        x,
        y,
        scale: isDragging ? 1.15 : isHovered ? 1.05 : 1,
      }}
      transition={
        isDragging
          ? { duration: 0 }
          : { type: 'spring', stiffness: 100, damping: 18 }
      }
      className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(vehicle.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Glowing Interactive Aura */}
      <circle
        r={isDragging ? 38 : isSelected ? 34 : 26}
        fill={glow}
        opacity={isDragging ? 0.45 : isSelected ? 0.35 : isHovered ? 0.25 : 0.12}
        className={isCritical || isSelected || isDragging ? 'animate-pulse' : ''}
      />

      {/* Pulsing Selection / Dragging Target Halo */}
      {(isSelected || isDragging) && (
        <circle
          r={isDragging ? 40 : 36}
          fill="none"
          stroke={isDragging ? '#00FFCC' : '#FF6B00'}
          strokeWidth={isDragging ? '2.5' : '1.8'}
          strokeDasharray="6 3"
          className="animate-spin"
          style={{ animationDuration: isDragging ? '4s' : '10s' }}
        />
      )}

      {/* Rotatable Ultra-Modern GT3 / Hypercar Vehicle Chassis Model */}
      <g transform={`rotate(${rotation})`}>
        {/* Headlights High-Xenon Beam Cone Projection */}
        <path
          d="M 22,-8 L 80,-32 L 80,32 L 22,8 Z"
          fill="url(#headlightCone)"
          opacity={isDragging ? 0.7 : 0.45}
          className="pointer-events-none"
        />

        {/* Realistic Underbody Cast Shadow (elevates on drag) */}
        <ellipse
          cx={isDragging ? '-4' : '-2'}
          cy={isDragging ? '10' : '6'}
          rx={isDragging ? '32' : '28'}
          ry={isDragging ? '16' : '14'}
          fill="#000000"
          opacity={isDragging ? 0.75 : 0.6}
        />

        {/* Carbon Fiber Rear Aerodynamic Diffuser Fins */}
        <g transform="translate(-24, -10)">
          <path d="M 0,0 L -5,-2 L -5,22 L 0,20 Z" fill="#020617" />
          <line x1="-5" y1="4" x2="0" y2="5" stroke="#38BDF8" strokeWidth="0.8" opacity="0.8" />
          <line x1="-5" y1="10" x2="0" y2="10" stroke="#38BDF8" strokeWidth="0.8" opacity="0.8" />
          <line x1="-5" y1="16" x2="0" y2="15" stroke="#38BDF8" strokeWidth="0.8" opacity="0.8" />
        </g>

        {/* Wide Low-Profile GT3 Racing Tires with Alloy Rims & Calipers */}
        {/* Front Left Wheel */}
        <g transform="translate(11, -15)">
          <rect x="0" y="0" width="10" height="4.5" rx="1.5" fill="#0B0F17" stroke="#334155" strokeWidth="0.5" />
          <rect x="2" y="1" width="6" height="2.5" rx="0.8" fill="#475569" />
          <line x1="5" y1="0" x2="5" y2="4.5" stroke="#EF4444" strokeWidth="1" />
        </g>
        {/* Front Right Wheel */}
        <g transform="translate(11, 10.5)">
          <rect x="0" y="0" width="10" height="4.5" rx="1.5" fill="#0B0F17" stroke="#334155" strokeWidth="0.5" />
          <rect x="2" y="1" width="6" height="2.5" rx="0.8" fill="#475569" />
          <line x1="5" y1="0" x2="5" y2="4.5" stroke="#EF4444" strokeWidth="1" />
        </g>
        {/* Rear Left Wheel (Wider) */}
        <g transform="translate(-15, -15.5)">
          <rect x="0" y="0" width="11" height="5" rx="1.5" fill="#0B0F17" stroke="#334155" strokeWidth="0.5" />
          <rect x="2" y="1" width="7" height="3" rx="0.8" fill="#475569" />
          <line x1="5.5" y1="0" x2="5.5" y2="5" stroke="#EAB308" strokeWidth="1" />
        </g>
        {/* Rear Right Wheel (Wider) */}
        <g transform="translate(-15, 10.5)">
          <rect x="0" y="0" width="11" height="5" rx="1.5" fill="#0B0F17" stroke="#334155" strokeWidth="0.5" />
          <rect x="2" y="1" width="7" height="3" rx="0.8" fill="#475569" />
          <line x1="5.5" y1="0" x2="5.5" y2="5" stroke="#EAB308" strokeWidth="1" />
        </g>

        {/* Aggressive Front Splitter (Carbon Fiber Lip) */}
        <path
          d="M 21,-11 L 28,-7 C 29.5,-3 29.5,3 28,7 L 21,11 L 18,12 L 18,-12 Z"
          fill="#0B0F17"
          stroke="#1E293B"
          strokeWidth="0.8"
        />

        {/* Wide Body Aerodynamic Chassis (Metallic Paint Body) */}
        <path
          d="M -22,-9 C -22,-13 -12,-14 -2,-12 C 4,-12 10,-12.5 18,-10 C 23,-7 26,-4 26,0 C 26,4 23,7 18,10 C 10,12.5 4,12 -2,12 C -12,14 -22,13 -22,9 C -24,5 -24,-5 -22,-9 Z"
          fill={vehicle.color}
          stroke="#090D14"
          strokeWidth="1.5"
        />

        {/* Dual Hood Heat Intake Scoops / Naca Ducts (Porsche GT3 RS Style) */}
        <path d="M 8,-6 L 16,-4 L 16,-1 L 8,-2 Z" fill="#090D14" opacity="0.85" />
        <path d="M 8,6 L 16,4 L 16,1 L 8,2 Z" fill="#090D14" opacity="0.85" />

        {/* Metallic Paint Curved Specular Highlight Lines */}
        <path
          d="M -18,-8 C -12,-11 2,-11 14,-8 C 20,-5 22,-2 22,0 C 20,2 14,0 2,-2 Z"
          fill="#FFFFFF"
          opacity="0.22"
        />

        {/* Side Air Scoop Intakes for Engine Cooling */}
        <path d="M -8,-12 L -2,-11 L -2,-8 L -8,-9 Z" fill="#020617" />
        <path d="M -8,12 L -2,11 L -2,8 L -8,9 Z" fill="#020617" />

        {/* Tinted Panoramic Glass Canopy & Cockpit */}
        <path
          d="M -10,-7 L 2,-7 C 8,-7 12,-4 12,0 C 12,4 8,7 2,7 L -10,7 C -14,5 -14,-5 -10,-7 Z"
          fill="#020617"
          stroke="#0F172A"
          strokeWidth="1"
        />
        {/* Glass Windshield & Roof Reflection Sheen */}
        <path
          d="M -6,-6 L 0,-6 C 5,-6 8,-3 8,0 C 8,3 5,3 0,2 Z"
          fill="#38BDF8"
          opacity="0.45"
        />
        <line x1="-4" y1="-5" x2="4" y2="4" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />

        {/* Aerodynamic Side Wing Mirrors */}
        <path d="M 6,-11 L 3,-15 L 8,-14 Z" fill="#090D14" stroke={vehicle.color} strokeWidth="0.8" />
        <path d="M 6,11 L 3,15 L 8,14 Z" fill="#090D14" stroke={vehicle.color} strokeWidth="0.8" />

        {/* Modern Swan-Neck Carbon GT Wing Spoiler */}
        <g transform="translate(-21, 0)">
          <line x1="0" y1="-6" x2="3" y2="-6" stroke="#020617" strokeWidth="1.5" />
          <line x1="0" y1="6" x2="3" y2="6" stroke="#020617" strokeWidth="1.5" />
          <rect x="-3" y="-15" width="5" height="30" rx="1.5" fill="#090D14" stroke="#334155" strokeWidth="0.8" />
          <rect x="-4" y="-16" width="7" height="2.5" rx="0.5" fill={vehicle.color} />
          <rect x="-4" y="13.5" width="7" height="2.5" rx="0.5" fill={vehicle.color} />
        </g>

        {/* Sharp Xenon LED DRL Headlight Strips */}
        <path d="M 22,-6 L 25,-4 L 23,-1 L 20,-3 Z" fill="#FEF08A" />
        <path d="M 22,6 L 25,4 L 23,1 L 20,3 Z" fill="#FEF08A" />
        <circle cx="23" cy="-4" r="1.2" fill="#FFFFFF" />
        <circle cx="23" cy="4" r="1.2" fill="#FFFFFF" />

        {/* Continuous LED Rear Lightbar */}
        <path d="M -23,-8 L -23,8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        <circle cx="-23" cy="0" r="1.5" fill="#F43F5E" className="animate-pulse" />
      </g>

      {/* Floating OS Pill Badge (Matching Reference Screenshot) */}
      <g transform="translate(26, -18)">
        {/* Glass Card Shadow & Backdrop */}
        <rect
          x="-5"
          y="-12"
          width="74"
          height="28"
          rx="6"
          fill="#0B0F17"
          fillOpacity={isDragging ? '0.96' : '0.88'}
          stroke={isDragging ? '#00FFCC' : glow}
          strokeWidth={isDragging ? '1.8' : '1.2'}
          className="shadow-2xl"
        />
        {/* OS Number Label */}
        <text
          x="3"
          y="-1"
          fill="#FFFFFF"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {vehicle.osNumber || `OS #${vehicle.id.slice(0, 5)}`}
        </text>
        {/* Progress Bar & Percentage Label */}
        <g transform="translate(3, 7)">
          <rect x="0" y="0" width="42" height="3.5" rx="2" fill="#1F2937" />
          <rect
            x="0"
            y="0"
            width={Math.min(42, (vehicle.progress / 100) * 42)}
            height="3.5"
            rx="2"
            fill={isDragging ? '#00FFCC' : sector.color}
          />
          <text
            x="48"
            y="3"
            fill="#D1D5DB"
            fontSize="7"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {vehicle.progress}%
          </text>
        </g>
      </g>

      {/* Hover Info Tooltip Card (Only when not dragging) */}
      {isHovered && !isDragging && (
        <foreignObject
          x="-95"
          y="-130"
          width="190"
          height="100"
          className="overflow-visible pointer-events-none z-50"
        >
          <div className="bg-[#141A24]/95 border border-cyan-500/40 rounded-xl p-2.5 text-[10px] text-white shadow-2xl backdrop-blur-md space-y-1 font-mono">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1">
              <span className="font-extrabold text-[#FF6B00]">{vehicle.plate}</span>
              <span className="text-cyan-400 font-bold">{vehicle.osNumber}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <User className="w-3 h-3 text-sky-400" />
              <span className="truncate">{vehicle.clientName}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{Math.floor(vehicle.elapsedMinutes / 60)}h{vehicle.elapsedMinutes % 60}m</span>
              </div>
              <span className="font-extrabold text-emerald-400">{vehicle.progress}%</span>
            </div>
            <div className="text-gray-400 truncate text-[9px] flex items-center justify-between pt-0.5">
              <span>{vehicle.brand} {vehicle.model}</span>
              <span className="text-cyan-400 text-[8px] bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-800">
                Arraste para mover
              </span>
            </div>
          </div>
        </foreignObject>
      )}
    </motion.g>
  );
};
