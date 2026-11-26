import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Lighting from './Lighting.jsx';
import Particles from './Particles.jsx';
import CameraController from './CameraController.jsx';
import GatewayScene from '../scenes/GatewayScene.jsx';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';
import { useTabVisibility } from '../hooks/useTabVisibility.js';

function detectWebGLSupport() {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(context);
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (this.props.onError) {
      this.props.onError(error?.message || 'WebGL initialization failed');
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* Lightweight ambient backdrop for the M1 Hub Arrival state (full 5-portal 3D Hub launches in M2) */
function HubArrivalBackdrop() {
  const reducedMotion = useExperienceStore((s) => s.reducedMotion);
  const ringRef = useRef(null);

  const geometries = useMemo(
    () => ({
      horizonRing: new THREE.TorusGeometry(2.85, 0.02, 12, 96),
      innerHalo: new THREE.TorusGeometry(2.2, 0.012, 12, 96),
    }),
    []
  );

  const materials = useMemo(
    () => ({
      gold: new THREE.MeshStandardMaterial({
        color: '#e7bd72',
        emissive: '#6e4e18',
        emissiveIntensity: 0.45,
        metalness: 0.75,
        roughness: 0.3,
      }),
      cyan: new THREE.MeshStandardMaterial({
        color: '#83d9dc',
        emissive: '#83d9dc',
        emissiveIntensity: 0.7,
        metalness: 0.3,
        roughness: 0.25,
      }),
    }),
    []
  );

  useEffect(() => {
    return () => {
      geometries.horizonRing.dispose();
      geometries.innerHalo.dispose();
      materials.gold.dispose();
      materials.cyan.dispose();
    };
  }, [geometries, materials]);

  useFrame((_, delta) => {
    if (reducedMotion || !ringRef.current) return;
    ringRef.current.rotation.z += Math.min(delta, 0.05) * 0.08;
  });

  return (
    <group ref={ringRef} position={[0, -0.35, -1.4]} rotation={[Math.PI * 0.38, 0, 0]}>
      <mesh geometry={geometries.horizonRing} material={materials.gold} />
      <mesh geometry={geometries.innerHalo} material={materials.cyan} />
    </group>
  );
}

export default function CanvasExperience({ onEnterGateway }) {
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const setCanvasReady = useExperienceStore((s) => s.setCanvasReady);
  const setWebglError = useExperienceStore((s) => s.setWebglError);
  const isTabVisible = useTabVisibility();
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!detectWebGLSupport()) {
      setWebglError('WebGL is unavailable on this browser/device.');
    }
  }, [setWebglError]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  if (viewMode === '2d') {
    return null;
  }

  return (
    <div className="canvas-stage" aria-hidden="true">
      <WebGLErrorBoundary onError={setWebglError}>
        <Canvas
          dpr={[1, 1.75]}
          frameloop={isTabVisible ? 'always' : 'never'}
          camera={{ position: [0, 0.12, 6.8], fov: 45, near: 0.1, far: 60 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            const handleContextLost = (event) => {
              event.preventDefault();
              setWebglError('WebGL rendering context was lost.');
            };
            gl.domElement.addEventListener('webglcontextlost', handleContextLost);
            cleanupRef.current = () => {
              gl.domElement.removeEventListener(
                'webglcontextlost',
                handleContextLost
              );
            };
            setCanvasReady(true);
          }}
        >
          <color attach="background" args={['#100d16']} />
          <fog attach="fog" args={['#100d16', 11, 28]} />
          <Lighting />
          <CameraController />
          <Particles starCount={420} moteCount={220} />

          <Suspense fallback={null}>
            {activeScene === SCENES.GATEWAY ? (
              <GatewayScene onEnter={onEnterGateway} />
            ) : (
              <HubArrivalBackdrop />
            )}
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
