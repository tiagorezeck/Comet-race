import * as THREE from 'three';

export function createAsphaltTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base dark racing tarmac
  ctx.fillStyle = '#252d3b';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle aggregate grain
  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const shade = 30 + Math.floor(Math.random() * 26);
    ctx.fillStyle = `rgb(${shade}, ${shade + 5}, ${shade + 12})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle tire rubber racing groove in the middle
  const groove = ctx.createLinearGradient(0, 0, 512, 0);
  groove.addColorStop(0, 'rgba(10,12,16,0)');
  groove.addColorStop(0.25, 'rgba(10,12,16,0.34)');
  groove.addColorStop(0.5, 'rgba(12,15,20,0.18)');
  groove.addColorStop(0.75, 'rgba(10,12,16,0.34)');
  groove.addColorStop(1, 'rgba(10,12,16,0)');
  ctx.fillStyle = groove;
  ctx.fillRect(0, 0, 512, 512);

  // Outer white track boundary lines
  ctx.fillStyle = 'rgba(241, 245, 249, 0.88)';
  ctx.fillRect(22, 0, 10, 512);
  ctx.fillRect(480, 0, 10, 512);

  // Center dashed racing line
  ctx.fillStyle = 'rgba(248, 250, 252, 0.55)';
  for (let y = 16; y < 512; y += 64) {
    ctx.fillRect(252, y, 8, 34);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 22);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createKerbTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const stripeH = 64;
  for (let y = 0; y < 256; y += stripeH) {
    const isRed = (y / stripeH) % 2 === 0;
    ctx.fillStyle = isRed ? '#dc2626' : '#f8fafc';
    ctx.fillRect(0, y, 128, stripeH);
    // Subtle weathering
    ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    ctx.fillRect(0, y + stripeH - 4, 128, 4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 46);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createCheckeredTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const size = 32;
  for (let y = 0; y < 128; y += size) {
    for (let x = 0; x < 256; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#f8fafc' : '#0f172a';
      ctx.fillRect(x, y, size, size);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createGrassTerrainTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e2418';
  ctx.fillRect(0, 0, 512, 512);

  // Mowed turf stripes
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(22, 60, 38, 0.35)' : 'rgba(10, 32, 20, 0.35)';
    ctx.fillRect(i * 32, 0, 32, 512);
  }

  // Organic turf noise
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const g = 28 + Math.floor(Math.random() * 34);
    ctx.fillStyle = `rgba(${Math.floor(g * 0.45)}, ${g}, ${Math.floor(g * 0.65)}, 0.45)`;
    ctx.fillRect(x, y, 3, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 18);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createBaySignTexture(
  label: string,
  accentColor: string,
  occupied: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090e17';
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = occupied ? accentColor : '#10b981';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 244, 116);

  ctx.fillStyle = occupied ? accentColor : '#10b981';
  ctx.fillRect(14, 14, 228, 22);

  ctx.fillStyle = '#090e17';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(occupied ? 'EM EXECUÇÃO' : 'BOX LIVRE', 128, 30);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 54px monospace';
  ctx.fillText(label, 128, 96);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createZonePadTexture(
  num: number,
  title: string,
  subtitle: string,
  colorHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 256);

  // Subtle glowing floor pad grid
  ctx.fillStyle = 'rgba(8, 14, 24, 0.72)';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(12, 12, 488, 232, 24);
  ctx.fill();
  ctx.stroke();

  // Inner corner brackets
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 456, 200);

  // Number badge
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.roundRect(38, 48, 96, 96, 18);
  ctx.fill();

  ctx.fillStyle = '#070b12';
  ctx.font = '900 60px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(num), 86, 118);

  // Title & subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, 152, 92);

  ctx.fillStyle = colorHex;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(subtitle, 152, 132);

  // Bottom telemetry bar
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(38, 178, 436, 24);
  ctx.fillStyle = colorHex;
  ctx.fillRect(38, 178, 140, 24);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function drawVehicleBadgeCanvas(
  canvas: HTMLCanvasElement,
  osNumber: string,
  model: string,
  progress: number,
  accentColor: string,
  isSelected: boolean,
  isDragged: boolean
): void {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Glass pill background
  ctx.fillStyle = isDragged ? 'rgba(6, 32, 42, 0.96)' : 'rgba(9, 14, 24, 0.92)';
  ctx.strokeStyle = isDragged ? '#00ffcc' : isSelected ? '#ff6b00' : accentColor;
  ctx.lineWidth = isSelected || isDragged ? 6 : 4;
  ctx.beginPath();
  ctx.roundRect(8, 8, w - 16, h - 24, 22);
  ctx.fill();
  ctx.stroke();

  // Pointer triangle
  ctx.fillStyle = isDragged ? '#00ffcc' : isSelected ? '#ff6b00' : accentColor;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 12, h - 16);
  ctx.lineTo(w / 2 + 12, h - 16);
  ctx.lineTo(w / 2, h - 2);
  ctx.closePath();
  ctx.fill();

  // OS Number
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(osNumber, 28, 48);

  // Progress %
  ctx.fillStyle = isDragged ? '#00ffcc' : '#10b981';
  ctx.font = '900 30px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(progress)}%`, w - 28, 48);

  // Model short name
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  const shortModel = model.length > 18 ? `${model.slice(0, 17)}…` : model;
  ctx.fillText(shortModel, 28, 78);

  // Progress bar track
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(28, 92, w - 56, 14, 7);
  ctx.fill();

  // Progress bar fill
  const fillW = Math.max(12, ((w - 56) * Math.min(100, Math.max(0, progress))) / 100);
  ctx.fillStyle = isDragged ? '#00ffcc' : isSelected ? '#ff6b00' : '#10b981';
  ctx.beginPath();
  ctx.roundRect(28, 92, fillW, 14, 7);
  ctx.fill();
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.45)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createSparkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(255, 220, 120, 0.85)');
  grad.addColorStop(1, 'rgba(255, 120, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
