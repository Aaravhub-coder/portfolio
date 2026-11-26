import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../store/experienceStore.js';

function createSoftParticleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.65)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function Particles({ starCount = 420, moteCount = 220 }) {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const starsRef = useRef(null);
  const motesRef = useRef(null);

  const spriteTexture = useMemo(() => createSoftParticleTexture(), []);

  const starGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color('#f6f0e6'),
      new THREE.Color('#e7bd72'),
      new THREE.Color('#83d9dc'),
      new THREE.Color('#b486b0'),
    ];

    for (let i = 0; i < starCount; i += 1) {
      const radius = 8 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = -2 - Math.abs(radius * Math.cos(phi)) * 0.75;

      const tint = palette[i % palette.length];
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [starCount]);

  const moteGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(moteCount * 3);
    const colors = new Float32Array(moteCount * 3);

    const gold = new THREE.Color('#e7bd72');
    const cyan = new THREE.Color('#83d9dc');
    const plum = new THREE.Color('#a46ca0');

    for (let i = 0; i < moteCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const ringRadius = 1.45 + Math.random() * 2.75;
      const spreadY = (Math.random() - 0.5) * 1.1;
      const spreadZ = (Math.random() - 0.5) * 2.8;

      positions[i * 3] = Math.cos(angle) * ringRadius;
      positions[i * 3 + 1] = Math.sin(angle) * ringRadius + 0.4 + spreadY * 0.3;
      positions[i * 3 + 2] = spreadZ;

      const roll = Math.random();
      const tint = roll < 0.48 ? gold : roll < 0.82 ? cyan : plum;
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [moteCount]);

  useEffect(() => {
    return () => {
      starGeometry.dispose();
      moteGeometry.dispose();
      if (spriteTexture) spriteTexture.dispose();
    };
  }, [starGeometry, moteGeometry, spriteTexture]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const clampedDelta = Math.min(delta, 0.05);
    if (starsRef.current) {
      starsRef.current.rotation.y += clampedDelta * 0.012;
      starsRef.current.rotation.z += clampedDelta * 0.004;
    }
    if (motesRef.current) {
      motesRef.current.rotation.z -= clampedDelta * 0.065;
      motesRef.current.rotation.y += clampedDelta * 0.018;
    }
  });

  return (
    <group>
      <points ref={starsRef} geometry={starGeometry} frustumCulled={false}>
        <pointsMaterial
          size={0.14}
          map={spriteTexture}
          vertexColors
          transparent
          opacity={0.82}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <points ref={motesRef} geometry={moteGeometry} frustumCulled={false}>
        <pointsMaterial
          size={0.095}
          map={spriteTexture}
          vertexColors
          transparent
          opacity={0.78}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
