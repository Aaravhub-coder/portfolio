import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../../store/experienceStore.js';

function createShieldShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.85);
  shape.lineTo(0.68, 0.62);
  shape.lineTo(0.62, -0.05);
  shape.bezierCurveTo(0.55, -0.52, 0.24, -0.78, 0, -0.92);
  shape.bezierCurveTo(-0.24, -0.78, -0.55, -0.52, -0.62, -0.05);
  shape.lineTo(-0.68, 0.62);
  shape.closePath();
  return shape;
}

export default function CyberFortressWorld() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const shieldRef = useRef(null);
  const firewallRef = useRef(null);
  const scanRingRef = useRef(null);

  const geometries = useMemo(() => {
    const shieldGeo = new THREE.ExtrudeGeometry(createShieldShape(), {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 3,
      curveSegments: 20,
    });
    shieldGeo.translate(0, 0, -0.07);

    return {
      shieldGeo,
      plinth: new THREE.CylinderGeometry(2.65, 2.95, 0.16, 8),
      plinthRing: new THREE.TorusGeometry(2.45, 0.024, 10, 48),
      defenseRingOuter: new THREE.TorusGeometry(1.75, 0.02, 12, 84),
      defenseRingInner: new THREE.TorusGeometry(1.38, 0.014, 10, 64),
      firewallPlate: new THREE.CylinderGeometry(0.28, 0.28, 0.04, 6),
      coreGem: new THREE.OctahedronGeometry(0.22, 0),
    };
  }, []);

  const materials = useMemo(
    () => ({
      plinth: new THREE.MeshStandardMaterial({
        color: '#171124',
        metalness: 0.58,
        roughness: 0.45,
      }),
      shieldBody: new THREE.MeshStandardMaterial({
        color: '#25394f',
        emissive: '#266575',
        emissiveIntensity: 0.52,
        metalness: 0.72,
        roughness: 0.22,
      }),
      cyanGlow: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.9,
        metalness: 0.3,
        roughness: 0.2,
      }),
      goldTrim: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#8f6218',
        emissiveIntensity: 0.5,
        metalness: 0.84,
        roughness: 0.2,
      }),
      plateHolo: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#3d8e99',
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.62,
        metalness: 0.3,
        roughness: 0.2,
      }),
    }),
    []
  );

  const plates = useMemo(() => {
    const count = 6;
    const radius = 1.92;
    return Array.from({ length: count }, (_, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      return {
        id: idx,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        rotY: -angle + Math.PI / 2,
      };
    });
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

    if (shieldRef.current) {
      shieldRef.current.rotation.y = Math.sin(t * 0.65) * 0.28;
      shieldRef.current.position.y = 1.38 + Math.sin(t * 1.4) * 0.06;
    }
    if (firewallRef.current) {
      firewallRef.current.rotation.y += dt * 0.24;
    }
    if (scanRingRef.current) {
      scanRingRef.current.rotation.z -= dt * 0.55;
      scanRingRef.current.rotation.x = 0.65 + Math.sin(t * 0.8) * 0.16;
    }
  });

  return (
    <group position={[0, -0.18, -0.25]}>
      <pointLight position={[0, 2.2, 1.5]} intensity={2.0} distance={12} decay={2} color="#83d9dc" />

      <mesh geometry={geometries.plinth} material={materials.plinth} position={[0, -0.08, 0]} />
      <mesh
        geometry={geometries.plinthRing}
        material={materials.goldTrim}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      />

      {/* Sculpted 3D Protective Shield Emblem */}
      <group ref={shieldRef} position={[0, 1.38, 0]}>
        <mesh geometry={geometries.shieldGeo} material={materials.shieldBody} />
        <mesh
          geometry={geometries.coreGem}
          material={materials.goldTrim}
          position={[0, 0.06, 0.12]}
        />
        <mesh
          geometry={geometries.defenseRingInner}
          material={materials.cyanGlow}
          position={[0, 0, -0.05]}
        />
      </group>

      {/* Tilted Scanning Defense Ring */}
      <group ref={scanRingRef} position={[0, 1.38, 0]}>
        <mesh geometry={geometries.defenseRingOuter} material={materials.goldTrim} />
      </group>

      {/* Six Orbiting Hexagonal Firewall Barrier Plates */}
      <group ref={firewallRef} position={[0, 1.25, 0]}>
        {plates.map((plate) => (
          <mesh
            key={plate.id}
            geometry={geometries.firewallPlate}
            material={materials.plateHolo}
            position={[plate.x, 0, plate.z]}
            rotation={[Math.PI / 2, plate.rotY, 0]}
          />
        ))}
      </group>
    </group>
  );
}
