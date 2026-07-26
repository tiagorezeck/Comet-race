import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { Trophy, TrendingUp, TrendingDown, Minus, Award, ShieldAlert, Sparkles } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { mechanics } = useRaceStore();

  const sortedMechanics = [...mechanics].sort((a, b) => b.score - a.score);

  const getMedalBadge = (medal: string) => {
    switch (medal) {
      case 'GOLD':
        return { label: '🥇 Ouro', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'SILVER':
        return { label: '🥈 Prata', color: 'text-slate-300 bg-slate-500/10 border-slate-500/30' };
      case 'BRONZE':
        return { label: '🥉 Bronze', color: 'text-amber-700 bg-amber-900/10 border-amber-800/30' };
      case 'BLACK_FLAG':
        return { label: '⬛ Band. Preta', color: 'text-gray-300 bg-gray-900 border-gray-700' };
      case 'RED_FLAG':
        return { label: '🚩 Band. Vermelha', color: 'text-red-400 bg-red-950/40 border-red-800' };
      default:
        return { label: '🏁 Classificado', color: 'text-blue-400 bg-blue-950/40 border-blue-800' };
    }
  };

  return (
    <div className="bg-[#141A24]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 shadow-xl text-white space-y-3">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase font-mono">Ranking dos Pilotos (Mecânicos)</h3>
        </div>
        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded">
          Temporada Ativa
        </span>
      </div>

      <div className="space-y-3">
        {sortedMechanics.map((mech, index) => {
          const medal = getMedalBadge(mech.medal);
          const xpPercent = Math.round((mech.xp / mech.maxXp) * 100);

          return (
            <div key={mech.id} className="bg-[#1B2330] border border-gray-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-extrabold text-[#FF6B00] w-4 text-center">
                    #{index + 1}
                  </span>
                  <img
                    src={mech.avatar}
                    alt={mech.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500/40 shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-100">{mech.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {mech.role} • Nível {mech.level}
                    </p>
                  </div>
                </div>

                {/* Score & Points Delta */}
                <div className="text-right font-mono">
                  <p className="text-sm font-black text-amber-400">{mech.score} pts</p>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +{mech.weeklyPointsDelta} pts
                  </p>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>Progresso XP ({mech.xp} / {mech.maxXp})</span>
                  <span>{xpPercent}%</span>
                </div>
                <div className="w-full bg-[#0B0F17] h-1.5 rounded-full overflow-hidden border border-gray-800">
                  <div
                    className="bg-gradient-to-r from-[#FF6B00] to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              {/* Medal & Achievements */}
              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className={`px-2 py-0.5 rounded border font-mono font-bold ${medal.color}`}>
                  {medal.label}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-[9px]">
                  <Award className="w-3 h-3 text-[#FF6B00]" />
                  <span>{mech.achievements.join(' • ')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
