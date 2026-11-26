import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../../store/experienceStore.js';

const MODULES = [
  { x: -1.15, z: -0.75, w: 0.65, h: 1.35, d: 0.65, accent: 'cyan' },
  { x: -0.1, z: -1.05, w: 0.78, h: 1.95, d: 0.72, accent: 'gold' },
  { x: 1.05, z: -0.65, w: 0.62, h: 1.5, d: 0.62, accent: 'cyan' },
  { x: -0.9, z: 0.55, w: 0.58, h: 0.95, d: 0.58, accent: 'gold' },
  { x: 0.15, z: 0.25, w: 0.85, h: 1.25, d: 0.78, accent: 'cyan' },
  { x: 1.15, z: 0.55, w: 0.56, h: 1.08, d: 0.56, accent: 'gold' },
];

export default function BuilderWorkshopWorld() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const cityRef = useRef(null);
  const gearARef = useRef(null);
  const gearBRef = useRef(null);

  const geometries = useMemo(() => {
    // Blueprint grid lines (1 draw call)
    const lines = [];
    const extent = 2.4;
    const step = 0.48;
    for (let v = -extent; v <= extent + 0.001; v += step) {
      lines.push(-extent, 0.03, v, extent, 0.03, v);
      lines.push(v, 0.03, -extent, v, 0.03, extent);
    }
    const blueprintGrid = new THREE.BufferGeometry();
    blueprintGrid.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(lines, 3)
    );

    return {
      blueprintGrid,
      tableBase: new THREE.BoxGeometry(5.2, 0.16, 5.2),
      block: new THREE.BoxGeometry(1, 1, 1),
      roofCap: new THREE.BoxGeometry(1.04, 0.05, 1.04),
      gearOuter: new THREE.TorusGeometry(0.75, 0.035, 10, 16),
      gearInner: new THREE.TorusGeometry(0.52, 0.028, 10, 12),
      haloRing: new THREE.TorusGeometry(2.7, 0.018, 10, 84),
    };
  }, []);

  const materials = useMemo(
    () => ({
      table: new THREE.MeshStandardMaterial({
        color: '#181224',
        metalness: 0.48,
        roughness: 0.58,
      }),
      towerBody: new THREE.MeshStandardMaterial({
        color: '#291d36',
        metalness: 0.4,
        roughness: 0.52,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#8f6218',
        emissiveIntensity: 0.52,
        metalness: 0.84,
        roughness: 0.22,
      }),
      cyan: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.78,
        metalness: 0.32,
        roughness: 0.2,
      }),
      gridLine: new THREE.LineBasicMaterial({
        color: '#83d9dc',
        transparent: true,
        opacity: 0.26,
      }),
    }),
    []
  );

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    if (cityRef.current) {
      cityRef.current.rotation.y = Math.sin(t * 0.28) * 0.32;
    }
    if (gearARef.current) {
      gearARef.current.rotation.z += dt * 0.42;
    }
    if (gearBRef.current) {
      gearBRef.current.rotation.z -= dt * 0.6;
    }
  });

  return (
    <group ref={cityRef} position={[0, -0.05, -0.35]}>
      <pointLight position={[0.4, 2.6, 1.5]} intensity={1.9} distance={12} decay={2} color="#83d9dc" />

      {/* Illuminated Blueprint Drafting Table */}
      <mesh geometry={geometries.tableBase} material={materials.table} position={[0, -0.08, 0]} />
      <lineSegments geometry={geometries.blueprintGrid} material={materials.gridLine} />
      <mesh
        geometry={geometries.haloRing}
        material={materials.gold}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
      />

      {/* Modular Illuminated Innovation City / Builder Blocks */}
      {MODULES.map((mod, idx) => (
        <group key={idx} position={[mod.x, mod.h / 2 + 0.02, mod.z]}>
          <mesh
            geometry={geometries.block}
            material={materials.towerBody}
            scale={[mod.w, mod.h, mod.d]}
          />
          <mesh
            geometry={geometries.roofCap}
            material={mod.accent === 'gold' ? materials.gold : materials.cyan}
            position={[0, mod.h / 2 + 0.02, 0]}
            scale={[mod.w, 1, mod.d]}
          />
        </group>
      ))}

      {/* Interlocking Inventor's Workshop Brass Gears */}
      <mesh
        ref={gearARef}
        geometry={geometries.gearOuter}
        material={materials.gold}
        position={[-1.45, 2.05, -1.25]}
      />
      <mesh
        ref={gearBRef}
        geometry={geometries.gearInner}
        material={materials.cyan}
        position={[-0.3, 2.38, -1.25]}
      />
    </group>
  );
}
