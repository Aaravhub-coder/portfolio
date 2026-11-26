import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { useExperienceStore } from '../store/experienceStore.js';

function TrophyEmblem({ category, id, geometries, materials, active }) {
  const mat = active ? materials.goldBright : materials.gold;

  if (category === 'Certification') {
    return (
      <group>
        <mesh geometry={geometries.certFrame} material={mat} />
        <mesh
          geometry={geometries.certParchment}
          material={materials.parchment}
          position={[0, 0, 0.032]}
        />
      </group>
    );
  }

  if (category === 'Learning') {
    return (
      <group>
        <mesh geometry={geometries.crystal} material={materials.cyan} />
        <mesh
          geometry={geometries.miniOrbit}
          material={mat}
          rotation={[Math.PI / 3, 0.35, 0]}
        />
      </group>
    );
  }

  if (id === 'sangyan-iit-bhu' || id === 'aws-ml-hackathon') {
    return (
      <group>
        <mesh geometry={geometries.starCrest} material={mat} />
        <mesh
          geometry={geometries.miniOrbit}
          material={id === 'aws-ml-hackathon' ? materials.cyan : materials.plumGlow}
        />
      </group>
    );
  }

  // Runner-Up Trophy Chalice silhouette
  return (
    <group>
      <mesh
        geometry={geometries.cupBowl}
        material={mat}
        position={[0, 0.12, 0]}
      />
      <mesh
        geometry={geometries.cupStem}
        material={mat}
        position={[0, -0.1, 0]}
      />
      <mesh
        geometry={geometries.cupFoot}
        material={materials.plumGlow}
        position={[0, -0.22, 0]}
      />
    </group>
  );
}

export default function AchievementScene() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const selectedAchievementId = useExperienceStore(
    (s) => s.selectedAchievementId
  );
  const setSelectedAchievementId = useExperienceStore(
    (s) => s.setSelectedAchievementId
  );
  const achievementFilter = useExperienceStore((s) => s.achievementFilter);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);

  const crestRefs = useRef([]);
  const archRingRef = useRef(null);

  const geometries = useMemo(
    () => ({
      hallFloor: new THREE.CylinderGeometry(4.4, 4.7, 0.16, 48),
      floorArcOuter: new THREE.TorusGeometry(3.55, 0.022, 10, 84),
      floorArcInner: new THREE.TorusGeometry(2.1, 0.015, 10, 64),
      archRing: new THREE.TorusGeometry(2.85, 0.032, 12, 72, Math.PI),
      pedestal: new THREE.CylinderGeometry(0.32, 0.42, 0.92, 8),
      pedestalCap: new THREE.TorusGeometry(0.34, 0.018, 8, 32),
      cupBowl: new THREE.CylinderGeometry(0.22, 0.1, 0.28, 12),
      cupStem: new THREE.CylinderGeometry(0.045, 0.06, 0.2, 10),
      cupFoot: new THREE.CylinderGeometry(0.16, 0.19, 0.07, 12),
      starCrest: new THREE.OctahedronGeometry(0.23, 0),
      crystal: new THREE.IcosahedronGeometry(0.2, 0),
      miniOrbit: new THREE.TorusGeometry(0.32, 0.015, 8, 32),
      certFrame: new THREE.BoxGeometry(0.46, 0.36, 0.05),
      certParchment: new THREE.BoxGeometry(0.38, 0.28, 0.02),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({
        color: '#181122',
        metalness: 0.48,
        roughness: 0.56,
      }),
      pedestal: new THREE.MeshStandardMaterial({
        color: '#251a33',
        metalness: 0.35,
        roughness: 0.65,
      }),
      pedestalMuted: new THREE.MeshStandardMaterial({
        color: '#1a1324',
        metalness: 0.28,
        roughness: 0.78,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#8f6218',
        emissiveIntensity: 0.42,
        metalness: 0.84,
        roughness: 0.22,
      }),
      goldBright: new THREE.MeshStandardMaterial({
        color: '#fae3af',
        emissive: '#d69c38',
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.16,
      }),
      plumGlow: new THREE.MeshStandardMaterial({
        color: '#56334d',
        emissive: '#945289',
        emissiveIntensity: 0.65,
        metalness: 0.45,
        roughness: 0.3,
      }),
      cyan: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.82,
        metalness: 0.35,
        roughness: 0.22,
      }),
      parchment: new THREE.MeshStandardMaterial({
        color: '#f6f0e6',
        emissive: '#d9ba82',
        emissiveIntensity: 0.28,
        roughness: 0.7,
      }),
    }),
    []
  );

  // Arrange 6 verified achievements along a ceremonial semi-circular gallery arc
  const pedestals = useMemo(() => {
    const radius = 2.45;
    return ACHIEVEMENTS.map((item, idx) => {
      const t = idx / Math.max(ACHIEVEMENTS.length - 1, 1);
      const angle = -1.12 + t * 2.24;
      return {
        item,
        x: Math.sin(angle) * radius,
        z: -Math.cos(angle) * radius + 0.55,
        rotY: -angle,
        heightOffset: idx === 1 || idx === 2 ? 0.16 : 0,
      };
    });
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

    crestRefs.current.forEach((group, idx) => {
      if (!group) return;
      const item = pedestals[idx].item;
      const isSelected = selectedAchievementId === item.id;
      const inFilter =
        achievementFilter === 'all' ||
        item.category.toLowerCase() === achievementFilter;

      const targetScale = isSelected ? 1.32 : inFilter ? 1.0 : 0.74;
      group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, dt * 6));

      if (!reducedMotion) {
        group.rotation.y += dt * (isSelected ? 1.1 : 0.45);
        group.position.y =
          1.34 +
          pedestals[idx].heightOffset +
          Math.sin(t * 1.5 + idx * 0.9) * 0.05;
      }
    });

    if (!reducedMotion && archRingRef.current) {
      archRingRef.current.rotation.y = Math.sin(t * 0.35) * 0.08;
    }
  });

  const activePedestal =
    pedestals.find((p) => p.item.id === selectedAchievementId) || null;

  return (
    <group position={[0, -0.22, -0.2]}>
      <pointLight
        position={[0, 2.8, 1.0]}
        intensity={2.2}
        distance={13}
        decay={2}
        color="#f5d28e"
      />

      {/* Ceremonial Gallery Floor & Grand Arch */}
      <mesh
        geometry={geometries.hallFloor}
        material={materials.floor}
        position={[0, -0.08, -0.4]}
      />
      <mesh
        geometry={geometries.floorArcOuter}
        material={materials.gold}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, -0.4]}
      />
      <mesh
        geometry={geometries.floorArcInner}
        material={materials.plumGlow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.025, -0.4]}
      />
      <mesh
        ref={archRingRef}
        geometry={geometries.archRing}
        material={materials.gold}
        position={[0, 0.15, -2.55]}
      />

      {/* Six Interactive Honors Pedestals */}
      {pedestals.map((entry, idx) => {
        const { item } = entry;
        const isSelected = selectedAchievementId === item.id;
        const inFilter =
          achievementFilter === 'all' ||
          item.category.toLowerCase() === achievementFilter;

        return (
          <group
            key={item.id}
            position={[entry.x, 0, entry.z]}
            rotation={[0, entry.rotY, 0]}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedAchievementId(isSelected ? null : item.id);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              setSelectedAchievementId(item.id);
              if (typeof document !== 'undefined') {
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={() => {
              if (typeof document !== 'undefined') {
                document.body.style.cursor = 'auto';
              }
            }}
          >
            <mesh
              geometry={geometries.pedestal}
              material={inFilter ? materials.pedestal : materials.pedestalMuted}
              position={[0, 0.46 + entry.heightOffset / 2, 0]}
              scale={[1, 1 + entry.heightOffset, 1]}
            />
            <mesh
              geometry={geometries.pedestalCap}
              material={isSelected ? materials.goldBright : materials.gold}
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0.92 + entry.heightOffset, 0]}
            />

            <group
              ref={(el) => {
                crestRefs.current[idx] = el;
              }}
              position={[0, 1.34 + entry.heightOffset, 0]}
            >
              <TrophyEmblem
                category={item.category}
                id={item.id}
                geometries={geometries}
                materials={materials}
                active={isSelected}
              />
            </group>
          </group>
        );
      })}

      {/* Floating badge above selected trophy pedestal */}
      {activePedestal && !isTransitioning && (
        <Html
          position={[
            activePedestal.x,
            1.88 + activePedestal.heightOffset,
            activePedestal.z,
          ]}
          center
          zIndexRange={[6, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="portal-world-badge portal-world-badge--active">
            <span className="portal-world-badge__title">
              {activePedestal.item.title}
            </span>
            <span className="portal-world-badge__sub">
              {activePedestal.item.issuer}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
