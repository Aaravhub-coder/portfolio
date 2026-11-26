import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../../store/experienceStore.js';

export default function EntityMatchingWorld() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const clusterRef = useRef(null);
  const coreRef = useRef(null);

  const { leftNodes, rightNodes, bridgePositions } = useMemo(() => {
    const left = [
      [-1.75, 1.9, 0.35],
      [-1.55, 1.35, -0.45],
      [-1.85, 0.85, 0.25],
      [-1.3, 1.65, 0.65],
      [-1.35, 0.95, -0.55],
      [-1.9, 1.45, -0.05],
    ];
    const right = [
      [1.75, 1.85, -0.25],
      [1.55, 1.4, 0.45],
      [1.82, 0.88, -0.32],
      [1.32, 1.68, -0.6],
      [1.38, 0.92, 0.55],
      [1.92, 1.4, 0.08],
    ];

    const center = [0, 1.35, 0];
    const edges = [];
    left.forEach((lPos, idx) => {
      const rPos = right[idx];
      // Connect source -> central matching prism -> target + direct candidate bridge
      edges.push(...lPos, ...center, ...center, ...rPos);
      if (idx % 2 === 0) {
        edges.push(...lPos, ...rPos);
      }
    });

    return {
      leftNodes: left,
      rightNodes: right,
      bridgePositions: new Float32Array(edges),
    };
  }, []);

  const geometries = useMemo(() => {
    const bridges = new THREE.BufferGeometry();
    bridges.setAttribute(
      'position',
      new THREE.BufferAttribute(bridgePositions, 3)
    );

    return {
      bridges,
      hexBase: new THREE.CylinderGeometry(3.0, 3.25, 0.14, 6),
      ringOuter: new THREE.TorusGeometry(2.55, 0.02, 10, 64),
      ringCenter: new THREE.TorusGeometry(0.68, 0.018, 10, 48),
      recordCard: new THREE.BoxGeometry(0.32, 0.2, 0.08),
      corePrism: new THREE.OctahedronGeometry(0.36, 0),
    };
  }, [bridgePositions]);

  const materials = useMemo(
    () => ({
      base: new THREE.MeshStandardMaterial({
        color: '#171123',
        metalness: 0.55,
        roughness: 0.48,
      }),
      cyanNode: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#4ba7b3',
        emissiveIntensity: 0.72,
        metalness: 0.35,
        roughness: 0.24,
      }),
      goldNode: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#a97723',
        emissiveIntensity: 0.65,
        metalness: 0.78,
        roughness: 0.24,
      }),
      plumRing: new THREE.MeshStandardMaterial({
        color: '#56334d',
        emissive: '#8f4b84',
        emissiveIntensity: 0.6,
        metalness: 0.45,
        roughness: 0.32,
      }),
      bridgeLine: new THREE.LineBasicMaterial({
        color: '#e7bd72',
        transparent: true,
        opacity: 0.52,
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

    if (clusterRef.current) {
      clusterRef.current.rotation.y += dt * 0.18;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= dt * 0.65;
      coreRef.current.rotation.x = Math.sin(t * 0.9) * 0.25;
    }
  });

  return (
    <group position={[0, -0.15, -0.25]}>
      <pointLight position={[0, 2.2, 1.4]} intensity={1.85} distance={11} decay={2} color="#83d9dc" />

      <mesh geometry={geometries.hexBase} material={materials.base} position={[0, -0.07, 0]} />
      <mesh
        geometry={geometries.ringOuter}
        material={materials.plumRing}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      />

      <group ref={clusterRef}>
        {/* Candidate Similarity Bridges (1 draw call) */}
        <lineSegments
          geometry={geometries.bridges}
          material={materials.bridgeLine}
        />

        {/* Source Dataset A Nodes (AI Cyan) */}
        {leftNodes.map((pos, idx) => (
          <mesh
            key={`l-${idx}`}
            geometry={geometries.recordCard}
            material={materials.cyanNode}
            position={pos}
            rotation={[0, 0.35, 0]}
          />
        ))}

        {/* Source Dataset B Nodes (Ancient Gold) */}
        {rightNodes.map((pos, idx) => (
          <mesh
            key={`r-${idx}`}
            geometry={geometries.recordCard}
            material={materials.goldNode}
            position={pos}
            rotation={[0, -0.35, 0]}
          />
        ))}

        {/* Central Entity Resolution Core */}
        <group position={[0, 1.35, 0]}>
          <mesh ref={coreRef} geometry={geometries.corePrism} material={materials.goldNode} />
          <mesh
            geometry={geometries.ringCenter}
            material={materials.cyanNode}
            rotation={[Math.PI / 2.4, 0.25, 0]}
          />
        </group>
      </group>
    </group>
  );
}
