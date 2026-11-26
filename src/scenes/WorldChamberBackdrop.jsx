import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../store/experienceStore.js';

/**
 * Lightweight on-demand 3D sanctuary chamber used in M2 for the 5 destination routes.
 * Replaced individually by rich dedicated worlds in M3 (Library & AI Lab),
 * M4 (6 Project Worlds), and M5 (Achievement Hall & Contact Portal).
 */
export default function WorldChamberBackdrop({
  primaryColor = '#e7bd72',
  secondaryColor = '#83d9dc',
}) {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const groupRef = useRef(null);

  const geometries = useMemo(
    () => ({
      outer: new THREE.TorusGeometry(2.15, 0.028, 16, 84),
      inner: new THREE.TorusGeometry(1.58, 0.016, 12, 64),
      core: new THREE.OctahedronGeometry(0.45, 0),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      primary: new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity: 0.42,
        metalness: 0.78,
        roughness: 0.24,
      }),
      secondary: new THREE.MeshStandardMaterial({
        color: secondaryColor,
        emissive: secondaryColor,
        emissiveIntensity: 0.65,
        metalness: 0.35,
        roughness: 0.25,
      }),
    }),
    [primaryColor, secondaryColor]
  );

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    groupRef.current.rotation.y += dt * 0.24;
    groupRef.current.position.y = 0.75 + Math.sin(state.clock.elapsedTime) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, 0.75, -1.6]}>
      <mesh
        geometry={geometries.outer}
        material={materials.primary}
        rotation={[0.4, 0.2, 0]}
      />
      <mesh
        geometry={geometries.inner}
        material={materials.secondary}
        rotation={[-0.5, 0.35, 0]}
      />
      <mesh geometry={geometries.core} material={materials.primary} />
    </group>
  );
}
