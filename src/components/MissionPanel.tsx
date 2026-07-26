import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { Target, CheckSquare, Trophy, ShieldCheck, Flag, Search, Sparkles } from 'lucide-react';

export const MissionPanel: React.FC = () => {
  const { missions } = useRaceStore();

  const dailyMissions = missions.filter((m) => m.category === 'DAILY');
  const companyMissions = missions.filter((m) => m.category === 'COMPANY' || m.category === 'WEEKLY');

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return Search;
      case 'Flag': return Flag;
      case 'ShieldCheck': return ShieldCheck;
      case 'CheckSquare': return CheckSquare;
      default: return Target;
    }
  };

  return (
    <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-xl text-white space-y-3">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono">Missões Diárias & Oficina</h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
          {missions.filter((m) => m.completed).length} / {missions.length} Concluídas
        </span>
      </div>

      <div className="space-y-2.5">
        {missions.map((mission) => {
          const Icon = getMissionIcon(mission.iconName);
          const percent = Math.round((mission.current / mission.goal) * 100);

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-xl border transition-all ${
                mission.completed
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[#1B2330] border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${mission.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-300'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${mission.completed ? 'text-emerald-300 line-through' : 'text-gray-200'}`}>
                      {mission.title}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono capitalize">
                      {mission.category.toLowerCase()} • Recompensa: +{mission.rewardXp} XP / +{mission.rewardPoints} pts
                    </p>
                  </div>
                </div>

                {mission.completed && (
                  <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    CONCLUÍDO ✓
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>
                    Progresso ({mission.current} / {mission.goal})
                  </span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full bg-[#0B0F17] h-1.5 rounded-full overflow-hidden border border-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      mission.completed ? 'bg-emerald-400' : 'bg-[#FF6B00]'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
