import { BusinessStatus, VisualState } from './race';

export type ThemeType = 'RACE' | 'FACTORY' | 'KITCHEN' | 'HOSPITAL' | 'LOGISTICS';

export interface SectorDefinition {
  id: string;
  name: string;
  description: string;
  businessStatus: BusinessStatus;
  visualState: VisualState;
  color: string;
  icon: string;
  nodePathIndex: number;
}

export interface FlowTheme {
  id: ThemeType;
  name: string;
  subTitle: string;
  assetUnitName: string; // e.g. "Veículo", "Item na Linha", "Prato", "Paciente", "Carga"
  operatorTitle: string;  // e.g. "Mecânico", "Operador", "Chef", "Médico", "Motorista"
  workStationTitle: string; // e.g. "Box", "Estação", "Fogão", "Sala Cirúrgica", "Doca"
  sectors: SectorDefinition[];
  backgroundGradient: string;
  primaryColor: string;
  accentColor: string;
  translateEventMessage: (eventKey: string, payload?: Record<string, string>) => string;
}
