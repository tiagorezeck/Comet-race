import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Maximize2,
  LayoutGrid,
  Flag,
  Layers,
  PlusCircle,
  Play,
  Pause,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useRaceStore } from '../stores/useRaceStore';
import { THEMES } from '../config/theme.config';

export const Header: React.FC = () => {
  const {
    shopName,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    activeThemeId,
    setActiveTheme,
    soundEnabled,
    toggleSound,
    isLiveSimulationActive,
    toggleLiveSimulation,
    advanceSimulationStep,
  } = useRaceStore();

  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form state for adding vehicle
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('Corolla Cross');
  const [clientName, setClientName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');

  const { addNewVehicle } = useRaceStore();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live simulation tick
  useEffect(() => {
    if (!isLiveSimulationActive) return;
    const simInterval = setInterval(() => {
      advanceSimulationStep();
    }, 8000);
    return () => clearInterval(simInterval);
  }, [isLiveSimulationActive, advanceSimulationStep]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !clientName) return;
    addNewVehicle({
      plate: plate.toUpperCase(),
      brand,
      model,
      clientName,
      serviceDescription: serviceDesc || 'Revisão preventiva e verificação de freios.',
      estimatedHours: 2,
    });
    setPlate('');
    setClientName('');
    setServiceDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <header className="bg-[#141A24]/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white sticky top-0 z-40 shadow-lg">
      {/* Brand & Workshop Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#E65100] text-white shadow-md shadow-orange-950/40">
          <Flag className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-white font-mono">COMET</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
              RACE CONTROL™
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">{shopName}</p>
        </div>
      </div>

      {/* Clock & Realtime Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md mx-2">
        <div className="hidden lg:flex items-center gap-2 bg-[#0B0F17]/80 px-3 py-1.5 rounded-lg border border-gray-800 text-xs font-mono text-gray-300">
          <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>{date}</span>
          <span className="text-[#FF6B00] font-bold">{time}</span>
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar placa (ex: ABC-1234, Hilux)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F17] text-xs text-white placeholder-gray-500 pl-9 pr-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#FF6B00] transition-all font-mono"
          />
        </div>
      </div>

      {/* Controls & Mode Switches */}
      <div className="flex items-center gap-2">
        {/* Live Simulation Auto-Traffic */}
        <button
          onClick={toggleLiveSimulation}
          title="Simulação Automática de Tráfego do Autódromo"
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
            isLiveSimulationActive
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse'
              : 'bg-[#0B0F17] text-gray-300 border-gray-800 hover:border-gray-700'
          }`}
        >
          {isLiveSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden sm:inline">{isLiveSimulationActive ? 'Simulando Corrida' : 'Simular Tráfego'}</span>
        </button>

        {/* Add New Vehicle Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-md shadow-orange-950/50"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Veículo</span>
        </button>

        {/* View Mode Switchers */}
        <div className="flex items-center bg-[#0B0F17] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveView('RACE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeView === 'RACE'
                ? 'bg-[#FF6B00] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Race Control</span>
          </button>

          <button
            onClick={() => setActiveView('KANBAN')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeView === 'KANBAN'
                ? 'bg-[#FF6B00] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            onClick={() => setActiveView('PLATFORM')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeView === 'PLATFORM'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden xl:inline">Flow Platform</span>
          </button>
        </div>

        {/* Theme Adapter Selector (Doc 07) */}
        <select
          value={activeThemeId}
          onChange={(e) => setActiveTheme(e.target.value as any)}
          className="bg-[#0B0F17] text-xs text-gray-200 border border-gray-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FF6B00] font-mono"
        >
          {Object.values(THEMES).map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Som Ativado' : 'Som Desativado'}
          className="p-2 rounded-lg bg-[#0B0F17] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-all"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF6B00]" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title="Modo Tela Cheia (TV Oficina)"
          className="p-2 rounded-lg bg-[#0B0F17] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-all"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Add New Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141A24] border border-gray-800 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-base font-bold">Novo Check-in de Veículo</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Placa do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="EX: ABC-1234"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2.5 text-white font-mono focus:border-[#FF6B00] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Marca</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2.5 text-white focus:border-[#FF6B00] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Modelo</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2.5 text-white focus:border-[#FF6B00] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2.5 text-white focus:border-[#FF6B00] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Descrição do Serviço</label>
                <textarea
                  rows={3}
                  placeholder="Descreva o serviço a ser executado..."
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-gray-800 rounded-lg p-2.5 text-white focus:border-[#FF6B00] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold"
                >
                  Iniciar Corrida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
