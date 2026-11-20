import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRaceStore } from '../stores/useRaceStore';
import { calculateDynamicBoxX } from '../config/track.config';
import { BusinessStatus, Vehicle } from '../types/race';
import { soundEffects } from '../utils/soundEffects';
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sun,
  Moon,
  Sunset as SunsetIcon,
  Focus,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Box,
  Layers,
} from 'lucide-react';

interface ZoneDefinition {
  id: string;
  num: number;
  name: string;
  subtitle: string;
  status: BusinessStatus;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  borderColor: string;
  bgColor: string;
}

const ZONES: ZoneDefinition[] = [
  {
    id: 'zone_checkin',
    num: 1,
    name: 'ENTRADA',
    subtitle: 'CHECK-IN',
    status: 'CHECKIN',
    x: 40,
    y: 40,
    w: 180,
    h: 120,
    color: '#06B6D4',
    borderColor: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.18)',
  },
  {
    id: 'zone_diagnosis',
    num: 2,
    name: 'DIAGNÓSTICO',
    subtitle: 'ANÁLISE TÉCNICA',
    status: 'DIAGNOSIS',
    x: 245,
    y: 15,
    w: 220,
    h: 120,
    color: '#00C8FF',
    borderColor: '#00C8FF',
    bgColor: 'rgba(0, 200, 255, 0.18)',
  },
  {
    id: 'zone_budget',
    num: 3,
    name: 'ORÇAMENTO',
    subtitle: 'AGUARD. APROVAÇÃO',
    status: 'WAITING_APPROVAL',
    x: 600,
    y: 15,
    w: 220,
    h: 120,
    color: '#EAB308',
    borderColor: '#EAB308',
    bgColor: 'rgba(234, 179, 8, 0.18)',
  },
  {
    id: 'zone_execution',
    num: 4,
    name: 'EXECUÇÃO',
    subtitle: 'EM ANDAMENTO (BOXES)',
    status: 'EXECUTION',
    x: 160,
    y: 180,
    w: 540,
    h: 160,
    color: '#FF6B00',
    borderColor: '#FF6B00',
    bgColor: 'rgba(255, 107, 0, 0.18)',
  },
  {
    id: 'zone_standby',
    num: 5,
    name: 'STAND BY',
    subtitle: 'AGUARDANDO PEÇAS',
    status: 'STAND_BY',
    x: 10,
    y: 250,
    w: 140,
    h: 170,
    color: '#EF4444',
    borderColor: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.20)',
  },
  {
    id: 'zone_test',
    num: 6,
    name: 'TESTE DINÂMICO',
    subtitle: 'TELEMETRIA & PISTA',
    status: 'TEST',
    x: 740,
    y: 140,
    w: 180,
    h: 180,
    color: '#A855F7',
    borderColor: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.18)',
  },
  {
    id: 'zone_finalization',
    num: 7,
    name: 'FINALIZAÇÃO',
    subtitle: 'PREPARAÇÃO ENTREGA & PÓDIO',
    status: 'DELIVERED',
    x: 730,
    y: 330,
    w: 260,
    h: 235,
    color: '#10B981',
    borderColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.20)',
  },
];

const TRACK_WAYPOINTS = [
  { x: 95, y: 170, angle: -60 },
  { x: 105, y: 100, angle: -30 },
  { x: 145, y: 60, angle: 10 },
  { x: 220, y: 55, angle: 0 },
  { x: 380, y: 55, angle: 0 },
  { x: 500, y: 60, angle: 0 },
  { x: 640, y: 55, angle: 0 },
  { x: 770, y: 65, angle: 15 },
  { x: 850, y: 120, angle: 60 },
  { x: 880, y: 220, angle: 90 },
  { x: 870, y: 320, angle: 110 },
  { x: 830, y: 400, angle: 140 },
  { x: 770, y: 450, angle: 170 },
  { x: 670, y: 475, angle: 180 },
  { x: 500, y: 475, angle: 180 },
  { x: 320, y: 475, angle: 180 },
  { x: 200, y: 470, angle: 200 },
  { x: 130, y: 440, angle: 240 },
  { x: 75, y: 370, angle: -80 },
  { x: 80, y: 270, angle: -80 },
  { x: 95, y: 170, angle: -60 },
];

export const RaceTrack2D: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectVehicle,
    moveVehicleStatus,
    assignMechanic,
    pitBoxes,
    mechanics,
    soundEnabled,
    toggleSound,
    isLiveSimulationActive,
    toggleLiveSimulation,
    trackRenderMode,
    setTrackRenderMode,
  } = useRaceStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [timeOfDay, setTimeOfDay] = useState<'DAY' | 'SUNSET' | 'NIGHT'>('NIGHT');

  const [draggedVehicleId, setDraggedVehicleId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [activeHoverZone, setActiveHoverZone] = useState<ZoneDefinition | null>(null);
  const [logMessage, setLogMessage] = useState<string>(
    'Circuito HTML5 Canvas 2D Pronto • Arraste qualquer veículo para alterar sua etapa'
  );
  const [logType, setLogType] = useState<'IDLE' | 'DRAGGING' | 'SUCCESS' | 'WARNING'>('IDLE');

  const animFrameRef = useRef<number | null>(null);
  const celebrationTickRef = useRef<number>(0);

  const totalBoxesCount = Math.max(5, Math.min(20, pitBoxes.length || 10));
  const pitBuildingStartX = 180;
  const pitBuildingWidth = 510;

  const dynamicPitSlots = pitBoxes.slice(0, totalBoxesCount).map((pBox, idx) => {
    const { boxX, boxWidth } = calculateDynamicBoxX(idx, totalBoxesCount, pitBuildingStartX, pitBuildingWidth);
    const mech = mechanics.find((m) => m.id === pBox.mechanicId);
    const currentVehicle = vehicles.find(
      (v) => v.assignedBoxId === pBox.id && v.visualState === 'BOX_RUNNING'
    );
    return { boxIndex: idx, boxNum: pBox.number || idx + 1, boxX, boxWidth, pBox, mech, currentVehicle };
  });

  function getVehicleCanvasPosition(
    veh: Vehicle,
    vehicleIndex: number,
    boxesCount: number = 10
  ): { x: number; y: number; rotation: number } {
    const visualState = veh.visualState;
    const progress = veh.progress;
    const offset = (vehicleIndex % 3) * 14 - 14;

    if (visualState === 'BOX_RUNNING') {
      const boxNum = veh.assignedBoxId
        ? pitBoxes.find((b) => b.id === veh.assignedBoxId)?.number
        : undefined;
      const targetBoxIndex = boxNum ? boxNum - 1 : vehicleIndex % Math.max(1, boxesCount);
      const { boxX } = calculateDynamicBoxX(targetBoxIndex, boxesCount, pitBuildingStartX, pitBuildingWidth);
      return {
        x: boxX,
        y: 282 + (vehicleIndex % 2) * 4,
        rotation: 0,
      };
    }

    if (visualState === 'PODIUM_DELIVERY') {
      return {
        x: 820 + (vehicleIndex % 3) * 22 - 22,
        y: 505 + Math.floor(vehicleIndex / 3) * 14,
        rotation: 0,
      };
    }

    if (visualState === 'PATIO_STANDBY') {
      return {
        x: 75 + (vehicleIndex % 2) * 22,
        y: 350 + Math.floor(vehicleIndex / 2) * 22,
        rotation: 90,
      };
    }

    let percent = 0.05;
    switch (visualState) {
      case 'GATE_PARKED':
        percent = 0.02 + (progress / 100) * 0.03;
        break;
      case 'GATE_CHECKIN':
        percent = 0.06 + (progress / 100) * 0.04;
        break;
      case 'CURVE_DIAGNOSIS':
        percent = 0.13 + (progress / 100) * 0.15;
        break;
      case 'TOWER_APPROVAL':
        percent = 0.31 + (progress / 100) * 0.13;
        break;
      case 'TRACK_TEST':
        percent = 0.58 + (progress / 100) * 0.15;
        break;
      case 'FINISH_LINE':
        percent = 0.78 + (progress / 100) * 0.12;
        break;
      default:
        percent = 0.05;
        break;
    }

    const totalSegments = TRACK_WAYPOINTS.length - 1;
    const exactIndex = percent * totalSegments;
    const idx1 = Math.floor(exactIndex);
    const idx2 = Math.min(TRACK_WAYPOINTS.length - 1, idx1 + 1);
    const frac = exactIndex - idx1;

    const p1 = TRACK_WAYPOINTS[idx1] || TRACK_WAYPOINTS[0];
    const p2 = TRACK_WAYPOINTS[idx2] || p1;

    const x = p1.x + (p2.x - p1.x) * frac;
    const y = p1.y + (p2.y - p1.y) * frac;
    const angle = p1.angle + (p2.angle - p1.angle) * frac;

    const rad = (angle * Math.PI) / 180;
    return {
      x: x + offset * Math.sin(rad),
      y: y - offset * Math.cos(rad),
      rotation: angle,
    };
  }

  const detectZoneAt = useCallback((x: number, y: number): ZoneDefinition | null => {
    for (const zone of ZONES) {
      if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) {
        return zone;
      }
    }
    return null;
  }, []);

  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const scaleX = 1000 / rect.width;
      const scaleY = 580 / rect.height;

      const rawX = clientX * scaleX;
      const rawY = clientY * scaleY;

      const centerX = 500;
      const centerY = 290;

      const canvasX = (rawX - centerX - pan.x) / zoom + centerX;
      const canvasY = (rawY - centerY - pan.y) / zoom + centerY;

      return { x: canvasX, y: canvasY };
    },
    [pan.x, pan.y, zoom]
  );

  const getVehicleUnderMouse = useCallback(
    (cx: number, cy: number): Vehicle | null => {
      for (let i = vehicles.length - 1; i >= 0; i--) {
        const v = vehicles[i];
        const pos = getVehicleCanvasPosition(v, i, totalBoxesCount);

        const distCar = Math.hypot(cx - pos.x, cy - pos.y);
        const inPill =
          cx >= pos.x + 18 && cx <= pos.x + 105 && cy >= pos.y - 32 && cy <= pos.y + 12;

        if (distCar <= 34 || inPill) {
          return v;
        }
      }
      return null;
    },
    [vehicles, totalBoxesCount]
  );

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const clickedCar = getVehicleUnderMouse(coords.x, coords.y);
    if (clickedCar) {
      soundEffects.playClick();
      selectVehicle(clickedCar.id);
      setDraggedVehicleId(clickedCar.id);
      setDragPos(coords);
      setLogType('DRAGGING');
      setLogMessage(`Arrastando ${clickedCar.brand} ${clickedCar.model} [${clickedCar.osNumber}] • Solte em uma das etapas`);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    if (draggedVehicleId) {
      setDragPos(coords);
      const hoveredZone = detectZoneAt(coords.x, coords.y);
      setActiveHoverZone(hoveredZone);

      if (hoveredZone) {
        setLogMessage(`Alvo detectado: ${hoveredZone.num}. ${hoveredZone.name} (${hoveredZone.subtitle})`);
      }
    } else {
      const isOverCar = Boolean(getVehicleUnderMouse(coords.x, coords.y));
      if (canvasRef.current) {
        canvasRef.current.style.cursor = isOverCar ? 'pointer' : 'default';
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (!draggedVehicleId || !dragPos) {
      setDraggedVehicleId(null);
      setDragPos(null);
      setActiveHoverZone(null);
      return;
    }

    const targetVehicle = vehicles.find((v) => v.id === draggedVehicleId);
    const targetZone = detectZoneAt(dragPos.x, dragPos.y);

    if (targetVehicle && targetZone) {
      if (targetZone.status === 'EXECUTION') {
        const closestSlot = dynamicPitSlots.reduce((prev, curr) => {
          return Math.abs(curr.boxX - dragPos.x) < Math.abs(prev.boxX - dragPos.x) ? curr : prev;
        }, dynamicPitSlots[0]);

        if (closestSlot && closestSlot.pBox) {
          const mechId = closestSlot.pBox.mechanicId || mechanics[0]?.id || 'mech_1';
          assignMechanic(targetVehicle.id, mechId, closestSlot.pBox.id);
        }
      }

      moveVehicleStatus(targetVehicle.id, targetZone.status);
      soundEffects.playSuccess();

      setLogType('SUCCESS');
      const msg = `✨ ${targetVehicle.osNumber} [${targetVehicle.brand} ${targetVehicle.model}] movida com sucesso para a etapa: ${targetZone.num}. ${targetZone.name}`;
      setLogMessage(msg);
    } else if (targetVehicle) {
      soundEffects.playDropOutside();
      setLogType('WARNING');
      setLogMessage(`⚠️ ${targetVehicle.osNumber} solta fora de uma etapa válida.`);
    }

    setDraggedVehicleId(null);
    setDragPos(null);
    setActiveHoverZone(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    function drawTree(c: CanvasRenderingContext2D, x: number, y: number, r: number, tint = 0) {
      c.save();
      c.fillStyle = 'rgba(0, 0, 0, 0.45)';
      c.beginPath();
      c.ellipse(x + r * 0.25, y + r * 0.35, r * 1.1, r * 0.7, 0.2, 0, Math.PI * 2);
      c.fill();

      const g1 = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
      if (tint === 1) {
        g1.addColorStop(0, '#1E4D2B');
        g1.addColorStop(0.7, '#11331D');
        g1.addColorStop(1, '#081C10');
      } else {
        g1.addColorStop(0, '#194326');
        g1.addColorStop(0.7, '#0E2E18');
        g1.addColorStop(1, '#06170B');
      }
      c.fillStyle = g1;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = 'rgba(40, 110, 60, 0.25)';
      c.beginPath();
      c.arc(x - r * 0.25, y - r * 0.2, r * 0.45, 0, Math.PI * 2);
      c.arc(x + r * 0.2, y - r * 0.15, r * 0.4, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = 'rgba(255, 255, 255, 0.08)';
      c.beginPath();
      c.arc(x - r * 0.2, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    function render() {
      if (!ctx || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const width = 1000;
      const height = 580;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      celebrationTickRef.current += 0.03;
      const tick = celebrationTickRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.translate(centerX + pan.x, centerY + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerX, -centerY);

      let bgColor = '#09110D';
      let asphaltColor = '#1A212B';
      if (timeOfDay === 'DAY') {
        bgColor = '#14241B';
        asphaltColor = '#2D3746';
      } else if (timeOfDay === 'SUNSET') {
        bgColor = '#1A1410';
        asphaltColor = '#241D19';
      }

      // 1. Terrain Grass Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const terrainGrad = ctx.createRadialGradient(500, 290, 150, 500, 290, 600);
      terrainGrad.addColorStop(0, 'rgba(18, 48, 30, 0.5)');
      terrainGrad.addColorStop(1, 'rgba(4, 12, 8, 0.95)');
      ctx.fillStyle = terrainGrad;
      ctx.fillRect(0, 0, width, height);

      const trees = [
        { x: 30, y: 30, r: 24 },
        { x: 70, y: 20, r: 30 },
        { x: 115, y: 25, r: 26 },
        { x: 160, y: 15, r: 28 },
        { x: 210, y: 20, r: 22 },
        { x: 25, y: 75, r: 28 },
        { x: 20, y: 130, r: 26 },
        { x: 20, y: 190, r: 25 },
        { x: 470, y: 20, r: 26 },
        { x: 505, y: 15, r: 22 },
        { x: 575, y: 15, r: 24 },
        { x: 610, y: 18, r: 20 },
        { x: 800, y: 25, r: 25 },
        { x: 845, y: 25, r: 30 },
        { x: 895, y: 30, r: 28 },
        { x: 940, y: 45, r: 32 },
        { x: 970, y: 90, r: 28 },
        { x: 975, y: 150, r: 30 },
        { x: 965, y: 210, r: 28 },
        { x: 960, y: 275, r: 26 },
        { x: 965, y: 340, r: 28 },
        { x: 970, y: 410, r: 26 },
        { x: 965, y: 480, r: 30 },
        { x: 940, y: 545, r: 32 },
        { x: 885, y: 560, r: 26 },
        { x: 700, y: 565, r: 25 },
        { x: 640, y: 565, r: 24 },
        { x: 460, y: 565, r: 26 },
        { x: 390, y: 560, r: 28 },
        { x: 80, y: 555, r: 30 },
        { x: 30, y: 535, r: 32 },
        { x: 20, y: 470, r: 26 },
        { x: 190, y: 115, r: 16 },
        { x: 215, y: 135, r: 14 },
        { x: 745, y: 305, r: 16 },
        { x: 760, y: 265, r: 15 },
      ];
      trees.forEach((t, i) => drawTree(ctx, t.x, t.y, t.r, i % 2));

      // 2. Main Isometric Asphalt Circuit & Curbs
      ctx.lineWidth = 58;
      ctx.strokeStyle = '#DC2626';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      TRACK_WAYPOINTS.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.stroke();

      ctx.lineWidth = 58;
      ctx.strokeStyle = '#FFFFFF';
      ctx.setLineDash([14, 14]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.lineWidth = 46;
      ctx.strokeStyle = asphaltColor;
      ctx.stroke();

      ctx.lineWidth = 42;
      ctx.strokeStyle = '#141B24';
      ctx.stroke();

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
      ctx.setLineDash([12, 10]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(330, 52); ctx.lineTo(336, 56); ctx.lineTo(330, 60);
      ctx.moveTo(338, 52); ctx.lineTo(344, 56); ctx.lineTo(338, 60);
      ctx.moveTo(872, 260); ctx.lineTo(876, 266); ctx.lineTo(880, 260);
      ctx.moveTo(560, 472); ctx.lineTo(554, 476); ctx.lineTo(560, 480);
      ctx.moveTo(552, 472); ctx.lineTo(546, 476); ctx.lineTo(552, 480);
      ctx.stroke();
      ctx.restore();

      // Checkered Finish Line
      ctx.save();
      ctx.translate(620, 452);
      ctx.rotate((-2 * Math.PI) / 180);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 28, 46);
      ctx.fillStyle = '#0F172A';
      for (let rx = 0; rx < 28; rx += 7) {
        for (let ry = 0; ry < 46; ry += 7) {
          if ((Math.floor(rx / 7) + Math.floor(ry / 7)) % 2 === 0) {
            ctx.fillRect(rx, ry, 7, 7);
          }
        }
      }
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 28, 46);
      ctx.restore();

      // 3. Buildings & Structures
      ctx.save();
      ctx.translate(270, 22);
      ctx.fillStyle = '#141C28';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(0, 0, 172, 78, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(6, 6, 160, 16);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(6, 6, 160, 16);
      [10, 64, 118].forEach((bx) => {
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(bx, 28, 44, 44);
        ctx.strokeStyle = '#00C8FF';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, 28, 44, 44);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + 10, 34); ctx.lineTo(bx + 10, 68);
        ctx.moveTo(bx + 34, 34); ctx.lineTo(bx + 34, 68);
        ctx.moveTo(bx + 6, 52); ctx.lineTo(bx + 38, 52);
        ctx.stroke();
      });
      ctx.restore();

      // Control Tower
      ctx.save();
      ctx.translate(535, 60);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 25, 42, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-36, -8, 72, 36, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-30, -22, 60, 20);
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(-32, -18, 64, 4);
      const towerGlow = ctx.createLinearGradient(-28, -42, 28, -22);
      towerGlow.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
      towerGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
      towerGlow.addColorStop(1, 'rgba(239, 68, 68, 0.85)');
      ctx.fillStyle = towerGlow;
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-28, -42, 56, 22, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      for (let mx = -20; mx <= 20; mx += 10) {
        ctx.beginPath();
        ctx.moveTo(mx, -42);
        ctx.lineTo(mx, -20);
        ctx.stroke();
      }
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(-32, -42);
      ctx.lineTo(32, -42);
      ctx.lineTo(0, -56);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(0, -70);
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -70, 3.5 + Math.sin(tick * 4) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Budget Building
      ctx.save();
      ctx.translate(625, 22);
      ctx.fillStyle = '#1D180F';
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(0, 0, 162, 78, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2E2211';
      ctx.fillRect(6, 6, 150, 16);
      [14, 88].forEach((bx) => {
        ctx.fillStyle = '#0B0905';
        ctx.fillRect(bx, 28, 60, 44);
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, 28, 60, 44);
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + 14, 34); ctx.lineTo(bx + 14, 66);
        ctx.moveTo(bx + 46, 34); ctx.lineTo(bx + 46, 66);
        ctx.moveTo(bx + 8, 50); ctx.lineTo(bx + 52, 50);
        ctx.stroke();
      });
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(595, 95, 32, -0.6 * Math.PI, 0.7 * Math.PI, false);
      ctx.stroke();
      ctx.restore();

      // Pit Boxes Complex
      ctx.save();
      ctx.translate(175, 195);
      ctx.fillStyle = '#111722';
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(0, 0, pitBuildingWidth, 90, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1A2332';
      ctx.fillRect(0, 0, pitBuildingWidth, 22);

      dynamicPitSlots.forEach(({ boxNum, boxX, boxWidth, pBox, mech }) => {
        const relX = boxX - pitBuildingStartX - boxWidth / 2;
        const isOccupied = pBox?.occupied;
        const isTargeted =
          activeHoverZone?.status === 'EXECUTION' &&
          dragPos &&
          Math.abs(boxX - dragPos.x) < boxWidth;

        ctx.fillStyle = isTargeted ? '#FF6B00' : isOccupied ? '#334155' : '#0F172A';
        ctx.fillRect(relX + 2, 2, boxWidth - 4, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(boxNum < 10 ? `0${boxNum}` : `${boxNum}`, relX + boxWidth / 2, 15);

        ctx.fillStyle = isTargeted ? 'rgba(255, 107, 0, 0.35)' : isOccupied ? '#17202E' : '#090E16';
        ctx.strokeStyle = isTargeted ? '#FF6B00' : '#334155';
        ctx.lineWidth = isTargeted ? 1.5 : 0.6;
        ctx.fillRect(relX + 2, 24, boxWidth - 4, 62);
        ctx.strokeRect(relX + 2, 24, boxWidth - 4, 62);

        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(relX + 5, 28); ctx.lineTo(relX + 5, 78);
        ctx.stroke();

        ctx.strokeStyle = '#2563EB';
        ctx.beginPath();
        ctx.moveTo(relX + boxWidth - 5, 28); ctx.lineTo(relX + boxWidth - 5, 78);
        ctx.stroke();

        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(relX + 5, 52); ctx.lineTo(relX + boxWidth - 5, 52);
        ctx.stroke();

        if (mech && boxWidth >= 30) {
          ctx.fillStyle = '#CBD5E1';
          ctx.font = '6.5px sans-serif';
          ctx.fillText(mech.name.split(' ')[0], relX + boxWidth / 2, 76);
        }

        ctx.fillStyle = isOccupied ? '#FF6B00' : '#10B981';
        ctx.beginPath();
        ctx.arc(relX + boxWidth / 2, 28, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(185, 475);
      ctx.quadraticCurveTo(190, 360, 275, 315);
      ctx.stroke();
      ctx.fillStyle = '#FF6B00';
      ctx.beginPath();
      ctx.moveTo(275, 315);
      ctx.lineTo(267, 322);
      ctx.lineTo(271, 312);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(310, 475);
      ctx.lineTo(600, 475);
      ctx.stroke();
      ctx.restore();

      // Stand By
      ctx.save();
      ctx.translate(15, 255);
      ctx.fillStyle = '#1A0C0E';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(0, 0, 105, 140, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#3B1215';
      ctx.fillRect(4, 4, 97, 18);
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STAND BY', 52, 16);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(15, 45); ctx.lineTo(90, 45);
      ctx.moveTo(15, 80); ctx.lineTo(90, 80);
      ctx.moveTo(15, 115); ctx.lineTo(90, 115);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Finalização
      ctx.save();
      ctx.translate(765, 340);
      ctx.fillStyle = '#0B1A14';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(0, 0, 175, 75, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(6, 6, 163, 16);
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PREPARAÇÃO & FINALIZAÇÃO', 87, 18);
      [12, 68, 124].forEach((gx) => {
        ctx.fillStyle = '#051E14';
        ctx.fillRect(gx, 28, 42, 42);
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 1;
        ctx.strokeRect(gx, 28, 42, 42);
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(gx + 21, 38, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Podium
      ctx.save();
      ctx.translate(770, 435);
      ctx.fillStyle = '#121A16';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(0, 0, 170, 90, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PÓDIO OFICIAL COMET 🏆', 85, 16);

      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(32, 42, 28, 38);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('2', 46, 64);

      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(68, 28, 36, 52);
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(68, 28, 36, 52);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('1', 86, 54);

      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(81, 26);
      ctx.lineTo(91, 26);
      ctx.lineTo(89, 14);
      ctx.lineTo(83, 14);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(86, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(81, 13, 3.5, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.arc(91, 13, 3.5, 1.5 * Math.PI, 0.5 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#D97706';
      ctx.fillRect(110, 48, 28, 32);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('3', 124, 68);

      for (let p = 0; p < 12; p++) {
        const angle = (p * Math.PI) / 6 + tick * 0.8;
        const dist = 22 + (p % 3) * 8 + Math.sin(tick * 2 + p) * 6;
        const fx = 152 + Math.cos(angle) * dist;
        const fy = 20 + Math.sin(angle) * dist;
        ctx.fillStyle = p % 2 === 0 ? '#FBBF24' : '#EF4444';
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5 + (p % 2) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Lower Left Support Garage
      ctx.save();
      ctx.translate(130, 495);
      ctx.fillStyle = '#121820';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(0, 0, 200, 60, 4);
      ctx.fill();
      ctx.stroke();
      const smallCars = [
        { x: 30, y: 70, col: '#F8FAFC' },
        { x: 75, y: 70, col: '#38BDF8' },
        { x: 120, y: 70, col: '#475569' },
        { x: 165, y: 70, col: '#94A3B8' },
      ];
      smallCars.forEach((sc) => {
        ctx.fillStyle = sc.col;
        ctx.fillRect(sc.x - 8, sc.y - 5, 16, 10);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(sc.x - 4, sc.y - 4, 8, 8);
      });
      ctx.restore();

      // 4. Sector Zones Floating Glass Badges
      ZONES.forEach((zone) => {
        const isHovered = activeHoverZone?.id === zone.id;

        if (draggedVehicleId) {
          ctx.save();
          ctx.strokeStyle = isHovered ? '#00FFCC' : 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = isHovered ? 2.5 : 1;
          ctx.fillStyle = isHovered ? zone.bgColor : 'transparent';
          if (!isHovered) ctx.setLineDash([4, 4]);

          ctx.beginPath();
          ctx.roundRect(zone.x, zone.y, zone.w, zone.h, 10);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.translate(zone.x + 6, zone.y + 6);

        const badgeWidth =
          zone.name === 'EXECUÇÃO' ? 145 : zone.name === 'FINALIZAÇÃO' ? 155 : 135;

        ctx.fillStyle = 'rgba(10, 16, 24, 0.94)';
        ctx.strokeStyle = isHovered ? '#00FFCC' : zone.borderColor;
        ctx.lineWidth = isHovered ? 2 : 1.2;
        ctx.beginPath();
        ctx.roundRect(0, 0, badgeWidth, 34, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = zone.color;
        ctx.beginPath();
        ctx.roundRect(4, 4, 26, 26, 4);
        ctx.fill();

        ctx.fillStyle = '#090D14';
        ctx.font = '900 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${zone.num}`, 17, 22);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9.5px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(zone.name, 35, 15);

        ctx.fillStyle = zone.color;
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(zone.subtitle, 35, 26);

        ctx.restore();
      });

      // 5. Drag & Drop Trajectory Arc
      if (draggedVehicleId && dragPos && activeHoverZone) {
        ctx.save();
        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(dragPos.x, dragPos.y);
        ctx.quadraticCurveTo(
          (dragPos.x + activeHoverZone.x + activeHoverZone.w / 2) / 2,
          (dragPos.y + activeHoverZone.y + activeHoverZone.h / 2) / 2 - 30,
          activeHoverZone.x + activeHoverZone.w / 2,
          activeHoverZone.y + activeHoverZone.h / 2
        );
        ctx.stroke();
        ctx.restore();
      }

      // 6. Supercars & Telemetry Badges
      vehicles.forEach((veh, idx) => {
        const isThisDragged = draggedVehicleId === veh.id;
        const pos =
          isThisDragged && dragPos
            ? { x: dragPos.x, y: dragPos.y, rotation: 0 }
            : getVehicleCanvasPosition(veh, idx, totalBoxesCount);

        const isSelected = veh.id === selectedVehicleId;

        ctx.save();
        ctx.translate(pos.x, pos.y);

        if (isSelected || isThisDragged) {
          ctx.save();
          ctx.strokeStyle = isThisDragged ? '#00FFCC' : '#FF6B00';
          ctx.lineWidth = isThisDragged ? 2.5 : 1.8;
          ctx.setLineDash([6, 3]);
          ctx.beginPath();
          ctx.arc(0, 0, isThisDragged ? 38 : 34, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.rotate((pos.rotation * Math.PI) / 180);

        const headGrad = ctx.createLinearGradient(20, 0, 75, 0);
        headGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
        headGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.3)');
        headGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(20, -7);
        ctx.lineTo(75, -28);
        ctx.lineTo(75, 28);
        ctx.lineTo(20, 7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#05070A';
        ctx.fillRect(10, -14, 9, 4);
        ctx.fillRect(10, 10, 9, 4);
        ctx.fillRect(-14, -14, 9, 4);
        ctx.fillRect(-14, 10, 9, 4);

        ctx.fillStyle = veh.color;
        ctx.strokeStyle = '#05080E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-20, -10, 42, 20, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-8, -6, 18, 12, 3);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-3, -4); ctx.lineTo(4, 3);
        ctx.stroke();

        ctx.fillStyle = '#05080E';
        ctx.fillRect(-22, -13, 4, 26);
        ctx.fillStyle = veh.color;
        ctx.fillRect(-23, -14, 6, 2.5);
        ctx.fillRect(-23, 11.5, 6, 2.5);

        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(21, -4.5, 1.8, 0, Math.PI * 2);
        ctx.arc(21, 4.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-21, -7); ctx.lineTo(-21, 7);
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.translate(24, -18);

        ctx.fillStyle = 'rgba(10, 16, 24, 0.92)';
        ctx.strokeStyle = isThisDragged ? '#00FFCC' : isSelected ? '#FF6B00' : 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = isThisDragged ? 1.8 : 1.2;
        ctx.beginPath();
        ctx.roundRect(-4, -10, 72, 26, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8.5px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(veh.osNumber || `OS #${veh.id.slice(0, 5)}`, 3, 0);

        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.roundRect(3, 7, 40, 3, 1.5);
        ctx.fill();

        ctx.fillStyle = isThisDragged ? '#00FFCC' : '#10B981';
        ctx.beginPath();
        ctx.roundRect(3, 7, Math.min(40, (veh.progress / 100) * 40), 3, 1.5);
        ctx.fill();

        ctx.fillStyle = '#CBD5E1';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(`${veh.progress}%`, 46, 10);

        ctx.restore();
        ctx.restore();
      });

      ctx.restore();
      ctx.restore();

      if (isRunning) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    }

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    vehicles,
    selectedVehicleId,
    draggedVehicleId,
    dragPos,
    activeHoverZone,
    zoom,
    pan,
    timeOfDay,
    totalBoxesCount,
    dynamicPitSlots,
  ]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFocusSelected = () => {
    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (!selectedVehicle) return;
    const pos = getVehicleCanvasPosition(selectedVehicle, 0, totalBoxesCount);
    setZoom(1.35);
    setPan({ x: 500 - pos.x, y: 290 - pos.y });
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#080F0B] border border-gray-800 shadow-2xl overflow-hidden select-none">
      {/* Top Header & Telemetry Controls Bar */}
      <div className="bg-[#0B121A] border-b border-gray-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-wider text-white">COMET RACE CONTROL</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-mono border border-emerald-800/50">
              HTML5 CANVAS 2D
            </span>
          </div>

          {/* 2D / 3D Mode Switcher */}
          <div className="flex items-center bg-[#060B12] border border-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setTrackRenderMode('2D')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                trackRenderMode === '2D' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Clássica</span>
            </button>
            <button
              onClick={() => setTrackRenderMode('3D')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                trackRenderMode === '3D' ? 'bg-[#FF6B00] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Game</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveSimulation}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isLiveSimulationActive
                ? 'bg-emerald-600 text-white border border-emerald-400 shadow-emerald-900/50'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {isLiveSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveSimulationActive ? 'SIMULAÇÃO ATIVA' : 'INICIAR SIMULAÇÃO'}</span>
          </button>

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Desativar Sons' : 'Ativar Efeitos Sonoros'}
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              soundEnabled
                ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800'
                : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setTimeOfDay('DAY')}
              title="Modo Dia"
              className={`p-1.5 rounded-md transition-colors ${
                timeOfDay === 'DAY' ? 'bg-[#FF6B00] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('SUNSET')}
              title="Modo Pôr do Sol"
              className={`p-1.5 rounded-md transition-colors ${
                timeOfDay === 'SUNSET' ? 'bg-[#FF6B00] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <SunsetIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('NIGHT')}
              title="Modo Noite"
              className={`p-1.5 rounded-md transition-colors ${
                timeOfDay === 'NIGHT' ? 'bg-[#FF6B00] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5">
            {selectedVehicleId && (
              <button
                onClick={handleFocusSelected}
                title="Focar Veículo Selecionado"
                className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Focus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleZoomIn}
              title="Aumentar Zoom"
              className="p-1.5 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Diminuir Zoom"
              className="p-1.5 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Resetar Câmera"
              className="p-1.5 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cybernetic Telemetry Log Ticker Bar */}
      <div
        id="log"
        className={`w-full px-4 py-2 text-xs font-mono flex items-center justify-between border-b transition-colors ${
          logType === 'DRAGGING'
            ? 'bg-cyan-950/80 border-cyan-700/80 text-cyan-200'
            : logType === 'SUCCESS'
            ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
            : logType === 'WARNING'
            ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
            : 'bg-[#101726]/90 border-gray-800 text-cyan-400'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-semibold">{logMessage}</span>
        </div>
        <div className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:block">
          Dica: clique e arraste os supercarros entre as zonas da pista
        </div>
      </div>

      {/* HTML5 Native Canvas Element Viewport */}
      <div className="w-full h-[600px] overflow-hidden relative flex items-center justify-center bg-[#080F0B]">
        <canvas
          id="pistaCanvas"
          ref={canvasRef}
          width={1000}
          height={580}
          className="w-full h-full max-w-[1000px] max-h-[580px] block"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Bottom Status Legend & Process Workflow Bar */}
      <div className="bg-[#0B121A] border-t border-gray-800/80 px-4 py-2 text-xs text-gray-400 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center flex-wrap gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> 1. Check-in
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C8FF]" /> 2. Diagnóstico
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /> 3. Orçamento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" /> 4. Execução (Boxes)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> 5. Stand By
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> 7. Finalização / Pódio
          </span>
        </div>
        <div className="text-gray-400 text-[11px] flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">HTML5 &lt;canvas&gt; 2D Engine</span>
          <span>•</span>
          <span>Web Audio API</span>
        </div>
      </div>
    </div>
  );
};
