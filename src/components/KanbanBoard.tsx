import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { BusinessStatus } from '../types/race';
import { StatusEngine } from '../engine/statusEngine';
import { Clock, User, Wrench, ShieldAlert, ArrowRight, LayoutGrid, CheckCircle2 } from 'lucide-react';

const KANBAN_COLUMNS: { id: BusinessStatus; label: string; color: string }[] = [
  { id: 'CHECKIN', label: 'Check-in / Portão', color: '#3B82F6' },
  { id: 'DIAGNOSIS', label: 'Diagnóstico', color: '#06B6D4' },
  { id: 'WAITING_APPROVAL', label: 'Orçamento', color: '#EAB308' },
  { id: 'EXECUTION', label: 'Execução (Boxes)', color: '#FF6B00' },
  { id: 'STAND_BY', label: 'Stand By', color: '#EF4444' },
  { id: 'TEST', label: 'Teste de Pista', color: '#A855F7' },
  { id: 'FINALIZATION', label: 'Finalização', color: '#10B981' },
  { id: 'DELIVERED', label: 'Pódio (Entregues)', color: '#F59E0B' },
];

export const KanbanBoard: React.FC = () => {
  const { vehicles, selectVehicle, selectedVehicleId, moveVehicleStatus, mechanics } = useRaceStore();

  return (
    <div className="p-4 space-y-4 text-white">
      <div className="flex items-center justify-between bg-[#141A24] p-4 rounded-2xl border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00]">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold font-mono uppercase tracking-wider text-white">
              Modo Gestão (Kanban Tradicional)
            </h2>
            <p className="text-xs text-gray-400">
              Sincronizado em tempo real com os mesmos dados do Race Control.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-gray-400 bg-[#0B0F17] px-3 py-1.5 rounded-lg border border-gray-800">
          Total: {vehicles.length} veículos em acompanhamento
        </span>
      </div>

      {/* Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colVehicles = vehicles.filter((v) => v.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-[#141A24]/90 border border-gray-800 rounded-2xl p-3 flex flex-col h-[650px] shadow-lg"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="text-xs font-extrabold font-mono text-gray-200 truncate">{col.label}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#0B0F17] px-2 py-0.5 rounded text-gray-400 border border-gray-800">
                  {colVehicles.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                {colVehicles.length === 0 ? (
                  <div className="text-[11px] text-gray-600 font-mono italic text-center py-8">Vazio</div>
                ) : (
                  colVehicles.map((vehicle) => {
                    const assignedMech = mechanics.find((m) => m.id === vehicle.assignedMechanicId);
                    const isSelected = vehicle.id === selectedVehicleId;
                    const isDelayed = vehicle.elapsedMinutes > vehicle.estimatedHours * 60;

                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => selectVehicle(vehicle.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-[#FF6B00]/20 border-[#FF6B00] shadow-lg shadow-orange-950/40 ring-1 ring-[#FF6B00]'
                            : 'bg-[#1B2330] border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {/* Plate & OS */}
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-xs font-black text-[#FF6B00]">{vehicle.plate}</span>
                          <span className="text-[10px] text-gray-400">{vehicle.osNumber}</span>
                        </div>

                        {/* Model & Client */}
                        <div>
                          <p className="text-xs font-bold text-gray-200 leading-tight">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-sky-400" />
                            <span className="truncate">{vehicle.clientName}</span>
                          </p>
                        </div>

                        {/* Mechanic */}
                        {assignedMech && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-300 bg-[#0B0F17] px-2 py-1 rounded border border-gray-800">
                            <Wrench className="w-3 h-3 text-amber-400" />
                            <span className="truncate">{assignedMech.name}</span>
                          </div>
                        )}

                        {/* Progress & Delay Alert */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-800/80 font-mono text-[10px]">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3 h-3 text-sky-400" />
                            <span className={isDelayed ? 'text-red-400 font-bold' : ''}>
                              {Math.floor(vehicle.elapsedMinutes / 60)}h{vehicle.elapsedMinutes % 60}m
                            </span>
                          </div>
                          <span className="font-bold text-emerald-400">{vehicle.progress}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
