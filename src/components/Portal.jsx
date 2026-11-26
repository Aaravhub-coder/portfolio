import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useExperienceStore } from '../store/experienceStore.js';

const PORTAL_VORTEX_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PORTAL_VORTEX_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uActive;
  uniform vec3 uAccent;
  uniform vec3 uSecondary;
  varying vec2 vUv;

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);
    if (dist > 1.0) discard;

    float angle = atan(centered.y, centered.x);
    float swirl = angle + (1.0 - dist) * 3.1 - uTime * (0.55 + uActive * 0.75);

    float wave = 0.5 + 0.5 * sin(swirl * 3.0 - dist * 5.0);
    float pulse = 0.5 + 0.5 * cos(swirl * 5.0 + uTime * 0.9);
    float rim = smoothstep(0.42, 0.96, dist);

    vec3 midnight = vec3(0.063, 0.051, 0.086);
    vec3 color = mix(midnight, uSecondary, wave * 0.62 + rim * 0.25);
    color += uAccent * pow(max(pulse * rim, 0.0001), 2.0) * (0.55 + uActive * 0.55);
    color += uAccent * (1.0 - smoothstep(0.0, 0.45, dist)) * (0.14 + uActive * 0.16);

    float edgeFade = 1.0 - smoothstep(0.84, 1.0, dist);
    float alpha = clamp((0.68 + rim * 0.24 + uActive * 0.15) * edgeFade, 0.0, 0.95);
    gl_FragColor = vec4(color, alpha);
  }
`;

function PortalSigil({ sigil, materials }) {
  switch (sigil) {
    case 'tome':
      return (
        <group>
          <mesh material={materials.accent}>
            <boxGeometry args={[0.34, 0.42, 0.07]} />
          </mesh>
          <mesh position={[0, 0, 0.045]} material={materials.secondary}>
            <boxGeometry args={[0.24, 0.3, 0.02]} />
          </mesh>
        </group>
      );
    case 'neural':
      return (
        <group>
          <mesh material={materials.accent}>
            <octahedronGeometry args={[0.24, 0]} />
          </mesh>
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]} material={materials.wireframe}>
            <icosahedronGeometry args={[0.36, 0]} />
          </mesh>
        </group>
      );
    case 'constellation':
      return (
        <group>
          <mesh material={materials.accent}>
            <dodecahedronGeometry args={[0.22, 0]} />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0.3, 0]} material={materials.secondary}>
            <torusGeometry args={[0.38, 0.014, 8, 36]} />
          </mesh>
          <mesh rotation={[-Math.PI / 3, -0.3, 0]} material={materials.accent}>
            <torusGeometry args={[0.45, 0.012, 8, 36]} />
          </mesh>
        </group>
      );
    case 'crest':
      return (
        <group>
          <mesh material={materials.accent}>
            <octahedronGeometry args={[0.25, 0]} />
          </mesh>
          <mesh material={materials.secondary}>
            <torusGeometry args={[0.36, 0.02, 10, 32]} />
          </mesh>
        </group>
      );
    case 'beacon':
    default:
      return (
        <group>
          <mesh material={materials.accent}>
            <sphereGeometry args={[0.14, 16, 16]} />
          </mesh>
          <mesh material={materials.accent}>
            <torusGeometry args={[0.27, 0.015, 10, 32]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.secondary}>
            <torusGeometry args={[0.37, 0.012, 10, 32]} />
          </mesh>
        </group>
      );
  }
}

export default function Portal({
  portal,
  sharedGeometries,
  sharedRingMaterials,
  onSelect,
}) {
  const hoveredPortal = useExperienceStore((s) => s.hoveredPortal);
  const setHoveredPortal = useExperienceStore((s) => s.setHoveredPortal);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  const isHighlighted = hoveredPortal === portal.id;

  const rootRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const sigilRef = useRef(null);
  const activeMixRef = useRef(0);

  const vortexMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PORTAL_VORTEX_VERTEX,
        fragmentShader: PORTAL_VORTEX_FRAGMENT,
        uniforms: {
          uTime: { value: Math.random() * 10 },
          uActive: { value: 0 },
          uAccent: { value: new THREE.Color(portal.accent) },
          uSecondary: { value: new THREE.Color(portal.secondaryAccent) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [portal.accent, portal.secondaryAccent]
  );

  const sigilMaterials = useMemo(
    () => ({
      accent: new THREE.MeshStandardMaterial({
        color: portal.accent,
        emissive: portal.accent,
        emissiveIntensity: 0.55,
        metalness: 0.65,
        roughness: 0.24,
      }),
      secondary: new THREE.MeshStandardMaterial({
        color: portal.secondaryAccent,
        emissive: portal.secondaryAccent,
        emissiveIntensity: 0.45,
        metalness: 0.5,
        roughness: 0.3,
      }),
      wireframe: new THREE.MeshBasicMaterial({
        color: portal.accent,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      }),
    }),
    [portal.accent, portal.secondaryAccent]
  );

  useEffect(() => {
    return () => {
      vortexMaterial.dispose();
      Object.values(sigilMaterials).forEach((m) => m.dispose());
    };
  }, [vortexMaterial, sigilMaterials]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    activeMixRef.current = THREE.MathUtils.lerp(
      activeMixRef.current,
      isHighlighted ? 1 : 0,
      dt * 6
    );
    vortexMaterial.uniforms.uActive.value = activeMixRef.current;

    if (rootRef.current) {
      const targetScale = portal.scale * (1 + activeMixRef.current * 0.075);
      rootRef.current.scale.setScalar(
        THREE.MathUtils.lerp(rootRef.current.scale.x, targetScale, dt * 5)
      );
    }

    if (reducedMotion) return;

    const speed = 1 + activeMixRef.current * 1.15;
    vortexMaterial.uniforms.uTime.value += dt * speed;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= dt * 0.2 * speed;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += dt * 0.34 * speed;
    }
    if (sigilRef.current) {
      sigilRef.current.rotation.y += dt * 0.65 * speed;
      sigilRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 1.6 + portal.position[0]) * 0.04;
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (!isTransitioning && onSelect) {
      onSelect(portal);
    }
  };

  return (
    <group
      ref={rootRef}
      position={portal.position}
      rotation={[0, portal.rotationY, 0]}
      scale={portal.scale}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHoveredPortal(portal.id);
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        if (hoveredPortal === portal.id) {
          setHoveredPortal(null);
        }
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'auto';
        }
      }}
    >
      {/* Stone-metallic plinth base */}
      <mesh
        geometry={sharedGeometries.pedestal}
        material={sharedRingMaterials.pedestal}
        position={[0, -1.12, 0]}
      />
      <mesh
        geometry={sharedGeometries.pedestalTrim}
        material={sharedRingMaterials.gold}
        position={[0, -0.97, 0]}
      />

      {/* Glowing portal vortex disc */}
      <mesh
        geometry={sharedGeometries.vortexDisc}
        material={vortexMaterial}
        position={[0, 0, -0.04]}
      />

      {/* Outer antique gold ring */}
      <group ref={outerRingRef}>
        <mesh
          geometry={sharedGeometries.outerRing}
          material={
            isHighlighted
              ? sharedRingMaterials.goldHighlight
              : sharedRingMaterials.gold
          }
        />
        <mesh
          geometry={sharedGeometries.outerHalo}
          material={sharedRingMaterials.purple}
        />
      </group>

      {/* Inner cyan circuit ring */}
      <group ref={innerRingRef}>
        <mesh
          geometry={sharedGeometries.innerRing}
          material={
            portal.accent === '#83D9DC'
              ? sharedRingMaterials.cyan
              : sharedRingMaterials.gold
          }
          position={[0, 0, 0.03]}
        />
      </group>

      {/* Floating realm sigil */}
      <group ref={sigilRef} position={[0, 0, 0.14]}>
        <PortalSigil sigil={portal.sigil} materials={sigilMaterials} />
      </group>

      {/* World-anchored floating micro-badge (desktop; hidden on small screens via CSS) */}
      {!isTransitioning && (
        <Html
          position={[0, -1.34, 0.1]}
          center
          zIndexRange={[5, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`portal-world-badge ${isHighlighted ? 'portal-world-badge--active' : ''}`}
          >
            <span className="portal-world-badge__title">{portal.title}</span>
            <span className="portal-world-badge__sub">{portal.subtitle}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
