import { Vehicle, Mechanic } from '../types/race';

export class AINarratorEngine {
  static generateRadioMessage(
    eventType: string,
    vehicle?: Vehicle,
    mechanic?: Mechanic,
    extraText?: string
  ): string {
    const plate = vehicle?.plate || 'A1';
    const model = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo';
    const mechanicName = mechanic?.name || 'Mecânico';

    switch (eventType) {
      case 'CHECKIN':
        return `Rádio Pit Wall: ${model} [${plate}] deu entrada pelo portão. Triagem liberada.`;
      case 'DIAGNOSIS_STARTED':
        return `Rádio Pit Wall: ${mechanicName} assumiu diagnóstico do ${model}.`;
      case 'APPROVAL_PENDING':
        return `Rádio Pit Wall: Orçamento do ${model} aguardando aprovação do cliente na Torre.`;
      case 'SERVICE_STARTED':
        return `Rádio Pit Wall: ${mechanicName} iniciou execução do ${model} no Box. Cronômetro ativo.`;
      case 'STANDBY_ALERT':
        return `Rádio Pit Wall: Atenção equipe! ${model} entrou em Stand By (${vehicle?.standByReason || 'Aguardando'}).`;
      case 'TEST_DRIVE':
        return `Rádio Pit Wall: ${model} entrou na reta de testes de performance. Validação final.`;
      case 'DELIVERY_VICTORY':
        return `MOMENTO VITÓRIA! ${model} [${plate}] concluiu o circuito, cruza a bandeira quadriculada e sobe ao pódio!`;
      case 'MISSION_COMPLETED':
        return `Rádio Pit Wall: Meta da equipe atingida! ${extraText || 'Missão diária concluída.'}`;
      default:
        return `Rádio Pit Wall: Operação em andamento no circuito.`;
    }
  }
}
