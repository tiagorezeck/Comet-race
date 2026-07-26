import { VisualState } from '../types/race';
import { TRACK_NODES, TrackNode } from '../config/track.config';

export class PhysicsEngine {
  static getNodeForState(state: VisualState): TrackNode {
    const match = TRACK_NODES.find((node) => node.visualState === state);
    return match || TRACK_NODES[0];
  }

  // Calculates smooth interpolated {x, y, rotation} with small offsets for multiple cars in same node
  static getVehiclePosition(
    visualState: VisualState,
    vehicleIndexInNode: number = 0,
    progress: number = 50,
    boxNumber?: number
  ): { x: number; y: number; rotation: number } {
    if (visualState === 'BOX_RUNNING') {
      const targetBoxIndex = boxNumber ? boxNumber - 1 : (vehicleIndexInNode % 10);
      const boxX = 270 + targetBoxIndex * 42;
      return {
        x: boxX,
        y: 288,
        rotation: 0,
      };
    }

    const node = this.getNodeForState(visualState);

    // Stagger multiple vehicles in the same node area gracefully
    const offsetX = (vehicleIndexInNode % 3) * 26 - 26;
    const offsetY = Math.floor(vehicleIndexInNode / 3) * 20 - 10;

    // Slight vibration / progression offset
    const progressFactor = (progress - 50) * 0.2;

    return {
      x: node.x + offsetX + progressFactor,
      y: node.y + offsetY,
      rotation: node.rotation,
    };
  }
}
