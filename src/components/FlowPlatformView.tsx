import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { THEMES } from '../config/theme.config';
import { Layers, Cpu, Sparkles, CheckCircle2, ArrowRight, Shield, Globe, Terminal } from 'lucide-react';
import { ThemeType } from '../types/theme';

export const FlowPlatformView: React.FC = () => {
  const { activeThemeId, setActiveTheme, vehicles } = useRaceStore();

  const activeTheme = THEMES[activeThemeId] || THEMES['RACE'];

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto font-sans">
      {/* Platform Banner Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-[#141A24] to-purple-900/40 border border-purple-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Layers className="w-64 h-64 text-purple-400" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40">
              <Layers className="w-6 h-6" />
            </span>
            <span className="font-extrabold font-mono text-sm tracking-widest text-purple-400 uppercase">
              Tecnologia Proprietária COMET
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
            COMET Flow Experience Platform™
          </h1>

          <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
            Plataforma genérica de orquestração visual capaz de transformar qualquer processo empresarial
            em um cenário temático interativo. Os dados reais continuam intactos no CRM/ERP; apenas a camada de experiência (Theme Adapter) se adapta ao segmento.
          </p>
        </div>
      </div>

      {/* Theme Selector Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Selecione um Cenário Temático (Theme Adapters)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.values(THEMES).map((theme) => {
            const isActive = theme.id === activeThemeId;
            return (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id as ThemeType)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-purple-900/30 border-purple-500 shadow-xl ring-2 ring-purple-500/50 scale-[1.02]'
                    : 'bg-[#141A24] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-extrabold text-sm text-white">{theme.name}</span>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-normal mb-2">{theme.subTitle}</p>
                <div className="text-[10px] font-mono text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40 inline-block">
                  Ativos: {theme.assetUnitName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Theme Breakdown Details */}
      <div className="bg-[#141A24] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-lg font-bold font-mono text-white">{activeTheme.name}</h3>
            <p className="text-xs text-gray-400">{activeTheme.subTitle}</p>
          </div>

          <div className="flex gap-2 font-mono text-xs">
            <span className="bg-[#0B0F17] px-3 py-1.5 rounded-lg border border-gray-800 text-purple-300">
              Operador: <b>{activeTheme.operatorTitle}</b>
            </span>
            <span className="bg-[#0B0F17] px-3 py-1.5 rounded-lg border border-gray-800 text-sky-300">
              Estação: <b>{activeTheme.workStationTitle}</b>
            </span>
          </div>
        </div>

        {/* Sectors Path Mapping Table */}
        <div className="space-y-2">
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            Mapeamento dos Setores de Processo ({activeTheme.sectors.length} Etapas)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeTheme.sectors.map((sector) => (
              <div
                key={sector.id}
                className="bg-[#1B2330] border border-gray-800 rounded-xl p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs" style={{ color: sector.color }}>
                    {sector.name}
                  </span>
                  <span className="text-[9px] font-mono bg-[#0B0F17] text-gray-400 px-1.5 py-0.5 rounded border border-gray-800">
                    Etapa {sector.id}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{sector.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architectural Layers Diagram (Doc 07) */}
      <div className="bg-[#141A24] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4 font-mono">
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Arquitetura das 5 Camadas Desacopladas (Documento 07)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {[
            { num: 'Camada 1', name: 'Business Layer', desc: 'CRM / ERP / Financeiro' },
            { num: 'Camada 2', name: 'Flow Engine', desc: 'Regras puras de processo' },
            { num: 'Camada 3', name: 'Experience Engine', desc: 'Transformação de estados' },
            { num: 'Camada 4', name: 'Theme Adapter', desc: `Tradução (${activeTheme.name})` },
            { num: 'Camada 5', name: 'Renderer', desc: 'Animações SVG & Canvas' },
          ].map((layer, idx) => (
            <div key={layer.num} className="bg-[#0B0F17] border border-gray-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-[#FF6B00] font-bold">{layer.num}</span>
              <p className="font-bold text-white text-xs">{layer.name}</p>
              <p className="text-[10px] text-gray-400 font-sans">{layer.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
