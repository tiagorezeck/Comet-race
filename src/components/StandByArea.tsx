import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { OctagonAlert, PauseCircle, Package, UserX, ShieldAlert } from 'lucide-react';
import { StandByReason } from '../types/race';

export const StandByArea: React.FC = () => {
  const { vehicles, selectVehicle, selectedVehicleId } = useRaceStore();

  const standbyVehicles = vehicles.filter((v) => v.status === 'STAND_BY');

  const getReasonBadge = (reason?: StandByReason) => {
    switch (reason) {
      case 'WAITING_PARTS':
        return { label: 'Esperando Peça', icon: Package, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'WAITING_CLIENT_RESPONSE':
        return { label: 'Cliente Não Respondeu', icon: UserX, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'WARRANTY_REVIEW':
        return { label: 'Garantia', icon: ShieldAlert, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      default:
        return { label: 'Em Espera', icon: PauseCircle, color: 'text-gray-400 bg-gray-800 border-gray-700' };
    }
  };

  return (
    <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-xl text-white space-y-3">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <OctagonAlert className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono">Área Lateral (Stand By)</h3>
        </div>
        <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded">
          {standbyVehicles.length} parados
        </span>
      </div>

      {standbyVehicles.length === 0 ? (
        <div className="text-xs text-gray-500 font-mono italic text-center py-4">Nenhum veículo em Stand By. Fluxo contínuo!</div>
      ) : (
        <div className="space-y-2">
          {standbyVehicles.map((vehicle) => {
            const badge = getReasonBadge(vehicle.standByReason);
            const Icon = badge.icon;
            const isSelected = vehicle.id === selectedVehicleId;

            return (
              <div
                key={vehicle.id}
                onClick={() => selectVehicle(vehicle.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected ? 'bg-rose-500/15 border-rose-500 shadow-lg' : 'bg-[#1B2330] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 font-mono">
                  <span className="text-xs font-bold text-[#FF6B00]">{vehicle.plate}</span>
                  <span className="text-[10px] text-gray-400">{vehicle.brand} {vehicle.model}</span>
                </div>

                <div className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded border ${badge.color}`}>
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{badge.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
