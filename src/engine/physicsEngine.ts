import { VisualState } from '../types/race';
import { TRACK_NODES, TrackNode, calculateDynamicBoxX } from '../config/track.config';

export class PhysicsEngine {
  static getNodeForState(state: VisualState): TrackNode {
    const match = TRACK_NODES.find((node) => node.visualState === state);
    return match || TRACK_NODES[0];
  }

  // Calculates smooth interpolated {x, y, rotation} with path curve progression
  static getVehiclePosition(
    visualState: VisualState,
    vehicleIndexInNode: number = 0,
    progress: number = 50,
    boxNumber?: number,
    totalBoxesCount: number = 10
  ): { x: number; y: number; rotation: number } {
    // 1. Pit Box Execution Area
    if (visualState === 'BOX_RUNNING') {
      const targetBoxIndex = boxNumber ? boxNumber - 1 : (vehicleIndexInNode % Math.max(1, totalBoxesCount));
      const { boxX } = calculateDynamicBoxX(targetBoxIndex, totalBoxesCount, 240, 460);
      return {
        x: boxX,
        y: 288,
        rotation: 0,
      };
    }

    const node = this.getNodeForState(visualState);

    // Stagger multiple vehicles in the same node area gracefully
    const offsetX = (vehicleIndexInNode % 3) * 24 - 24;
    const offsetY = Math.floor(vehicleIndexInNode / 3) * 18 - 9;

    // Calculate progression along the section vector
    const progNorm = (progress - 50) / 100; // -0.5 to +0.5
    let deltaX = 0;
    let deltaY = 0;
    let computedRotation = node.rotation;

    switch (visualState) {
      case 'GATE_PARKED':
      case 'GATE_CHECKIN':
        deltaX = progNorm * 40 * Math.cos((node.rotation * Math.PI) / 180);
        deltaY = progNorm * 40 * Math.sin((node.rotation * Math.PI) / 180);
        break;
      case 'CURVE_DIAGNOSIS':
        deltaX = progNorm * 70;
        deltaY = Math.sin(progNorm * Math.PI) * -12;
        computedRotation = progNorm * 10;
        break;
      case 'TOWER_APPROVAL':
        deltaX = progNorm * 60;
        computedRotation = 0;
        break;
      case 'PATIO_STANDBY':
        deltaY = progNorm * 50;
        computedRotation = 90;
        break;
      case 'TRACK_TEST':
        deltaY = progNorm * 100;
        computedRotation = 90;
        break;
      case 'FINISH_LINE':
        deltaX = -progNorm * 80;
        computedRotation = 180;
        break;
      case 'PODIUM_DELIVERY':
        deltaX = progNorm * 30;
        computedRotation = 0;
        break;
      default:
        deltaX = progNorm * 40;
        break;
    }

    return {
      x: node.x + offsetX + deltaX,
      y: node.y + offsetY + deltaY,
      rotation: computedRotation,
    };
  }
}


