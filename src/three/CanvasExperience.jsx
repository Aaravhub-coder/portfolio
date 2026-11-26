import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Lighting from './Lighting.jsx';
import Particles from './Particles.jsx';
import CameraController from './CameraController.jsx';
import GatewayScene from '../scenes/GatewayScene.jsx';
import { SCENES, useExperienceStore } from '../store/experienceStore.js';
import { useTabVisibility } from '../hooks/useTabVisibility.js';

// Lazy-load scenes on demand so only one active 3D environment mounts at a time
const MultiverseScene = lazy(() => import('../scenes/MultiverseScene.jsx'));
const LibraryScene = lazy(() => import('../scenes/LibraryScene.jsx'));
const AILabScene = lazy(() => import('../scenes/AILabScene.jsx'));
const ProjectWorldScene = lazy(() => import('../scenes/ProjectWorldScene.jsx'));
const AchievementScene = lazy(() => import('../scenes/AchievementScene.jsx'));
const ContactScene = lazy(() => import('../scenes/ContactScene.jsx'));

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

function getPerformanceTier() {
  if (typeof window === 'undefined') return 'standard';
  const isCompact = window.innerWidth < 768;
  const lowMemory =
    typeof navigator !== 'undefined' &&
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= 4;
  return isCompact || lowMemory ? 'compact' : 'standard';
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

export default function CanvasExperience({ onEnterGateway, onSelectPortal }) {
  const activeScene = useExperienceStore((s) => s.activeScene);
  const viewMode = useExperienceStore((s) => s.viewMode);
  const setCanvasReady = useExperienceStore((s) => s.setCanvasReady);
  const setWebglError = useExperienceStore((s) => s.setWebglError);
  const isTabVisible = useTabVisibility();
  const cleanupRef = useRef(null);
  const [tier, setTier] = useState(getPerformanceTier);

  useEffect(() => {
    if (!detectWebGLSupport()) {
      setWebglError('WebGL is unavailable on this browser/device.');
    }
  }, [setWebglError]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setTier(getPerformanceTier());
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Adaptive GPU budget for Apple M1 (8 GB unified memory) and compact mobile screens
  const quality = useMemo(
    () =>
      tier === 'compact'
        ? { dpr: [1, 1.35], stars: 240, motes: 110 }
        : { dpr: [1, 1.75], stars: 380, motes: 190 },
    [tier]
  );

  if (viewMode === '2d') {
    return null;
  }

  return (
    <div className="canvas-stage" aria-hidden="true">
      <WebGLErrorBoundary onError={setWebglError}>
        <Canvas
          dpr={quality.dpr}
          performance={{ min: 0.5 }}
          frameloop={isTabVisible ? 'always' : 'never'}
          camera={{ position: [0, 0.08, 7.2], fov: 46, near: 0.1, far: 65 }}
          gl={{
            antialias: tier === 'standard',
            alpha: false,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            const handleContextLost = (event) => {
              event.preventDefault();
              setWebglError('WebGL rendering context was lost.');
            };
            const handleContextRestored = () => {
              setWebglError(null);
            };
            gl.domElement.addEventListener('webglcontextlost', handleContextLost);
            gl.domElement.addEventListener(
              'webglcontextrestored',
              handleContextRestored
            );
            cleanupRef.current = () => {
              gl.domElement.removeEventListener(
                'webglcontextlost',
                handleContextLost
              );
              gl.domElement.removeEventListener(
                'webglcontextrestored',
                handleContextRestored
              );
            };
            setCanvasReady(true);
          }}
        >
          <color attach="background" args={['#100d16']} />
          <fog attach="fog" args={['#100d16', 11, 30]} />
          <Lighting />
          <CameraController />
          <Particles starCount={quality.stars} moteCount={quality.motes} />

          <Suspense fallback={null}>
            {activeScene === SCENES.GATEWAY && (
              <GatewayScene onEnter={onEnterGateway} />
            )}
            {activeScene === SCENES.HUB && (
              <MultiverseScene onSelectPortal={onSelectPortal} />
            )}
            {activeScene === SCENES.LIBRARY && <LibraryScene />}
            {activeScene === SCENES.AILAB && <AILabScene />}
            {activeScene === SCENES.PROJECTS && <ProjectWorldScene />}
            {activeScene === SCENES.ACHIEVEMENTS && <AchievementScene />}
            {activeScene === SCENES.CONTACT && <ContactScene />}
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
