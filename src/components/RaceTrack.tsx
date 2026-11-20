import React from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { RaceTrack3D } from './RaceTrack3D';
import { RaceTrack2D } from './RaceTrack2D';

export const RaceTrack: React.FC = () => {
  const trackRenderMode = useRaceStore((state) => state.trackRenderMode);

  return trackRenderMode === '2D' ? <RaceTrack2D /> : <RaceTrack3D />;
};
