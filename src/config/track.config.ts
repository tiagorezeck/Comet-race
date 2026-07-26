import { BusinessStatus, VisualState } from '../types/race';

export interface TrackNode {
  id: string;
  name: string;
  visualState: VisualState;
  x: number;
  y: number;
  rotation: number; // Degrees for vehicle orientation
  sectorId: string;
}

export const SECTOR_CONFIGS: Record<VisualState, { name: string; color: string; bg: string; icon: string }> = {
  GATE_PARKED: { name: 'Estacionamento', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)', icon: 'Car' },
  GATE_CHECKIN: { name: 'Portão (Check-in)', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', icon: 'LogIn' },
  CURVE_DIAGNOSIS: { name: 'Primeira Volta (Diagnóstico)', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)', icon: 'Search' },
  TOWER_APPROVAL: { name: 'Torre da Corrida (Orçamento)', color: '#EAB308', bg: 'rgba(234, 179, 8, 0.15)', icon: 'TowerControl' },
  BOX_RUNNING: { name: 'Complexo dos Boxes (Execução)', color: '#FF6B00', bg: 'rgba(255, 107, 0, 0.15)', icon: 'Wrench' },
  PATIO_STANDBY: { name: 'Área Lateral (Stand By)', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: 'OctagonAlert' },
  TRACK_TEST: { name: 'Reta de Performance (Teste)', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)', icon: 'Gauge' },
  FINISH_LINE: { name: 'Reta Final (Finalização)', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', icon: 'Flag' },
  PODIUM_DELIVERY: { name: 'Pódio (Entrega)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)', icon: 'Trophy' },
  WARRANTY_PIT: { name: 'Box de Garantia', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.2)', icon: 'ShieldAlert' },
};

// 12 Nodes forming a sleek 2.5D isometric race circuit loop with pit lane branching
export const TRACK_NODES: TrackNode[] = [
  // 1. Parking / Entry Gate
  { id: 'node_parked', name: 'Estacionamento', visualState: 'GATE_PARKED', x: 80, y: 380, rotation: 0, sectorId: 'PARKED' },
  { id: 'node_checkin', name: 'Portão de Check-in', visualState: 'GATE_CHECKIN', x: 180, y: 380, rotation: 15, sectorId: 'CHECKIN' },
  
  // 2. Diagnostic Curve
  { id: 'node_diag_1', name: 'Primeira Volta (Entrada)', visualState: 'CURVE_DIAGNOSIS', x: 290, y: 340, rotation: -30, sectorId: 'DIAGNOSIS' },
  { id: 'node_diag_2', name: 'Curva de Diagnóstico', visualState: 'CURVE_DIAGNOSIS', x: 380, y: 220, rotation: -60, sectorId: 'DIAGNOSIS' },
  
  // 3. Approval Tower
  { id: 'node_approval', name: 'Torre de Controle (Aprovação)', visualState: 'TOWER_APPROVAL', x: 480, y: 120, rotation: 0, sectorId: 'APPROVAL' },
  
  // 4. Pit Lane / Boxes Complex (Main execution area)
  { id: 'node_box_1', name: 'Box 01 (Carlos)', visualState: 'BOX_RUNNING', x: 620, y: 120, rotation: 0, sectorId: 'BOX' },
  { id: 'node_box_2', name: 'Box 02 (Pedro)', visualState: 'BOX_RUNNING', x: 740, y: 120, rotation: 0, sectorId: 'BOX' },
  { id: 'node_box_3', name: 'Box 03 (João)', visualState: 'BOX_RUNNING', x: 860, y: 120, rotation: 0, sectorId: 'BOX' },
  
  // 5. StandBy Patio (Side track branch)
  { id: 'node_standby', name: 'Área de Stand By', visualState: 'PATIO_STANDBY', x: 680, y: 220, rotation: 90, sectorId: 'STANDBY' },
  
  // 6. Test Track / Acceleration Straight
  { id: 'node_test', name: 'Reta de Testes', visualState: 'TRACK_TEST', x: 920, y: 280, rotation: 90, sectorId: 'TEST' },
  
  // 7. Finish Straight
  { id: 'node_finish', name: 'Reta Final', visualState: 'FINISH_LINE', x: 720, y: 380, rotation: 180, sectorId: 'FINISH' },
  
  // 8. Podium / Customer Delivery
  { id: 'node_podium', name: 'Pódio de Entrega', visualState: 'PODIUM_DELIVERY', x: 450, y: 380, rotation: 180, sectorId: 'PODIUM' },
];

export const TRACK_CONFIG = {
  viewBoxWidth: 1000,
  viewBoxHeight: 500,
  asphaltColor: '#2A2F37',
  backgroundColor: '#0B0F17',
  panelColor: '#141A24',
  boxColor: '#1B2330',
  stripeColor: '#ECECEC',
  grassColor: '#1C5E35',
  escapeColor: '#B5442D',
  accentOrange: '#FF6B00',
};
