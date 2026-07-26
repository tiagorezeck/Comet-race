import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { Wrench, User, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const PitBoxes: React.FC = () => {
  const { pitBoxes, mechanics, vehicles, selectVehicle, selectedVehicleId } = useRaceStore();

  return (
    <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-xl text-white space-y-3">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#FF6B00]" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono">Complexo dos Boxes</h3>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">
          {pitBoxes.filter((b) => b.occupied).length} / {pitBoxes.length} ocupados
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {pitBoxes.map((box) => {
          const mechanic = mechanics.find((m) => m.id === box.mechanicId);
          const vehicle = vehicles.find((v) => v.id === box.currentVehicleId);
          const isDelayed = vehicle && vehicle.elapsedMinutes > vehicle.estimatedHours * 60;

          // Status light color according to Document 04
          const getLightColor = () => {
            if (!box.occupied) return 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]';
            if (isDelayed) return 'bg-red-500 animate-ping shadow-[0_0_12px_rgba(239,68,68,0.9)]';
            return 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]';
          };

          return (
            <div
              key={box.id}
              onClick={() => vehicle && selectVehicle(vehicle.id)}
              className={`p-3 rounded-xl border transition-all ${
                vehicle && selectedVehicleId === vehicle.id
                  ? 'bg-[#FF6B00]/15 border-[#FF6B00] shadow-lg shadow-orange-950/30'
                  : 'bg-[#1B2330] border-gray-800 hover:border-gray-700'
              } cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${getLightColor()}`} />
                  <span className="font-mono font-extrabold text-xs tracking-wide text-white">{box.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    !box.occupied
                      ? 'bg-gray-800 text-gray-400'
                      : isDelayed
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold'
                      : 'bg-sky-500/20 text-sky-300'
                  }`}
                >
                  {!box.occupied ? 'LIVRE' : isDelayed ? 'ATRASADO' : 'EM EXECUÇÃO'}
                </span>
              </div>

              {/* Mechanic Info */}
              <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  {mechanic?.avatar ? (
                    <img src={mechanic.avatar} alt={mechanic.name} className="w-5 h-5 rounded-full object-cover border border-gray-700" />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-200">{mechanic?.name || 'Sem Mecânico'}</span>
                </div>
                {mechanic && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {mechanic.role} (Nv.{mechanic.level})
                  </span>
                )}
              </div>

              {/* Active Vehicle in Box */}
              {vehicle ? (
                <div className="bg-[#0B0F17] p-2 rounded-lg border border-gray-800/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[#FF6B00] font-bold">{vehicle.plate}</span>
                    <span className="text-gray-400 ml-2 text-[11px] truncate max-w-[110px] inline-block">
                      {vehicle.brand} {vehicle.model}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">{vehicle.progress}%</span>
                </div>
              ) : (
                <div className="text-[11px] text-gray-500 font-mono italic text-center py-1">Box vago - Aguardando próximo veículo</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
