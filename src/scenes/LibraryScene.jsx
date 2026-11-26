import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PROFILE } from '../data/profile.js';
import { useExperienceStore } from '../store/experienceStore.js';

const BAY_COUNT = 5;
const SHELVES_PER_BAY = 4;
const BOOKS_PER_SHELF = 6;
const TOTAL_BOOKS = BAY_COUNT * SHELVES_PER_BAY * BOOKS_PER_SHELF; // 120 instanced books = 1 draw call
const ARCHIVE_DUST_COUNT = 180;

const PAGE_WIDTH = 0.92;
const PAGE_HEIGHT = 1.24;
const COVER_WIDTH = 1.0;
const COVER_HEIGHT = 1.34;
const OPEN_TILT = 0.22;

function createGoldenRuneTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Soft warm radial aura
  const aura = ctx.createRadialGradient(cx, cy, 40, cx, cy, 245);
  aura.addColorStop(0, 'rgba(231, 189, 114, 0.24)');
  aura.addColorStop(0.55, 'rgba(131, 217, 220, 0.08)');
  aura.addColorStop(1, 'rgba(16, 13, 22, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, size, size);

  // Concentric antique gold astrolabe rings
  ctx.strokeStyle = 'rgba(231, 189, 114, 0.88)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 232, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(231, 189, 114, 0.52)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, 194, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(131, 217, 220, 0.62)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, 152, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Original geometric arcane rune glyphs around outer ring (24 glyphs)
  const glyphCount = 24;
  ctx.strokeStyle = 'rgba(247, 219, 158, 0.92)';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < glyphCount; i += 1) {
    const angle = (i / glyphCount) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * 213, cy + Math.sin(angle) * 213);
    ctx.rotate(angle + Math.PI / 2);

    ctx.beginPath();
    if (i % 3 === 0) {
      // Diamond & vertical bar glyph
      ctx.moveTo(0, -10);
      ctx.lineTo(7, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-7, 0);
      ctx.closePath();
      ctx.moveTo(0, -13);
      ctx.lineTo(0, 13);
    } else if (i % 3 === 1) {
      // Chevron & cross glyph
      ctx.moveTo(-7, 7);
      ctx.lineTo(0, -9);
      ctx.lineTo(7, 7);
      ctx.moveTo(-5, 2);
      ctx.lineTo(5, 2);
    } else {
      // Astrolabe arc & dot glyph
      ctx.arc(0, 0, 7, 0, Math.PI * 1.45);
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Inner 8-pointed star geometry
  ctx.strokeStyle = 'rgba(231, 189, 114, 0.45)';
  ctx.lineWidth = 1.5;
  for (let pass = 0; pass < 2; pass += 1) {
    ctx.beginPath();
    for (let k = 0; k < 4; k += 1) {
      const a = (k * Math.PI) / 2 + (pass * Math.PI) / 4;
      const px = cx + Math.cos(a) * 145;
      const py = cy + Math.sin(a) * 145;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createCoverTexture() {
  const w = 512;
  const h = 680;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Deep antique mystic plum leather gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#3a1f36');
  grad.addColorStop(0.5, '#2a162a');
  grad.addColorStop(1, '#1c1020');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Double gilded filigree frame
  ctx.strokeStyle = '#e7bd72';
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.strokeStyle = 'rgba(231, 189, 114, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, w - 88, h - 88);

  // Center astrolabe medallion
  const cx = w / 2;
  const cy = h / 2 - 18;
  ctx.strokeStyle = '#e7bd72';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 112, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(131, 217, 220, 0.65)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, 94, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Monogram AR
  ctx.fillStyle = '#f3d492';
  ctx.font = '700 84px Cinzel, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(PROFILE.initials, cx, cy + 4);

  // Header & footer embossed lettering
  ctx.fillStyle = '#e7bd72';
  ctx.font = '600 22px Cinzel, Georgia, serif';
  ctx.fillText('THE CHRONICLES OF AARAV', cx, 112);

  ctx.fillStyle = '#83d9dc';
  ctx.font = '500 17px "DM Mono", monospace';
  ctx.fillText('MULTIVERSE OF INTELLIGENCE', cx, 520);

  ctx.fillStyle = 'rgba(246, 240, 230, 0.8)';
  ctx.font = '500 16px "DM Mono", monospace';
  ctx.fillText('CLICK TOME TO OPEN · III CHAPTERS', cx, 578);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createParchmentPageTexture({
  heading,
  subtitle,
  lines,
  pageNumber,
  numeral,
  isLeft,
}) {
  const w = 512;
  const h = 680;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Warm illuminated parchment gradient
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 40, w * 0.5, h * 0.5, 430);
  grad.addColorStop(0, '#fbf5ea');
  grad.addColorStop(0.75, '#f2e6d0');
  grad.addColorStop(1, '#dfc9a4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle gutter shadow along spine edge
  const gutterGrad = isLeft
    ? ctx.createLinearGradient(w - 58, 0, w, 0)
    : ctx.createLinearGradient(0, 0, 58, 0);
  if (isLeft) {
    gutterGrad.addColorStop(0, 'rgba(42, 22, 42, 0)');
    gutterGrad.addColorStop(1, 'rgba(42, 22, 42, 0.22)');
  } else {
    gutterGrad.addColorStop(0, 'rgba(42, 22, 42, 0.22)');
    gutterGrad.addColorStop(1, 'rgba(42, 22, 42, 0)');
  }
  ctx.fillStyle = gutterGrad;
  ctx.fillRect(isLeft ? w - 58 : 0, 0, 58, h);

  // Ornate manuscript border
  ctx.strokeStyle = 'rgba(148, 102, 34, 0.68)';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.strokeStyle = 'rgba(86, 51, 77, 0.32)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  // Ornamental chapter header seal
  ctx.fillStyle = '#56334d';
  ctx.font = '600 18px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`— CHAPTER ${numeral} —`, w / 2, 86);

  ctx.fillStyle = '#24152c';
  ctx.font = '700 26px Cinzel, Georgia, serif';
  ctx.fillText(heading, w / 2, 130);

  ctx.fillStyle = '#7c5520';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText(subtitle, w / 2, 166);

  // Decorative gold divider line
  ctx.strokeStyle = '#c29240';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, 194);
  ctx.lineTo(w - 96, 194);
  ctx.stroke();

  // Illuminated manuscript lines
  ctx.textAlign = 'left';
  ctx.fillStyle = '#24172b';
  ctx.font = '600 22px Georgia, serif';
  lines.forEach((line, idx) => {
    const y = 252 + idx * 66;
    ctx.fillStyle = '#b4822e';
    ctx.fillText('✦', 68, y);
    ctx.fillStyle = '#23162b';
    ctx.fillText(line, 102, y, w - 160);
  });

  // Delicate cyan/gold astrolabe watermark near bottom
  ctx.strokeStyle = 'rgba(86, 51, 77, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w / 2, 558, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#7a5724';
  ctx.font = '600 16px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(pageNumber, w / 2, 620);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createSoftDustTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 236, 184, 1)');
  grad.addColorStop(0.45, 'rgba(231, 189, 114, 0.55)');
  grad.addColorStop(1, 'rgba(231, 189, 114, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function LibraryScene() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const libraryBookOpen = useExperienceStore((s) => s.libraryBookOpen);
  const libraryChapterIndex = useExperienceStore((s) => s.libraryChapterIndex);
  const libraryTurningDir = useExperienceStore((s) => s.libraryTurningDir);
  const libraryTurnNonce = useExperienceStore((s) => s.libraryTurnNonce);
  const openLibraryBook = useExperienceStore((s) => s.openLibraryBook);
  const stepLibraryChapter = useExperienceStore((s) => s.stepLibraryChapter);
  const clearLibraryTurning = useExperienceStore((s) => s.clearLibraryTurning);

  const [hoveredPart, setHoveredPart] = useState(null);

  const booksRef = useRef(null);
  const tomeFloatRef = useRef(null);
  const bookSlideRef = useRef(null);
  const frontCoverPivotRef = useRef(null);
  const backCoverPivotRef = useRef(null);
  const leftStackRef = useRef(null);
  const turningLeafRef = useRef(null);
  const runeFloorRef = useRef(null);
  const runeHaloRef = useRef(null);
  const dustPointsRef = useRef(null);
  const candleLightRef = useRef(null);
  const orbRefs = useRef([]);

  const openProgressRef = useRef(libraryBookOpen ? 1 : 0);
  const turnAnimRef = useRef({ active: false, progress: 0, dir: 1 });
  const lastNonceRef = useRef(libraryTurnNonce);

  // Build procedural textures once and dispose cleanly on unmount
  const textures = useMemo(() => {
    const runeCircle = createGoldenRuneTexture();
    const coverFront = createCoverTexture();
    const dustSprite = createSoftDustTexture();

    const chapterSpreads = PROFILE.libraryChapters.map((chapter, idx) => ({
      left: createParchmentPageTexture({
        heading: chapter.leftHeading,
        subtitle: chapter.subtitle,
        lines: chapter.leftLines,
        pageNumber: `0${idx * 2 + 1}`,
        numeral: chapter.numeral,
        isLeft: true,
      }),
      right: createParchmentPageTexture({
        heading: chapter.rightHeading,
        subtitle: chapter.title,
        lines: chapter.rightLines,
        pageNumber: `0${idx * 2 + 2}`,
        numeral: chapter.numeral,
        isLeft: false,
      }),
    }));

    return { runeCircle, coverFront, dustSprite, chapterSpreads };
  }, []);

  // Rising golden archive dust particle attributes
  const dustData = useMemo(() => {
    const positions = new Float32Array(ARCHIVE_DUST_COUNT * 3);
    const speeds = new Float32Array(ARCHIVE_DUST_COUNT);
    const phases = new Float32Array(ARCHIVE_DUST_COUNT);

    for (let i = 0; i < ARCHIVE_DUST_COUNT; i += 1) {
      const radius = 0.7 + Math.random() * 2.3;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.15 + Math.random() * 3.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 0.15;
      speeds[i] = 0.14 + Math.random() * 0.22;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry, speeds, phases };
  }, []);

  // Curved bending turning leaf geometry (pivoted at x = 0 spine)
  const turningLeafGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(PAGE_WIDTH, PAGE_HEIGHT, 22, 4);
    geo.translate(PAGE_WIDTH / 2, 0, 0);
    const basePos = new Float32Array(geo.attributes.position.array);
    return { geo, basePos };
  }, []);

  const geometries = useMemo(
    () => ({
      floor: new THREE.CylinderGeometry(5.8, 6.1, 0.16, 48),
      floorRingGold: new THREE.TorusGeometry(4.0, 0.026, 10, 84),
      runePlane: new THREE.PlaneGeometry(4.2, 4.2),
      runeHaloRing: new THREE.TorusGeometry(1.72, 0.016, 10, 84),
      runeHaloInner: new THREE.TorusGeometry(1.42, 0.011, 10, 72),
      bayBack: new THREE.BoxGeometry(1.9, 3.85, 0.16),
      bayPillar: new THREE.BoxGeometry(0.17, 3.96, 0.36),
      bayShelf: new THREE.BoxGeometry(1.78, 0.06, 0.34),
      bayCap: new THREE.BoxGeometry(2.1, 0.16, 0.44),
      bookUnit: new THREE.BoxGeometry(0.18, 0.5, 0.24),
      pedestalBase: new THREE.CylinderGeometry(0.66, 0.92, 0.72, 8),
      pedestalRim: new THREE.TorusGeometry(0.7, 0.024, 10, 36),
      spine: new THREE.BoxGeometry(0.14, COVER_HEIGHT + 0.02, 0.18),
      spineBand: new THREE.BoxGeometry(0.16, 0.036, 0.2),
      coverBoard: new THREE.BoxGeometry(COVER_WIDTH, COVER_HEIGHT, 0.05),
      coverFacePlane: new THREE.PlaneGeometry(COVER_WIDTH - 0.04, COVER_HEIGHT - 0.04),
      cornerClasp: new THREE.BoxGeometry(0.13, 0.13, 0.068),
      pageBlock: new THREE.BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, 0.08),
      pageSurface: new THREE.PlaneGeometry(PAGE_WIDTH - 0.015, PAGE_HEIGHT - 0.015),
      candleOrb: new THREE.SphereGeometry(0.085, 14, 14),
      candleRing: new THREE.TorusGeometry(0.14, 0.01, 8, 24),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({
        color: '#171020',
        metalness: 0.38,
        roughness: 0.72,
      }),
      stone: new THREE.MeshStandardMaterial({
        color: '#251a30',
        metalness: 0.26,
        roughness: 0.78,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: '#392534',
        metalness: 0.22,
        roughness: 0.65,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        metalness: 0.84,
        roughness: 0.22,
        emissive: '#785419',
        emissiveIntensity: 0.42,
      }),
      goldBright: new THREE.MeshStandardMaterial({
        color: '#f8e1a6',
        metalness: 0.9,
        roughness: 0.16,
        emissive: '#c48e30',
        emissiveIntensity: 0.78,
      }),
      bookInstanced: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.2,
        roughness: 0.68,
      }),
      leather: new THREE.MeshStandardMaterial({
        color: '#3b1f38',
        metalness: 0.34,
        roughness: 0.48,
        emissive: '#3b1f38',
        emissiveIntensity: 0.28,
      }),
      coverGraphic: new THREE.MeshStandardMaterial({
        map: textures.coverFront,
        metalness: 0.35,
        roughness: 0.42,
      }),
      parchmentEdge: new THREE.MeshStandardMaterial({
        color: '#e8d7b8',
        roughness: 0.78,
        metalness: 0.05,
      }),
      leftPageMat: new THREE.MeshStandardMaterial({
        map: textures.chapterSpreads[0].left,
        roughness: 0.72,
        metalness: 0.06,
      }),
      rightPageMat: new THREE.MeshStandardMaterial({
        map: textures.chapterSpreads[0].right,
        roughness: 0.72,
        metalness: 0.06,
      }),
      turningLeafMat: new THREE.MeshStandardMaterial({
        map: textures.chapterSpreads[0].right,
        roughness: 0.7,
        metalness: 0.06,
        side: THREE.DoubleSide,
      }),
      runeFloorMat: new THREE.MeshBasicMaterial({
        map: textures.runeCircle,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      cyanAccent: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.78,
        metalness: 0.3,
        roughness: 0.22,
      }),
      candleGlow: new THREE.MeshStandardMaterial({
        color: '#ffe8b8',
        emissive: '#f5b85b',
        emissiveIntensity: 1.55,
        roughness: 0.2,
      }),
      dustMat: new THREE.PointsMaterial({
        size: 0.11,
        map: textures.dustSprite,
        color: '#f7d894',
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    }),
    [textures]
  );

  // Sync open spread textures cleanly with the current chapter index
  useEffect(() => {
    const spread =
      textures.chapterSpreads[libraryChapterIndex] || textures.chapterSpreads[0];
    materials.leftPageMat.map = spread.left;
    materials.leftPageMat.needsUpdate = true;
    materials.rightPageMat.map = spread.right;
    materials.rightPageMat.needsUpdate = true;
    materials.turningLeafMat.map =
      libraryTurningDir < 0 ? spread.left : spread.right;
    materials.turningLeafMat.needsUpdate = true;
  }, [libraryChapterIndex, libraryTurningDir, textures, materials]);

  // Trigger curved 3D page-turn animation on every chapter turn
  useEffect(() => {
    if (libraryTurnNonce === lastNonceRef.current) return;
    lastNonceRef.current = libraryTurnNonce;

    if (reducedMotion || libraryTurningDir === 0) {
      turnAnimRef.current.active = false;
      clearLibraryTurning();
      return;
    }

    turnAnimRef.current = {
      active: true,
      progress: 0,
      dir: libraryTurningDir,
    };
  }, [libraryTurnNonce, libraryTurningDir, reducedMotion, clearLibraryTurning]);

  const bays = useMemo(() => {
    const radius = 4.45;
    const angles = [-1.06, -0.53, 0, 0.53, 1.06];
    return angles.map((angle, idx) => ({
      id: idx,
      x: Math.sin(angle) * radius,
      z: -Math.cos(angle) * radius + 0.4,
      rotY: -angle,
    }));
  }, []);

  const candles = useMemo(
    () => [
      { id: 0, pos: [-2.65, 2.35, -1.9], phase: 0.2 },
      { id: 1, pos: [-1.2, 2.95, -2.85], phase: 1.4 },
      { id: 2, pos: [1.2, 2.95, -2.85], phase: 2.6 },
      { id: 3, pos: [2.65, 2.35, -1.9], phase: 3.9 },
      { id: 4, pos: [-2.05, 1.7, 0.35], phase: 5.1 },
      { id: 5, pos: [2.05, 1.7, 0.35], phase: 0.9 },
    ],
    []
  );

  // Populate 120 richly tinted ancient book volumes into 1 InstancedMesh
  useEffect(() => {
    if (!booksRef.current) return;
    const palette = [
      new THREE.Color('#6b364f'),
      new THREE.Color('#3b2847'),
      new THREE.Color('#8e6835'),
      new THREE.Color('#2c3c4a'),
      new THREE.Color('#5a392d'),
      new THREE.Color('#b78c49'),
    ];
    const dummy = new THREE.Object3D();
    const bayMatrix = new THREE.Matrix4();
    const localMatrix = new THREE.Matrix4();
    const finalMatrix = new THREE.Matrix4();

    let idx = 0;
    bays.forEach((bay, bIdx) => {
      bayMatrix.makeRotationY(bay.rotY);
      bayMatrix.setPosition(bay.x, 0, bay.z);
      for (let s = 0; s < SHELVES_PER_BAY; s += 1) {
        const shelfY = 0.64 + s * 0.82;
        for (let k = 0; k < BOOKS_PER_SHELF; k += 1) {
          const seed = bIdx * 31 + s * 13 + k * 7;
          const hScale = 0.74 + ((seed * 17) % 10) * 0.048;
          const tScale = 0.72 + ((seed * 23) % 7) * 0.08;
          const tilt = k === BOOKS_PER_SHELF - 1 && s % 2 === 0 ? -0.14 : 0;

          dummy.position.set(-0.7 + k * 0.28, shelfY + 0.25 * hScale, 0.14);
          dummy.rotation.set(0, 0, tilt);
          dummy.scale.set(tScale, hScale, 0.95);
          dummy.updateMatrix();
          localMatrix.copy(dummy.matrix);

          finalMatrix.multiplyMatrices(bayMatrix, localMatrix);
          booksRef.current.setMatrixAt(idx, finalMatrix);
          booksRef.current.setColorAt(idx, palette[seed % palette.length]);
          idx += 1;
        }
      }
    });

    booksRef.current.instanceMatrix.needsUpdate = true;
    if (booksRef.current.instanceColor) {
      booksRef.current.instanceColor.needsUpdate = true;
    }
  }, [bays]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.body.style.cursor = hoveredPart ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hoveredPart]);

  // Explicit GPU disposal on unmount (geometries, materials, procedural textures)
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      dustData.geometry.dispose();
      turningLeafGeo.geo.dispose();
      textures.runeCircle?.dispose();
      textures.coverFront?.dispose();
      textures.dustSprite?.dispose();
      textures.chapterSpreads.forEach((spread) => {
        spread.left?.dispose();
        spread.right?.dispose();
      });
    };
  }, [geometries, materials, dustData, turningLeafGeo, textures]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // 1. Smoothly open / close the giant ancient book covers
    const targetOpen = libraryBookOpen ? 1 : 0;
    openProgressRef.current = reducedMotion
      ? targetOpen
      : THREE.MathUtils.lerp(openProgressRef.current, targetOpen, dt * 4.5);

    const p = openProgressRef.current;

    if (bookSlideRef.current) {
      bookSlideRef.current.position.x = THREE.MathUtils.lerp(-COVER_WIDTH / 2, 0, p);
    }

    if (frontCoverPivotRef.current) {
      // Closed: Math.PI (ornate AR cover faces +Z); Open: +OPEN_TILT rad
      frontCoverPivotRef.current.rotation.y = THREE.MathUtils.lerp(
        Math.PI,
        OPEN_TILT,
        p
      );
      frontCoverPivotRef.current.position.z = THREE.MathUtils.lerp(0.145, 0.0, p);
    }

    if (backCoverPivotRef.current) {
      backCoverPivotRef.current.rotation.y = THREE.MathUtils.lerp(0, -OPEN_TILT, p);
    }

    if (leftStackRef.current) {
      leftStackRef.current.visible = p > 0.16;
      leftStackRef.current.scale.z = Math.max(0.15, p);
    }

    // 2. Realistic Curved 3D Turning Page Leaf Deformation
    if (turningLeafRef.current) {
      const anim = turnAnimRef.current;
      if (anim.active && p > 0.72) {
        turningLeafRef.current.visible = true;
        anim.progress = Math.min(1, anim.progress + dt * 1.35);

        const rawT = anim.progress;
        const eased =
          rawT < 0.5
            ? 4 * rawT * rawT * rawT
            : 1 - (-2 * rawT + 2) ** 3 / 2;

        const startAngle = anim.dir > 0 ? -OPEN_TILT : Math.PI - OPEN_TILT;
        const endAngle = anim.dir > 0 ? Math.PI - OPEN_TILT : -OPEN_TILT;
        const theta = THREE.MathUtils.lerp(startAngle, endAngle, eased);
        const arch = Math.sin(rawT * Math.PI) * 0.28;

        const posAttr = turningLeafGeo.geo.attributes.position;
        const base = turningLeafGeo.basePos;

        for (let i = 0; i < posAttr.count; i += 1) {
          const bx = base[i * 3];
          const by = base[i * 3 + 1];
          const u = bx / PAGE_WIDTH; // 0 at spine, 1 at outer page edge
          const lag = -anim.dir * arch * 0.65 * u * u;
          const localAngle = theta + lag;
          const lift = Math.sin(u * Math.PI) * arch * 0.34;

          posAttr.setXYZ(
            i,
            Math.cos(localAngle) * bx,
            by,
            Math.sin(localAngle) * bx + lift
          );
        }
        posAttr.needsUpdate = true;
        turningLeafGeo.geo.computeVertexNormals();

        if (anim.progress >= 1) {
          anim.active = false;
          turningLeafRef.current.visible = false;
          clearLibraryTurning();
        }
      } else {
        turningLeafRef.current.visible = false;
      }
    }

    if (reducedMotion) return;

    // 3. Levitating book float, rotating golden runes, rising dust & candlelight
    if (tomeFloatRef.current) {
      tomeFloatRef.current.position.y =
        1.56 + Math.sin(t * 1.15) * (libraryBookOpen ? 0.035 : 0.075);
      tomeFloatRef.current.rotation.y = libraryBookOpen
        ? Math.sin(t * 0.35) * 0.045
        : Math.sin(t * 0.55) * 0.16;
      tomeFloatRef.current.rotation.x = THREE.MathUtils.lerp(
        tomeFloatRef.current.rotation.x,
        libraryBookOpen ? 0.16 : 0.08,
        dt * 3
      );
    }

    if (runeFloorRef.current) {
      runeFloorRef.current.rotation.z += dt * (libraryBookOpen ? 0.18 : 0.1);
    }

    if (runeHaloRef.current) {
      runeHaloRef.current.rotation.z -= dt * 0.14;
      runeHaloRef.current.rotation.y = Math.sin(t * 0.45) * 0.12;
    }

    if (dustPointsRef.current) {
      const posAttr = dustData.geometry.attributes.position;
      for (let i = 0; i < ARCHIVE_DUST_COUNT; i += 1) {
        let y = posAttr.getY(i) + dustData.speeds[i] * dt;
        if (y > 3.35) y = 0.15;
        const x = posAttr.getX(i) + Math.sin(t * 0.8 + dustData.phases[i]) * 0.0025;
        posAttr.setXY(i, x, y);
      }
      posAttr.needsUpdate = true;
    }

    if (candleLightRef.current) {
      candleLightRef.current.intensity = 2.4 + Math.sin(t * 5.2) * 0.2;
    }

    orbRefs.current.forEach((orb, idx) => {
      if (!orb) return;
      const base = candles[idx];
      orb.position.y = base.pos[1] + Math.sin(t * 1.3 + base.phase) * 0.08;
    });
  });

  const handleClosedBookClick = (event) => {
    event.stopPropagation();
    if (!libraryBookOpen) {
      openLibraryBook();
    }
  };

  const handleLeftPageClick = (event) => {
    event.stopPropagation();
    if (!libraryBookOpen) {
      openLibraryBook();
    } else if (libraryChapterIndex > 0) {
      stepLibraryChapter(-1);
    }
  };

  const handleRightPageClick = (event) => {
    event.stopPropagation();
    if (!libraryBookOpen) {
      openLibraryBook();
    } else if (libraryChapterIndex < PROFILE.libraryChapters.length - 1) {
      stepLibraryChapter(1);
    }
  };

  return (
    <group position={[0, -0.18, -0.25]}>
      {/* Warm Archive Candlelight & Golden Book Uplight */}
      <pointLight
        ref={candleLightRef}
        position={[0, 2.75, 1.25]}
        intensity={2.4}
        distance={14}
        decay={2}
        color="#f6c982"
      />
      <pointLight
        position={[0, 0.85, 0.8]}
        intensity={1.35}
        distance={8}
        decay={2}
        color="#e7bd72"
      />

      {/* Sanctuary Floor + Rotating Golden Arcane Rune Circle */}
      <mesh
        geometry={geometries.floor}
        material={materials.floor}
        position={[0, -0.08, 0]}
      />
      <mesh
        geometry={geometries.floorRingGold}
        material={materials.gold}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      />
      <mesh
        ref={runeFloorRef}
        geometry={geometries.runePlane}
        material={materials.runeFloorMat}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, -0.1]}
      />

      {/* Rising Glowing Golden Archive Dust Particles */}
      <points
        ref={dustPointsRef}
        geometry={dustData.geometry}
        material={materials.dustMat}
        frustumCulled={false}
      />

      {/* Curved Stone & Wood Archive Bookshelf Bays */}
      {bays.map((bay) => (
        <group
          key={bay.id}
          position={[bay.x, 0, bay.z]}
          rotation={[0, bay.rotY, 0]}
        >
          <mesh
            geometry={geometries.bayBack}
            material={materials.stone}
            position={[0, 1.92, -0.04]}
          />
          <mesh
            geometry={geometries.bayPillar}
            material={materials.stone}
            position={[-0.98, 1.98, 0.08]}
          />
          <mesh
            geometry={geometries.bayPillar}
            material={materials.stone}
            position={[0.98, 1.98, 0.08]}
          />
          <mesh
            geometry={geometries.bayCap}
            material={materials.gold}
            position={[0, 3.9, 0.1]}
          />
          {[0, 1, 2, 3].map((shelfIdx) => (
            <mesh
              key={shelfIdx}
              geometry={geometries.bayShelf}
              material={materials.wood}
              position={[0, 0.61 + shelfIdx * 0.82, 0.14]}
            />
          ))}
        </group>
      ))}

      {/* 120 Instanced Books across all 5 bays (1 draw call) */}
      <instancedMesh
        ref={booksRef}
        args={[geometries.bookUnit, materials.bookInstanced, TOTAL_BOOKS]}
      />

      {/* Floating Candlelight Orbs */}
      {candles.map((candle, idx) => (
        <group
          key={candle.id}
          ref={(el) => {
            orbRefs.current[idx] = el;
          }}
          position={candle.pos}
        >
          <mesh geometry={geometries.candleOrb} material={materials.candleGlow} />
          <mesh
            geometry={geometries.candleRing}
            material={materials.gold}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </group>
      ))}

      {/* Central Archive Pedestal */}
      <group position={[0, 0, -0.1]}>
        <mesh
          geometry={geometries.pedestalBase}
          material={materials.stone}
          position={[0, 0.36, 0]}
        />
        <mesh
          geometry={geometries.pedestalRim}
          material={materials.gold}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.72, 0]}
        />

        {/* GIANT FLOATING ANCIENT BOOK */}
        <group ref={tomeFloatRef} position={[0, 1.56, 0.1]}>
          {/* Enchanted vertical rune halo framing the giant floating book */}
          <group ref={runeHaloRef} position={[0, 0, -0.26]}>
            <mesh
              geometry={geometries.runeHaloRing}
              material={hoveredPart ? materials.goldBright : materials.gold}
            />
            <mesh
              geometry={geometries.runeHaloInner}
              material={materials.cyanAccent}
              rotation={[0.28, 0.32, 0]}
            />
          </group>

          {/* Sliding root keeps book centered whether closed or wide open */}
          <group ref={bookSlideRef} position={[-COVER_WIDTH / 2, 0, 0]}>
            {/* Ornate Leather Spine + 5 Gold Raised Bands */}
            <mesh
              geometry={geometries.spine}
              material={materials.leather}
              position={[0, 0, 0.05]}
            />
            {[-0.48, -0.24, 0, 0.24, 0.48].map((bandY) => (
              <mesh
                key={bandY}
                geometry={geometries.spineBand}
                material={materials.gold}
                position={[0, bandY, 0.05]}
              />
            ))}

            {/* Back / Right Cover & Right Illuminated Page Spread */}
            <group ref={backCoverPivotRef} position={[0, 0, 0]}>
              <mesh
                geometry={geometries.coverBoard}
                material={materials.leather}
                position={[COVER_WIDTH / 2, 0, 0]}
              />
              {/* Brass corner clasps on right outer edge */}
              <mesh
                geometry={geometries.cornerClasp}
                material={materials.goldBright}
                position={[COVER_WIDTH - 0.05, COVER_HEIGHT / 2 - 0.05, 0]}
              />
              <mesh
                geometry={geometries.cornerClasp}
                material={materials.goldBright}
                position={[COVER_WIDTH - 0.05, -COVER_HEIGHT / 2 + 0.05, 0]}
              />
              {/* Right Parchment Block */}
              <mesh
                geometry={geometries.pageBlock}
                material={materials.parchmentEdge}
                position={[PAGE_WIDTH / 2 + 0.02, 0, 0.068]}
              />
              {/* Right Readable Illuminated Page */}
              <mesh
                geometry={geometries.pageSurface}
                material={materials.rightPageMat}
                position={[PAGE_WIDTH / 2 + 0.02, 0, 0.112]}
                onClick={handleRightPageClick}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredPart('right');
                }}
                onPointerOut={() => setHoveredPart(null)}
              />
            </group>

            {/* Front / Left Cover (Ornate AR Seal when Closed + Left Illuminated Spread when Open) */}
            <group ref={frontCoverPivotRef} position={[0, 0, 0.145]} rotation={[0, Math.PI, 0]}>
              <mesh
                geometry={geometries.coverBoard}
                material={materials.leather}
                position={[-COVER_WIDTH / 2, 0, 0]}
                onClick={handleClosedBookClick}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredPart('cover');
                }}
                onPointerOut={() => setHoveredPart(null)}
              />
              {/* Embossed Front Cover Graphic (on -Z face so it faces +Z when closed at rotY=PI) */}
              <mesh
                geometry={geometries.coverFacePlane}
                material={materials.coverGraphic}
                position={[-COVER_WIDTH / 2, 0, -0.028]}
                rotation={[0, Math.PI, 0]}
                onClick={handleClosedBookClick}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredPart('cover');
                }}
                onPointerOut={() => setHoveredPart(null)}
              />
              {/* Brass corner clasps on front outer corners */}
              <mesh
                geometry={geometries.cornerClasp}
                material={materials.goldBright}
                position={[-COVER_WIDTH + 0.05, COVER_HEIGHT / 2 - 0.05, 0]}
              />
              <mesh
                geometry={geometries.cornerClasp}
                material={materials.goldBright}
                position={[-COVER_WIDTH + 0.05, -COVER_HEIGHT / 2 + 0.05, 0]}
              />

              {/* Left Parchment Stack & Illuminated Page (visible as book opens) */}
              <group ref={leftStackRef} visible={false}>
                <mesh
                  geometry={geometries.pageBlock}
                  material={materials.parchmentEdge}
                  position={[-PAGE_WIDTH / 2 - 0.02, 0, 0.068]}
                />
                <mesh
                  geometry={geometries.pageSurface}
                  material={materials.leftPageMat}
                  position={[-PAGE_WIDTH / 2 - 0.02, 0, 0.112]}
                  onClick={handleLeftPageClick}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredPart('left');
                  }}
                  onPointerOut={() => setHoveredPart(null)}
                />
              </group>
            </group>

            {/* Curved 3D Animated Turning Page Leaf */}
            <mesh
              ref={turningLeafRef}
              geometry={turningLeafGeo.geo}
              material={materials.turningLeafMat}
              position={[0, 0, 0.12]}
              visible={false}
            />
          </group>
        </group>
      </group>
    </group>
  );
}
