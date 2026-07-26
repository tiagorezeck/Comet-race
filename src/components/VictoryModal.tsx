import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useRaceStore } from '../stores/useRaceStore';
import { Trophy, Flag, Sparkles, CheckCircle2, X } from 'lucide-react';

export const VictoryModal: React.FC = () => {
  const { victoryVehicle, clearVictoryVehicle } = useRaceStore();

  useEffect(() => {
    if (victoryVehicle) {
      // Fire victory confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#F59E0B', '#10B981', '#3B82F6'],
        });
      } catch (err) {
        // Fallback
      }
    }
  }, [victoryVehicle]);

  if (!victoryVehicle) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-[#1B2330] to-[#0B0F17] border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center text-white shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-6 relative overflow-hidden">
        {/* Glowing Background Ring */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={clearVictoryVehicle}
          className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Podium Icon & Chequered Flag */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-xl animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-extrabold text-amber-400 tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>MOMENTO VITÓRIA (EFEITO WOW)</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
            VEÍCULO ENTREGUE COM SUCESSO!
          </h2>
          <p className="text-xs text-gray-300 font-sans">
            Trabalho de equipe concluído dentro do circuito.
          </p>
        </div>

        {/* Vehicle Badge Banner */}
        <div className="bg-[#141A24] border border-gray-800 rounded-2xl p-4 space-y-2 font-mono">
          <div className="flex items-center justify-between text-sm">
            <span className="font-extrabold text-[#FF6B00] text-lg">{victoryVehicle.plate}</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full text-xs">
              PÓDIO 100% ✓
            </span>
          </div>

          <p className="text-left text-xs text-gray-200 font-bold">
            {victoryVehicle.brand} {victoryVehicle.model}
          </p>
          <p className="text-left text-[11px] text-gray-400 font-sans">
            Cliente: <b>{victoryVehicle.clientName}</b> • OS: <b>{victoryVehicle.osNumber}</b>
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={clearVictoryVehicle}
          className="w-full bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-[#e05e00] hover:to-amber-600 text-white font-mono font-extrabold py-3.5 rounded-xl shadow-xl transition-all text-sm uppercase tracking-wider"
        >
          CONFIRMAR & CONTINUAR CORRIDA 🏁
        </button>
      </div>
    </div>
  );
};
