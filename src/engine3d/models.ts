import * as THREE from 'three';
import {
  createBaySignTexture,
  createCheckeredTexture,
  createContactShadowTexture,
  createZonePadTexture,
  drawVehicleBadgeCanvas,
} from './textures';
import { PitBox, Mechanic } from '../types/race';
import {
  getDynamicBoxWorldX,
  PIT_COMPLEX_START_X,
  PIT_COMPLEX_WIDTH,
  ZONES_3D,
} from './trackGeometry';

export interface SupercarInstance {
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  paintMat: THREE.MeshPhysicalMaterial;
  haloMesh: THREE.Mesh;
  wheels: THREE.Group[];
  headlightCones: THREE.Mesh[];
  badgeSprite: THREE.Sprite;
  badgeCanvas: HTMLCanvasElement;
  badgeTex: THREE.CanvasTexture;
  lastBadgeKey: string;
}

export function buildSupercar3D(
  vehicleId: string,
  colorHex: string,
  osNumber: string,
  modelName: string,
  progress: number,
  contactShadowTex: THREE.CanvasTexture,
  maxAnisotropy: number
): SupercarInstance {
  const group = new THREE.Group();
  group.userData.vehicleId = vehicleId;

  // 1. Contact Shadow (bottom-center grounded)
  const shadowGeo = new THREE.PlaneGeometry(2.5, 4.3);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.025;
  group.add(shadowMesh);

  // 2. Selection / Drag Underglow Halo Ring
  const haloGeo = new THREE.RingGeometry(1.55, 1.9, 36);
  haloGeo.rotateX(-Math.PI / 2);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff6b00,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.y = 0.04;
  group.add(haloMesh);

  // 3. Sculpted GT3 Chassis Silhouette (ExtrudeGeometry with bevels, nose along +Z)
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-1.55, 0.22); // Rear bumper bottom
  bodyShape.lineTo(1.55, 0.16);  // Front splitter edge
  bodyShape.lineTo(1.62, 0.34);  // Front nose tip
  bodyShape.lineTo(1.15, 0.52);  // Front hood slope
  bodyShape.lineTo(0.45, 0.72);  // Windshield base
  bodyShape.lineTo(-0.22, 0.86); // Roof apex
  bodyShape.lineTo(-1.12, 0.64); // Fastback rear deck
  bodyShape.lineTo(-1.55, 0.56); // Rear tail
  bodyShape.closePath();

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 1.32,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.08,
    bevelSegments: 3,
    curveSegments: 8,
  });
  // Rotate so X->Z (length along +Z), Y stays Y, extrusion depth along X centered
  bodyGeo.translate(0, 0, -0.66);
  bodyGeo.rotateY(-Math.PI / 2);
  bodyGeo.computeVertexNormals();

  const paintMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    metalness: 0.55,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, paintMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 4. Carbon-Fiber Lower Aero Splitter & Side Skirts
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.35,
    roughness: 0.6,
  });
  const splitterGeo = new THREE.BoxGeometry(1.56, 0.09, 3.32);
  const splitterMesh = new THREE.Mesh(splitterGeo, carbonMat);
  splitterMesh.position.set(0, 0.2, 0.02);
  splitterMesh.castShadow = true;
  group.add(splitterMesh);

  // 5. Tinted Cockpit Canopy Glass
  const canopyShape = new THREE.Shape();
  canopyShape.moveTo(0.55, 0.58);
  canopyShape.lineTo(0.1, 0.88);
  canopyShape.lineTo(-0.68, 0.88);
  canopyShape.lineTo(-1.12, 0.62);
  canopyShape.closePath();

  const canopyGeo = new THREE.ExtrudeGeometry(canopyShape, {
    depth: 1.04,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  canopyGeo.translate(0, 0, -0.52);
  canopyGeo.rotateY(-Math.PI / 2);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x060b14,
    metalness: 0.2,
    roughness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });
  const canopyMesh = new THREE.Mesh(canopyGeo, glassMat);
  canopyMesh.position.y = 0.02;
  group.add(canopyMesh);

  // 6. GT3 Rear Wing Spoiler + Endplates + Struts
  const wingDeck = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.06, 0.38), carbonMat);
  wingDeck.position.set(0, 1.04, -1.42);
  wingDeck.rotation.x = 0.14;
  wingDeck.castShadow = true;
  group.add(wingDeck);

  const strutGeo = new THREE.BoxGeometry(0.06, 0.42, 0.22);
  [-0.45, 0.45].forEach((sx) => {
    const strut = new THREE.Mesh(strutGeo, carbonMat);
    strut.position.set(sx, 0.82, -1.38);
    group.add(strut);
  });

  const endPlateGeo = new THREE.BoxGeometry(0.05, 0.26, 0.46);
  [-0.85, 0.85].forEach((ex) => {
    const ep = new THREE.Mesh(endPlateGeo, paintMat);
    ep.position.set(ex, 1.02, -1.42);
    group.add(ep);
  });

  // 7. 4 Detailed Wheels (Tire + Alloy Rim + Caliper)
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0f1218,
    roughness: 0.88,
    metalness: 0.05,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.2,
    metalness: 0.92,
  });
  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.35,
    metalness: 0.4,
  });

  const wheels: THREE.Group[] = [];
  const wheelPositions = [
    { x: -0.78, z: 0.96 },
    { x: 0.78, z: 0.96 },
    { x: -0.8, z: -0.98 },
    { x: 0.8, z: -0.98 },
  ];

  wheelPositions.forEach((wp) => {
    const wg = new THREE.Group();
    wg.position.set(wp.x, 0.32, wp.z);

    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.26, 20);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    wg.add(tire);

    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.28, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wg.add(rim);

    const cal = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.12), caliperMat);
    cal.position.set(0, 0.06, -0.08);
    wg.add(cal);

    group.add(wg);
    wheels.push(wg);
  });

  // 8. LED Headlights + Volumetric Cones + Rear Taillight Strip
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    emissive: 0xfef08a,
    emissiveIntensity: 2.2,
    roughness: 0.1,
  });
  const coneGeo = new THREE.ConeGeometry(0.95, 3.8, 16, 1, true);
  coneGeo.translate(0, -1.9, 0);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const headlightCones: THREE.Mesh[] = [];
  [-0.5, 0.5].forEach((hx) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), headlightMat);
    hl.position.set(hx, 0.38, 1.62);
    group.add(hl);

    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(hx, 0.36, 1.66);
    cone.rotation.x = 0.08;
    group.add(cone);
    headlightCones.push(cone);
  });

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xff1f1f,
    emissiveIntensity: 2.4,
    roughness: 0.2,
  });
  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.08, 0.06), tailMat);
  tailBar.position.set(0, 0.52, -1.58);
  group.add(tailBar);

  // 9. Raycast Hit Proxy Box (Layer 1 for crisp mouse picking)
  const hitGeo = new THREE.BoxGeometry(2.3, 1.8, 3.9);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.position.y = 0.75;
  hitMesh.layers.set(1);
  hitMesh.userData.vehicleId = vehicleId;
  group.add(hitMesh);

  // 10. Crisp Floating 3D Telemetry Sprite Badge
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 320;
  badgeCanvas.height = 128;
  drawVehicleBadgeCanvas(badgeCanvas, osNumber, modelName, progress, '#38bdf8', false, false);

  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  badgeTex.colorSpace = THREE.SRGBColorSpace;
  badgeTex.anisotropy = maxAnisotropy;

  const badgeMat = new THREE.SpriteMaterial({
    map: badgeTex,
    transparent: true,
    depthTest: false,
  });
  const badgeSprite = new THREE.Sprite(badgeMat);
  badgeSprite.position.set(0, 2.35, 0);
  badgeSprite.scale.set(4.5, 1.8, 1);
  badgeSprite.renderOrder = 20;
  group.add(badgeSprite);

  return {
    group,
    hitMesh,
    paintMat,
    haloMesh,
    wheels,
    headlightCones,
    badgeSprite,
    badgeCanvas,
    badgeTex,
    lastBadgeKey: `${osNumber}|${modelName}|${progress}|0|0`,
  };
}

export interface AnimatedProps {
  radarDish: THREE.Group;
  beaconMesh: THREE.Mesh;
  beaconLight: THREE.PointLight;
  trophyGroup: THREE.Group;
  gateArm: THREE.Group;
  scannerBeam: THREE.Mesh;
  zonePads: Map<string, { ring: THREE.Mesh; pillar: THREE.Mesh; mat: THREE.MeshBasicMaterial }>;
  pitBaySigns: Map<number, { mesh: THREE.Mesh; led: THREE.Mesh; lastKey: string }>;
}

export function buildEnvironmentStructures3D(
  scene: THREE.Scene,
  pitBoxes: PitBox[],
  mechanics: Mechanic[],
  maxAnisotropy: number
): AnimatedProps {
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x16202e,
    metalness: 0.72,
    roughness: 0.32,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x1e2633,
    metalness: 0.1,
    roughness: 0.85,
  });
  const glassBlue = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    metalness: 0.15,
    roughness: 0.08,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.68,
  });

  // ==========================================
  // 1. CHECK-IN SCANNER GANTRY (ZONE 1)
  // ==========================================
  const checkinGroup = new THREE.Group();
  checkinGroup.position.set(-34, 0, -11.5);
  checkinGroup.rotation.y = 0.35;

  const gantryMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.75, roughness: 0.3 });
  const cyanEmissive = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.8,
  });

  [-4.2, 4.2].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.4, 0.7), gantryMat);
    pillar.position.set(px, 2.2, 0);
    pillar.castShadow = true;
    checkinGroup.add(pillar);
  });

  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.75, 1.1), gantryMat);
  crossbar.position.set(0, 4.35, 0);
  crossbar.castShadow = true;
  checkinGroup.add(crossbar);

  const neonStrip = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.14, 1.16), cyanEmissive);
  neonStrip.position.set(0, 4.35, 0);
  checkinGroup.add(neonStrip);

  const gateArm = new THREE.Group();
  gateArm.position.set(-3.7, 1.1, 0.55);
  const armBar = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.12, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xeab308, emissiveIntensity: 0.4 })
  );
  armBar.position.set(2.1, 0, 0);
  gateArm.add(armBar);
  checkinGroup.add(gateArm);

  const scannerBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 3.6),
    new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scannerBeam.position.set(0, 2.1, 0);
  checkinGroup.add(scannerBeam);
  scene.add(checkinGroup);

  // ==========================================
  // 2. DIAGNÓSTICO WORKSHOP (ZONE 2)
  // ==========================================
  const diagGroup = new THREE.Group();
  diagGroup.position.set(-14, 0, -27.2);

  const diagBody = new THREE.Mesh(new THREE.BoxGeometry(15, 3.8, 5.2), darkMetal);
  diagBody.position.y = 1.9;
  diagBody.castShadow = true;
  diagBody.receiveShadow = true;
  diagGroup.add(diagBody);

  const diagRoof = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.35, 6.2), concreteMat);
  diagRoof.position.set(0, 3.95, 0.3);
  diagRoof.castShadow = true;
  diagGroup.add(diagRoof);

  const diagTrim = new THREE.Mesh(
    new THREE.BoxGeometry(15.9, 0.16, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x00c8ff, emissive: 0x00c8ff, emissiveIntensity: 1.6 })
  );
  diagTrim.position.set(0, 3.95, 3.35);
  diagGroup.add(diagTrim);

  // 3 Hydraulic Lifts inside Diagnostic Bays
  [-4.6, 0, 4.6].forEach((bx) => {
    const bayFloor = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.08, 4.6),
      new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.4 })
    );
    bayFloor.position.set(bx, 0.04, 1.6);
    diagGroup.add(bayFloor);

    [-1.4, 1.4].forEach((lx) => {
      const liftPost = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 2.6, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 })
      );
      liftPost.position.set(bx + lx, 1.3, 2.3);
      diagGroup.add(liftPost);
    });
  });
  scene.add(diagGroup);

  // ==========================================
  // 3. OCTAGONAL CONTROL TOWER & BUDGET PAVILION (ZONE 3)
  // ==========================================
  const towerGroup = new THREE.Group();
  towerGroup.position.set(2.5, 0, -27.5);

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.0, 1.8, 8), concreteMat);
  plinth.position.y = 0.9;
  plinth.castShadow = true;
  towerGroup.add(plinth);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.0, 5.2, 8), darkMetal);
  shaft.position.y = 4.4;
  shaft.castShadow = true;
  towerGroup.add(shaft);

  const redRing = new THREE.Mesh(
    new THREE.CylinderGeometry(2.05, 2.05, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.6 })
  );
  redRing.position.y = 5.6;
  towerGroup.add(redRing);

  const obsDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1, 2.5, 1.9, 8),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.3,
    })
  );
  obsDeck.position.y = 7.9;
  towerGroup.add(obsDeck);

  const roofCone = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.6, 8), darkMetal);
  roofCone.position.y = 9.6;
  roofCone.castShadow = true;
  towerGroup.add(roofCone);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.6, 8), darkMetal);
  mast.position.y = 11.4;
  towerGroup.add(mast);

  // Rotating Radar Dish
  const radarDish = new THREE.Group();
  radarDish.position.set(0, 10.9, 0);
  const dishPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.45, 0.08),
    new THREE.Vector2(0.85, 0.35),
  ];
  const dishGeo = new THREE.LatheGeometry(dishPts, 16);
  dishGeo.rotateX(Math.PI * 0.35);
  const dishMesh = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 }));
  radarDish.add(dishMesh);
  towerGroup.add(radarDish);

  const beaconMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 3 })
  );
  beaconMesh.position.y = 12.7;
  towerGroup.add(beaconMesh);

  const beaconLight = new THREE.PointLight(0xef4444, 2.5, 16);
  beaconLight.position.y = 12.8;
  towerGroup.add(beaconLight);
  scene.add(towerGroup);

  // Budget Pavilion next to Control Tower
  const budgetGroup = new THREE.Group();
  budgetGroup.position.set(14.5, 0, -27.2);
  const budgetBody = new THREE.Mesh(new THREE.BoxGeometry(13.5, 3.6, 5.0), darkMetal);
  budgetBody.position.y = 1.8;
  budgetBody.castShadow = true;
  budgetGroup.add(budgetBody);
  const budgetTrim = new THREE.Mesh(
    new THREE.BoxGeometry(13.8, 0.18, 5.4),
    new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xeab308, emissiveIntensity: 1.1 })
  );
  budgetTrim.position.y = 3.7;
  budgetGroup.add(budgetTrim);
  scene.add(budgetGroup);

  // ==========================================
  // 4. CENTRAL PIT BOXES COMPLEX (ZONE 4)
  // ==========================================
  const pitGroup = new THREE.Group();
  const totalBoxes = Math.max(5, Math.min(20, pitBoxes.length || 10));

  // Main Pit Complex Apron Floor
  const pitApron = new THREE.Mesh(
    new THREE.BoxGeometry(PIT_COMPLEX_WIDTH + 3, 0.08, 12.5),
    new THREE.MeshStandardMaterial({ color: 0x131b26, roughness: 0.72, metalness: 0.18 })
  );
  pitApron.position.set(PIT_COMPLEX_START_X + PIT_COMPLEX_WIDTH * 0.5, 0.04, 0.2);
  pitApron.receiveShadow = true;
  pitGroup.add(pitApron);

  // Pit Building Main Structure (North half of pit apron)
  const pitMainHall = new THREE.Mesh(
    new THREE.BoxGeometry(PIT_COMPLEX_WIDTH + 1.5, 3.2, 4.6),
    darkMetal
  );
  pitMainHall.position.set(PIT_COMPLEX_START_X + PIT_COMPLEX_WIDTH * 0.5, 1.6, -3.5);
  pitMainHall.castShadow = true;
  pitMainHall.receiveShadow = true;
  pitGroup.add(pitMainHall);

  // Cantilevered Pit Canopy Roof
  const pitCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(PIT_COMPLEX_WIDTH + 2.4, 0.28, 7.6),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.3 })
  );
  pitCanopy.position.set(PIT_COMPLEX_START_X + PIT_COMPLEX_WIDTH * 0.5, 3.35, -1.8);
  pitCanopy.castShadow = true;
  pitGroup.add(pitCanopy);

  // Glowing Orange Fascia Strip across Pit Complex
  const pitFascia = new THREE.Mesh(
    new THREE.BoxGeometry(PIT_COMPLEX_WIDTH + 2.42, 0.14, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xff6b00, emissive: 0xff6b00, emissiveIntensity: 1.8 })
  );
  pitFascia.position.set(PIT_COMPLEX_START_X + PIT_COMPLEX_WIDTH * 0.5, 3.35, 2.02);
  pitGroup.add(pitFascia);

  const pitBaySigns = new Map<number, { mesh: THREE.Mesh; led: THREE.Mesh; lastKey: string }>();

  const liftRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.55, roughness: 0.35 });
  const liftBlueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.55, roughness: 0.35 });

  for (let i = 0; i < totalBoxes; i++) {
    const pBox = pitBoxes[i];
    const boxNum = pBox?.number || i + 1;
    const { boxX, boxWidth } = getDynamicBoxWorldX(i, totalBoxes);
    const isOccupied = Boolean(pBox?.occupied);

    // Bay lane divider line
    const divLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.05, 5.2),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    divLine.position.set(boxX - boxWidth * 0.5, 0.08, -0.4);
    pitGroup.add(divLine);

    // 2-Post Hydraulic Lift Pillars
    const postOffset = Math.min(1.2, boxWidth * 0.36);
    const postLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.4, 0.14), liftRedMat);
    postLeft.position.set(boxX - postOffset, 1.2, -0.4);
    postLeft.castShadow = true;
    pitGroup.add(postLeft);

    const postRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.4, 0.14), liftBlueMat);
    postRight.position.set(boxX + postOffset, 1.2, -0.4);
    postRight.castShadow = true;
    pitGroup.add(postRight);

    // Overhead Bay Number Sign
    const label = boxNum < 10 ? `0${boxNum}` : `${boxNum}`;
    const signTex = createBaySignTexture(label, '#FF6B00', isOccupied, maxAnisotropy);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(2.6, boxWidth * 0.85), 1.15),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(boxX, 2.75, 2.08);
    pitGroup.add(signMesh);

    // Status LED Dome
    const ledMat = new THREE.MeshStandardMaterial({
      color: isOccupied ? 0xff6b00 : 0x10b981,
      emissive: isOccupied ? 0xff6b00 : 0x10b981,
      emissiveIntensity: 2.2,
    });
    const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), ledMat);
    ledMesh.position.set(boxX, 3.55, 2.0);
    pitGroup.add(ledMesh);

    const mech = mechanics.find((m) => m.id === pBox?.mechanicId);
    if (mech) {
      // Stylized mechanic safety cone/cabinet prop
      const cabinet = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.85, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.4, roughness: 0.4 })
      );
      cabinet.position.set(boxX + postOffset * 0.65, 0.45, -1.3);
      pitGroup.add(cabinet);
    }

    pitBaySigns.set(boxNum, {
      mesh: signMesh,
      led: ledMesh,
      lastKey: `${label}|${isOccupied}`,
    });
  }
  scene.add(pitGroup);

  // ==========================================
  // 5. STAND BY YARD (ZONE 5)
  // ==========================================
  const standbyGroup = new THREE.Group();
  standbyGroup.position.set(-34.5, 0, 4.5);

  const yardSlab = new THREE.Mesh(
    new THREE.BoxGeometry(11, 0.08, 12.5),
    new THREE.MeshStandardMaterial({ color: 0x1c1215, roughness: 0.85 })
  );
  yardSlab.position.y = 0.04;
  yardSlab.receiveShadow = true;
  standbyGroup.add(yardSlab);

  const redBarrierMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.6,
  });
  [-5.6, 5.6].forEach((bx) => {
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.75, 12.4), redBarrierMat);
    barrier.position.set(bx, 0.38, 0);
    barrier.castShadow = true;
    standbyGroup.add(barrier);
  });
  scene.add(standbyGroup);

  // ==========================================
  // 6. TEST SECTOR SPEED TRAP GANTRY (ZONE 6)
  // ==========================================
  const speedGantry = new THREE.Group();
  speedGantry.position.set(36.8, 0, -2);
  speedGantry.rotation.y = Math.PI * 0.5;

  [-3.8, 3.8].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.2, 10), darkMetal);
    post.position.set(px, 2.1, 0);
    post.castShadow = true;
    speedGantry.add(post);
  });
  const speedArch = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.65, 0.8), darkMetal);
  speedArch.position.set(0, 4.2, 0);
  speedGantry.add(speedArch);

  const purpleNeon = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 0.18, 0.88),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2.0 })
  );
  purpleNeon.position.set(0, 4.2, 0);
  speedGantry.add(purpleNeon);
  scene.add(speedGantry);

  // ==========================================
  // 7. FINALIZATION SHOWROOM & CHAMPIONSHIP PODIUM (ZONE 7)
  // ==========================================
  const podiumArea = new THREE.Group();
  podiumArea.position.set(27, 0, 14);

  // Showroom glass pavilion
  const showroomBase = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 7.5), concreteMat);
  showroomBase.position.set(-4, 0.06, 4.5);
  showroomBase.receiveShadow = true;
  podiumArea.add(showroomBase);

  const showroomGlass = new THREE.Mesh(new THREE.BoxGeometry(10.2, 2.6, 6.2), glassBlue);
  showroomGlass.position.set(-4, 1.35, 5.2);
  podiumArea.add(showroomGlass);

  const showroomRoof = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.25, 7.0), darkMetal);
  showroomRoof.position.set(-4, 2.75, 5.2);
  showroomRoof.castShadow = true;
  podiumArea.add(showroomRoof);

  const emeraldTrim = new THREE.Mesh(
    new THREE.BoxGeometry(11.3, 0.14, 7.1),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.5 })
  );
  emeraldTrim.position.set(-4, 2.75, 5.2);
  podiumArea.add(emeraldTrim);

  // 3-Tier Championship Podium Stage
  const stage = new THREE.Group();
  stage.position.set(5.2, 0, 2.5);
  stage.rotation.y = -0.35;

  const step2 = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 1.1, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.25 })
  );
  step2.position.set(-2.1, 0.55, 0);
  step2.castShadow = true;
  stage.add(step2);

  const step1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.8, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.75, roughness: 0.2 })
  );
  step1.position.set(0, 0.9, 0);
  step1.castShadow = true;
  stage.add(step1);

  const step3 = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.75, 2.0),
    new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.6, roughness: 0.3 })
  );
  step3.position.set(2.1, 0.375, 0);
  step3.castShadow = true;
  stage.add(step3);

  // LatheGeometry Golden Trophy atop #1
  const trophyGroup = new THREE.Group();
  trophyGroup.position.set(0, 1.85, 0);
  const trophyPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.42, 0),
    new THREE.Vector2(0.32, 0.18),
    new THREE.Vector2(0.14, 0.45),
    new THREE.Vector2(0.14, 0.72),
    new THREE.Vector2(0.55, 1.25),
    new THREE.Vector2(0.45, 1.35),
    new THREE.Vector2(0, 1.1),
  ];
  const trophyGeo = new THREE.LatheGeometry(trophyPts, 20);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    metalness: 0.94,
    roughness: 0.14,
  });
  const trophyMesh = new THREE.Mesh(trophyGeo, goldMat);
  trophyMesh.castShadow = true;
  trophyGroup.add(trophyMesh);
  stage.add(trophyGroup);

  podiumArea.add(stage);
  scene.add(podiumArea);

  // ==========================================
  // 8. START / FINISH CHECKERED ARCH & FLOODLIGHT TOWERS
  // ==========================================
  const finishArch = new THREE.Group();
  finishArch.position.set(6, 0, 19.0);
  [-4.2, 4.2].forEach((px) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.4, 0.55), darkMetal);
    leg.position.set(0, 2.2, px);
    leg.castShadow = true;
    finishArch.add(leg);
  });
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 9.2), darkMetal);
  archTop.position.set(0, 4.4, 0);
  finishArch.add(archTop);

  const checkeredTex = createCheckeredTexture(maxAnisotropy);
  const finishBanner = new THREE.Mesh(
    new THREE.PlaneGeometry(8.2, 0.8),
    new THREE.MeshBasicMaterial({ map: checkeredTex, side: THREE.DoubleSide })
  );
  finishBanner.rotation.y = Math.PI / 2;
  finishBanner.position.set(0.58, 4.4, 0);
  finishArch.add(finishBanner);

  // Checkered Finish Line painted on track
  const finishStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 6.2),
    new THREE.MeshStandardMaterial({
      map: checkeredTex,
      roughness: 0.75,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  finishStrip.rotation.x = -Math.PI / 2;
  finishStrip.position.set(0, 0.09, 0);
  finishArch.add(finishStrip);
  scene.add(finishArch);

  // Stadium Floodlight Towers around Perimeter
  const towerPositions = [
    { x: -42, z: -24, rot: 0.6 },
    { x: 42, z: -24, rot: -0.6 },
    { x: 43, z: 24, rot: -2.4 },
    { x: -42, z: 24, rot: 2.4 },
  ];
  const lampEmissive = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe0f2fe,
    emissiveIntensity: 3.0,
  });
  towerPositions.forEach((tp) => {
    const lt = new THREE.Group();
    lt.position.set(tp.x, 0, tp.z);
    lt.rotation.y = tp.rot;

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 13, 8), darkMetal);
    pole.position.y = 6.5;
    pole.castShadow = true;
    lt.add(pole);

    const head = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 0.4), darkMetal);
    head.position.set(0, 13.0, 0);
    head.rotation.x = 0.45;
    lt.add(head);

    const lampFace = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.95), lampEmissive);
    lampFace.position.set(0, 12.92, 0.24);
    lampFace.rotation.x = 0.45;
    lt.add(lampFace);

    scene.add(lt);
  });

  // ==========================================
  // 9. INTERACTIVE 3D HOLOGRAPHIC ZONE DROP PADS
  // ==========================================
  const zonePads = new Map<string, { ring: THREE.Mesh; pillar: THREE.Mesh; mat: THREE.MeshBasicMaterial }>();
  ZONES_3D.forEach((z) => {
    const padTex = createZonePadTexture(z.num, z.name, z.subtitle, z.color, maxAnisotropy);
    const padMat = new THREE.MeshBasicMaterial({
      map: padTex,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    const padPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 4.3), padMat);
    padPlane.rotation.x = -Math.PI / 2;
    padPlane.position.set(z.padX, 0.11, z.padZ);
    scene.add(padPlane);

    // Highlight perimeter ring (glows when dragging a car over the zone)
    const ringGeo = new THREE.RingGeometry(
      Math.min(z.w, z.d) * 0.42,
      Math.min(z.w, z.d) * 0.46,
      36
    );
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(z.color),
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(z.x, 0.09, z.z);
    scene.add(ringMesh);

    // Vertical holographic light beam (visible when hovered during drag)
    const pillarGeo = new THREE.CylinderGeometry(
      Math.min(z.w, z.d) * 0.35,
      Math.min(z.w, z.d) * 0.38,
      7.5,
      24,
      1,
      true
    );
    const pillarMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(z.color),
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.set(z.x, 3.75, z.z);
    scene.add(pillarMesh);

    zonePads.set(z.id, { ring: ringMesh, pillar: pillarMesh, mat: ringMat });
  });

  // ==========================================
  // 10. INSTANCED SURROUNDING FOREST & TIRE BARRIERS
  // ==========================================
  const treeCoords: Array<{ x: number; z: number; s: number }> = [];
  for (let angle = 0; angle < Math.PI * 2; angle += 0.14) {
    const rOuter = 48 + Math.sin(angle * 5) * 4;
    treeCoords.push({
      x: Math.cos(angle) * rOuter * 1.15,
      z: Math.sin(angle) * rOuter * 0.72,
      s: 0.85 + Math.abs(Math.sin(angle * 7)) * 0.45,
    });
    const rSecond = 56 + Math.cos(angle * 3) * 5;
    treeCoords.push({
      x: Math.cos(angle + 0.07) * rSecond * 1.18,
      z: Math.sin(angle + 0.07) * rSecond * 0.74,
      s: 0.9 + Math.abs(Math.cos(angle * 9)) * 0.5,
    });
  }

  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.36, 1.8, 7);
  trunkGeo.translate(0, 0.9, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2818, roughness: 0.92 });
  const trunksInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCoords.length);
  trunksInst.castShadow = true;

  const crownLowerGeo = new THREE.ConeGeometry(1.75, 3.2, 8);
  crownLowerGeo.translate(0, 2.8, 0);
  const crownUpperGeo = new THREE.ConeGeometry(1.25, 2.6, 8);
  crownUpperGeo.translate(0, 4.4, 0);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82 });

  const crownLowerInst = new THREE.InstancedMesh(crownLowerGeo, foliageMat, treeCoords.length);
  const crownUpperInst = new THREE.InstancedMesh(crownUpperGeo, foliageMat, treeCoords.length);
  crownLowerInst.castShadow = true;
  crownUpperInst.castShadow = true;

  const dummy = new THREE.Object3D();
  const colorTemp = new THREE.Color();
  treeCoords.forEach((t, idx) => {
    dummy.position.set(t.x, 0, t.z);
    dummy.rotation.y = idx * 0.8;
    dummy.scale.setScalar(t.s);
    dummy.updateMatrix();
    trunksInst.setMatrixAt(idx, dummy.matrix);
    crownLowerInst.setMatrixAt(idx, dummy.matrix);
    crownUpperInst.setMatrixAt(idx, dummy.matrix);

    const gShift = 0.08 + (idx % 5) * 0.025;
    colorTemp.setRGB(0.06, 0.22 + gShift, 0.11);
    crownLowerInst.setColorAt(idx, colorTemp);
    colorTemp.setRGB(0.09, 0.28 + gShift, 0.14);
    crownUpperInst.setColorAt(idx, colorTemp);
  });
  trunksInst.instanceMatrix.needsUpdate = true;
  crownLowerInst.instanceMatrix.needsUpdate = true;
  crownUpperInst.instanceMatrix.needsUpdate = true;
  if (crownLowerInst.instanceColor) crownLowerInst.instanceColor.needsUpdate = true;
  if (crownUpperInst.instanceColor) crownUpperInst.instanceColor.needsUpdate = true;
  trunksInst.computeBoundingSphere();
  crownLowerInst.computeBoundingSphere();
  crownUpperInst.computeBoundingSphere();

  scene.add(trunksInst, crownLowerInst, crownUpperInst);

  return {
    radarDish,
    beaconMesh,
    beaconLight,
    trophyGroup,
    gateArm,
    scannerBeam,
    zonePads,
    pitBaySigns,
  };
}
