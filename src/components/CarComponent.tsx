import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Vehicle } from '../types/race';
import { SECTOR_CONFIGS } from '../config/track.config';
import { Clock, User } from 'lucide-react';

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
    if (isSelected) return 'rgba(255, 107, 0, 0.9)';
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

      {/* Rotatable Semi-3D Isometric Race Vehicle Body */}
      <g transform={`rotate(${rotation})`}>
        {/* Headlights Light Cone Projection */}
        <path
          d="M 16,-5 L 50,-18 L 50,18 L 16,5 Z"
          fill="url(#headlightCone)"
          opacity="0.3"
          className="pointer-events-none"
        />

        {/* Isometric Cast Shadow */}
        <ellipse cx="-1" cy="5" rx="18" ry="10" fill="#000000" opacity="0.5" />

        {/* Wide Performance Tires with Rims */}
        {/* Front Left */}
        <rect x="8" y="-12" width="6" height="3" rx="1" fill="#0F172A" stroke="#475569" strokeWidth="0.5" />
        {/* Front Right */}
        <rect x="8" y="9" width="6" height="3" rx="1" fill="#0F172A" stroke="#475569" strokeWidth="0.5" />
        {/* Rear Left */}
        <rect x="-12" y="-12" width="6" height="3" rx="1" fill="#0F172A" stroke="#475569" strokeWidth="0.5" />
        {/* Rear Right */}
        <rect x="-12" y="9" width="6" height="3" rx="1" fill="#0F172A" stroke="#475569" strokeWidth="0.5" />

        {/* Main Body Chassis (Metallic Paint) */}
        <path
          d="M -16,-7 C -16,-9 -10,-10 6,-10 L 14,-6 C 18,-3 18,3 14,6 L 6,10 C -10,10 -16,9 -16,7 Z"
          fill={vehicle.color}
          stroke="#0F172A"
          strokeWidth="1.5"
        />

        {/* Top Metallic Specular Highlight */}
        <path
          d="M -14,-6 C -14,-8 -8,-8 4,-8 L 12,-4 C 13,-2 13,0 12,1 Z"
          fill="#FFFFFF"
          opacity="0.25"
        />

        {/* Aerodynamic Front Hood Vents & Grille */}
        <path d="M 6,-6 L 12,-4 L 12,4 L 6,6 Z" fill="#1E293B" opacity="0.6" />

        {/* Tinted Glass Windshield & Cabin Roof */}
        <path
          d="M -6,-6 L 2,-6 L 5,-4 L 5,4 L 2,6 L -6,6 Z"
          fill="url(#glassGrad)"
          stroke="#0F172A"
          strokeWidth="0.8"
        />
        {/* Glass Glare Reflection Line */}
        <line x1="-3" y1="-5" x2="2" y2="4" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />

        {/* Carbon Fiber Roof */}
        <rect x="-5" y="-4" width="7" height="8" rx="1.5" fill="#0F172A" opacity="0.85" />

        {/* Rear GT Wing Spoiler */}
        <rect x="-17" y="-10" width="3" height="20" rx="1" fill="#020617" stroke="#334155" strokeWidth="0.8" />

        {/* Headlight Bulbs (Yellow Xenon LED) */}
        <circle cx="15" cy="-5" r="1.8" fill="#FEF08A" />
        <circle cx="15" cy="5" r="1.8" fill="#FEF08A" />

        {/* Rear Brake LED Lights */}
        <circle cx="-16" cy="-5" r="1.2" fill="#EF4444" />
        <circle cx="-16" cy="5" r="1.2" fill="#EF4444" />
      </g>

      {/* Floating License Plate & Badges Tag (Upright Orientation) */}
      <g transform="translate(0, -32)">
        {/* Mini Plate Box */}
        <rect
          x="-30"
          y="-11"
          width="60"
          height="15"
          rx="4"
          fill="#141A24"
          stroke={glow}
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="9"
          fontWeight="extrabold"
          fontFamily="monospace"
        >
          {vehicle.plate}
        </text>

        {/* Delay / Critical Alert Badge */}
        {isDelayed && (
          <g transform="translate(22, -13)">
            <circle r="6" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="black">!</text>
          </g>
        )}

        {/* VIP Priority Badge */}
        {vehicle.priority === 'VIP' && (
          <g transform="translate(-22, -13)">
            <circle r="6" fill="#A855F7" stroke="#581C87" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#FFF" fontSize="8">★</text>
          </g>
        )}
      </g>

      {/* Mini Progress Indicator Bar Below Vehicle */}
      <g transform="translate(-20, 22)">
        <rect x="0" y="0" width="40" height="3" rx="1.5" fill="#1F2937" />
        <rect
          x="0"
          y="0"
          width={Math.min(40, (vehicle.progress / 100) * 40)}
          height="3"
          rx="1.5"
          fill={sector.color}
        />
      </g>

      {/* Hover Info Tooltip Card */}
      {isHovered && (
        <foreignObject x="-95" y="-125" width="190" height="95" className="overflow-visible pointer-events-none z-50">
          <div className="bg-[#141A24]/95 border border-gray-700/80 rounded-xl p-2.5 text-[10px] text-white shadow-2xl backdrop-blur-md space-y-1 font-mono">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1">
              <span className="font-extrabold text-[#FF6B00]">{vehicle.plate}</span>
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
              <span className="font-extrabold text-emerald-400">{vehicle.progress}%</span>
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

