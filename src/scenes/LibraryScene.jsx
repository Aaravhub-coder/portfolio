import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../store/experienceStore.js';

const BAY_COUNT = 5;
const SHELVES_PER_BAY = 4;
const BOOKS_PER_SHELF = 6;
const TOTAL_BOOKS = BAY_COUNT * SHELVES_PER_BAY * BOOKS_PER_SHELF; // 120 instanced books = 1 draw call

export default function LibraryScene() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const activeLibraryChapter = useExperienceStore((s) => s.activeLibraryChapter);
  const toggleLibraryChapter = useExperienceStore((s) => s.toggleLibraryChapter);
  const [tomeHovered, setTomeHovered] = useState(false);

  const booksRef = useRef(null);
  const tomeGroupRef = useRef(null);
  const leftCoverRef = useRef(null);
  const rightCoverRef = useRef(null);
  const haloRef = useRef(null);
  const candleLightRef = useRef(null);
  const orbRefs = useRef([]);

  const geometries = useMemo(
    () => ({
      floor: new THREE.CylinderGeometry(5.6, 5.9, 0.16, 48),
      floorRingGold: new THREE.TorusGeometry(3.8, 0.024, 10, 84),
      floorRingInner: new THREE.TorusGeometry(1.7, 0.018, 10, 64),
      bayBack: new THREE.BoxGeometry(1.85, 3.6, 0.16),
      bayPillar: new THREE.BoxGeometry(0.16, 3.72, 0.34),
      bayShelf: new THREE.BoxGeometry(1.74, 0.06, 0.32),
      bayCap: new THREE.BoxGeometry(2.05, 0.16, 0.42),
      bookUnit: new THREE.BoxGeometry(0.18, 0.5, 0.24),
      pedestalBase: new THREE.CylinderGeometry(0.54, 0.72, 0.92, 8),
      pedestalRim: new THREE.TorusGeometry(0.56, 0.02, 10, 32),
      tomeSpine: new THREE.BoxGeometry(0.08, 0.62, 0.09),
      tomeCover: new THREE.BoxGeometry(0.46, 0.62, 0.032),
      tomePages: new THREE.BoxGeometry(0.42, 0.56, 0.045),
      tomeHalo: new THREE.TorusGeometry(0.82, 0.014, 10, 64),
      tomeHaloOuter: new THREE.TorusGeometry(1.06, 0.01, 10, 64),
      candleOrb: new THREE.SphereGeometry(0.085, 14, 14),
      candleRing: new THREE.TorusGeometry(0.14, 0.01, 8, 24),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({
        color: '#191222',
        metalness: 0.35,
        roughness: 0.72,
      }),
      stone: new THREE.MeshStandardMaterial({
        color: '#261b31',
        metalness: 0.25,
        roughness: 0.78,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: '#382534',
        metalness: 0.22,
        roughness: 0.65,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        metalness: 0.82,
        roughness: 0.24,
        emissive: '#6e4e18',
        emissiveIntensity: 0.35,
      }),
      goldHighlight: new THREE.MeshStandardMaterial({
        color: '#f5dba2',
        metalness: 0.88,
        roughness: 0.18,
        emissive: '#b8832c',
        emissiveIntensity: 0.62,
      }),
      bookInstanced: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.2,
        roughness: 0.68,
      }),
      tomeLeather: new THREE.MeshStandardMaterial({
        color: '#56334d',
        metalness: 0.35,
        roughness: 0.42,
        emissive: '#56334d',
        emissiveIntensity: 0.38,
      }),
      parchment: new THREE.MeshStandardMaterial({
        color: '#f6f0e6',
        metalness: 0.08,
        roughness: 0.72,
        emissive: '#e7bd72',
        emissiveIntensity: 0.22,
      }),
      cyanAccent: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.7,
        metalness: 0.3,
        roughness: 0.22,
      }),
      candleGlow: new THREE.MeshStandardMaterial({
        color: '#ffe5b0',
        emissive: '#f5b85b',
        emissiveIntensity: 1.5,
        roughness: 0.2,
      }),
    }),
    []
  );

  // Curved semi-circle of 5 grand stone & wood archive bays
  const bays = useMemo(() => {
    const radius = 4.25;
    const angles = [-1.06, -0.53, 0, 0.53, 1.06];
    return angles.map((angle, idx) => ({
      id: idx,
      x: Math.sin(angle) * radius,
      z: -Math.cos(angle) * radius + 0.4,
      rotY: -angle,
    }));
  }, []);

  // Floating candle lanterns positioned around the reading sanctuary
  const candles = useMemo(
    () => [
      { id: 0, pos: [-2.45, 2.25, -1.9], phase: 0.2 },
      { id: 1, pos: [-1.1, 2.75, -2.8], phase: 1.4 },
      { id: 2, pos: [1.1, 2.75, -2.8], phase: 2.6 },
      { id: 3, pos: [2.45, 2.25, -1.9], phase: 3.9 },
      { id: 4, pos: [-1.75, 1.55, 0.35], phase: 5.1 },
      { id: 5, pos: [1.75, 1.55, 0.35], phase: 0.9 },
    ],
    []
  );

  // Populate 120 richly tinted ancient book volumes into 1 single InstancedMesh
  useEffect(() => {
    if (!booksRef.current) return;

    const palette = [
      new THREE.Color('#6b364f'), // royal burgundy
      new THREE.Color('#3b2847'), // mystic plum
      new THREE.Color('#8e6835'), // antique ochre
      new THREE.Color('#2c3c4a'), // archive slate
      new THREE.Color('#5a392d'), // leather umber
      new THREE.Color('#b78c49'), // gilded spine
    ];

    const dummy = new THREE.Object3D();
    const bayMatrix = new THREE.Matrix4();
    const localMatrix = new THREE.Matrix4();
    const finalMatrix = new THREE.Matrix4();

    let instanceIndex = 0;
    bays.forEach((bay, bIdx) => {
      bayMatrix.makeRotationY(bay.rotY);
      bayMatrix.setPosition(bay.x, 0, bay.z);

      for (let s = 0; s < SHELVES_PER_BAY; s += 1) {
        const shelfY = 0.62 + s * 0.78;
        for (let k = 0; k < BOOKS_PER_SHELF; k += 1) {
          const seed = bIdx * 31 + s * 13 + k * 7;
          const heightScale = 0.72 + ((seed * 17) % 10) * 0.048;
          const thickScale = 0.72 + ((seed * 23) % 7) * 0.08;
          const tilt = k === BOOKS_PER_SHELF - 1 && s % 2 === 0 ? -0.14 : 0;

          const localX = -0.68 + k * 0.27;
          const localY = shelfY + 0.25 * heightScale;
          const localZ = 0.14;

          dummy.position.set(localX, localY, localZ);
          dummy.rotation.set(0, 0, tilt);
          dummy.scale.set(thickScale, heightScale, 0.95);
          dummy.updateMatrix();
          localMatrix.copy(dummy.matrix);

          finalMatrix.multiplyMatrices(bayMatrix, localMatrix);
          booksRef.current.setMatrixAt(instanceIndex, finalMatrix);
          booksRef.current.setColorAt(
            instanceIndex,
            palette[seed % palette.length]
          );
          instanceIndex += 1;
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
    document.body.style.cursor = tomeHovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [tomeHovered]);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    const targetOpenAngle =
      activeLibraryChapter === 'education' ? 0.58 : tomeHovered ? 0.42 : 0.28;

    if (leftCoverRef.current && rightCoverRef.current) {
      leftCoverRef.current.rotation.y = THREE.MathUtils.lerp(
        leftCoverRef.current.rotation.y,
        targetOpenAngle,
        dt * 5
      );
      rightCoverRef.current.rotation.y = THREE.MathUtils.lerp(
        rightCoverRef.current.rotation.y,
        -targetOpenAngle,
        dt * 5
      );
    }

    if (reducedMotion) return;

    if (tomeGroupRef.current) {
      tomeGroupRef.current.position.y = 1.46 + Math.sin(t * 1.4) * 0.06;
      tomeGroupRef.current.rotation.y = Math.sin(t * 0.55) * 0.16;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z += dt * 0.22;
      haloRef.current.rotation.x = 1.1 + Math.sin(t * 0.6) * 0.08;
    }

    if (candleLightRef.current) {
      candleLightRef.current.intensity = 2.1 + Math.sin(t * 5.2) * 0.18;
    }

    orbRefs.current.forEach((orb, idx) => {
      if (!orb) return;
      const base = candles[idx];
      orb.position.y = base.pos[1] + Math.sin(t * 1.3 + base.phase) * 0.08;
    });
  });

  return (
    <group position={[0, -0.15, -0.3]}>
      {/* Warm local archive candlelight */}
      <pointLight
        ref={candleLightRef}
        position={[0, 2.35, 0.6]}
        intensity={2.1}
        distance={12}
        decay={2}
        color="#f3c178"
      />

      {/* Sanctuary Stone Floor & Engraved Gold Astrolabe Rings */}
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
        geometry={geometries.floorRingInner}
        material={materials.cyanAccent}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.025, 0]}
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
            position={[0, 1.8, -0.04]}
          />
          <mesh
            geometry={geometries.bayPillar}
            material={materials.stone}
            position={[-0.95, 1.85, 0.08]}
          />
          <mesh
            geometry={geometries.bayPillar}
            material={materials.stone}
            position={[0.95, 1.85, 0.08]}
          />
          <mesh
            geometry={geometries.bayCap}
            material={materials.gold}
            position={[0, 3.68, 0.1]}
          />
          {[0, 1, 2, 3].map((shelfIdx) => (
            <mesh
              key={shelfIdx}
              geometry={geometries.bayShelf}
              material={materials.wood}
              position={[0, 0.59 + shelfIdx * 0.78, 0.14]}
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

      {/* Central Stone Reading Pedestal */}
      <group position={[0, 0, -0.15]}>
        <mesh
          geometry={geometries.pedestalBase}
          material={materials.stone}
          position={[0, 0.46, 0]}
        />
        <mesh
          geometry={geometries.pedestalRim}
          material={materials.gold}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.92, 0]}
        />

        {/* Interactive Floating Chronicle Tome (click to toggle Chronicle / Education chapter) */}
        <group
          ref={tomeGroupRef}
          position={[0, 1.46, 0]}
          rotation={[0.38, 0, 0]}
          onClick={(event) => {
            event.stopPropagation();
            toggleLibraryChapter();
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setTomeHovered(true);
          }}
          onPointerOut={() => setTomeHovered(false)}
        >
          <mesh
            geometry={geometries.tomeSpine}
            material={tomeHovered ? materials.goldHighlight : materials.gold}
          />
          {/* Left hinged book half */}
          <group ref={leftCoverRef} position={[-0.04, 0, 0]}>
            <mesh
              geometry={geometries.tomeCover}
              material={materials.tomeLeather}
              position={[-0.23, 0, -0.02]}
            />
            <mesh
              geometry={geometries.tomePages}
              material={materials.parchment}
              position={[-0.22, 0, 0.022]}
            />
          </group>
          {/* Right hinged book half */}
          <group ref={rightCoverRef} position={[0.04, 0, 0]}>
            <mesh
              geometry={geometries.tomeCover}
              material={materials.tomeLeather}
              position={[0.23, 0, -0.02]}
            />
            <mesh
              geometry={geometries.tomePages}
              material={materials.parchment}
              position={[0.22, 0, 0.022]}
            />
          </group>

          {/* Arcane Golden & Cyan Reading Halo */}
          <group ref={haloRef} position={[0, 0, -0.12]}>
            <mesh
              geometry={geometries.tomeHalo}
              material={tomeHovered ? materials.goldHighlight : materials.gold}
            />
            <mesh
              geometry={geometries.tomeHaloOuter}
              material={materials.cyanAccent}
              rotation={[0.45, 0.45, 0]}
            />
          </group>
        </group>
      </group>
    </group>
  );
}
