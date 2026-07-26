import { FlowTheme } from '../types/theme';

export const THEMES: Record<string, FlowTheme> = {
  RACE: {
    id: 'RACE',
    name: 'Race Theme',
    subTitle: 'Autódromo Automotivo & Centro de Serviços',
    assetUnitName: 'Veículo',
    operatorTitle: 'Mecânico',
    workStationTitle: 'Box',
    primaryColor: '#FF6B00',
    accentColor: '#3B82F6',
    backgroundGradient: 'from-[#0B0F17] via-[#141A24] to-[#0B0F17]',
    sectors: [
      { id: '1', name: 'Estacionamento', description: 'Veículos agendados', businessStatus: 'SCHEDULED', visualState: 'GATE_PARKED', color: '#9CA3AF', icon: 'Car', nodePathIndex: 0 },
      { id: '2', name: 'Portão Check-in', description: 'Recepção e triagem', businessStatus: 'CHECKIN', visualState: 'GATE_CHECKIN', color: '#3B82F6', icon: 'LogIn', nodePathIndex: 1 },
      { id: '3', name: 'Curva Técnica', description: 'Diagnóstico em andamento', businessStatus: 'DIAGNOSIS', visualState: 'CURVE_DIAGNOSIS', color: '#06B6D4', icon: 'Search', nodePathIndex: 2 },
      { id: '4', name: 'Torre da Corrida', description: 'Aguardando aprovação do cliente', businessStatus: 'WAITING_APPROVAL', visualState: 'TOWER_APPROVAL', color: '#EAB308', icon: 'TowerControl', nodePathIndex: 3 },
      { id: '5', name: 'Complexo dos Boxes', description: 'Execução do serviço no elevador', businessStatus: 'EXECUTION', visualState: 'BOX_RUNNING', color: '#FF6B00', icon: 'Wrench', nodePathIndex: 4 },
      { id: '6', name: 'Pátio Stand By', description: 'Aguardando peças / resposta', businessStatus: 'STAND_BY', visualState: 'PATIO_STANDBY', color: '#EF4444', icon: 'OctagonAlert', nodePathIndex: 5 },
      { id: '7', name: 'Reta de Performance', description: 'Teste de rodagem / qualidade', businessStatus: 'TEST', visualState: 'TRACK_TEST', color: '#A855F7', icon: 'Gauge', nodePathIndex: 6 },
      { id: '8', name: 'Reta Final', description: 'Lavagem e finalização', businessStatus: 'FINALIZATION', visualState: 'FINISH_LINE', color: '#10B981', icon: 'Flag', nodePathIndex: 7 },
      { id: '9', name: 'Pódio de Entrega', description: 'Entregue ao cliente com troféu', businessStatus: 'DELIVERED', visualState: 'PODIUM_DELIVERY', color: '#F59E0B', icon: 'Trophy', nodePathIndex: 8 },
    ],
    translateEventMessage: (eventKey, payload) => {
      switch (eventKey) {
        case 'CHECKIN': return `Veículo ${payload?.plate || ''} deu entrada pelo portão.`;
        case 'SERVICE_STARTED': return `${payload?.mechanic || 'Mecânico'} iniciou serviço no Box.`;
        case 'TEST_COMPLETED': return `Teste de pista concluído para o veículo.`;
        case 'DELIVERY': return `Veículo ${payload?.plate || ''} subiu ao pódio e foi entregue!`;
        default: return `Movimentação no circuito.`;
      }
    },
  },
  FACTORY: {
    id: 'FACTORY',
    name: 'Factory Theme',
    subTitle: 'Linha de Produção Industrial & Manufatura',
    assetUnitName: 'Lote / Produto',
    operatorTitle: 'Operador',
    workStationTitle: 'Estação de Trabalho',
    primaryColor: '#0EA5E9',
    accentColor: '#10B981',
    backgroundGradient: 'from-[#0F172A] via-[#1E293B] to-[#0F172A]',
    sectors: [
      { id: '1', name: 'Almoxarifado', description: 'Matéria-prima recebida', businessStatus: 'SCHEDULED', visualState: 'GATE_PARKED', color: '#9CA3AF', icon: 'Package', nodePathIndex: 0 },
      { id: '2', name: 'Entrada da Linha', description: 'Ordens de fabricação', businessStatus: 'CHECKIN', visualState: 'GATE_CHECKIN', color: '#3B82F6', icon: 'LogIn', nodePathIndex: 1 },
      { id: '3', name: 'Inspeção de Molde', description: 'Análise técnica de componentes', businessStatus: 'DIAGNOSIS', visualState: 'CURVE_DIAGNOSIS', color: '#06B6D4', icon: 'Search', nodePathIndex: 2 },
      { id: '4', name: 'Controle de Engenharia', description: 'Liberação de projeto', businessStatus: 'WAITING_APPROVAL', visualState: 'TOWER_APPROVAL', color: '#EAB308', icon: 'FileText', nodePathIndex: 3 },
      { id: '5', name: 'Células de Usinagem', description: 'Processo produtivo ativo', businessStatus: 'EXECUTION', visualState: 'BOX_RUNNING', color: '#0EA5E9', icon: 'Cpu', nodePathIndex: 4 },
      { id: '6', name: 'Depósito de Espera', description: 'Falta de insumos / gargalo', businessStatus: 'STAND_BY', visualState: 'PATIO_STANDBY', color: '#EF4444', icon: 'PauseCircle', nodePathIndex: 5 },
      { id: '7', name: 'Bancada de Testes', description: 'Controle de qualidade e estresse', businessStatus: 'TEST', visualState: 'TRACK_TEST', color: '#A855F7', icon: 'CheckCircle2', nodePathIndex: 6 },
      { id: '8', name: 'Embalagem', description: 'Empacotamento final', businessStatus: 'FINALIZATION', visualState: 'FINISH_LINE', color: '#10B981', icon: 'Box', nodePathIndex: 7 },
      { id: '9', name: 'Expedição', description: 'Enviado ao cliente', businessStatus: 'DELIVERED', visualState: 'PODIUM_DELIVERY', color: '#F59E0B', icon: 'Truck', nodePathIndex: 8 },
    ],
    translateEventMessage: (eventKey, payload) => {
      switch (eventKey) {
        case 'CHECKIN': return `Lote ${payload?.plate || ''} inserido na esteira.`;
        case 'SERVICE_STARTED': return `${payload?.mechanic || 'Operador'} iniciou usinagem na Estação.`;
        case 'DELIVERY': return `Lote descarregado na Expedição com sucesso!`;
        default: return `Avanço na esteira de produção.`;
      }
    },
  },
  KITCHEN: {
    id: 'KITCHEN',
    name: 'Kitchen Theme',
    subTitle: 'Cozinha Profissional & Gastronomia Express',
    assetUnitName: 'Prato / Pedido',
    operatorTitle: 'Chef / Cozinheiro',
    workStationTitle: 'Fogão / Bancada',
    primaryColor: '#EF4444',
    accentColor: '#F59E0B',
    backgroundGradient: 'from-[#180808] via-[#2D1212] to-[#180808]',
    sectors: [
      { id: '1', name: 'Mesa do Cliente', description: 'Pedido recebido', businessStatus: 'SCHEDULED', visualState: 'GATE_PARKED', color: '#9CA3AF', icon: 'Utensils', nodePathIndex: 0 },
      { id: '2', name: 'Pass da Cozinha', description: 'Entrada na comanda', businessStatus: 'CHECKIN', visualState: 'GATE_CHECKIN', color: '#3B82F6', icon: 'ClipboardList', nodePathIndex: 1 },
      { id: '3', name: 'Mise en Place', description: 'Corte e preparação inicial', businessStatus: 'DIAGNOSIS', visualState: 'CURVE_DIAGNOSIS', color: '#06B6D4', icon: 'ChefHat', nodePathIndex: 2 },
      { id: '4', name: 'Aprovação do Sous-Chef', description: 'Pedido especial / personalização', businessStatus: 'WAITING_APPROVAL', visualState: 'TOWER_APPROVAL', color: '#EAB308', icon: 'Flame', nodePathIndex: 3 },
      { id: '5', name: 'Fogões & Grelhas', description: 'Cozimento e montagem', businessStatus: 'EXECUTION', visualState: 'BOX_RUNNING', color: '#EF4444', icon: 'Flame', nodePathIndex: 4 },
      { id: '6', name: 'Estufa de Espera', description: 'Aguardando acompanhamento', businessStatus: 'STAND_BY', visualState: 'PATIO_STANDBY', color: '#DC2626', icon: 'Timer', nodePathIndex: 5 },
      { id: '7', name: 'Degustação e Finalização', description: 'Ponto do prato e molho', businessStatus: 'TEST', visualState: 'TRACK_TEST', color: '#A855F7', icon: 'Sparkles', nodePathIndex: 6 },
      { id: '8', name: 'Balcão de Saída', description: 'Prato pronto para servir', businessStatus: 'FINALIZATION', visualState: 'FINISH_LINE', color: '#10B981', icon: 'Check', nodePathIndex: 7 },
      { id: '9', name: 'Entrega na Mesa', description: 'Servido ao cliente com elogio', businessStatus: 'DELIVERED', visualState: 'PODIUM_DELIVERY', color: '#F59E0B', icon: 'Smile', nodePathIndex: 8 },
    ],
    translateEventMessage: (eventKey, payload) => {
      switch (eventKey) {
        case 'CHECKIN': return `Pedido #${payload?.plate || ''} entrou no KDS da cozinha.`;
        case 'SERVICE_STARTED': return `${payload?.mechanic || 'Chef'} assumiu o prato no fogão.`;
        case 'DELIVERY': return `Prato servido à mesa em tempo recorde!`;
        default: return `Etapa de preparo concluída.`;
      }
    },
  },
  HOSPITAL: {
    id: 'HOSPITAL',
    name: 'Hospital Theme',
    subTitle: 'Fluxo Hospitalar & Centro Cirúrgico',
    assetUnitName: 'Paciente / Atendimento',
    operatorTitle: 'Médico / Especialista',
    workStationTitle: 'Sala de Atendimento',
    primaryColor: '#10B981',
    accentColor: '#06B6D4',
    backgroundGradient: 'from-[#062019] via-[#0D382C] to-[#062019]',
    sectors: [
      { id: '1', name: 'Triagem / Recepção', description: 'Ficha médica aberta', businessStatus: 'SCHEDULED', visualState: 'GATE_PARKED', color: '#9CA3AF', icon: 'UserPlus', nodePathIndex: 0 },
      { id: '2', name: 'Acolhimento', description: 'Sinais vitais e prioridade', businessStatus: 'CHECKIN', visualState: 'GATE_CHECKIN', color: '#3B82F6', icon: 'HeartPulse', nodePathIndex: 1 },
      { id: '3', name: 'Consultório Clínico', description: 'Diagnóstico e exames', businessStatus: 'DIAGNOSIS', visualState: 'CURVE_DIAGNOSIS', color: '#06B6D4', icon: 'Stethoscope', nodePathIndex: 2 },
      { id: '4', name: 'Parecer Médico', description: 'Autorização de procedimentos', businessStatus: 'WAITING_APPROVAL', visualState: 'TOWER_APPROVAL', color: '#EAB308', icon: 'FilePlus', nodePathIndex: 3 },
      { id: '5', name: 'Centro Cirúrgico', description: 'Procedimento / Intervenção', businessStatus: 'EXECUTION', visualState: 'BOX_RUNNING', color: '#10B981', icon: 'Syringe', nodePathIndex: 4 },
      { id: '6', name: 'Leito de Observação', description: 'Aguardando resultado de exame', businessStatus: 'STAND_BY', visualState: 'PATIO_STANDBY', color: '#EF4444', icon: 'Bed', nodePathIndex: 5 },
      { id: '7', name: 'Recuperação Anestésica', description: 'Acompanhamento pós-procedimento', businessStatus: 'TEST', visualState: 'TRACK_TEST', color: '#A855F7', icon: 'Activity', nodePathIndex: 6 },
      { id: '8', name: 'Instruções de Alta', description: 'Receituário e alta', businessStatus: 'FINALIZATION', visualState: 'FINISH_LINE', color: '#10B981', icon: 'CheckSquare', nodePathIndex: 7 },
      { id: '9', name: 'Alta Hospitalar', description: 'Paciente liberado', businessStatus: 'DELIVERED', visualState: 'PODIUM_DELIVERY', color: '#F59E0B', icon: 'SmilePlus', nodePathIndex: 8 },
    ],
    translateEventMessage: (eventKey, payload) => {
      switch (eventKey) {
        case 'CHECKIN': return `Atendimento #${payload?.plate || ''} iniciado na triagem.`;
        case 'SERVICE_STARTED': return `${payload?.mechanic || 'Médico'} deu início ao atendimento na Sala Cirúrgica.`;
        case 'DELIVERY': return `Alta concedida com sucesso ao paciente!`;
        default: return `Atualização no quadro clínico.`;
      }
    },
  },
  LOGISTICS: {
    id: 'LOGISTICS',
    name: 'Logistics Theme',
    subTitle: 'Centro de Distribuição & Frotas',
    assetUnitName: 'Carga / Caminhão',
    operatorTitle: 'Motorista / Operador',
    workStationTitle: 'Doca de Carga',
    primaryColor: '#F59E0B',
    accentColor: '#3B82F6',
    backgroundGradient: 'from-[#1C1408] via-[#2E220D] to-[#1C1408]',
    sectors: [
      { id: '1', name: 'Pátio Externo', description: 'Aguardando convocação', businessStatus: 'SCHEDULED', visualState: 'GATE_PARKED', color: '#9CA3AF', icon: 'Truck', nodePathIndex: 0 },
      { id: '2', name: 'Guarita de Entrada', description: 'Pesagem e nota fiscal', businessStatus: 'CHECKIN', visualState: 'GATE_CHECKIN', color: '#3B82F6', icon: 'Building', nodePathIndex: 1 },
      { id: '3', name: 'Conferência de Carga', description: 'Bipagem e separação', businessStatus: 'DIAGNOSIS', visualState: 'CURVE_DIAGNOSIS', color: '#06B6D4', icon: 'QrCode', nodePathIndex: 2 },
      { id: '4', name: 'Torre Logística', description: 'Autorização de desembarque', businessStatus: 'WAITING_APPROVAL', visualState: 'TOWER_APPROVAL', color: '#EAB308', icon: 'Radio', nodePathIndex: 3 },
      { id: '5', name: 'Docas de Carga', description: 'Carregamento ativo', businessStatus: 'EXECUTION', visualState: 'BOX_RUNNING', color: '#F59E0B', icon: 'Boxes', nodePathIndex: 4 },
      { id: '6', name: 'Área de Avaria', description: 'Carga bloqueada', businessStatus: 'STAND_BY', visualState: 'PATIO_STANDBY', color: '#EF4444', icon: 'AlertTriangle', nodePathIndex: 5 },
      { id: '7', name: 'Lacre e Pesagem Saída', description: 'Inspeção de segurança', businessStatus: 'TEST', visualState: 'TRACK_TEST', color: '#A855F7', icon: 'Lock', nodePathIndex: 6 },
      { id: '8', name: 'Emissão de CTE', description: 'Documentação final', businessStatus: 'FINALIZATION', visualState: 'FINISH_LINE', color: '#10B981', icon: 'FileCheck', nodePathIndex: 7 },
      { id: '9', name: 'Partida em Rota', description: 'Caminhão na rodovia', businessStatus: 'DELIVERED', visualState: 'PODIUM_DELIVERY', color: '#F59E0B', icon: 'Navigation', nodePathIndex: 8 },
    ],
    translateEventMessage: (eventKey, payload) => {
      switch (eventKey) {
        case 'CHECKIN': return `Carga ${payload?.plate || ''} deu entrada na Guarita.`;
        case 'SERVICE_STARTED': return `${payload?.mechanic || 'Operador'} iniciou manobra na Doca.`;
        case 'DELIVERY': return `Carga liberada e caminhão em rota de destino!`;
        default: return `Avanço no centro de distribuição.`;
      }
    },
  },
};
