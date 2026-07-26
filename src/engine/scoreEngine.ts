import { Vehicle, Mechanic } from '../types/race';

export class ScoreEngine {
  static calculateVehicleScore(vehicle: Vehicle): number {
    let score = 0;

    // Time compliance
    if (vehicle.elapsedMinutes <= vehicle.estimatedHours * 60 * 0.9) {
      score += 100; // Before deadline
    } else if (vehicle.elapsedMinutes <= vehicle.estimatedHours * 60) {
      score += 80; // On time
    } else if (vehicle.elapsedMinutes <= vehicle.estimatedHours * 60 * 1.2) {
      score += 40; // Small delay
    } else {
      score += 0; // Big delay
    }

    // Quality
    if (vehicle.reworkCount === 0) score += 60;
    else score -= 80 * vehicle.reworkCount;

    if (vehicle.hasWarranty) score -= 120;

    // Checklist
    const c = vehicle.checklist;
    const isChecklistComplete =
      c.exteriorInspected &&
      c.fluidLevelsChecked &&
      c.diagnosticsScanned &&
      c.testDriveCompleted &&
      c.cleanedAndSanitized;

    if (isChecklistComplete) score += 20;
    else score -= 40;

    if (c.photosAttached) score += 15;
    if (c.videoAttached) score += 10;

    // Customer satisfaction
    if (vehicle.rating === 5) score += 50;

    return Math.max(0, score);
  }

  static getMechanicRole(xp: number): Mechanic['role'] {
    if (xp < 1000) return 'Novato';
    if (xp < 2500) return 'Auxiliar';
    if (xp < 5000) return 'Mecânico';
    if (xp < 8000) return 'Especialista';
    if (xp < 12000) return 'Master';
    return 'Lenda COMET';
  }

  static calculateMedal(mechanic: Mechanic, activeVehicles: Vehicle[]): Mechanic['medal'] {
    const hasWarranty = activeVehicles.some((v) => v.hasWarranty);
    if (hasWarranty) return 'BLACK_FLAG';

    const hasSevereDelay = activeVehicles.some((v) => v.elapsedMinutes > v.estimatedHours * 60 * 1.25);
    if (hasSevereDelay) return 'RED_FLAG';

    const hasModerateDelay = activeVehicles.some((v) => v.elapsedMinutes > v.estimatedHours * 60);
    if (hasModerateDelay) return 'YELLOW_FLAG';

    if (mechanic.score >= 2000) return 'GOLD';
    if (mechanic.score >= 1000) return 'SILVER';
    return 'BRONZE';
  }
}
