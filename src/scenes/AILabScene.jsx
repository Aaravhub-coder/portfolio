import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import * as THREE from 'three';
import { SKILL_CATEGORIES } from '../data/skills.js';
import { useExperienceStore } from '../store/experienceStore.js';

const LAYER_Y = [-0.72, -0.2, 0.34, 0.86];
const LAYER_RADIUS = [1.05, 1.55, 1.32, 1.62];

export default function AILabScene() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const selectedSkillCategory = useExperienceStore(
    (s) => s.selectedSkillCategory
  );
  const setSelectedSkillCategory = useExperienceStore(
    (s) => s.setSelectedSkillCategory
  );
  const highlightedSkill = useExperienceStore((s) => s.highlightedSkill);
  const setHighlightedSkill = useExperienceStore((s) => s.setHighlightedSkill);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const networkRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const nodeRefs = useRef([]);

  // Deterministic 4-layer 3D neural layout directly derived from verified SKILL_CATEGORIES
  const { nodes, synapsePositions } = useMemo(() => {
    const computedNodes = [];
    const byLayer = [];

    SKILL_CATEGORIES.forEach((category, layerIdx) => {
      const layerList = [];
      const count = category.items.length;
      const radius = LAYER_RADIUS[layerIdx % LAYER_RADIUS.length];
      const y = LAYER_Y[layerIdx % LAYER_Y.length];
      const phaseOffset = layerIdx * 0.78;

      category.items.forEach((item, itemIdx) => {
        const angle = phaseOffset + (itemIdx / Math.max(count, 1)) * Math.PI * 2;
        const pos = [
          Math.cos(angle) * radius,
          y + Math.sin(angle * 2) * 0.08,
          Math.sin(angle) * radius,
        ];
        const node = {
          id: `${category.id}-${item.name}`,
          name: item.name,
          familiarity: item.familiarity,
          categoryId: category.id,
          categoryTitle: category.title,
          layerIdx,
          position: pos,
          isLearning: item.familiarity.toLowerCase().includes('learning'),
        };
        computedNodes.push(node);
        layerList.push(node);
      });
      byLayer.push(layerList);
    });

    // Build synaptic edges connecting adjacent layers & intra-layer rings (1 LineSegments draw call)
    const edges = [];
    for (let l = 0; l < byLayer.length; l += 1) {
      const current = byLayer[l];
      for (let i = 0; i < current.length; i += 1) {
        const a = current[i];
        const nextSibling = current[(i + 1) % current.length];
        if (current.length > 1) {
          edges.push(...a.position, ...nextSibling.position);
        }
        // Connect to 2 nearest nodes in next layer
        if (l < byLayer.length - 1) {
          const nextLayer = byLayer[l + 1];
          const target1 = nextLayer[i % nextLayer.length];
          const target2 = nextLayer[(i + 1) % nextLayer.length];
          edges.push(...a.position, ...target1.position);
          if (target2 && target2 !== target1) {
            edges.push(...a.position, ...target2.position);
          }
        }
      }
    }

    return {
      nodes: computedNodes,
      synapsePositions: new Float32Array(edges),
    };
  }, []);

  const geometries = useMemo(() => {
    const synapses = new THREE.BufferGeometry();
    synapses.setAttribute(
      'position',
      new THREE.BufferAttribute(synapsePositions, 3)
    );

    return {
      synapses,
      platform: new THREE.CylinderGeometry(3.2, 3.55, 0.14, 48),
      holoRingOuter: new THREE.TorusGeometry(2.55, 0.02, 12, 96),
      holoRingMid: new THREE.TorusGeometry(1.92, 0.014, 10, 84),
      holoRingVertical: new THREE.TorusGeometry(2.15, 0.012, 10, 96),
      pillar: new THREE.BoxGeometry(0.14, 3.1, 0.05),
      coreCrystal: new THREE.IcosahedronGeometry(0.32, 0),
      nodeOrb: new THREE.OctahedronGeometry(0.11, 1),
      nodeHalo: new THREE.TorusGeometry(0.17, 0.01, 8, 24),
    };
  }, [synapsePositions]);

  const materials = useMemo(
    () => ({
      platform: new THREE.MeshStandardMaterial({
        color: '#151221',
        metalness: 0.65,
        roughness: 0.42,
      }),
      cyanGlow: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.85,
        metalness: 0.3,
        roughness: 0.2,
      }),
      cyanSoft: new THREE.MeshStandardMaterial({
        color: '#4e9ba8',
        emissive: '#357485',
        emissiveIntensity: 0.45,
        metalness: 0.4,
        roughness: 0.3,
      }),
      goldHighlight: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#c48d31',
        emissiveIntensity: 0.9,
        metalness: 0.82,
        roughness: 0.2,
      }),
      mutedNode: new THREE.MeshStandardMaterial({
        color: '#433452',
        emissive: '#2c2238',
        emissiveIntensity: 0.28,
        metalness: 0.4,
        roughness: 0.5,
      }),
      coreWire: new THREE.MeshBasicMaterial({
        color: '#83d9dc',
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      }),
      pillarHolo: new THREE.MeshBasicMaterial({
        color: '#83d9dc',
        transparent: true,
        opacity: 0.14,
      }),
      synapseLine: new THREE.LineBasicMaterial({
        color: '#83d9dc',
        transparent: true,
        opacity: 0.3,
      }),
    }),
    []
  );

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

    nodeRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const node = nodes[idx];
      const isFocused = highlightedSkill === node.name;
      const inSelectedCategory =
        selectedSkillCategory === 'all' ||
        selectedSkillCategory === node.categoryId;

      const targetScale = isFocused ? 1.55 : inSelectedCategory ? 1.05 : 0.72;
      mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, dt * 7));
    });

    if (reducedMotion) return;

    if (networkRef.current) {
      networkRef.current.rotation.y += dt * (highlightedSkill ? 0.07 : 0.2);
      networkRef.current.position.y = 1.42 + Math.sin(t * 1.1) * 0.05;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= dt * 0.14;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += dt * 0.22;
      innerRingRef.current.rotation.x = 0.55 + Math.sin(t * 0.45) * 0.12;
    }
  });

  const activeNode = nodes.find((n) => n.name === highlightedSkill) || null;

  return (
    <group position={[0, -0.25, -0.35]}>
      {/* Local Cyan Holographic Laboratory Lighting */}
      <pointLight
        position={[0, 2.2, 1.2]}
        intensity={2.0}
        distance={12}
        decay={2}
        color="#83d9dc"
      />

      {/* Laboratory Base Platform & Rotating Holographic Rings */}
      <mesh
        geometry={geometries.platform}
        material={materials.platform}
        position={[0, -0.07, 0]}
      />
      <group
        ref={outerRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <mesh
          geometry={geometries.holoRingOuter}
          material={materials.cyanGlow}
        />
        <mesh
          geometry={geometries.holoRingMid}
          material={materials.goldHighlight}
        />
      </group>

      {/* Subtle Rear Holographic Containment Pillars */}
      {[-2.35, 0, 2.35].map((xPos, idx) => (
        <mesh
          key={xPos}
          geometry={geometries.pillar}
          material={materials.pillarHolo}
          position={[xPos, 1.55, idx === 1 ? -2.75 : -2.2]}
          rotation={[0, xPos * -0.18, 0]}
        />
      ))}

      {/* Interactive 4-Layer 3D Neural Network Hologram */}
      <group ref={networkRef} position={[0, 1.42, 0]}>
        {/* Central holographic neural core */}
        <mesh geometry={geometries.coreCrystal} material={materials.coreWire} />

        {/* Orbital containment gyroscope */}
        <group ref={innerRingRef}>
          <mesh
            geometry={geometries.holoRingVertical}
            material={materials.cyanSoft}
          />
        </group>

        {/* Synaptic connections (1 draw call) */}
        <lineSegments
          geometry={geometries.synapses}
          material={materials.synapseLine}
        />

        {/* Interactive Skill Nodes */}
        {nodes.map((node, idx) => {
          const isFocused = highlightedSkill === node.name;
          const inCategory =
            selectedSkillCategory === 'all' ||
            selectedSkillCategory === node.categoryId;

          const nodeMaterial = isFocused
            ? materials.goldHighlight
            : !inCategory
              ? materials.mutedNode
              : node.isLearning
                ? materials.goldHighlight
                : materials.cyanGlow;

          return (
            <group key={node.id} position={node.position}>
              <mesh
                ref={(el) => {
                  nodeRefs.current[idx] = el;
                }}
                geometry={geometries.nodeOrb}
                material={nodeMaterial}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedSkillCategory(node.categoryId);
                  setHighlightedSkill(node.name);
                }}
                onPointerOver={(event) => {
                  event.stopPropagation();
                  setHighlightedSkill(node.name);
                  if (typeof document !== 'undefined') {
                    document.body.style.cursor = 'pointer';
                  }
                }}
                onPointerOut={() => {
                  if (typeof document !== 'undefined') {
                    document.body.style.cursor = 'auto';
                  }
                }}
              />
              {isFocused && (
                <mesh
                  geometry={geometries.nodeHalo}
                  material={materials.goldHighlight}
                  rotation={[Math.PI / 2, 0, 0]}
                />
              )}
            </group>
          );
        })}

        {/* Floating label for the currently focused 3D skill node */}
        {activeNode && !isTransitioning && (
          <Html
            position={[
              activeNode.position[0],
              activeNode.position[1] + 0.34,
              activeNode.position[2],
            ]}
            center
            zIndexRange={[6, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="portal-world-badge portal-world-badge--active">
              <span className="portal-world-badge__title">
                {activeNode.name}
              </span>
              <span className="portal-world-badge__sub">
                {activeNode.familiarity}
              </span>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
