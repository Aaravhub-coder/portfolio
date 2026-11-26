import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../../store/experienceStore.js';

const BAR_COUNT = 26;
// Stylized illustrative heights for the visual metaphor (not real stock data)
const BAR_HEIGHTS = [
  0.45, 0.52, 0.48, 0.62, 0.58, 0.72, 1.85, 0.68, 0.64, 0.78, 0.74, 0.85,
  0.82, 2.25, 0.9, 0.84, 0.76, 0.88, 1.95, 0.92, 0.86, 0.96, 1.04, 2.1, 0.95,
  0.88,
];
const ANOMALY_INDICES = [6, 13, 18, 23];

export default function StockUniverseWorld() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const groupRef = useRef(null);
  const barsRef = useRef(null);
  const ringRefs = useRef([]);

  const geometries = useMemo(() => {
    const curvePoints = BAR_HEIGHTS.map((h, idx) => {
      const x = -2.5 + (idx / (BAR_COUNT - 1)) * 5.0;
      const z = Math.sin(idx * 0.42) * 0.55;
      return new THREE.Vector3(x, h + 0.22, z);
    });
    const curve = new THREE.CatmullRomCurve3(curvePoints);

    return {
      baseDisc: new THREE.CylinderGeometry(3.15, 3.4, 0.14, 48),
      baseRing: new THREE.TorusGeometry(2.95, 0.02, 10, 84),
      gridRing: new THREE.TorusGeometry(1.95, 0.012, 8, 64),
      bar: new THREE.BoxGeometry(0.12, 1, 0.12),
      trendTube: new THREE.TubeGeometry(curve, 72, 0.018, 8, false),
      anomalyBeacon: new THREE.OctahedronGeometry(0.11, 0),
      anomalyRing: new THREE.TorusGeometry(0.24, 0.012, 8, 32),
    };
  }, []);

  const materials = useMemo(
    () => ({
      base: new THREE.MeshStandardMaterial({
        color: '#171122',
        metalness: 0.55,
        roughness: 0.48,
      }),
      barInstanced: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.42,
        roughness: 0.34,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#a87624',
        emissiveIntensity: 0.72,
        metalness: 0.8,
        roughness: 0.22,
      }),
      cyan: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.85,
        metalness: 0.3,
        roughness: 0.2,
      }),
      anomalyAlert: new THREE.MeshStandardMaterial({
        color: '#f7c978',
        emissive: '#e69845',
        emissiveIntensity: 1.15,
        metalness: 0.65,
        roughness: 0.2,
      }),
    }),
    []
  );

  const anomalyMarkers = useMemo(
    () =>
      ANOMALY_INDICES.map((idx) => ({
        idx,
        x: -2.5 + (idx / (BAR_COUNT - 1)) * 5.0,
        y: BAR_HEIGHTS[idx] + 0.36,
        z: Math.sin(idx * 0.42) * 0.55,
      })),
    []
  );

  useEffect(() => {
    if (!barsRef.current) return;
    const dummy = new THREE.Object3D();
    const normalColor = new THREE.Color('#5b9aa8');
    const plumColor = new THREE.Color('#6b4166');
    const anomalyColor = new THREE.Color('#e7bd72');

    for (let i = 0; i < BAR_COUNT; i += 1) {
      const h = BAR_HEIGHTS[i];
      const x = -2.5 + (i / (BAR_COUNT - 1)) * 5.0;
      const z = Math.sin(i * 0.42) * 0.55;
      dummy.position.set(x, h / 2 + 0.04, z);
      dummy.scale.set(1, h, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      barsRef.current.setMatrixAt(i, dummy.matrix);

      const isAnomaly = ANOMALY_INDICES.includes(i);
      barsRef.current.setColorAt(
        i,
        isAnomaly ? anomalyColor : i % 2 === 0 ? normalColor : plumColor
      );
    }

    barsRef.current.instanceMatrix.needsUpdate = true;
    if (barsRef.current.instanceColor) {
      barsRef.current.instanceColor.needsUpdate = true;
    }
  }, []);

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

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.28) * 0.24;
    }

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      ring.rotation.z += dt * 1.1;
      const pulse = 1 + Math.sin(t * 2.6 + i * 1.3) * 0.14;
      ring.scale.setScalar(pulse);
    });
  });

  return (
    <group ref={groupRef} position={[0, -0.1, -0.25]}>
      <pointLight position={[0, 2.4, 1.2]} intensity={1.8} distance={11} decay={2} color="#e7bd72" />

      <mesh geometry={geometries.baseDisc} material={materials.base} position={[0, -0.07, 0]} />
      <mesh
        geometry={geometries.baseRing}
        material={materials.gold}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      />
      <mesh
        geometry={geometries.gridRing}
        material={materials.cyan}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.025, 0]}
      />

      {/* 26 Instanced Market Volume/Price Bars (1 draw call) */}
      <instancedMesh
        ref={barsRef}
        args={[geometries.bar, materials.barInstanced, BAR_COUNT]}
      />

      {/* Luminous Trend Trajectory Ribbon */}
      <mesh geometry={geometries.trendTube} material={materials.cyan} />

      {/* Anomaly Spike Beacons & Scanning Reticles */}
      {anomalyMarkers.map((marker, i) => (
        <group key={marker.idx} position={[marker.x, marker.y, marker.z]}>
          <mesh geometry={geometries.anomalyBeacon} material={materials.anomalyAlert} />
          <mesh
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            geometry={geometries.anomalyRing}
            material={materials.cyan}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
}
