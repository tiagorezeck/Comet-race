import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { Radio, Activity, CheckCircle2, AlertTriangle, ArrowRight, Flag } from 'lucide-react';

export const EventFeed: React.FC = () => {
  const { events } = useRaceStore();

  const latestRadio = events.find((e) => e.radioVoiceMessage)?.radioVoiceMessage;

  return (
    <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-xl text-white space-y-3">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono">Telemetria & Feed de Eventos</h3>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          AO VIVO
        </span>
      </div>

      {/* AI Radio Narrator Broadcast Bar (Doc 03 / Doc 07) */}
      {latestRadio && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#FF6B00]/20 to-amber-500/15 border border-[#FF6B00]/40 rounded-xl p-3 flex items-start gap-2.5 shadow-md">
          <div className="p-1.5 rounded-lg bg-[#FF6B00]/30 text-[#FF6B00] animate-pulse">
            <Radio className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-mono font-extrabold text-[#FF6B00] uppercase tracking-wider">
              RÁDIO DA CENTRAL DE CORRIDA (IA NARRATORA)
            </p>
            <p className="text-xs text-amber-200 font-mono italic">{latestRadio}</p>
          </div>
        </div>
      )}

      {/* Events Stream */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar font-mono text-xs">
        {events.map((evt) => (
          <div key={evt.id} className="bg-[#1B2330] border border-gray-800 rounded-xl p-2.5 flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#FF6B00] font-bold">{evt.timestamp}</span>
                <span className="text-xs font-bold text-gray-200">{evt.title}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans">{evt.message}</p>
            </div>
            {evt.type === 'DELIVERY' && <Flag className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
};
