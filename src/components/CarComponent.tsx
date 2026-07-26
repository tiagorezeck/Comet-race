import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Vehicle } from '../types/race';
import { SECTOR_CONFIGS } from '../config/track.config';
import { AlertTriangle, ShieldAlert, Star, Wrench, Clock, User, CheckCircle2 } from 'lucide-react';

interface CarComponentProps {
  vehicle: Vehicle;
  x: number;
  y: number;
  rotation: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const CarComponent: React.FC<CarComponentProps> = ({
  vehicle,
  x,
  y,
  rotation,
  isSelected,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sector = SECTOR_CONFIGS[vehicle.visualState] || SECTOR_CONFIGS['GATE_PARKED'];
  const isDelayed = vehicle.elapsedMinutes > vehicle.estimatedHours * 60;
  const isCritical = vehicle.elapsedMinutes > vehicle.estimatedHours * 60 * 1.2;

  // Glow color based on priority & state
  const getGlowColor = () => {
    if (isSelected) return 'rgba(255, 107, 0, 0.8)';
    if (isCritical) return 'rgba(239, 68, 68, 0.9)';
    if (isDelayed) return 'rgba(245, 158, 11, 0.8)';
    if (vehicle.priority === 'VIP') return 'rgba(168, 85, 247, 0.8)';
    return sector.color;
  };

  const glow = getGlowColor();

  return (
    <motion.g
      initial={false}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      className="cursor-pointer group"
      onClick={() => onSelect(vehicle.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Glowing Aura */}
      <circle
        r={isSelected ? 32 : 24}
        fill={glow}
        opacity={isSelected ? 0.35 : isHovered ? 0.25 : 0.12}
        className={isCritical || isSelected ? 'animate-pulse' : ''}
      />

      {/* Pulsing Selection Ring */}
      {isSelected && (
        <circle
          r={34}
          fill="none"
          stroke="#FF6B00"
          strokeWidth="2"
          strokeDasharray="4 2"
          className="animate-spin"
          style={{ animationDuration: '8s' }}
        />
      )}

      {/* Rotatable SVG Race Vehicle Body */}
      <g transform={`rotate(${rotation})`}>
        {/* Car Shadow */}
        <ellipse cx="0" cy="3" rx="16" ry="9" fill="#000000" opacity="0.4" />

        {/* Vehicle Chassis */}
        <path
          d="M -14,-7 L -10,-9 L 8,-9 L 14,-6 L 15,0 L 14,6 L 8,9 L -10,9 L -14,7 Z"
          fill={vehicle.color}
          stroke="#1F2937"
          strokeWidth="1.2"
        />

        {/* Windshield & Windows */}
        <path
          d="M -4,-6 L 2,-6 L 5,-4 L 5,4 L 2,6 L -4,6 Z"
          fill="#38BDF8"
          opacity="0.75"
        />

        {/* Roof */}
        <rect x="-3" y="-4" width="6" height="8" rx="1" fill="#111827" opacity="0.8" />

        {/* Wheels */}
        <rect x="-10" y="-11" width="5" height="2" rx="1" fill="#000" />
        <rect x="6" y="-11" width="5" height="2" rx="1" fill="#000" />
        <rect x="-10" y="9" width="5" height="2" rx="1" fill="#000" />
        <rect x="6" y="9" width="5" height="2" rx="1" fill="#000" />

        {/* Headlights */}
        <circle cx="14" cy="-4" r="1.5" fill="#FEF08A" className="animate-pulse" />
        <circle cx="14" cy="4" r="1.5" fill="#FEF08A" className="animate-pulse" />

        {/* Rear Lights */}
        <circle cx="-14" cy="-4" r="1" fill="#EF4444" />
        <circle cx="-14" cy="4" r="1" fill="#EF4444" />
      </g>

      {/* Floating Plate & Badges Badge (Always Upright) */}
      <g transform="translate(0, -28)">
        {/* Mini Plate Box */}
        <rect
          x="-28"
          y="-10"
          width="56"
          height="14"
          rx="3"
          fill="#1E293B"
          stroke={glow}
          strokeWidth="1.2"
        />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {vehicle.plate}
        </text>

        {/* Delay / Critical Indicator */}
        {isDelayed && (
          <g transform="translate(20, -12)">
            <circle r="6" fill="#EF4444" />
            <text x="0" y="3" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="bold">!</text>
          </g>
        )}

        {/* VIP Star */}
        {vehicle.priority === 'VIP' && (
          <g transform="translate(-20, -12)">
            <circle r="6" fill="#A855F7" />
            <text x="0" y="3" textAnchor="middle" fill="#FFF" fontSize="8">★</text>
          </g>
        )}
      </g>

      {/* Mini Progress Bar below car */}
      <g transform="translate(-20, 22)">
        <rect x="0" y="0" width="40" height="3" rx="1.5" fill="#1F2937" />
        <rect x="0" y="0" width={Math.min(40, (vehicle.progress / 100) * 40)} height="3" rx="1.5" fill={sector.color} />
      </g>

      {/* Hover Info Card (Doc 02) */}
      {isHovered && (
        <foreignObject x="-90" y="-120" width="180" height="90" className="overflow-visible pointer-events-none z-50">
          <div className="bg-[#141A24]/95 border border-gray-700/80 rounded-xl p-2.5 text-[10px] text-white shadow-2xl backdrop-blur-md space-y-1 font-mono">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1">
              <span className="font-bold text-[#FF6B00]">{vehicle.plate}</span>
              <span className="text-gray-400">{vehicle.osNumber}</span>
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
              <span className="font-bold text-emerald-400">{vehicle.progress}%</span>
            </div>
            <div className="text-gray-400 truncate text-[9px]">
              {vehicle.brand} {vehicle.model}
            </div>
          </div>
        </foreignObject>
      )}
    </motion.g>
  );
};
