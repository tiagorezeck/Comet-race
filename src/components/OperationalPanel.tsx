import React from 'react';
import { Car, Wrench, Flag, Trophy } from 'lucide-react';
import { useRaceStore } from '../stores/useRaceStore';

export const OperationalPanel: React.FC = () => {
  const { vehicles } = useRaceStore();

  const totalInWorkshop = vehicles.filter((v) => v.status !== 'DELIVERED' && v.status !== 'CANCELLED').length;
  const inExecution = vehicles.filter((v) => v.status === 'EXECUTION').length;
  const inFinalization = vehicles.filter((v) => v.status === 'FINALIZATION' || v.status === 'TEST').length;
  const deliveredToday = vehicles.filter((v) => v.status === 'DELIVERED').length;

  const stats = [
    {
      label: 'Carros na Oficina',
      value: totalInWorkshop,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      icon: Car,
    },
    {
      label: 'Em Execução',
      value: inExecution,
      color: 'text-[#FF6B00]',
      bg: 'bg-[#FF6B00]/10 border-[#FF6B00]/30',
      icon: Wrench,
    },
    {
      label: 'Finalizando',
      value: inFinalization,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      icon: Flag,
    },
    {
      label: 'Entregues Hoje',
      value: deliveredToday,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      icon: Trophy,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pt-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-md ${stat.bg} transition-all duration-200 hover:scale-[1.01]`}
          >
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase font-mono">{stat.label}</p>
              <p className={`text-2xl font-black tracking-tight font-mono ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-black/30 ${stat.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
