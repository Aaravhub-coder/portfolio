import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useExperienceStore } from '../store/experienceStore.js';

const RELAYS = [
  { id: 'email', label: 'Email · Direct', angle: -Math.PI / 2, y: 0.45 },
  { id: 'github', label: 'GitHub · Code', angle: Math.PI / 6, y: -0.22 },
  { id: 'linkedin', label: 'LinkedIn · Network', angle: (5 * Math.PI) / 6, y: -0.22 },
];

export default function ContactScene() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const hoveredContactChannel = useExperienceStore(
    (s) => s.hoveredContactChannel
  );
  const setHoveredContactChannel = useExperienceStore(
    (s) => s.setHoveredContactChannel
  );
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const outerRingRef = useRef(null);
  const midRingRef = useRef(null);
  const coreRef = useRef(null);
  const waveRefs = useRef([]);
  const relayRefs = useRef([]);

  const geometries = useMemo(
    () => ({
      dais: new THREE.CylinderGeometry(3.0, 3.3, 0.14, 48),
      daisRing: new THREE.TorusGeometry(2.75, 0.02, 10, 84),
      outerAstrolabe: new THREE.TorusGeometry(1.52, 0.04, 16, 84),
      midAstrolabe: new THREE.TorusGeometry(1.22, 0.024, 12, 72),
      innerAstrolabe: new THREE.TorusGeometry(0.92, 0.015, 10, 64),
      beaconCore: new THREE.OctahedronGeometry(0.32, 0),
      pulseWave: new THREE.TorusGeometry(1.15, 0.012, 8, 64),
      relayOrb: new THREE.OctahedronGeometry(0.16, 1),
      relayRing: new THREE.TorusGeometry(0.25, 0.014, 8, 28),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      dais: new THREE.MeshStandardMaterial({
        color: '#171122',
        metalness: 0.55,
        roughness: 0.48,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#8f6218',
        emissiveIntensity: 0.48,
        metalness: 0.84,
        roughness: 0.22,
      }),
      goldBright: new THREE.MeshStandardMaterial({
        color: '#fae3af',
        emissive: '#d69c38',
        emissiveIntensity: 0.92,
        metalness: 0.88,
        roughness: 0.16,
      }),
      cyan: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.88,
        metalness: 0.3,
        roughness: 0.2,
      }),
      plum: new THREE.MeshStandardMaterial({
        color: '#56334d',
        emissive: '#945289',
        emissiveIntensity: 0.62,
        metalness: 0.45,
        roughness: 0.3,
      }),
      wave: new THREE.MeshBasicMaterial({
        color: '#83d9dc',
        transparent: true,
        opacity: 0.28,
      }),
    }),
    []
  );

  const relayPositions = useMemo(() => {
    const r = 1.98;
    return RELAYS.map((relay) => ({
      ...relay,
      pos: [Math.cos(relay.angle) * r, 1.38 + relay.y, Math.sin(relay.angle) * 0.65],
    }));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'auto';
      }
    };
  }, [geometries, materials]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    relayRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const active = hoveredContactChannel === RELAYS[idx].id;
      const targetScale = active ? 1.38 : 1.0;
      mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, dt * 6));
      if (!reducedMotion) {
        mesh.rotation.y += dt * (active ? 1.4 : 0.6);
      }
    });

    if (reducedMotion) return;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= dt * 0.18;
      outerRingRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.x += dt * 0.26;
      midRingRef.current.rotation.z += dt * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= dt * 0.65;
      coreRef.current.position.y = Math.sin(t * 1.6) * 0.06;
    }

    waveRefs.current.forEach((wave, idx) => {
      if (!wave) return;
      const cycle = ((t * 0.38 + idx / 3) % 1);
      const scale = 0.72 + cycle * 1.45;
      wave.scale.setScalar(scale);
    });
  });

  const activeRelay =
    relayPositions.find((r) => r.id === hoveredContactChannel) || null;

  return (
    <group position={[0, -0.18, -0.25]}>
      <pointLight
        position={[0, 2.3, 1.5]}
        intensity={2.1}
        distance={13}
        decay={2}
        color="#83d9dc"
      />

      {/* Sanctuary Platform */}
      <mesh geometry={geometries.dais} material={materials.dais} position={[0, -0.07, 0]} />
      <mesh
        geometry={geometries.daisRing}
        material={materials.gold}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      />

      {/* Central Communication Beacon Portal */}
      <group position={[0, 1.38, 0]}>
        <group ref={outerRingRef}>
          <mesh geometry={geometries.outerAstrolabe} material={materials.gold} />
          <mesh geometry={geometries.innerAstrolabe} material={materials.cyan} />
        </group>

        <group ref={midRingRef}>
          <mesh geometry={geometries.midAstrolabe} material={materials.plum} />
        </group>

        <mesh ref={coreRef} geometry={geometries.beaconCore} material={materials.goldBright} />

        {/* Concentric Expanding Signal Waves */}
        {[0, 1, 2].map((idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              waveRefs.current[idx] = el;
            }}
            geometry={geometries.pulseWave}
            material={materials.wave}
          />
        ))}
      </group>

      {/* Three Interactive Channel Relay Nodes (Email, GitHub, LinkedIn) */}
      {relayPositions.map((relay, idx) => {
        const active = hoveredContactChannel === relay.id;
        return (
          <group
            key={relay.id}
            ref={(el) => {
              relayRefs.current[idx] = el;
            }}
            position={relay.pos}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHoveredContactChannel(relay.id);
              if (typeof document !== 'undefined') {
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={() => {
              setHoveredContactChannel(null);
              if (typeof document !== 'undefined') {
                document.body.style.cursor = 'auto';
              }
            }}
          >
            <mesh
              geometry={geometries.relayOrb}
              material={active ? materials.goldBright : materials.cyan}
            />
            <mesh
              geometry={geometries.relayRing}
              material={active ? materials.cyan : materials.gold}
              rotation={[Math.PI / 3, idx * 0.7, 0]}
            />
          </group>
        );
      })}

      {activeRelay && !isTransitioning && (
        <Html
          position={[activeRelay.pos[0], activeRelay.pos[1] + 0.36, activeRelay.pos[2]]}
          center
          zIndexRange={[6, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="portal-world-badge portal-world-badge--active">
            <span className="portal-world-badge__title">{activeRelay.label}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
