import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export default function CameraController() {
  const { camera, size } = useThree();
  const activeScene = useExperienceStore((s) => s.activeScene);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);

  const pointerRef = useRef({ x: 0, y: 0 });
  const basePosRef = useRef({ x: 0, y: 0.08, z: 7.2 });
  const lookTargetRef = useRef(new THREE.Vector3(0, 0.08, 0));

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const isNarrow = aspect < 0.85;
    const isMedium = aspect >= 0.85 && aspect < 1.25;

    const targetZ =
      activeScene === SCENES.GATEWAY
        ? isNarrow
          ? 9.6
          : isMedium
            ? 8.1
            : 7.2
        : isNarrow
          ? 8.4
          : 6.4;

    const targetY = activeScene === SCENES.GATEWAY ? (isNarrow ? 0.18 : 0.08) : 0.2;

    if (reducedMotion) {
      basePosRef.current.z = targetZ;
      basePosRef.current.y = targetY;
      camera.position.set(0, targetY, targetZ);
      return;
    }

    const tween = gsap.to(basePosRef.current, {
      z: targetZ,
      y: targetY,
      duration: 1.05,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    return () => tween.kill();
  }, [activeScene, size.width, size.height, reducedMotion, camera]);

  useEffect(() => {
    if (!isTransitioning || reducedMotion) return undefined;

    const diveZ = activeScene === SCENES.GATEWAY ? 2.15 : 8.5;
    const tween = gsap.to(basePosRef.current, {
      z: diveZ,
      duration: 0.72,
      ease: 'power2.in',
      overwrite: 'auto',
    });

    return () => tween.kill();
  }, [isTransitioning, activeScene, reducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onPointerMove = (event) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -(event.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame((_, delta) => {
    const smooth = 1 - Math.exp(-Math.min(delta, 0.05) * 4.2);
    const parallaxScale = reducedMotion || isTransitioning ? 0 : 0.36;

    const desiredX = basePosRef.current.x + pointerRef.current.x * parallaxScale;
    const desiredY =
      basePosRef.current.y + pointerRef.current.y * parallaxScale * 0.55;
    const desiredZ = basePosRef.current.z;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, desiredX, smooth);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, desiredY, smooth);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, desiredZ, smooth);

    const lookY = activeScene === SCENES.GATEWAY ? 0.08 : 0.2;
    lookTargetRef.current.y = THREE.MathUtils.lerp(
      lookTargetRef.current.y,
      lookY,
      smooth
    );
    camera.lookAt(lookTargetRef.current);
  });

  return null;
}
