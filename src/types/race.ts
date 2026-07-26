export type BusinessStatus =
  | 'SCHEDULED'        // Agendamento
  | 'CHECKIN'          // Check-in / Portão
  | 'DIAGNOSIS'        // Diagnóstico / Primeira Volta
  | 'WAITING_APPROVAL' // Orçamento / Torre de Controle
  | 'EXECUTION'        // Execução / Box
  | 'STAND_BY'         // Stand By / Área Lateral
  | 'TEST'             // Teste / Classificação
  | 'FINALIZATION'     // Finalização / Reta Final
  | 'DELIVERED'        // Entrega / Pódio
  | 'WARRANTY'         // Garantia
  | 'CANCELLED';       // Cancelado

export type VisualState =
  | 'GATE_PARKED'
  | 'GATE_CHECKIN'
  | 'CURVE_DIAGNOSIS'
  | 'TOWER_APPROVAL'
  | 'BOX_RUNNING'
  | 'PATIO_STANDBY'
  | 'TRACK_TEST'
  | 'FINISH_LINE'
  | 'PODIUM_DELIVERY'
  | 'WARRANTY_PIT';

export type PriorityLevel = 'NORMAL' | 'URGENT' | 'CRITICAL' | 'VIP';

export type StandByReason =
  | 'WAITING_PARTS'
  | 'WAITING_CLIENT_RESPONSE'
  | 'SUPPLIER_DELAY'
  | 'WARRANTY_REVIEW'
  | 'APPROVAL_PENDING';

export interface VehicleChecklist {
  exteriorInspected: boolean;
  fluidLevelsChecked: boolean;
  diagnosticsScanned: boolean;
  testDriveCompleted: boolean;
  cleanedAndSanitized: boolean;
  photosAttached: boolean;
  videoAttached: boolean;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string; // Hex color for SVG body
  clientName: string;
  clientPhone?: string;
  status: BusinessStatus;
  visualState: VisualState;
  priority: PriorityLevel;
  assignedMechanicId?: string;
  assignedBoxId?: string;
  entryTime: string; // ISO String
  estimatedHours: number;
  elapsedMinutes: number;
  progress: number; // 0 - 100%
  trackProgress: number; // 0 - 100% along SVG path
  standByReason?: StandByReason;
  osNumber: string;
  serviceDescription: string;
  checklist: VehicleChecklist;
  rating?: number; // 1 - 5 stars
  reworkCount: number;
  hasWarranty: boolean;
  costEstimate: number;
}

export interface Mechanic {
  id: string;
  name: string;
  avatar: string;
  role: 'Novato' | 'Auxiliar' | 'Mecânico' | 'Especialista' | 'Master' | 'Lenda COMET';
  level: number;
  xp: number;
  maxXp: number;
  score: number;
  weeklyPointsDelta: number;
  assignedBoxId?: string;
  activeVehicleIds: string[];
  completedCountToday: number;
  specialty: string;
  medal: 'GOLD' | 'SILVER' | 'BRONZE' | 'YELLOW_FLAG' | 'RED_FLAG' | 'BLACK_FLAG' | 'BLUE_FLAG';
  trend: 'UP' | 'STABLE' | 'DOWN';
  achievements: string[];
}

export interface PitBox {
  id: string;
  number: number;
  name: string;
  mechanicId?: string;
  currentVehicleId?: string;
  occupied: boolean;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'DELAYED' | 'STANDBY';
}

export interface Mission {
  id: string;
  title: string;
  category: 'DAILY' | 'WEEKLY' | 'COMPANY';
  current: number;
  goal: number;
  rewardXp: number;
  rewardPoints: number;
  completed: boolean;
  iconName: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface RaceEvent {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'CHECKIN' | 'MOVE' | 'DIAGNOSIS' | 'APPROVAL' | 'SERVICE' | 'STANDBY' | 'TEST' | 'DELIVERY' | 'ALERT' | 'ACHIEVEMENT';
  vehicleId?: string;
  mechanicId?: string;
  plate?: string;
  radioVoiceMessage?: string; // AI Radio Narrator text
}

export type WeatherType = 'SUNNY' | 'SUNSET' | 'RAINY' | 'VICTORY_FIREWORKS';
