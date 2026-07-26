import React from 'react';
import { Clock, PauseCircle, UserCheck, Hourglass, ShieldAlert, RotateCcw } from 'lucide-react';
import { useRaceStore } from '../stores/useRaceStore';

export const QuickHUD: React.FC = () => {
  const { vehicles, mechanics } = useRaceStore();

  const activeVehicles = vehicles.filter((v) => v.status !== 'DELIVERED' && v.status !== 'CANCELLED');
  const avgMinutes =
    activeVehicles.length > 0
      ? Math.round(activeVehicles.reduce((acc, v) => acc + v.elapsedMinutes, 0) / activeVehicles.length)
      : 0;

  const freeMechanics = mechanics.filter((m) => m.activeVehicleIds.length === 0).length;
  const waitingClient = vehicles.filter((v) => v.status === 'WAITING_APPROVAL').length;
  const inStandby = vehicles.filter((v) => v.status === 'STAND_BY').length;
  const warrantyCount = vehicles.filter((v) => v.hasWarranty).length;
  const reworkCount = vehicles.reduce((acc, v) => acc + v.reworkCount, 0);

  const indicators = [
    { label: 'Tempo Médio', value: `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`, icon: Clock, color: 'text-sky-400' },
    { label: 'Tempo Parado (StandBy)', value: `${inStandby} veíc`, icon: PauseCircle, color: inStandby > 0 ? 'text-rose-400' : 'text-gray-400' },
    { label: 'Mecânicos Livres', value: `${freeMechanics} de ${mechanics.length}`, icon: UserCheck, color: 'text-emerald-400' },
    { label: 'Aguardando Cliente', value: `${waitingClient} orçam.`, icon: Hourglass, color: 'text-amber-400' },
    { label: 'Garantias', value: `${warrantyCount}`, icon: ShieldAlert, color: warrantyCount > 0 ? 'text-red-500 font-bold' : 'text-gray-400' },
    { label: 'Retrabalhos', value: `${reworkCount}`, icon: RotateCcw, color: reworkCount > 0 ? 'text-purple-400' : 'text-gray-400' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 text-xs no-scrollbar">
      {indicators.map((ind) => {
        const Icon = ind.icon;
        return (
          <div
            key={ind.label}
            className="flex items-center gap-2.5 bg-[#141A24]/80 border border-gray-800/80 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm font-mono"
          >
            <Icon className={`w-3.5 h-3.5 ${ind.color}`} />
            <span className="text-gray-400 font-sans text-[11px]">{ind.label}:</span>
            <span className={`font-semibold ${ind.color}`}>{ind.value}</span>
          </div>
        );
      })}
    </div>
  );
};
