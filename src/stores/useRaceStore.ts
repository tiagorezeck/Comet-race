import { create } from 'zustand';
import { Vehicle, Mechanic, PitBox, Mission, RaceEvent, BusinessStatus, StandByReason, WeatherType, PriorityLevel } from '../types/race';
import { ThemeType } from '../types/theme';
import { StatusEngine } from '../engine/statusEngine';
import { ScoreEngine } from '../engine/scoreEngine';
import { AINarratorEngine } from '../engine/aiNarratorEngine';
import { soundEffects } from '../utils/soundEffects';

interface RaceStore {
  // State
  vehicles: Vehicle[];
  mechanics: Mechanic[];
  pitBoxes: PitBox[];
  missions: Mission[];
  events: RaceEvent[];
  selectedVehicleId: string | null;
  searchQuery: string;
  activeView: 'RACE' | 'KANBAN' | 'PLATFORM';
  trackRenderMode: '3D' | '2D';
  activeThemeId: ThemeType;
  weather: WeatherType;
  isLiveSimulationActive: boolean;
  soundEnabled: boolean;
  victoryVehicle: Vehicle | null;
  shopName: string;

  // Actions
  selectVehicle: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveView: (view: 'RACE' | 'KANBAN' | 'PLATFORM') => void;
  setTrackRenderMode: (mode: '3D' | '2D') => void;
  setActiveTheme: (themeId: ThemeType) => void;
  toggleLiveSimulation: () => void;
  toggleSound: () => void;
  clearVictoryVehicle: () => void;

  moveVehicleStatus: (id: string, newStatus: BusinessStatus, standByReason?: StandByReason) => void;
  updateChecklist: (id: string, key: keyof Vehicle['checklist'], value: boolean) => void;
  assignMechanic: (vehicleId: string, mechanicId: string, boxId: string) => void;
  addNewVehicle: (vehicleData: Partial<Vehicle>) => void;
  advanceSimulationStep: () => void;
}

const INITIAL_MECHANICS: Mechanic[] = [
  {
    id: 'mech_1',
    name: 'Carlos Silva',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Especialista',
    level: 18,
    xp: 4200,
    maxXp: 5000,
    score: 2310,
    weeklyPointsDelta: 120,
    assignedBoxId: 'box_1',
    activeVehicleIds: ['veh_1'],
    completedCountToday: 3,
    specialty: 'Motor & Injeção',
    medal: 'GOLD',
    trend: 'UP',
    achievements: ['Diagnóstico Ninja', 'Qualidade Máxima'],
  },
  {
    id: 'mech_2',
    name: 'Pedro Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Mecânico',
    level: 14,
    xp: 2900,
    maxXp: 3500,
    score: 2260,
    weeklyPointsDelta: 85,
    assignedBoxId: 'box_2',
    activeVehicleIds: ['veh_2'],
    completedCountToday: 2,
    specialty: 'Freios & Suspensão',
    medal: 'SILVER',
    trend: 'UP',
    achievements: ['Mestre dos Boxes'],
  },
  {
    id: 'mech_3',
    name: 'João Oliveira',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Auxiliar',
    level: 9,
    xp: 1800,
    maxXp: 2500,
    score: 2190,
    weeklyPointsDelta: 50,
    assignedBoxId: 'box_3',
    activeVehicleIds: [],
    completedCountToday: 2,
    specialty: 'Elétrica & Ar',
    medal: 'BRONZE',
    trend: 'STABLE',
    achievements: ['Velocista'],
  },
];

const INITIAL_BOXES: PitBox[] = [
  { id: 'box_1', number: 1, name: 'BOX 01 - Performance', mechanicId: 'mech_1', currentVehicleId: 'veh_1', occupied: true, capacity: 1, status: 'OCCUPIED' },
  { id: 'box_2', number: 2, name: 'BOX 02 - Suspensão', mechanicId: 'mech_2', currentVehicleId: 'veh_2', occupied: true, capacity: 1, status: 'OCCUPIED' },
  { id: 'box_3', number: 3, name: 'BOX 03 - Diagnóstico', mechanicId: 'mech_3', currentVehicleId: undefined, occupied: false, capacity: 1, status: 'FREE' },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1',
    plate: 'GT3-2026',
    brand: 'Ferrari',
    model: '296 GT3 Evo',
    color: '#EF4444',
    clientName: 'Roberto Alves',
    clientPhone: '(11) 98877-6655',
    status: 'EXECUTION',
    visualState: 'BOX_RUNNING',
    priority: 'URGENT',
    assignedMechanicId: 'mech_1',
    assignedBoxId: 'box_1',
    entryTime: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    estimatedHours: 3.5,
    elapsedMinutes: 140,
    progress: 75,
    trackProgress: 45,
    osNumber: 'OS-8841',
    serviceDescription: 'Ajuste de rigidez torsional, calibração do mapa de injeção e troca do splitter de carbono.',
    costEstimate: 18500,
    reworkCount: 0,
    hasWarranty: false,
    checklist: {
      exteriorInspected: true,
      fluidLevelsChecked: true,
      diagnosticsScanned: true,
      testDriveCompleted: false,
      cleanedAndSanitized: false,
      photosAttached: true,
      videoAttached: true,
    },
  },
  {
    id: 'veh_2',
    plate: 'RCE-911',
    brand: 'Porsche',
    model: '911 GT3 RS (992)',
    color: '#F59E0B',
    clientName: 'Fernanda Lima',
    clientPhone: '(11) 97766-5544',
    status: 'EXECUTION',
    visualState: 'BOX_RUNNING',
    priority: 'VIP',
    assignedMechanicId: 'mech_2',
    assignedBoxId: 'box_2',
    entryTime: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    estimatedHours: 2.0,
    elapsedMinutes: 90,
    progress: 50,
    trackProgress: 52,
    osNumber: 'OS-8842',
    serviceDescription: 'Configuração da asa traseira DRS e alinhamento do sistema de suspensão ativa.',
    costEstimate: 23200,
    reworkCount: 0,
    hasWarranty: false,
    checklist: {
      exteriorInspected: true,
      fluidLevelsChecked: true,
      diagnosticsScanned: true,
      testDriveCompleted: false,
      cleanedAndSanitized: false,
      photosAttached: true,
      videoAttached: false,
    },
  },
  {
    id: 'veh_3',
    plate: 'STO-0063',
    brand: 'Lamborghini',
    model: 'Huracán STO GT',
    color: '#3B82F6',
    clientName: 'Marcos Vinicius',
    clientPhone: '(11) 96655-4433',
    status: 'DIAGNOSIS',
    visualState: 'CURVE_DIAGNOSIS',
    priority: 'NORMAL',
    assignedMechanicId: 'mech_3',
    entryTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    estimatedHours: 1.5,
    elapsedMinutes: 30,
    progress: 25,
    trackProgress: 20,
    osNumber: 'OS-8843',
    serviceDescription: 'Diagnóstico telemétrico no sensor de pressão do freio cerâmico dianteiro.',
    costEstimate: 12650,
    reworkCount: 0,
    hasWarranty: false,
    checklist: {
      exteriorInspected: true,
      fluidLevelsChecked: false,
      diagnosticsScanned: true,
      testDriveCompleted: false,
      cleanedAndSanitized: false,
      photosAttached: false,
      videoAttached: false,
    },
  },
  {
    id: 'veh_4',
    plate: 'M4-GT3',
    brand: 'BMW',
    model: 'M4 GT3 Competition',
    color: '#A855F7',
    clientName: 'Gabriel Siqueira',
    clientPhone: '(11) 95544-3322',
    status: 'WAITING_APPROVAL',
    visualState: 'TOWER_APPROVAL',
    priority: 'CRITICAL',
    entryTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    estimatedHours: 4.0,
    elapsedMinutes: 180,
    progress: 35,
    trackProgress: 32,
    osNumber: 'OS-8844',
    serviceDescription: 'Aguardando aprovação para substituição do radiador de alta performance.',
    costEstimate: 28500,
    reworkCount: 0,
    hasWarranty: false,
    checklist: {
      exteriorInspected: true,
      fluidLevelsChecked: true,
      diagnosticsScanned: true,
      testDriveCompleted: false,
      cleanedAndSanitized: false,
      photosAttached: true,
      videoAttached: true,
    },
  },
  {
    id: 'veh_5',
    plate: 'MCL-720S',
    brand: 'McLaren',
    model: '720S GT3 EVO',
    color: '#10B981',
    clientName: 'Juliana Paes',
    clientPhone: '(11) 94433-2211',
    status: 'STAND_BY',
    visualState: 'PATIO_STANDBY',
    priority: 'URGENT',
    standByReason: 'WAITING_PARTS',
    entryTime: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    estimatedHours: 5.0,
    elapsedMinutes: 300,
    progress: 40,
    trackProgress: 60,
    osNumber: 'OS-8845',
    serviceDescription: 'Aguardando entrega de novo conjunto turbocompressor de corrida.',
    costEstimate: 34100,
    reworkCount: 0,
    hasWarranty: false,
    checklist: {
      exteriorInspected: true,
      fluidLevelsChecked: true,
      diagnosticsScanned: true,
      testDriveCompleted: false,
      cleanedAndSanitized: false,
      photosAttached: true,
      videoAttached: false,
    },
  },
  {
    id: 'veh_6',
    plate: 'AMG-GT3',
    brand: 'Mercedes-AMG',
    model: 'GT3 Edition 55',
    color: '#06B6D4',
    clientName: 'Lucas Mendes',
    clientPhone: '(11) 93322-1100',
    status: 'TEST',
    visualState: 'TRACK_TEST',
    priority: 'VIP',
    assignedMechanicId: 'mech_1',
    entryTime: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    estimatedHours: 4.0,
    elapsedMinutes: 220,
    progress: 88,
    trackProgress: 75,
    osNumber: 'OS-8846',
    serviceDescription: 'Teste dinâmico de telemetria, aerodinâmica e temperatura de pneus em reta.',
    costEstimate: 19800,
    reworkCount: 0,
    hasWarranty: false,
    checklist: {
      exteriorInspected: true,
      fluidLevelsChecked: true,
      diagnosticsScanned: true,
      testDriveCompleted: true,
      cleanedAndSanitized: true,
      photosAttached: true,
      videoAttached: true,
    },
  },
  {
    id: 'veh_7',
    plate: 'C8R-2026',
    brand: 'Chevrolet',
    model: 'Corvette C8.R GT3',
    color: '#EAB308',
    clientName: 'Camila Pitanga',
    clientPhone: '(11) 92211-0099',
    status: 'DELIVERED',
    visualState: 'PODIUM_DELIVERY',
    priority: 'VIP',
    rating: 5,
    entryTime: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    estimatedHours: 3.0,
    elapsedMinutes: 160,
    progress: 100,
    trackProgress: 100,
    osNumber: 'OS-8840',
    serviceDescription: 'Instalação de escape titânio racing e vitrificação cerâmica de alta resistência.',
    costEstimate: 27200,
    reworkCount: 0,
    hasWarranty: false,
    checklist: {
      exteriorInspected: true,
      fluidLevelsChecked: true,
      diagnosticsScanned: true,
      testDriveCompleted: true,
      cleanedAndSanitized: true,
      photosAttached: true,
      videoAttached: true,
    },
  },
];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Concluir 5 Diagnósticos Rápidos', category: 'DAILY', current: 3, goal: 5, rewardXp: 150, rewardPoints: 200, completed: false, iconName: 'Search' },
  { id: 'm2', title: 'Realizar 8 Entregas sem Atraso', category: 'DAILY', current: 6, goal: 8, rewardXp: 250, rewardPoints: 350, completed: false, iconName: 'Flag' },
  { id: 'm3', title: 'Manter Zero Carros com Garantia', category: 'DAILY', current: 1, goal: 1, rewardXp: 300, rewardPoints: 400, completed: true, iconName: 'ShieldCheck' },
  { id: 'm4', title: 'Preencher 100% dos Checklists da Semana', category: 'WEEKLY', current: 14, goal: 20, rewardXp: 600, rewardPoints: 800, completed: false, iconName: 'CheckSquare' },
  { id: 'm5', title: 'Meta da Oficina: 120 Entregas na Temporada', category: 'COMPANY', current: 86, goal: 120, rewardXp: 2000, rewardPoints: 3000, completed: false, iconName: 'Trophy' },
];

const INITIAL_EVENTS: RaceEvent[] = [
  {
    id: 'evt_1',
    timestamp: '15:42',
    title: 'Check-in Concluído',
    message: 'Toyota Hilux [ABC-1234] deu entrada no circuito.',
    type: 'CHECKIN',
    plate: 'ABC-1234',
    radioVoiceMessage: AINarratorEngine.generateRadioMessage('CHECKIN'),
  },
  {
    id: 'evt_2',
    timestamp: '15:45',
    title: 'Box Ocupado',
    message: 'Carlos Silva iniciou execução no BOX 01.',
    type: 'SERVICE',
    radioVoiceMessage: 'Carlos Silva assumiu execução no Box 01.',
  },
  {
    id: 'evt_3',
    timestamp: '15:50',
    title: 'Orçamento Enviado',
    message: 'BMW 330i aguardando autorização do cliente.',
    type: 'APPROVAL',
    radioVoiceMessage: 'Orçamento do BMW 330i aguardando aprovação.',
  },
];

export const useRaceStore = create<RaceStore>((set, get) => ({
  vehicles: INITIAL_VEHICLES,
  mechanics: INITIAL_MECHANICS,
  pitBoxes: INITIAL_BOXES,
  missions: INITIAL_MISSIONS,
  events: INITIAL_EVENTS,
  selectedVehicleId: 'veh_1',
  searchQuery: '',
  activeView: 'RACE',
  trackRenderMode: '3D',
  activeThemeId: 'RACE',
  weather: 'SUNNY',
  isLiveSimulationActive: false,
  soundEnabled: true,
  victoryVehicle: null,
  shopName: 'COMET Performance Autódromo',

  selectVehicle: (id) => set({ selectedVehicleId: id }),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (query.trim().length >= 3) {
      const match = get().vehicles.find((v) =>
        v.plate.toLowerCase().includes(query.toLowerCase()) ||
        v.model.toLowerCase().includes(query.toLowerCase()) ||
        v.osNumber.toLowerCase().includes(query.toLowerCase())
      );
      if (match) {
        set({ selectedVehicleId: match.id });
        soundEffects.playCheckIn();
      }
    }
  },

  setActiveView: (view) => set({ activeView: view }),
  setTrackRenderMode: (mode) => set({ trackRenderMode: mode }),
  setActiveTheme: (themeId) => set({ activeThemeId: themeId }),
  toggleLiveSimulation: () => set((state) => ({ isLiveSimulationActive: !state.isLiveSimulationActive })),
  toggleSound: () => {
    soundEffects.enabled = !get().soundEnabled;
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },
  clearVictoryVehicle: () => set({ victoryVehicle: null }),

  moveVehicleStatus: (id, newStatus, standByReason) => {
    const { vehicles, mechanics, pitBoxes, soundEnabled } = get();
    const vehicle = vehicles.find((v) => v.id === id);
    if (!vehicle) return;

    const oldStatus = vehicle.status;
    const visualState = StatusEngine.toVisualState(newStatus);

    // Audio effects
    if (soundEnabled) {
      if (newStatus === 'DELIVERED') soundEffects.playVictory();
      else if (newStatus === 'STAND_BY') soundEffects.playWarning();
      else if (newStatus === 'EXECUTION') soundEffects.playPitStart();
      else soundEffects.playCheckIn();
    }

    const updatedVehicles = vehicles.map((v) => {
      if (v.id === id) {
        return {
          ...v,
          status: newStatus,
          visualState,
          standByReason: newStatus === 'STAND_BY' ? (standByReason || 'WAITING_PARTS') : undefined,
          progress: newStatus === 'DELIVERED' ? 100 : v.progress,
        };
      }
      return v;
    });

    // Update Box assignment
    const updatedBoxes = pitBoxes.map((box) => {
      if (box.currentVehicleId === id && newStatus !== 'EXECUTION') {
        return { ...box, currentVehicleId: undefined, occupied: false, status: 'FREE' as const };
      }
      return box;
    });

    // Create Event & AI Radio narration
    const radioText = AINarratorEngine.generateRadioMessage(
      newStatus === 'DELIVERED' ? 'DELIVERY_VICTORY' : newStatus,
      vehicle
    );

    const newEvent: RaceEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      title: `Mudança de Status: ${StatusEngine.getStatusLabel(newStatus)}`,
      message: `${vehicle.brand} ${vehicle.model} [${vehicle.plate}] mudou de ${StatusEngine.getStatusLabel(oldStatus)} para ${StatusEngine.getStatusLabel(newStatus)}.`,
      type: newStatus === 'DELIVERED' ? 'DELIVERY' : 'MOVE',
      vehicleId: id,
      plate: vehicle.plate,
      radioVoiceMessage: radioText,
    };

    set({
      vehicles: updatedVehicles,
      pitBoxes: updatedBoxes,
      events: [newEvent, ...get().events].slice(0, 30),
      victoryVehicle: newStatus === 'DELIVERED' ? { ...vehicle, status: 'DELIVERED', visualState } : get().victoryVehicle,
      weather: newStatus === 'DELIVERED' ? 'VICTORY_FIREWORKS' : get().weather,
    });
  },

  updateChecklist: (id, key, value) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            checklist: { ...v.checklist, [key]: value },
          };
        }
        return v;
      }),
    }));
  },

  assignMechanic: (vehicleId, mechanicId, boxId) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === vehicleId ? { ...v, assignedMechanicId: mechanicId, assignedBoxId: boxId } : v)),
      pitBoxes: state.pitBoxes.map((b) => (b.id === boxId ? { ...b, mechanicId, currentVehicleId: vehicleId, occupied: true, status: 'OCCUPIED' } : b)),
    }));
  },

  addNewVehicle: (data) => {
    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      plate: data.plate || 'NEW-2026',
      brand: data.brand || 'Volkswagen',
      model: data.model || 'Golf GTI',
      color: data.color || '#3B82F6',
      clientName: data.clientName || 'Cliente Novo',
      clientPhone: data.clientPhone || '(11) 99999-0000',
      status: 'CHECKIN',
      visualState: 'GATE_CHECKIN',
      priority: data.priority || 'NORMAL',
      entryTime: new Date().toISOString(),
      estimatedHours: data.estimatedHours || 2,
      elapsedMinutes: 0,
      progress: 10,
      trackProgress: 10,
      osNumber: `OS-${Math.floor(8000 + Math.random() * 1000)}`,
      serviceDescription: data.serviceDescription || 'Inspeção e manutenção preventiva geral.',
      costEstimate: data.costEstimate || 1200,
      reworkCount: 0,
      hasWarranty: false,
      checklist: {
        exteriorInspected: true,
        fluidLevelsChecked: false,
        diagnosticsScanned: false,
        testDriveCompleted: false,
        cleanedAndSanitized: false,
        photosAttached: false,
        videoAttached: false,
      },
    };

    set((state) => ({
      vehicles: [newVehicle, ...state.vehicles],
      selectedVehicleId: newVehicle.id,
      events: [
        {
          id: `evt_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          title: 'Novo Check-in',
          message: `${newVehicle.brand} ${newVehicle.model} [${newVehicle.plate}] entrou para atendimento.`,
          type: 'CHECKIN',
          plate: newVehicle.plate,
          radioVoiceMessage: AINarratorEngine.generateRadioMessage('CHECKIN', newVehicle),
        },
        ...state.events,
      ],
    }));
  },

  advanceSimulationStep: () => {
    const { vehicles } = get();
    // Pick an active vehicle that is not delivered or cancelled and advance it
    const activeCandidates = vehicles.filter((v) => v.status !== 'DELIVERED' && v.status !== 'CANCELLED');
    if (activeCandidates.length === 0) return;

    const randomVehicle = activeCandidates[Math.floor(Math.random() * activeCandidates.length)];
    const sequence: BusinessStatus[] = [
      'SCHEDULED',
      'CHECKIN',
      'DIAGNOSIS',
      'WAITING_APPROVAL',
      'EXECUTION',
      'TEST',
      'FINALIZATION',
      'DELIVERED',
    ];

    const currentIdx = sequence.indexOf(randomVehicle.status);
    if (currentIdx !== -1 && currentIdx < sequence.length - 1) {
      const nextStatus = sequence[currentIdx + 1];
      get().moveVehicleStatus(randomVehicle.id, nextStatus);
    }
  },
}));
