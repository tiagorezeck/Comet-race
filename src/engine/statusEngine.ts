import { BusinessStatus, VisualState } from '../types/race';

export class StatusEngine {
  // Maps CRM Business Status to Visual State for rendering
  static toVisualState(status: BusinessStatus): VisualState {
    switch (status) {
      case 'SCHEDULED': return 'GATE_PARKED';
      case 'CHECKIN': return 'GATE_CHECKIN';
      case 'DIAGNOSIS': return 'CURVE_DIAGNOSIS';
      case 'WAITING_APPROVAL': return 'TOWER_APPROVAL';
      case 'EXECUTION': return 'BOX_RUNNING';
      case 'STAND_BY': return 'PATIO_STANDBY';
      case 'TEST': return 'TRACK_TEST';
      case 'FINALIZATION': return 'FINISH_LINE';
      case 'DELIVERED': return 'PODIUM_DELIVERY';
      case 'WARRANTY': return 'WARRANTY_PIT';
      case 'CANCELLED': return 'GATE_PARKED';
      default: return 'GATE_PARKED';
    }
  }

  // State Machine Validation (Doc 06: Prevents illegal state jumps like CHECKIN -> DELIVERED)
  static isValidTransition(current: BusinessStatus, next: BusinessStatus): boolean {
    const validMap: Record<BusinessStatus, BusinessStatus[]> = {
      SCHEDULED: ['CHECKIN', 'CANCELLED'],
      CHECKIN: ['DIAGNOSIS', 'CANCELLED', 'STAND_BY'],
      DIAGNOSIS: ['WAITING_APPROVAL', 'EXECUTION', 'STAND_BY', 'CANCELLED'],
      WAITING_APPROVAL: ['EXECUTION', 'STAND_BY', 'CANCELLED'],
      EXECUTION: ['TEST', 'STAND_BY', 'WARRANTY', 'CANCELLED'],
      STAND_BY: ['EXECUTION', 'DIAGNOSIS', 'WAITING_APPROVAL', 'CANCELLED'],
      TEST: ['FINALIZATION', 'EXECUTION', 'STAND_BY', 'CANCELLED'],
      FINALIZATION: ['DELIVERED', 'WARRANTY', 'CANCELLED'],
      DELIVERED: ['WARRANTY'], // Can re-enter as warranty
      WARRANTY: ['DIAGNOSIS', 'EXECUTION', 'CANCELLED'],
      CANCELLED: ['CHECKIN'],
    };

    return validMap[current]?.includes(next) ?? false;
  }

  // Returns human readable status name in Portuguese
  static getStatusLabel(status: BusinessStatus): string {
    const labels: Record<BusinessStatus, string> = {
      SCHEDULED: 'Agendado',
      CHECKIN: 'Check-in',
      DIAGNOSIS: 'Diagnóstico',
      WAITING_APPROVAL: 'Orçamento',
      EXECUTION: 'Execução',
      STAND_BY: 'Stand By',
      TEST: 'Teste',
      FINALIZATION: 'Finalização',
      DELIVERED: 'Entregue',
      WARRANTY: 'Garantia',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }
}
