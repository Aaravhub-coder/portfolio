import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../../store/experienceStore.js';

const CRATERS = [
  { x: -0.9, z: -0.5, r: 0.72, depth: 0.22 },
  { x: 0.85, z: -0.25, r: 0.62, depth: 0.18 },
  { x: -0.15, z: 0.85, r: 0.55, depth: 0.16 },
  { x: 1.2, z: 0.95, r: 0.42, depth: 0.12 },
  { x: -1.45, z: 0.55, r: 0.46, depth: 0.13 },
];

function buildLunarSurfaceGeometry() {
  const geo = new THREE.PlaneGeometry(5.6, 5.6, 44, 44);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const radialDist = Math.hypot(x, z);

    // Gentle dome curvature tapering toward edge of lunar horizon disc
    let y = Math.max(0, 1 - (radialDist / 2.95) ** 2) * 0.34;
    y += Math.sin(x * 2.1) * Math.cos(z * 2.3) * 0.035;

    CRATERS.forEach((crater) => {
      const d = Math.hypot(x - crater.x, z - crater.z);
      if (d < crater.r * 1.35) {
        const norm = d / crater.r;
        if (norm < 1) {
          // Concave crater bowl
          y -= (1 - norm * norm) * crater.depth;
        } else {
          // Subtle raised crater rim
          const rimFactor = 1 - (norm - 1) / 0.35;
          y += rimFactor * rimFactor * crater.depth * 0.32;
        }
      }
    });

    if (radialDist > 2.8) {
      y -= (radialDist - 2.8) * 0.65;
    }

    pos.setY(i, y);
  }

  geo.computeVertexNormals();
  return geo;
}

export default function LunarStationWorld() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const orbiterRef = useRef(null);
  const sunLightRef = useRef(null);

  const geometries = useMemo(
    () => ({
      terrain: buildLunarSurfaceGeometry(),
      horizonRing: new THREE.TorusGeometry(2.86, 0.02, 10, 84),
      orbitTrack: new THREE.TorusGeometry(1.75, 0.01, 8, 72),
      probeBody: new THREE.OctahedronGeometry(0.18, 0),
      solarWing: new THREE.BoxGeometry(0.54, 0.02, 0.16),
      scanBeam: new THREE.ConeGeometry(0.68, 1.85, 24, 1, true),
      landmarkPin: new THREE.RingGeometry(0.08, 0.13, 24),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      regolith: new THREE.MeshStandardMaterial({
        color: '#8b8a99',
        metalness: 0.12,
        roughness: 0.92,
        flatShading: true,
      }),
      goldFoil: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#8f6218',
        emissiveIntensity: 0.55,
        metalness: 0.88,
        roughness: 0.22,
      }),
      cyanPanel: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#4ba7b3',
        emissiveIntensity: 0.72,
        metalness: 0.55,
        roughness: 0.22,
      }),
      scanCone: new THREE.MeshBasicMaterial({
        color: '#83d9dc',
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      landmarkGold: new THREE.MeshBasicMaterial({
        color: '#e7bd72',
        side: THREE.DoubleSide,
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

    if (orbiterRef.current) {
      orbiterRef.current.rotation.y += dt * 0.34;
    }

    // Subtle low-angle sun sweep illustrating lunar illumination variation
    if (sunLightRef.current) {
      const sunAngle = t * 0.22;
      sunLightRef.current.position.set(
        Math.cos(sunAngle) * 4.5,
        1.75,
        Math.sin(sunAngle) * 4.5
      );
    }
  });

  return (
    <group position={[0, 0.05, -0.3]}>
      {/* Low-angle directional lunar illumination */}
      <pointLight
        ref={sunLightRef}
        position={[4.2, 1.75, 1.6]}
        intensity={2.8}
        distance={16}
        decay={1.8}
        color="#f6e7c9"
      />

      {/* Sculpted Cratered Lunar Regolith Terrain */}
      <mesh geometry={geometries.terrain} material={materials.regolith} />
      <mesh
        geometry={geometries.horizonRing}
        material={materials.goldFoil}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
      />

      {/* Surface Correspondence Reference Rings */}
      {CRATERS.slice(0, 3).map((crater, idx) => (
        <mesh
          key={idx}
          geometry={geometries.landmarkPin}
          material={materials.landmarkGold}
          position={[crater.x, 0.24, crater.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      ))}

      {/* Orbital Track Ring */}
      <mesh
        geometry={geometries.orbitTrack}
        material={materials.cyanPanel}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 2.05, 0]}
      />

      {/* Orbiting Optical Research Probe + Translucent Scan Frustum */}
      <group ref={orbiterRef} position={[0, 2.05, 0]}>
        <group position={[1.75, 0, 0]}>
          <mesh geometry={geometries.probeBody} material={materials.goldFoil} />
          <mesh
            geometry={geometries.solarWing}
            material={materials.cyanPanel}
            position={[0.45, 0, 0]}
          />
          <mesh
            geometry={geometries.solarWing}
            material={materials.cyanPanel}
            position={[-0.45, 0, 0]}
          />
          <mesh
            geometry={geometries.scanBeam}
            material={materials.scanCone}
            position={[0, -0.95, 0]}
          />
        </group>
      </group>
    </group>
  );
}
