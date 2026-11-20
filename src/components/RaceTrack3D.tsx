import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useRaceStore } from '../stores/useRaceStore';
import { soundEffects } from '../utils/soundEffects';
import {
  createAsphaltTexture,
  createBaySignTexture,
  createContactShadowTexture,
  createGrassTerrainTexture,
  createKerbTexture,
  createSparkTexture,
  drawVehicleBadgeCanvas,
} from '../engine3d/textures';
import {
  buildEnvironmentStructures3D,
  buildSupercar3D,
  SupercarInstance,
} from '../engine3d/models';
import {
  buildTrackRibbonGeometry,
  createMainTrackCurve,
  createPitLaneCurve,
  detectZoneAtWorld,
  getDynamicBoxWorldX,
  getVehicleTargetPose3D,
  ZONES_3D,
  Zone3DDef,
} from '../engine3d/trackGeometry';
import {
  Box,
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  Focus,
  Gamepad2,
  Layers,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Sun,
  Sunset as SunsetIcon,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

type CameraPreset = 'ISO' | 'CHASE' | 'TOP' | 'TOWER' | 'FOCUS' | 'FREE';
type TimeOfDay = 'DAY' | 'SUNSET' | 'NIGHT';

// Pre-allocated math helpers outside render loop (Zero GC)
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersectPt = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _chaseOffset = new THREE.Vector3();
const _zoomDir = new THREE.Vector3();

function shortestAngleDiff(from: number, to: number): number {
  let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export const RaceTrack3D: React.FC = () => {
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

  const mountRef = useRef<HTMLDivElement | null>(null);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('NIGHT');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('ISO');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [logMessage, setLogMessage] = useState<string>(
    'Motor 3D WebGL Ativo • Arraste os carros entre as zonas ou orbite a câmera livremente'
  );
  const [logType, setLogType] = useState<'IDLE' | 'DRAGGING' | 'SUCCESS' | 'WARNING'>('IDLE');

  // Mutable refs for 60fps loop without recreating WebGL context
  const stateRef = useRef({
    vehicles,
    pitBoxes,
    mechanics,
    selectedVehicleId,
    timeOfDay,
    cameraPreset,
    cameraTransitionActive: true,
    isLiveSimulationActive,
    pendingZoomDelta: 0,
  });
  stateRef.current.vehicles = vehicles;
  stateRef.current.pitBoxes = pitBoxes;
  stateRef.current.mechanics = mechanics;
  stateRef.current.selectedVehicleId = selectedVehicleId;
  stateRef.current.timeOfDay = timeOfDay;
  stateRef.current.cameraPreset = cameraPreset;
  stateRef.current.isLiveSimulationActive = isLiveSimulationActive;

  const actionsRef = useRef({
    selectVehicle,
    moveVehicleStatus,
    assignMechanic,
    setCameraPreset,
    setLogMessage,
    setLogType,
  });
  actionsRef.current = {
    selectVehicle,
    moveVehicleStatus,
    assignMechanic,
    setCameraPreset,
    setLogMessage,
    setLogType,
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 600;

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    // 3. Scene & Studio RoomEnvironment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070d12);
    scene.fog = new THREE.FogExp2(0x070d12, 0.0068);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 4. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.5, 320);
    camera.position.set(0, 38, 46);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI * 0.44;
    controls.minPolarAngle = 0.12;
    controls.minDistance = 12;
    controls.maxDistance = 95;
    controls.target.set(0, 0, -2);
    controls.update();

    controls.addEventListener('start', () => {
      stateRef.current.cameraTransitionActive = false;
      if (stateRef.current.cameraPreset !== 'FREE') {
        actionsRef.current.setCameraPreset('FREE');
      }
    });

    // 5. Three-Point Warm/Cool Studio + Stadium Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0b1f14, 0.75);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1d6, 1.85);
    sunLight.position.set(32, 46, 26);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 140;
    sunLight.shadow.camera.left = -52;
    sunLight.shadow.camera.right = 52;
    sunLight.shadow.camera.top = 38;
    sunLight.shadow.camera.bottom = -38;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.025;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-36, 24, -30);
    scene.add(rimLight);

    // 6. Extended Natural Terrain Ground
    const grassTex = createGrassTerrainTexture(maxAnisotropy);
    const groundGeo = new THREE.PlaneGeometry(360, 360);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(
      groundGeo,
      new THREE.MeshStandardMaterial({
        map: grassTex,
        roughness: 0.92,
        metalness: 0.02,
      })
    );
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 7. Continuous 3D Racetrack Ribbon + Kerbs + Pit Lane
    const mainCurve = createMainTrackCurve();
    const pitCurve = createPitLaneCurve();

    const asphaltTex = createAsphaltTexture(maxAnisotropy);
    const kerbTex = createKerbTexture(maxAnisotropy);

    const asphaltMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.75,
      metalness: 0.08,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const kerbMat = new THREE.MeshStandardMaterial({
      map: kerbTex,
      roughness: 0.62,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const mainTrackGeo = buildTrackRibbonGeometry(mainCurve, 6.6, 220, true, 0.07, 0);
    const mainTrackMesh = new THREE.Mesh(mainTrackGeo, asphaltMat);
    mainTrackMesh.receiveShadow = true;
    scene.add(mainTrackMesh);

    const outerKerbGeo = buildTrackRibbonGeometry(mainCurve, 0.95, 220, true, 0.08, 3.65);
    const innerKerbGeo = buildTrackRibbonGeometry(mainCurve, 0.95, 220, true, 0.08, -3.65);
    const outerKerb = new THREE.Mesh(outerKerbGeo, kerbMat);
    const innerKerb = new THREE.Mesh(innerKerbGeo, kerbMat);
    outerKerb.receiveShadow = true;
    innerKerb.receiveShadow = true;
    scene.add(outerKerb, innerKerb);

    const pitAsphaltTex = asphaltTex.clone();
    pitAsphaltTex.repeat.set(1, 8);
    pitAsphaltTex.needsUpdate = true;
    const pitTrackGeo = buildTrackRibbonGeometry(pitCurve, 4.6, 72, false, 0.06, 0);
    const pitTrackMesh = new THREE.Mesh(
      pitTrackGeo,
      new THREE.MeshStandardMaterial({
        map: pitAsphaltTex,
        roughness: 0.78,
        metalness: 0.08,
        side: THREE.DoubleSide,
      })
    );
    pitTrackMesh.receiveShadow = true;
    scene.add(pitTrackMesh);

    // 8. Workshop Buildings, Control Tower, Pit Boxes, Podium, Forest & Zone Pads
    const animatedProps = buildEnvironmentStructures3D(
      scene,
      stateRef.current.pitBoxes,
      stateRef.current.mechanics,
      maxAnisotropy
    );

    // 9. Podium Firework Spark Particles (Points)
    const sparkCount = 90;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);
    const sparkVelocities: Array<{ vx: number; vy: number; vz: number; life: number }> = [];
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4.0;
      sparkPositions[i * 3] = 32.2;
      sparkPositions[i * 3 + 1] = 4.5;
      sparkPositions[i * 3 + 2] = 16.5;
      const isGold = i % 2 === 0;
      sparkColors[i * 3] = 1.0;
      sparkColors[i * 3 + 1] = isGold ? 0.78 : 0.28;
      sparkColors[i * 3 + 2] = isGold ? 0.15 : 0.18;
      sparkVelocities.push({
        vx: Math.cos(angle) * spd,
        vy: 2.0 + Math.random() * 4.5,
        vz: Math.sin(angle) * spd,
        life: Math.random(),
      });
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
    const sparkTex = createSparkTexture();
    const sparkPoints = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({
        size: 0.9,
        map: sparkTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(sparkPoints);

    // 10. Dynamic Drag Trajectory Arc Line
    const arcSegments = 24;
    const arcPositions = new Float32Array((arcSegments + 1) * 3);
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    const arcLine = new THREE.Line(
      arcGeo,
      new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.9 })
    );
    arcLine.visible = false;
    scene.add(arcLine);

    // 11. Vehicle Instance Pool
    const contactShadowTex = createContactShadowTexture();
    const carMap = new Map<string, SupercarInstance>();
    const carSimPos = new Map<string, { x: number; y: number; z: number; yaw: number }>();

    // 12. 3D Raycast Drag-and-Drop State
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();

    let draggedVehicleId: string | null = null;
    let dragWorldX = 0;
    let dragWorldZ = 0;
    let hoveredZone: Zone3DDef | null = null;
    let pointerDownClient = { x: 0, y: 0 };

    const updateNdc = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      updateNdc(e);
      raycaster.setFromCamera(pointerNdc, camera);

      const hitTargets: THREE.Object3D[] = [];
      carMap.forEach((c) => hitTargets.push(c.hitMesh));
      const hits = raycaster.intersectObjects(hitTargets, false);

      if (hits.length > 0) {
        const vid = hits[0].object.userData.vehicleId as string;
        const veh = stateRef.current.vehicles.find((v) => v.id === vid);
        if (!veh) return;

        controls.enabled = false;
        draggedVehicleId = vid;
        pointerDownClient = { x: e.clientX, y: e.clientY };

        const cur = carSimPos.get(vid);
        dragWorldX = cur ? cur.x : 0;
        dragWorldZ = cur ? cur.z : 0;

        soundEffects.playClick();
        actionsRef.current.selectVehicle(vid);
        actionsRef.current.setLogType('DRAGGING');
        actionsRef.current.setLogMessage(
          `Arrastando ${veh.brand} ${veh.model} [${veh.osNumber}] • Solte sobre qualquer setor 3D`
        );
        renderer.domElement.style.cursor = 'grabbing';
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      updateNdc(e);
      raycaster.setFromCamera(pointerNdc, camera);

      if (draggedVehicleId) {
        if (raycaster.ray.intersectPlane(_groundPlane, _intersectPt)) {
          dragWorldX = THREE.MathUtils.clamp(_intersectPt.x, -44, 44);
          dragWorldZ = THREE.MathUtils.clamp(_intersectPt.z, -28, 26);

          const z = detectZoneAtWorld(dragWorldX, dragWorldZ);
          hoveredZone = z;
          if (z) {
            actionsRef.current.setLogMessage(
              `Alvo 3D: ${z.num}. ${z.name} (${z.subtitle})`
            );
          } else {
            actionsRef.current.setLogMessage('Mova o veículo para uma das 7 zonas iluminadas...');
          }
        }
      } else {
        const hitTargets: THREE.Object3D[] = [];
        carMap.forEach((c) => hitTargets.push(c.hitMesh));
        const hits = raycaster.intersectObjects(hitTargets, false);
        renderer.domElement.style.cursor = hits.length > 0 ? 'grab' : 'default';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!draggedVehicleId) return;
      controls.enabled = true;
      renderer.domElement.style.cursor = 'default';

      const distMoved = Math.hypot(
        e.clientX - pointerDownClient.x,
        e.clientY - pointerDownClient.y
      );
      const vid = draggedVehicleId;
      const veh = stateRef.current.vehicles.find((v) => v.id === vid);
      const targetZone = distMoved > 8 ? detectZoneAtWorld(dragWorldX, dragWorldZ) : null;

      if (veh && targetZone) {
        if (targetZone.status === 'EXECUTION') {
          const boxes = stateRef.current.pitBoxes;
          const totalBoxes = Math.max(5, Math.min(20, boxes.length || 10));
          let bestBox = boxes[0];
          let bestDist = Infinity;
          boxes.slice(0, totalBoxes).forEach((b, idx) => {
            const { boxX } = getDynamicBoxWorldX(idx, totalBoxes);
            const d = Math.abs(boxX - dragWorldX);
            if (d < bestDist) {
              bestDist = d;
              bestBox = b;
            }
          });
          if (bestBox) {
            const mechId = bestBox.mechanicId || stateRef.current.mechanics[0]?.id || 'mech_1';
            actionsRef.current.assignMechanic(veh.id, mechId, bestBox.id);
          }
        }

        actionsRef.current.moveVehicleStatus(veh.id, targetZone.status);
        soundEffects.playSuccess();
        actionsRef.current.setLogType('SUCCESS');
        actionsRef.current.setLogMessage(
          `✨ ${veh.osNumber} [${veh.brand} ${veh.model}] movida para ${targetZone.num}. ${targetZone.name}`
        );
      } else if (veh && distMoved > 18) {
        soundEffects.playDropOutside();
        actionsRef.current.setLogType('WARNING');
        actionsRef.current.setLogMessage(`⚠️ ${veh.osNumber} solta fora de uma etapa válida.`);
      } else if (veh) {
        actionsRef.current.setLogType('IDLE');
        actionsRef.current.setLogMessage(
          `Selecionado: ${veh.brand} ${veh.model} [${veh.osNumber}] • ${veh.progress}% concluído`
        );
      }

      draggedVehicleId = null;
      hoveredZone = null;
      arcLine.visible = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 13. Pre-warm shaders once on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 14. Resize Observer
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1000;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObs = new ResizeObserver(onResize);
    resizeObs.observe(container);

    // 15. Animation Loop with Software-WebGL afterDraw Pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let isDisposed = false;

    const bgNight = new THREE.Color(0x070d12);
    const bgDay = new THREE.Color(0x162b22);
    const bgSunset = new THREE.Color(0x1e1314);

    const sunNightColor = new THREE.Color(0xcbd5e1);
    const sunDayColor = new THREE.Color(0xfff4de);
    const sunSunsetColor = new THREE.Color(0xff8c42);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;

      const delta = Math.min(0.05, clock.getDelta());
      const elapsed = clock.getElapsedTime();
      const {
        vehicles: currVehicles,
        pitBoxes: currBoxes,
        selectedVehicleId: currSelId,
        timeOfDay: tod,
        cameraPreset: camPreset,
      } = stateRef.current;

      // A. Smooth Time-Of-Day Atmosphere & Lighting Damping
      const targetBg = tod === 'DAY' ? bgDay : tod === 'SUNSET' ? bgSunset : bgNight;
      const targetSunCol =
        tod === 'DAY' ? sunDayColor : tod === 'SUNSET' ? sunSunsetColor : sunNightColor;
      const targetSunInt = tod === 'DAY' ? 2.4 : tod === 'SUNSET' ? 2.1 : 1.35;
      const targetHemiInt = tod === 'DAY' ? 1.15 : tod === 'SUNSET' ? 0.85 : 0.65;
      const targetConeOpacity = tod === 'DAY' ? 0.04 : tod === 'SUNSET' ? 0.14 : 0.22;

      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(targetBg, 1 - Math.exp(-4 * delta));
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(scene.background as THREE.Color);
      }
      sunLight.color.lerp(targetSunCol, 1 - Math.exp(-4 * delta));
      sunLight.intensity = THREE.MathUtils.damp(sunLight.intensity, targetSunInt, 4, delta);
      hemiLight.intensity = THREE.MathUtils.damp(hemiLight.intensity, targetHemiInt, 4, delta);

      // B. Animate World Props
      animatedProps.radarDish.rotation.y += delta * 1.4;
      const beaconPulse = 1.5 + Math.sin(elapsed * 5.0) * 1.4;
      animatedProps.beaconLight.intensity = beaconPulse;
      (animatedProps.beaconMesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.5 + Math.sin(elapsed * 5.0) * 1.2;
      animatedProps.trophyGroup.rotation.y += delta * 0.9;
      (animatedProps.scannerBeam.material as THREE.MeshBasicMaterial).opacity =
        0.1 + Math.sin(elapsed * 3.5) * 0.07;

      const hasCheckinCar = currVehicles.some((v) => v.status === 'CHECKIN');
      const targetArmAngle = hasCheckinCar ? Math.PI * 0.38 : 0.04;
      animatedProps.gateArm.rotation.z = THREE.MathUtils.damp(
        animatedProps.gateArm.rotation.z,
        targetArmAngle,
        6,
        delta
      );

      // Update Firework Sparks around Podium
      const spPos = sparkGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < sparkCount; i++) {
        const sv = sparkVelocities[i];
        sv.life += delta * 0.65;
        if (sv.life >= 1) {
          sv.life = 0;
          spPos.setXYZ(i, 32.2, 4.2, 16.5);
        } else {
          const x = 32.2 + sv.vx * sv.life * 2.2;
          const y = 4.2 + sv.vy * sv.life - 4.5 * sv.life * sv.life;
          const z = 16.5 + sv.vz * sv.life * 2.2;
          spPos.setXYZ(i, x, Math.max(0.4, y), z);
        }
      }
      spPos.needsUpdate = true;

      // C. Highlight Zone Pads when Dragging
      ZONES_3D.forEach((z) => {
        const pad = animatedProps.zonePads.get(z.id);
        if (!pad) return;
        const isHov = hoveredZone?.id === z.id;
        const targetRingOp = draggedVehicleId ? (isHov ? 0.9 : 0.38) : 0.18;
        const targetPillarOp = isHov ? 0.24 : 0.0;
        pad.mat.opacity = THREE.MathUtils.damp(pad.mat.opacity, targetRingOp, 10, delta);
        const pMat = pad.pillar.material as THREE.MeshBasicMaterial;
        pMat.opacity = THREE.MathUtils.damp(pMat.opacity, targetPillarOp, 10, delta);
      });

      // C2. Sync Pit Box Bay Signs & Status LEDs dynamically
      currBoxes.forEach((pBox, idx) => {
        const boxNum = pBox.number || idx + 1;
        const signObj = animatedProps.pitBaySigns.get(boxNum);
        if (!signObj) return;
        const label = boxNum < 10 ? `0${boxNum}` : `${boxNum}`;
        const key = `${label}|${pBox.occupied}`;
        if (signObj.lastKey !== key) {
          signObj.lastKey = key;
          const signMat = signObj.mesh.material as THREE.MeshBasicMaterial;
          signMat.map?.dispose();
          signMat.map = createBaySignTexture(label, '#FF6B00', pBox.occupied, maxAnisotropy);
          signMat.needsUpdate = true;

          const ledMat = signObj.led.material as THREE.MeshStandardMaterial;
          const hex = pBox.occupied ? 0xff6b00 : 0x10b981;
          ledMat.color.setHex(hex);
          ledMat.emissive.setHex(hex);
        }
      });

      // D. Sync Vehicles -> 3D Supercars with Smooth Kinematics
      const activeIds = new Set(currVehicles.map((v) => v.id));
      carMap.forEach((inst, vid) => {
        if (!activeIds.has(vid)) {
          scene.remove(inst.group);
          inst.badgeTex.dispose();
          carMap.delete(vid);
          carSimPos.delete(vid);
        }
      });

      currVehicles.forEach((veh, idx) => {
        let inst = carMap.get(veh.id);
        if (!inst) {
          inst = buildSupercar3D(
            veh.id,
            veh.color,
            veh.osNumber,
            veh.model,
            veh.progress,
            contactShadowTex,
            maxAnisotropy
          );
          scene.add(inst.group);
          carMap.set(veh.id, inst);

          const initialPose = getVehicleTargetPose3D(veh, idx, currBoxes, mainCurve, elapsed);
          carSimPos.set(veh.id, {
            x: initialPose.x,
            y: initialPose.y,
            z: initialPose.z,
            yaw: initialPose.yaw,
          });
        }

        const isDragged = draggedVehicleId === veh.id;
        const isSelected = currSelId === veh.id;
        const targetPose = isDragged
          ? { x: dragWorldX, y: 2.1, z: dragWorldZ, yaw: 0, speedGlow: true }
          : getVehicleTargetPose3D(veh, idx, currBoxes, mainCurve, elapsed);

        const sim = carSimPos.get(veh.id)!;
        const prevX = sim.x;
        const prevZ = sim.z;

        const dampSpeed = isDragged ? 22 : 5.5;
        sim.x = THREE.MathUtils.damp(sim.x, targetPose.x, dampSpeed, delta);
        sim.y = THREE.MathUtils.damp(sim.y, targetPose.y, 10, delta);
        sim.z = THREE.MathUtils.damp(sim.z, targetPose.z, dampSpeed, delta);
        const yawDiff = shortestAngleDiff(sim.yaw, targetPose.yaw);
        sim.yaw += yawDiff * (1 - Math.exp(-8 * delta));

        inst.group.position.set(sim.x, sim.y, sim.z);
        inst.group.rotation.y = sim.yaw;

        const moveDist = Math.hypot(sim.x - prevX, sim.z - prevZ);
        const wheelSpin = moveDist * 3.1 + (targetPose.speedGlow ? delta * 6 : 0);
        inst.wheels.forEach((wg) => {
          wg.rotation.x += wheelSpin;
        });

        inst.headlightCones.forEach((cone) => {
          (cone.material as THREE.MeshBasicMaterial).opacity = targetConeOpacity;
        });

        const haloMat = inst.haloMesh.material as THREE.MeshBasicMaterial;
        if (isDragged) {
          haloMat.color.setHex(0x00ffcc);
          haloMat.opacity = 0.85;
          inst.haloMesh.scale.setScalar(1.18 + Math.sin(elapsed * 8) * 0.06);
        } else if (isSelected) {
          haloMat.color.setHex(0xff6b00);
          haloMat.opacity = 0.72;
          inst.haloMesh.scale.setScalar(1.06 + Math.sin(elapsed * 4) * 0.04);
        } else {
          haloMat.opacity = 0;
        }

        const badgeKey = `${veh.osNumber}|${veh.model}|${Math.round(veh.progress)}|${isSelected ? 1 : 0}|${isDragged ? 1 : 0}`;
        if (inst.lastBadgeKey !== badgeKey) {
          drawVehicleBadgeCanvas(
            inst.badgeCanvas,
            veh.osNumber,
            veh.model,
            veh.progress,
            '#38bdf8',
            isSelected,
            isDragged
          );
          inst.badgeTex.needsUpdate = true;
          inst.lastBadgeKey = badgeKey;
        }
      });

      // E. Update 3D Trajectory Arc while Dragging over a Zone
      if (draggedVehicleId && hoveredZone) {
        arcLine.visible = true;
        const startX = dragWorldX;
        const startY = 2.4;
        const startZ = dragWorldZ;
        const endX = hoveredZone.x;
        const endY = 0.4;
        const endZ = hoveredZone.z;
        const midX = (startX + endX) * 0.5;
        const midY = 7.5;
        const midZ = (startZ + endZ) * 0.5;

        const posAttr = arcGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i <= arcSegments; i++) {
          const t = i / arcSegments;
          const omt = 1 - t;
          const x = omt * omt * startX + 2 * omt * t * midX + t * t * endX;
          const y = omt * omt * startY + 2 * omt * t * midY + t * t * endY;
          const z = omt * omt * startZ + 2 * omt * t * midZ + t * t * endZ;
          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      } else {
        arcLine.visible = false;
      }

      // F. Button Zoom Step Handling
      if (Math.abs(stateRef.current.pendingZoomDelta) > 0.01) {
        _zoomDir.copy(camera.position).sub(controls.target);
        const currentDist = _zoomDir.length();
        const nextDist = THREE.MathUtils.clamp(
          currentDist + stateRef.current.pendingZoomDelta,
          controls.minDistance,
          controls.maxDistance
        );
        _zoomDir.normalize().multiplyScalar(nextDist);
        camera.position.copy(controls.target).add(_zoomDir);
        stateRef.current.pendingZoomDelta = 0;
      }

      // G. Smooth Camera Presets, Focus & Chase Cam
      if (camPreset === 'CHASE' && currSelId) {
        const sim = carSimPos.get(currSelId);
        if (sim) {
          _chaseOffset.set(0, 8.5, -15.5).applyAxisAngle(THREE.Object3D.DEFAULT_UP, sim.yaw);
          _targetCamPos.set(sim.x + _chaseOffset.x, sim.y + _chaseOffset.y, sim.z + _chaseOffset.z);
          _targetLookAt.set(sim.x, sim.y + 1.2, sim.z);
          camera.position.lerp(_targetCamPos, 1 - Math.exp(-5 * delta));
          controls.target.lerp(_targetLookAt, 1 - Math.exp(-7 * delta));
        }
      } else if (stateRef.current.cameraTransitionActive && camPreset !== 'FREE') {
        if (camPreset === 'ISO') {
          _targetCamPos.set(0, 38, 46);
          _targetLookAt.set(0, 0, -2);
        } else if (camPreset === 'TOP') {
          _targetCamPos.set(0, 62, 6);
          _targetLookAt.set(0, 0, -1);
        } else if (camPreset === 'TOWER') {
          _targetCamPos.set(28, 16, 26);
          _targetLookAt.set(-2, 2, -6);
        } else if (camPreset === 'FOCUS' && currSelId) {
          const sim = carSimPos.get(currSelId);
          if (sim) {
            _targetCamPos.set(sim.x + 8, sim.y + 11, sim.z + 14);
            _targetLookAt.set(sim.x, sim.y + 0.8, sim.z);
          }
        }
        camera.position.lerp(_targetCamPos, 1 - Math.exp(-5.5 * delta));
        controls.target.lerp(_targetLookAt, 1 - Math.exp(-5.5 * delta));
        if (camera.position.distanceTo(_targetCamPos) < 0.25) {
          stateRef.current.cameraTransitionActive = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObs.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      envTex.dispose();
      grassTex.dispose();
      asphaltTex.dispose();
      pitAsphaltTex.dispose();
      kerbTex.dispose();
      contactShadowTex.dispose();
      sparkTex.dispose();
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, []);

  const selectPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    stateRef.current.cameraTransitionActive = true;
  };

  const handleZoomIn = () => {
    stateRef.current.cameraTransitionActive = false;
    stateRef.current.pendingZoomDelta -= 9;
  };

  const handleZoomOut = () => {
    stateRef.current.cameraTransitionActive = false;
    stateRef.current.pendingZoomDelta += 9;
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#070d12] border border-gray-800 shadow-2xl overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="bg-[#0B121A] border-b border-gray-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span className="font-black text-sm tracking-wider text-white">COMET 3D RACE ENGINE</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 font-mono border border-cyan-800/60">
              WEBGL 3D • PBR
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
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isLiveSimulationActive
                ? 'bg-emerald-600 text-white border border-emerald-400'
                : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700 border border-gray-700'
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
                ? 'bg-cyan-950/70 text-cyan-400 border-cyan-800'
                : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Telemetry Ticker Bar */}
      <div
        id="log"
        className={`w-full px-4 py-2 text-xs font-mono flex items-center justify-between border-b transition-colors ${
          logType === 'DRAGGING'
            ? 'bg-cyan-950/85 border-cyan-700/80 text-cyan-200'
            : logType === 'SUCCESS'
            ? 'bg-emerald-950/85 border-emerald-700/80 text-emerald-300'
            : logType === 'WARNING'
            ? 'bg-amber-950/85 border-amber-700/80 text-amber-300'
            : 'bg-[#101726] border-gray-800 text-cyan-400'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Compass className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-semibold">{logMessage}</span>
        </div>
        <div className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:block">
          Arraste carros para mover etapas • Botão direito/scroll: orbitar &amp; zoom 3D
        </div>
      </div>

      {/* Unobstructed 3D WebGL Viewport + Collapsible Bottom Dock */}
      <div className="relative w-full h-[600px] bg-[#070d12] overflow-hidden">
        <div ref={mountRef} className="w-full h-full" />

        {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion, no backdrop-filter over WebGL) */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 bottom-4 z-20 transition-transform duration-300 flex flex-col items-center ${
            dockCollapsed ? 'translate-y-[calc(100%-24px)]' : 'translate-y-0'
          }`}
          style={{ maxWidth: 'min(940px, 95%)' }}
        >
          <button
            onClick={() => setDockCollapsed((c) => !c)}
            className="px-3 py-1 rounded-t-lg bg-[#0d1520] border border-b-0 border-gray-700 text-[10px] font-mono text-gray-300 hover:text-white flex items-center gap-1"
          >
            {dockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{dockCollapsed ? 'Mostrar Controles 3D' : 'Ocultar Controles'}</span>
          </button>

          <div className="px-3 py-2 rounded-xl bg-[#0b121c]/95 border border-gray-700/90 shadow-2xl flex flex-wrap items-center justify-center gap-2.5">
            {/* Camera Presets */}
            <div className="flex items-center gap-1 bg-[#121c2b] rounded-lg p-1 border border-gray-800">
              <Camera className="w-3.5 h-3.5 text-cyan-400 mx-1.5" />
              {(
                [
                  { id: 'ISO', label: 'Isométrica' },
                  { id: 'CHASE', label: 'Perseguir' },
                  { id: 'TOP', label: 'Aérea' },
                  { id: 'TOWER', label: 'Torre' },
                ] as const
              ).map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => selectPreset(cam.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                    cameraPreset === cam.id
                      ? 'bg-[#FF6B00] text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            {/* Time of Day Lighting Presets */}
            <div className="flex items-center gap-1 bg-[#121c2b] rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setTimeOfDay('DAY')}
                title="Modo Dia"
                className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-colors ${
                  timeOfDay === 'DAY' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Dia</span>
              </button>
              <button
                onClick={() => setTimeOfDay('SUNSET')}
                title="Modo Pôr do Sol"
                className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-colors ${
                  timeOfDay === 'SUNSET' ? 'bg-orange-500 text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <SunsetIcon className="w-3.5 h-3.5" />
                <span>Sunset</span>
              </button>
              <button
                onClick={() => setTimeOfDay('NIGHT')}
                title="Modo Noite"
                className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-colors ${
                  timeOfDay === 'NIGHT' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Noite</span>
              </button>
            </div>

            {/* Focus, Zoom In/Out & Reset */}
            <div className="flex items-center gap-1 bg-[#121c2b] rounded-lg p-1 border border-gray-800">
              {selectedVehicleId && (
                <button
                  onClick={() => selectPreset('FOCUS')}
                  title="Focar Veículo Selecionado"
                  className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                    cameraPreset === 'FOCUS'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <Focus className="w-3.5 h-3.5" />
                  <span>Focar OS</span>
                </button>
              )}
              <button
                onClick={handleZoomIn}
                title="Aumentar Zoom"
                className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                title="Diminuir Zoom"
                className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => selectPreset('ISO')}
                title="Resetar Câmera"
                className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Legend & Workflow Bar */}
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" /> 6. Teste Dinâmico
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> 7. Finalização / Pódio
          </span>
        </div>
        <div className="text-gray-400 text-[11px] flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">Three.js WebGL 3D Engine</span>
          <span>•</span>
          <span>60 FPS Real-Time PBR</span>
        </div>
      </div>
    </div>
  );
};
