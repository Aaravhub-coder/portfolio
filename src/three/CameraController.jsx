import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { HUB_PORTALS } from '../data/profile.js';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';

export default function CameraController() {
  const { camera, size } = useThree();
  const activeScene = useExperienceStore((s) => s.activeScene);
  const hoveredPortal = useExperienceStore((s) => s.hoveredPortal);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const transitionFocus = useExperienceStore((s) => s.transitionFocus);
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const panelHidden = useExperienceStore((s) => s.panelHidden);

  const pointerRef = useRef({ x: 0, y: 0 });
  const basePosRef = useRef({ x: 0, y: 0.08, z: 7.2 });
  const lookTargetRef = useRef(new THREE.Vector3(0, 0.08, 0));

  const isSplitWorld =
    activeScene === SCENES.LIBRARY ||
    activeScene === SCENES.AILAB ||
    activeScene === SCENES.PROJECTS;
  const useDesktopSplitOffset =
    isSplitWorld && !panelHidden && size.width >= 960;

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const isNarrow = aspect < 0.85;
    const isMedium = aspect >= 0.85 && aspect < 1.25;

    let targetX = 0;
    let targetY = 0.08;
    let targetZ = 7.2;

    if (activeScene === SCENES.GATEWAY) {
      targetY = isNarrow ? 0.18 : 0.08;
      targetZ = isNarrow ? 9.6 : isMedium ? 8.1 : 7.2;
    } else if (activeScene === SCENES.HUB) {
      targetY = isNarrow ? 1.85 : 1.48;
      targetZ = isNarrow ? 11.8 : isMedium ? 9.1 : 7.35;
    } else if (activeScene === SCENES.LIBRARY) {
      targetX = useDesktopSplitOffset ? 1.3 : 0;
      targetY = isNarrow ? 2.05 : 1.72;
      targetZ = isNarrow ? 7.6 : 5.75;
    } else if (activeScene === SCENES.AILAB) {
      targetX = useDesktopSplitOffset ? 1.25 : 0;
      targetY = isNarrow ? 1.9 : 1.55;
      targetZ = isNarrow ? 7.9 : 5.85;
    } else if (activeScene === SCENES.PROJECTS) {
      targetX = useDesktopSplitOffset ? 1.35 : 0;
      targetY = isNarrow ? 2.35 : 2.05;
      targetZ = isNarrow ? 8.6 : 6.35;
    } else {
      targetY = isNarrow ? 1.05 : 0.85;
      targetZ = isNarrow ? 8.4 : 6.4;
    }

    if (reducedMotion) {
      basePosRef.current.x = targetX;
      basePosRef.current.y = targetY;
      basePosRef.current.z = targetZ;
      camera.position.set(targetX, targetY, targetZ);
      return;
    }

    const tween = gsap.to(basePosRef.current, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 1.0,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    return () => tween.kill();
  }, [
    activeScene,
    size.width,
    size.height,
    reducedMotion,
    camera,
    useDesktopSplitOffset,
  ]);

  useEffect(() => {
    if (!isTransitioning || reducedMotion) return undefined;

    let diveX = 0;
    let diveY = basePosRef.current.y;
    let diveZ = 2.4;

    if (transitionFocus && Array.isArray(transitionFocus)) {
      diveX = transitionFocus[0] * 0.7;
      diveY = transitionFocus[1];
      diveZ = transitionFocus[2] + 1.45;
    } else if (activeScene === SCENES.GATEWAY) {
      diveZ = 2.15;
    } else {
      diveZ = 8.8;
    }

    const tween = gsap.to(basePosRef.current, {
      x: diveX,
      y: diveY,
      z: diveZ,
      duration: 0.68,
      ease: 'power2.in',
      overwrite: 'auto',
    });

    return () => tween.kill();
  }, [isTransitioning, transitionFocus, activeScene, reducedMotion]);

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
    const parallaxScale = reducedMotion || isTransitioning ? 0 : 0.3;

    const focusedPortal =
      activeScene === SCENES.HUB && hoveredPortal
        ? HUB_PORTALS.find((p) => p.id === hoveredPortal)
        : null;

    const hoverShiftX =
      !reducedMotion && !isTransitioning && focusedPortal
        ? focusedPortal.position[0] * 0.22
        : 0;

    const desiredX =
      basePosRef.current.x + hoverShiftX + pointerRef.current.x * parallaxScale;
    const desiredY =
      basePosRef.current.y + pointerRef.current.y * parallaxScale * 0.45;
    const desiredZ = basePosRef.current.z;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, desiredX, smooth);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, desiredY, smooth);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, desiredZ, smooth);

    let targetLookX = 0;
    let targetLookY = 0.08;
    let targetLookZ = 0;

    if (isTransitioning && transitionFocus) {
      targetLookX = transitionFocus[0];
      targetLookY = transitionFocus[1];
      targetLookZ = transitionFocus[2];
    } else if (activeScene === SCENES.HUB) {
      targetLookX = focusedPortal ? focusedPortal.position[0] * 0.35 : 0;
      targetLookY = focusedPortal ? focusedPortal.position[1] - 0.28 : 0.72;
      targetLookZ = -1.2;
    } else if (activeScene === SCENES.LIBRARY) {
      targetLookX = useDesktopSplitOffset ? 1.15 : 0;
      targetLookY = 1.25;
      targetLookZ = -0.65;
    } else if (activeScene === SCENES.AILAB) {
      targetLookX = useDesktopSplitOffset ? 1.15 : 0;
      targetLookY = 1.15;
      targetLookZ = -0.35;
    } else if (activeScene === SCENES.PROJECTS) {
      targetLookX = useDesktopSplitOffset ? 1.2 : 0;
      targetLookY = 1.02;
      targetLookZ = -0.3;
    } else if (activeScene !== SCENES.GATEWAY) {
      targetLookY = 0.72;
      targetLookZ = -1.5;
    }

    lookTargetRef.current.x = THREE.MathUtils.lerp(
      lookTargetRef.current.x,
      targetLookX,
      smooth
    );
    lookTargetRef.current.y = THREE.MathUtils.lerp(
      lookTargetRef.current.y,
      targetLookY,
      smooth
    );
    lookTargetRef.current.z = THREE.MathUtils.lerp(
      lookTargetRef.current.z,
      targetLookZ,
      smooth
    );
    camera.lookAt(lookTargetRef.current);
  });

  return null;
}
