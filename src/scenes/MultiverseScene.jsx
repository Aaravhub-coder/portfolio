import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Portal from '../components/Portal.jsx';
import { HUB_PORTALS } from '../data/profile.js';
import { useExperienceStore } from '../store/experienceStore.js';

export default function MultiverseScene({ onSelectPortal }) {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const daisRingRef = useRef(null);

  const sharedPortalGeometries = useMemo(
    () => ({
      vortexDisc: new THREE.CircleGeometry(0.76, 48),
      outerRing: new THREE.TorusGeometry(0.92, 0.044, 16, 64),
      outerHalo: new THREE.TorusGeometry(1.01, 0.016, 12, 64),
      innerRing: new THREE.TorusGeometry(0.78, 0.015, 12, 64),
      pedestal: new THREE.CylinderGeometry(0.55, 0.72, 0.28, 8),
      pedestalTrim: new THREE.TorusGeometry(0.56, 0.016, 8, 32),
    }),
    []
  );

  const sharedRingMaterials = useMemo(
    () => ({
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        metalness: 0.82,
        roughness: 0.25,
        emissive: '#593e14',
        emissiveIntensity: 0.32,
      }),
      goldHighlight: new THREE.MeshStandardMaterial({
        color: '#f7dfa8',
        metalness: 0.88,
        roughness: 0.16,
        emissive: '#a47524',
        emissiveIntensity: 0.75,
      }),
      purple: new THREE.MeshStandardMaterial({
        color: '#56334d',
        metalness: 0.45,
        roughness: 0.32,
        emissive: '#8f4b84',
        emissiveIntensity: 0.65,
      }),
      cyan: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        metalness: 0.3,
        roughness: 0.2,
        emissive: '#83d9dc',
        emissiveIntensity: 0.85,
      }),
      pedestal: new THREE.MeshStandardMaterial({
        color: '#21172b',
        metalness: 0.35,
        roughness: 0.72,
      }),
    }),
    []
  );

  const sanctuaryGeometries = useMemo(
    () => ({
      daisFloor: new THREE.CylinderGeometry(5.6, 5.9, 0.16, 48),
      daisGoldOuter: new THREE.TorusGeometry(5.35, 0.025, 12, 96),
      daisGoldMid: new THREE.TorusGeometry(3.55, 0.018, 12, 84),
      daisCyanInner: new THREE.TorusGeometry(1.85, 0.014, 12, 64),
      conduitBeam: new THREE.BoxGeometry(0.032, 0.01, 1),
    }),
    []
  );

  const sanctuaryMaterials = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({
        color: '#171020',
        metalness: 0.42,
        roughness: 0.68,
      }),
      conduit: new THREE.MeshBasicMaterial({
        color: '#83d9dc',
        transparent: true,
        opacity: 0.42,
      }),
    }),
    []
  );

  // Compute radial energy conduit lines connecting center nexus (0, 0.02, 0.4) to each portal base
  const conduits = useMemo(() => {
    const origin = new THREE.Vector3(0, 0.04, 0.75);
    return HUB_PORTALS.map((portal) => {
      const target = new THREE.Vector3(portal.position[0], 0.04, portal.position[2]);
      const diff = target.clone().sub(origin);
      const length = diff.length();
      const midpoint = origin.clone().add(diff.clone().multiplyScalar(0.5));
      const angle = Math.atan2(diff.x, diff.z);
      return { id: portal.id, midpoint, length, angle };
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(sharedPortalGeometries).forEach((g) => g.dispose());
      Object.values(sharedRingMaterials).forEach((m) => m.dispose());
      Object.values(sanctuaryGeometries).forEach((g) => g.dispose());
      Object.values(sanctuaryMaterials).forEach((m) => m.dispose());
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'auto';
      }
    };
  }, [
    sharedPortalGeometries,
    sharedRingMaterials,
    sanctuaryGeometries,
    sanctuaryMaterials,
  ]);

  useFrame((_, delta) => {
    if (reducedMotion || !daisRingRef.current) return;
    daisRingRef.current.rotation.z += Math.min(delta, 0.05) * 0.045;
  });

  return (
    <group>
      {/* Observatory Sanctuary Floor Dais */}
      <group position={[0, -0.05, -0.55]}>
        <mesh
          geometry={sanctuaryGeometries.daisFloor}
          material={sanctuaryMaterials.floor}
          position={[0, -0.08, 0]}
        />
        <group ref={daisRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <mesh
            geometry={sanctuaryGeometries.daisGoldOuter}
            material={sharedRingMaterials.gold}
          />
          <mesh
            geometry={sanctuaryGeometries.daisGoldMid}
            material={sharedRingMaterials.purple}
          />
          <mesh
            geometry={sanctuaryGeometries.daisCyanInner}
            material={sharedRingMaterials.cyan}
          />
        </group>
      </group>

      {/* Radial cyan conduits leading to each portal */}
      {conduits.map((beam) => (
        <mesh
          key={beam.id}
          geometry={sanctuaryGeometries.conduitBeam}
          material={sanctuaryMaterials.conduit}
          position={[beam.midpoint.x, 0.01, beam.midpoint.z]}
          rotation={[0, beam.angle, 0]}
          scale={[1, 1, beam.length]}
        />
      ))}

      {/* Five Interactive Multiverse Portals */}
      {HUB_PORTALS.map((portal) => (
        <Portal
          key={portal.id}
          portal={portal}
          sharedGeometries={sharedPortalGeometries}
          sharedRingMaterials={sharedRingMaterials}
          onSelect={onSelectPortal}
        />
      ))}
    </group>
  );
}
