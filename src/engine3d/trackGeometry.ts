import * as THREE from 'three';
import { BusinessStatus, PitBox, Vehicle } from '../types/race';
import { calculateDynamicBoxX } from '../config/track.config';

export interface Zone3DDef {
  id: string;
  num: number;
  name: string;
  subtitle: string;
  status: BusinessStatus;
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  padX: number;
  padZ: number;
}

export const ZONES_3D: Zone3DDef[] = [
  {
    id: 'zone_checkin',
    num: 1,
    name: 'ENTRADA',
    subtitle: 'CHECK-IN',
    status: 'CHECKIN',
    x: -33,
    z: -15,
    w: 16,
    d: 14,
    color: '#06B6D4',
    padX: -32,
    padZ: -14,
  },
  {
    id: 'zone_diagnosis',
    num: 2,
    name: 'DIAGNÓSTICO',
    subtitle: 'ANÁLISE TÉCNICA',
    status: 'DIAGNOSIS',
    x: -14,
    z: -21,
    w: 18,
    d: 14,
    color: '#00C8FF',
    padX: -14,
    padZ: -20,
  },
  {
    id: 'zone_budget',
    num: 3,
    name: 'ORÇAMENTO',
    subtitle: 'AGUARD. APROVAÇÃO',
    status: 'WAITING_APPROVAL',
    x: 13,
    z: -21,
    w: 18,
    d: 14,
    color: '#EAB308',
    padX: 13,
    padZ: -20,
  },
  {
    id: 'zone_execution',
    num: 4,
    name: 'EXECUÇÃO',
    subtitle: 'COMPLEXO DOS BOXES',
    status: 'EXECUTION',
    x: -1,
    z: -1,
    w: 40,
    d: 16,
    color: '#FF6B00',
    padX: -1,
    padZ: 2.5,
  },
  {
    id: 'zone_standby',
    num: 5,
    name: 'STAND BY',
    subtitle: 'AGUARDANDO PEÇAS',
    status: 'STAND_BY',
    x: -34,
    z: 4,
    w: 15,
    d: 16,
    color: '#EF4444',
    padX: -34,
    padZ: 4,
  },
  {
    id: 'zone_test',
    num: 6,
    name: 'TESTE DINÂMICO',
    subtitle: 'TELEMETRIA & PISTA',
    status: 'TEST',
    x: 34,
    z: -2,
    w: 16,
    d: 18,
    color: '#A855F7',
    padX: 34,
    padZ: -2,
  },
  {
    id: 'zone_finalization',
    num: 7,
    name: 'FINALIZAÇÃO',
    subtitle: 'ENTREGA & PÓDIO',
    status: 'DELIVERED',
    x: 26,
    z: 16,
    w: 22,
    d: 16,
    color: '#10B981',
    padX: 25,
    padZ: 15.5,
  },
];

export const PIT_COMPLEX_START_X = -18;
export const PIT_COMPLEX_WIDTH = 34;

export function createMainTrackCurve(): THREE.CatmullRomCurve3 {
  const pts = [
    new THREE.Vector3(-34, 0, 8),
    new THREE.Vector3(-35, 0, -6),
    new THREE.Vector3(-30, 0, -18),
    new THREE.Vector3(-16, 0, -21),
    new THREE.Vector3(0, 0, -20.5),
    new THREE.Vector3(16, 0, -21),
    new THREE.Vector3(31, 0, -17),
    new THREE.Vector3(37, 0, -5),
    new THREE.Vector3(36, 0, 8),
    new THREE.Vector3(26, 0, 17.5),
    new THREE.Vector3(8, 0, 19),
    new THREE.Vector3(-12, 0, 19),
    new THREE.Vector3(-27, 0, 17),
  ];
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.45);
}

export function createPitLaneCurve(): THREE.CatmullRomCurve3 {
  const pts = [
    new THREE.Vector3(-27, 0, 17),
    new THREE.Vector3(-22, 0, 5.5),
    new THREE.Vector3(-12, 0, 3.0),
    new THREE.Vector3(0, 0, 3.0),
    new THREE.Vector3(12, 0, 3.0),
    new THREE.Vector3(21, 0, 5.5),
    new THREE.Vector3(26, 0, 17.5),
  ];
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
}

export function buildTrackRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  width: number,
  segments: number,
  closed: boolean,
  yOffset: number,
  lateralOffset: number = 0
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3();
  const sampleCount = closed ? segments : segments;

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const pt = curve.getPointAt(t % 1);
    const tangent = curve.getTangentAt(t % 1).normalize();
    right.crossVectors(tangent, up).normalize();

    const centerX = pt.x + right.x * lateralOffset;
    const centerZ = pt.z + right.z * lateralOffset;

    const lx = centerX - right.x * (width * 0.5);
    const lz = centerZ - right.z * (width * 0.5);
    const rx = centerX + right.x * (width * 0.5);
    const rz = centerZ + right.z * (width * 0.5);

    positions.push(lx, yOffset, lz);
    positions.push(rx, yOffset, rz);

    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, t);
    uvs.push(1, t);
  }

  for (let i = 0; i < sampleCount; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

export function detectZoneAtWorld(x: number, z: number): Zone3DDef | null {
  for (const zone of ZONES_3D) {
    if (
      x >= zone.x - zone.w * 0.5 &&
      x <= zone.x + zone.w * 0.5 &&
      z >= zone.z - zone.d * 0.5 &&
      z <= zone.z + zone.d * 0.5
    ) {
      return zone;
    }
  }
  return null;
}

export function getDynamicBoxWorldX(boxIndex: number, totalBoxes: number): { boxX: number; boxWidth: number } {
  const { boxX, boxWidth } = calculateDynamicBoxX(
    boxIndex,
    totalBoxes,
    PIT_COMPLEX_START_X,
    PIT_COMPLEX_WIDTH
  );
  return { boxX, boxWidth };
}

export function getVehicleTargetPose3D(
  veh: Vehicle,
  vehicleIndex: number,
  pitBoxes: PitBox[],
  mainCurve: THREE.CatmullRomCurve3,
  elapsedTime: number
): { x: number; y: number; z: number; yaw: number; speedGlow: boolean } {
  const totalBoxes = Math.max(5, Math.min(20, pitBoxes.length || 10));
  const visualState = veh.visualState;
  const lateralOffset = ((vehicleIndex % 3) - 1) * 1.15;

  if (visualState === 'BOX_RUNNING') {
    const boxNum = veh.assignedBoxId
      ? pitBoxes.find((b) => b.id === veh.assignedBoxId)?.number
      : undefined;
    const targetIdx = boxNum ? boxNum - 1 : vehicleIndex % Math.max(1, totalBoxes);
    const { boxX } = getDynamicBoxWorldX(targetIdx, totalBoxes);
    return {
      x: boxX,
      y: 0.08,
      z: 0.4 + (vehicleIndex % 2) * 0.35,
      yaw: 0, // Facing +Z out of pit bay toward pit lane
      speedGlow: false,
    };
  }

  if (visualState === 'PATIO_STANDBY') {
    const col = vehicleIndex % 2;
    const row = Math.floor(vehicleIndex / 2);
    return {
      x: -36.5 + col * 3.8,
      y: 0.06,
      z: 2.0 + row * 4.4,
      yaw: Math.PI * 0.35,
      speedGlow: false,
    };
  }

  if (visualState === 'PODIUM_DELIVERY') {
    const slot = vehicleIndex % 3;
    const row = Math.floor(vehicleIndex / 3);
    return {
      x: 20 + slot * 4.2,
      y: 0.08,
      z: 14.5 + row * 3.5,
      yaw: -Math.PI * 0.15,
      speedGlow: false,
    };
  }

  let t = 0.12;
  let animatedDrive = false;

  switch (visualState) {
    case 'GATE_PARKED':
      t = 0.06 + (veh.progress / 100) * 0.04;
      break;
    case 'GATE_CHECKIN':
      t = 0.12 + (veh.progress / 100) * 0.06;
      break;
    case 'CURVE_DIAGNOSIS':
      t = 0.22 + (veh.progress / 100) * 0.12;
      break;
    case 'TOWER_APPROVAL':
      t = 0.38 + (veh.progress / 100) * 0.12;
      break;
    case 'TRACK_TEST':
      // Dynamic racing motion along the test sector & circuit!
      animatedDrive = true;
      t = (0.52 + elapsedTime * 0.045 + vehicleIndex * 0.08) % 1;
      break;
    case 'FINISH_LINE':
      t = 0.72 + (veh.progress / 100) * 0.08;
      break;
    default:
      t = 0.14;
      break;
  }

  const wrappedT = ((t % 1) + 1) % 1;
  const pt = mainCurve.getPointAt(wrappedT);
  const tangent = mainCurve.getTangentAt(wrappedT).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

  // Yaw in Three.js where car nose points along +Z: atan2(tangent.x, tangent.z)
  const yaw = Math.atan2(tangent.x, tangent.z);

  return {
    x: pt.x + right.x * lateralOffset,
    y: 0.06,
    z: pt.z + right.z * lateralOffset,
    yaw,
    speedGlow: animatedDrive,
  };
}
