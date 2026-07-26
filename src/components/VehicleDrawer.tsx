import React, { useState } from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { StatusEngine } from '../engine/statusEngine';
import { BusinessStatus, StandByReason } from '../types/race';
import {
  X,
  User,
  Clock,
  Wrench,
  CheckSquare,
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
  ChevronRight,
  Phone,
  DollarSign,
  Camera,
  Video,
} from 'lucide-react';

export const VehicleDrawer: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectVehicle,
    mechanics,
    pitBoxes,
    moveVehicleStatus,
    updateChecklist,
    assignMechanic,
    setActiveView,
  } = useRaceStore();

  const [standbyReasonInput, setStandbyReasonInput] = useState<StandByReason>('WAITING_PARTS');
  const [showStandbySelect, setShowStandbySelect] = useState<boolean>(false);

  if (!selectedVehicleId) return null;

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
  if (!vehicle) return null;

  const assignedMechanic = mechanics.find((m) => m.id === vehicle.assignedMechanicId);
  const assignedBox = pitBoxes.find((b) => b.id === vehicle.assignedBoxId);

  // Available valid target statuses from current status (Doc 06 State Machine)
  const allStatuses: BusinessStatus[] = [
    'SCHEDULED',
    'CHECKIN',
    'DIAGNOSIS',
    'WAITING_APPROVAL',
    'EXECUTION',
    'STAND_BY',
    'TEST',
    'FINALIZATION',
    'DELIVERED',
    'WARRANTY',
  ];

  const validTargetStatuses = allStatuses.filter((st) =>
    StatusEngine.isValidTransition(vehicle.status, st)
  );

  const handleStatusChange = (status: BusinessStatus) => {
    if (status === 'STAND_BY') {
      setShowStandbySelect(true);
      return;
    }
    moveVehicleStatus(vehicle.id, status);
    setShowStandbySelect(false);
  };

  const confirmStandby = () => {
    moveVehicleStatus(vehicle.id, 'STAND_BY', standbyReasonInput);
    setShowStandbySelect(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#141A24] border-l border-gray-800 text-white shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#0B0F17]/80">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm border shadow-md"
            style={{ backgroundColor: `${vehicle.color}20`, borderColor: vehicle.color, color: vehicle.color }}
          >
            {vehicle.plate.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold font-mono text-white">{vehicle.plate}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                {vehicle.osNumber}
              </span>
            </div>
            <p className="text-xs text-gray-400">{vehicle.brand} {vehicle.model}</p>
          </div>
        </div>

        <button
          onClick={() => selectVehicle(null)}
          className="p-2 rounded-lg bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar text-xs">
        {/* Customer & Status Banner */}
        <div className="bg-[#1B2330] p-3.5 rounded-xl border border-gray-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-200">
              <User className="w-4 h-4 text-sky-400" />
              <span className="font-bold">{vehicle.clientName}</span>
            </div>
            {vehicle.clientPhone && (
              <a href={`tel:${vehicle.clientPhone}`} className="text-sky-400 flex items-center gap-1 font-mono text-[11px] hover:underline">
                <Phone className="w-3 h-3" />
                {vehicle.clientPhone}
              </a>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-800 font-mono">
            <div>
              <span className="text-gray-400 text-[10px]">Status Atual:</span>
              <p className="font-extrabold text-[#FF6B00] text-sm">{StatusEngine.getStatusLabel(vehicle.status)}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-[10px]">Orçamento Estimado:</span>
              <p className="font-extrabold text-emerald-400 text-sm">R$ {vehicle.costEstimate.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Assigned Mechanic & Pit Box Selector */}
        <div className="bg-[#1B2330] p-3.5 rounded-xl border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-gray-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#FF6B00]" />
              Mecânico & Box Atribuído
            </span>
            {assignedBox && (
              <span className="text-[10px] font-mono text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded border border-[#FF6B00]/30 font-bold">
                {assignedBox.name}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-gray-400 text-[11px]">Selecionar Responsável:</label>
            <select
              value={vehicle.assignedMechanicId || ''}
              onChange={(e) => {
                const mechId = e.target.value;
                const mech = mechanics.find((m) => m.id === mechId);
                if (mech && mech.assignedBoxId) {
                  assignMechanic(vehicle.id, mechId, mech.assignedBoxId);
                }
              }}
              className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2 text-white font-mono focus:border-[#FF6B00] outline-none"
            >
              <option value="">Nenhum Mecânico Atribuído</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role} - Nv.{m.level})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checklist Verification (Doc 03 Gamification) */}
        <div className="bg-[#1B2330] p-3.5 rounded-xl border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-gray-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              Checklist de Qualidade (+20 pts)
            </span>
          </div>

          <div className="space-y-2 font-mono">
            {[
              { key: 'exteriorInspected', label: 'Inspeção de Lataria e Pintura' },
              { key: 'fluidLevelsChecked', label: 'Verificação de Óleo e Nível de Fluidos' },
              { key: 'diagnosticsScanned', label: 'Passagem do Scanner de Injeção' },
              { key: 'testDriveCompleted', label: 'Teste Dinâmico de Rodagem' },
              { key: 'cleanedAndSanitized', label: 'Lavagem e Higienização Final' },
              { key: 'photosAttached', label: 'Fotos do Veículo Anexadas' },
              { key: 'videoAttached', label: 'Vídeo Explicativo Anexado' },
            ].map((chk) => (
              <label
                key={chk.key}
                className="flex items-center justify-between p-2 rounded-lg bg-[#0B0F17] border border-gray-800 hover:border-gray-700 cursor-pointer"
              >
                <span className="text-gray-300 text-[11px]">{chk.label}</span>
                <input
                  type="checkbox"
                  checked={vehicle.checklist[chk.key as keyof typeof vehicle.checklist]}
                  onChange={(e) => updateChecklist(vehicle.id, chk.key as any, e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] rounded cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Status Transition State Machine Actions (Doc 06) */}
        <div className="bg-[#1B2330] p-3.5 rounded-xl border border-gray-800 space-y-3">
          <span className="font-mono font-bold text-gray-300 uppercase tracking-wider text-[11px] block">
            Ações de Transição de Estado (Máquina de Estados)
          </span>

          {showStandbySelect && (
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-rose-500/40 space-y-2">
              <label className="block text-rose-400 font-bold text-[11px]">Motivo do Stand By:</label>
              <select
                value={standbyReasonInput}
                onChange={(e) => setStandbyReasonInput(e.target.value as StandByReason)}
                className="w-full bg-[#141A24] text-white border border-gray-800 rounded p-2 text-xs"
              >
                <option value="WAITING_PARTS">Esperando Peça do Fornecedor</option>
                <option value="WAITING_CLIENT_RESPONSE">Aguardando Resposta do Cliente</option>
                <option value="SUPPLIER_DELAY">Atraso de Entrega do Fornecedor</option>
                <option value="WARRANTY_REVIEW">Análise Técnica de Garantia</option>
              </select>
              <button
                onClick={confirmStandby}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 rounded transition-all"
              >
                Confirmar Colocar em Stand By
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {validTargetStatuses.map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0F17] hover:bg-[#FF6B00]/20 border border-gray-800 hover:border-[#FF6B00] text-gray-200 hover:text-white font-mono font-bold transition-all text-[11px]"
              >
                <span>Mover p/ {StatusEngine.getStatusLabel(st)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#FF6B00]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer Footer Action Button: Open Kanban */}
      <div className="p-4 border-t border-gray-800 bg-[#0B0F17]/90 space-y-2">
        <button
          onClick={() => {
            setActiveView('KANBAN');
            selectVehicle(vehicle.id);
          }}
          className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white font-mono font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 transition-all text-xs"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>ABRIR NO KANBAN TRADICIONAL</span>
        </button>
      </div>
    </div>
  );
};
