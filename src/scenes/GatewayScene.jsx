import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../store/experienceStore.js';

const VORTEX_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const VORTEX_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uWarp;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);
    if (dist > 1.0) discard;

    float angle = atan(centered.y, centered.x);
    float swirl = angle + (1.0 - dist) * (3.4 + uWarp * 2.8) - uTime * (0.42 + uHover * 0.25 + uWarp * 1.4);

    float arms = 0.5 + 0.5 * sin(swirl * 3.0 + noise(centered * 3.8 + uTime * 0.18) * 3.2);
    float filaments = 0.5 + 0.5 * cos(swirl * 6.0 - dist * 9.0 + uTime * 0.55);

    vec3 midnight = vec3(0.063, 0.051, 0.086);
    vec3 plum = vec3(0.337, 0.200, 0.302);
    vec3 gold = vec3(0.906, 0.741, 0.447);
    vec3 cyan = vec3(0.514, 0.851, 0.863);

    float rimGlow = smoothstep(0.45, 0.96, dist);
    float centerHaze = 1.0 - smoothstep(0.0, 0.52, dist);

    vec3 color = mix(midnight, plum, arms * 0.78 + rimGlow * 0.32);
    color += cyan * pow(max(filaments, 0.0001), 3.0) * (0.28 + 0.22 * uHover + 0.35 * uWarp) * (0.35 + rimGlow * 0.65);
    color += gold * pow(max(arms * rimGlow, 0.0001), 2.0) * (0.48 + 0.25 * uHover);
    color += plum * centerHaze * 0.32;

    float edgeFade = 1.0 - smoothstep(0.84, 1.0, dist);
    float alpha = clamp((0.68 + rimGlow * 0.28 + uWarp * 0.2) * edgeFade, 0.0, 0.96);

    gl_FragColor = vec4(color, alpha);
  }
`;

function createLetterAShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.62, -0.42);
  shape.lineTo(-0.48, -0.42);
  shape.lineTo(-0.41, -0.17);
  shape.lineTo(-0.23, -0.17);
  shape.lineTo(-0.16, -0.42);
  shape.lineTo(-0.02, -0.42);
  shape.lineTo(-0.26, 0.42);
  shape.lineTo(-0.38, 0.42);
  shape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-0.38, -0.05);
  hole.lineTo(-0.32, 0.22);
  hole.lineTo(-0.26, -0.05);
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

function createLetterRShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0.08, -0.42);
  shape.lineTo(0.21, -0.42);
  shape.lineTo(0.21, -0.04);
  shape.lineTo(0.32, -0.04);
  shape.lineTo(0.49, -0.42);
  shape.lineTo(0.64, -0.42);
  shape.lineTo(0.45, -0.01);
  shape.bezierCurveTo(0.61, 0.04, 0.62, 0.16, 0.62, 0.22);
  shape.bezierCurveTo(0.62, 0.36, 0.52, 0.42, 0.36, 0.42);
  shape.lineTo(0.08, 0.42);
  shape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(0.21, 0.07);
  hole.lineTo(0.35, 0.07);
  hole.bezierCurveTo(0.45, 0.07, 0.48, 0.13, 0.48, 0.19);
  hole.bezierCurveTo(0.48, 0.26, 0.44, 0.31, 0.35, 0.31);
  hole.lineTo(0.21, 0.31);
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

const DIAL_COUNT = 36;
const CIRCUIT_NODE_COUNT = 12;

export default function GatewayScene({ onEnter }) {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const [hovered, setHovered] = useState(false);

  const portalGroupRef = useRef(null);
  const outerAstrolabeRef = useRef(null);
  const midPurpleRef = useRef(null);
  const innerCyanRef = useRef(null);
  const monogramRef = useRef(null);
  const dialInstancedRef = useRef(null);
  const nodeInstancedRef = useRef(null);

  const hoverValueRef = useRef(0);
  const warpValueRef = useRef(0);

  const vortexMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VORTEX_VERTEX_SHADER,
        fragmentShader: VORTEX_FRAGMENT_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uWarp: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  const monogramGeometries = useMemo(() => {
    const extrudeSettings = {
      depth: 0.065,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 20,
    };
    const geoA = new THREE.ExtrudeGeometry(createLetterAShape(), extrudeSettings);
    const geoR = new THREE.ExtrudeGeometry(createLetterRShape(), extrudeSettings);
    geoA.translate(0, 0, -0.0325);
    geoR.translate(0, 0, -0.0325);
    return { geoA, geoR };
  }, []);

  const sharedGeometries = useMemo(
    () => ({
      vortexDisc: new THREE.CircleGeometry(1.42, 64),
      outerGoldRing: new THREE.TorusGeometry(1.76, 0.052, 20, 96),
      outerHairline: new THREE.TorusGeometry(1.9, 0.013, 12, 96),
      midPurpleRing: new THREE.TorusGeometry(1.56, 0.034, 16, 84),
      orbitalArc: new THREE.TorusGeometry(1.66, 0.015, 12, 48, Math.PI * 0.58),
      innerCyanRing: new THREE.TorusGeometry(1.32, 0.014, 12, 84),
      reticleRing: new THREE.RingGeometry(0.86, 0.89, 48),
      dialTick: new THREE.BoxGeometry(0.022, 0.11, 0.024),
      circuitNode: new THREE.OctahedronGeometry(0.044, 0),
      cardinalFinial: new THREE.OctahedronGeometry(0.075, 0),
    }),
    []
  );

  const sharedMaterials = useMemo(
    () => ({
      goldMetal: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        metalness: 0.82,
        roughness: 0.24,
        emissive: '#593e14',
        emissiveIntensity: 0.35,
      }),
      goldBright: new THREE.MeshStandardMaterial({
        color: '#f3d392',
        metalness: 0.88,
        roughness: 0.18,
        emissive: '#785419',
        emissiveIntensity: 0.42,
      }),
      purpleEnergy: new THREE.MeshStandardMaterial({
        color: '#56334d',
        metalness: 0.45,
        roughness: 0.32,
        emissive: '#8f4b84',
        emissiveIntensity: 0.72,
      }),
      cyanGlow: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        metalness: 0.25,
        roughness: 0.2,
        emissive: '#83d9dc',
        emissiveIntensity: 0.92,
      }),
      reticle: new THREE.MeshBasicMaterial({
        color: '#83d9dc',
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
    }),
    []
  );

  useEffect(() => {
    if (dialInstancedRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < DIAL_COUNT; i += 1) {
        const angle = (i / DIAL_COUNT) * Math.PI * 2;
        const isMajor = i % 3 === 0;
        const radius = 1.83;
        dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        dummy.rotation.set(0, 0, angle - Math.PI / 2);
        dummy.scale.set(isMajor ? 1.45 : 0.85, isMajor ? 1.35 : 0.75, 1);
        dummy.updateMatrix();
        dialInstancedRef.current.setMatrixAt(i, dummy.matrix);
      }
      dialInstancedRef.current.instanceMatrix.needsUpdate = true;
    }

    if (nodeInstancedRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < CIRCUIT_NODE_COUNT; i += 1) {
        const angle = (i / CIRCUIT_NODE_COUNT) * Math.PI * 2;
        const radius = 1.32;
        dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.04);
        dummy.rotation.set(0.4, angle, 0.2);
        dummy.scale.setScalar(i % 2 === 0 ? 1.1 : 0.78);
        dummy.updateMatrix();
        nodeInstancedRef.current.setMatrixAt(i, dummy.matrix);
      }
      nodeInstancedRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  useEffect(() => {
    return () => {
      vortexMaterial.dispose();
      monogramGeometries.geoA.dispose();
      monogramGeometries.geoR.dispose();
      Object.values(sharedGeometries).forEach((geo) => geo.dispose());
      Object.values(sharedMaterials).forEach((mat) => mat.dispose());
    };
  }, [vortexMaterial, monogramGeometries, sharedGeometries, sharedMaterials]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const speedBoost = 1 + hoverValueRef.current * 0.55 + warpValueRef.current * 3.5;

    hoverValueRef.current = THREE.MathUtils.lerp(
      hoverValueRef.current,
      hovered ? 1 : 0,
      dt * 5
    );
    warpValueRef.current = THREE.MathUtils.lerp(
      warpValueRef.current,
      isTransitioning ? 1 : 0,
      dt * 4
    );

    vortexMaterial.uniforms.uHover.value = hoverValueRef.current;
    vortexMaterial.uniforms.uWarp.value = warpValueRef.current;

    if (reducedMotion) return;

    vortexMaterial.uniforms.uTime.value += dt * speedBoost;

    if (outerAstrolabeRef.current) {
      outerAstrolabeRef.current.rotation.z -= dt * 0.14 * speedBoost;
    }
    if (midPurpleRef.current) {
      midPurpleRef.current.rotation.z += dt * 0.24 * speedBoost;
    }
    if (innerCyanRef.current) {
      innerCyanRef.current.rotation.z -= dt * 0.34 * speedBoost;
    }
    if (monogramRef.current) {
      monogramRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 1.3) * 0.035;
      monogramRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.75) * 0.08;
    }
    if (portalGroupRef.current) {
      const targetScale = 0.86 * (1 + hoverValueRef.current * 0.035);
      portalGroupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(portalGroupRef.current.scale.x, targetScale, dt * 4)
      );
    }
  });

  const handlePortalClick = (event) => {
    event.stopPropagation();
    if (!isTransitioning && onEnter) {
      onEnter();
    }
  };

  return (
    <group
      ref={portalGroupRef}
      position={[0, 0.82, 0]}
      scale={0.86}
      onClick={handlePortalClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Procedural GLSL cosmic vortex core */}
      <mesh
        geometry={sharedGeometries.vortexDisc}
        material={vortexMaterial}
        position={[0, 0, -0.08]}
      />

      {/* Outer Ancient Gold Astrolabe Ring + 36 Instanced Dial Ticks + 4 Cardinal Finials */}
      <group ref={outerAstrolabeRef}>
        <mesh
          geometry={sharedGeometries.outerGoldRing}
          material={sharedMaterials.goldMetal}
        />
        <mesh
          geometry={sharedGeometries.outerHairline}
          material={sharedMaterials.goldBright}
        />
        <instancedMesh
          ref={dialInstancedRef}
          args={[sharedGeometries.dialTick, sharedMaterials.goldBright, DIAL_COUNT]}
        />
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle) => (
          <mesh
            key={angle}
            geometry={sharedGeometries.cardinalFinial}
            material={sharedMaterials.goldBright}
            position={[Math.cos(angle) * 1.96, Math.sin(angle) * 1.96, 0.04]}
            rotation={[0, 0, angle]}
          />
        ))}
      </group>

      {/* Mid Royal Purple Dimensional Ring + Tilted Orbital Energy Arcs */}
      <group ref={midPurpleRef}>
        <mesh
          geometry={sharedGeometries.midPurpleRing}
          material={sharedMaterials.purpleEnergy}
          position={[0, 0, 0.02]}
        />
        <mesh
          geometry={sharedGeometries.orbitalArc}
          material={sharedMaterials.goldMetal}
          rotation={[0.24, 0.16, 0]}
        />
        <mesh
          geometry={sharedGeometries.orbitalArc}
          material={sharedMaterials.purpleEnergy}
          rotation={[-0.22, 0.18, (Math.PI * 2) / 3]}
        />
        <mesh
          geometry={sharedGeometries.orbitalArc}
          material={sharedMaterials.cyanGlow}
          rotation={[0.18, -0.24, (Math.PI * 4) / 3]}
        />
      </group>

      {/* Inner AI Cyan Holographic Circuit Ring + 12 Instanced Nodes */}
      <group ref={innerCyanRef}>
        <mesh
          geometry={sharedGeometries.innerCyanRing}
          material={sharedMaterials.cyanGlow}
          position={[0, 0, 0.04]}
        />
        <instancedMesh
          ref={nodeInstancedRef}
          args={[
            sharedGeometries.circuitNode,
            sharedMaterials.cyanGlow,
            CIRCUIT_NODE_COUNT,
          ]}
        />
      </group>

      {/* Central Sculptural 3D "AR" Monogram + Reticle */}
      <group ref={monogramRef} position={[0, 0, 0.12]}>
        <mesh
          geometry={sharedGeometries.reticleRing}
          material={sharedMaterials.reticle}
          position={[0, 0, -0.04]}
        />
        <mesh
          geometry={monogramGeometries.geoA}
          material={sharedMaterials.goldBright}
        />
        <mesh
          geometry={monogramGeometries.geoR}
          material={sharedMaterials.goldBright}
        />
      </group>
    </group>
  );
}
