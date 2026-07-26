import React from 'react';
import { useRaceStore } from './stores/useRaceStore';
import { Header } from './components/Header';
import { OperationalPanel } from './components/OperationalPanel';
import { QuickHUD } from './components/QuickHUD';
import { RaceTrack } from './components/RaceTrack';
import { PitBoxes } from './components/PitBoxes';
import { StandByArea } from './components/StandByArea';
import { Leaderboard } from './components/Leaderboard';
import { MissionPanel } from './components/MissionPanel';
import { EventFeed } from './components/EventFeed';
import { VehicleDrawer } from './components/VehicleDrawer';
import { KanbanBoard } from './components/KanbanBoard';
import { FlowPlatformView } from './components/FlowPlatformView';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const { activeView } = useRaceStore();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white antialiased">
      {/* Region 1: Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto pb-8">
        {activeView === 'RACE' && (
          <div className="space-y-4">
            {/* Region 2: Operational Panel */}
            <OperationalPanel />

            {/* Region 3: Quick KPI HUD Indicators */}
            <QuickHUD />

            {/* Main Interactive Circuit & Right Panels Grid */}
            <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Region 4: Racetrack Canvas (~70% desktop width) */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
                <RaceTrack />
              </div>

              {/* Right Side Panels: Regions 5, 6, 7 */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                {/* Region 5: Pit Boxes */}
                <PitBoxes />

                {/* Region 6: Stand By Area */}
                <StandByArea />

                {/* Region 7: Leaderboard / Mechanics Ranking */}
                <Leaderboard />
              </div>
            </div>

            {/* Bottom Row Grid: Regions 8 & 9 */}
            <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region 8: Daily & Company Missions */}
              <MissionPanel />

              {/* Region 9: Telemetry & AI Radio Narrator Event Feed */}
              <EventFeed />
            </div>
          </div>
        )}

        {activeView === 'KANBAN' && <KanbanBoard />}

        {activeView === 'PLATFORM' && <FlowPlatformView />}
      </main>

      {/* Vehicle Action & Details Side Drawer */}
      <VehicleDrawer />

      {/* Efeito WOW - Victory Moment Celebration Overlay Modal */}
      <VictoryModal />
    </div>
  );
}
