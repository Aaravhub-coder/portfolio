import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../../store/experienceStore.js';

export default function SolarPlanetWorld() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const planetGroupRef = useRef(null);
  const sunOrbitRef = useRef(null);

  const geometries = useMemo(
    () => ({
      planet: new THREE.IcosahedronGeometry(1.18, 2),
      orbitRing: new THREE.TorusGeometry(2.05, 0.018, 10, 84),
      orbitRingInner: new THREE.TorusGeometry(1.58, 0.012, 8, 64),
      sun: new THREE.SphereGeometry(0.32, 24, 24),
      sunHalo: new THREE.TorusGeometry(0.46, 0.014, 10, 48),
      panelFrame: new THREE.BoxGeometry(0.56, 0.04, 0.36),
      panelCells: new THREE.BoxGeometry(0.5, 0.048, 0.3),
      panelStrut: new THREE.CylinderGeometry(0.025, 0.035, 0.2, 8),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      planetSurface: new THREE.MeshStandardMaterial({
        color: '#2c223c',
        metalness: 0.28,
        roughness: 0.74,
        flatShading: true,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#94671b',
        emissiveIntensity: 0.48,
        metalness: 0.82,
        roughness: 0.22,
      }),
      sunCore: new THREE.MeshStandardMaterial({
        color: '#ffe4a3',
        emissive: '#f5b851',
        emissiveIntensity: 1.5,
        roughness: 0.2,
      }),
      solarCell: new THREE.MeshStandardMaterial({
        color: '#1f4f68',
        emissive: '#3b8da3',
        emissiveIntensity: 0.48,
        metalness: 0.72,
        roughness: 0.16,
      }),
      cyanAccent: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.75,
        metalness: 0.3,
        roughness: 0.24,
      }),
    }),
    []
  );

  // 6 stylized rooftop solar panel arrays mounted radially around the planet's sunlit hemisphere
  const panelMounts = useMemo(() => {
    const dirs = [
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0.75, 0.65, 0.15).normalize(),
      new THREE.Vector3(-0.75, 0.65, 0.15).normalize(),
      new THREE.Vector3(0.32, 0.68, 0.66).normalize(),
      new THREE.Vector3(-0.32, 0.68, -0.66).normalize(),
      new THREE.Vector3(0.55, 0.35, -0.76).normalize(),
    ];
    const up = new THREE.Vector3(0, 1, 0);
    return dirs.map((dir, idx) => {
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      const euler = new THREE.Euler().setFromQuaternion(quat);
      return {
        id: idx,
        position: dir.clone().multiplyScalar(1.22).toArray(),
        rotation: [euler.x, euler.y, euler.z],
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const dt = Math.min(delta, 0.05);
    if (planetGroupRef.current) {
      planetGroupRef.current.rotation.y += dt * 0.22;
    }
    if (sunOrbitRef.current) {
      sunOrbitRef.current.rotation.y -= dt * 0.32;
    }
  });

  return (
    <group position={[0, 1.12, -0.3]}>
      {/* Orbiting Radiant Sun & Golden Sunlight */}
      <group ref={sunOrbitRef}>
        <group position={[1.95, 1.05, 0.65]}>
          <pointLight intensity={3.0} distance={14} decay={2} color="#ffcf77" />
          <mesh geometry={geometries.sun} material={materials.sunCore} />
          <mesh
            geometry={geometries.sunHalo}
            material={materials.gold}
            rotation={[Math.PI / 3, 0.4, 0]}
          />
        </group>
      </group>

      {/* Orbital Energy Rings */}
      <mesh
        geometry={geometries.orbitRing}
        material={materials.gold}
        rotation={[Math.PI / 2.25, 0.22, 0]}
      />
      <mesh
        geometry={geometries.orbitRingInner}
        material={materials.cyanAccent}
        rotation={[Math.PI / 2.05, -0.26, 0]}
      />

      {/* Rotating Solar Planet + Rooftop Solar Arrays */}
      <group ref={planetGroupRef}>
        <mesh geometry={geometries.planet} material={materials.planetSurface} />
        {panelMounts.map((mount) => (
          <group
            key={mount.id}
            position={mount.position}
            rotation={mount.rotation}
          >
            <mesh
              geometry={geometries.panelStrut}
              material={materials.gold}
              position={[0, 0.04, 0]}
            />
            <group position={[0, 0.14, 0]} rotation={[0.18, 0, 0]}>
              <mesh geometry={geometries.panelFrame} material={materials.gold} />
              <mesh
                geometry={geometries.panelCells}
                material={materials.solarCell}
                position={[0, 0.012, 0]}
              />
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}
