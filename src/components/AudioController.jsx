import { useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useExperienceStore } from '../store/experienceStore.js';
import { useTabVisibility } from '../hooks/useTabVisibility.js';

export default function AudioController() {
  const audioEnabled = useExperienceStore((s) => s.audioEnabled);
  const toggleAudio = useExperienceStore((s) => s.toggleAudio);
  const isTransitioning = useExperienceStore((s) => s.isTransitioning);
  const isTabVisible = useTabVisibility();

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const oscNodesRef = useRef([]);

  const stopAudioEngine = () => {
    const ctx = ctxRef.current;
    const gain = masterGainRef.current;
    if (!ctx || !gain) return;

    try {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0.0001, now, 0.12);
    } catch {
      // Ignore Web Audio teardown errors on suspended contexts
    }
  };

  const startAudioEngine = async () => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!ctxRef.current) {
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.0001;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      filter.Q.value = 0.9;

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Gentle cosmic fifth drone (A2 + E3 + subtle shimmer A3)
      const frequencies = [110, 164.81, 220];
      const types = ['sine', 'triangle', 'sine'];
      const gains = [0.42, 0.24, 0.12];

      oscNodesRef.current = frequencies.map((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = types[idx];
        osc.frequency.value = freq;
        oscGain.gain.value = gains[idx];
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        return { osc, oscGain };
      });

      ctxRef.current = ctx;
      masterGainRef.current = masterGain;
    }

    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setTargetAtTime(0.045, now, 0.35);
  };

  useEffect(() => {
    if (audioEnabled && isTabVisible) {
      startAudioEngine();
    } else {
      stopAudioEngine();
    }
  }, [audioEnabled, isTabVisible]);

  // Subtle crystalline shimmer chime when crossing a portal while sound is unmuted
  useEffect(() => {
    if (!audioEnabled || !isTransitioning || !ctxRef.current || !isTabVisible) {
      return;
    }
    const ctx = ctxRef.current;
    if (ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(528, now);
      chimeOsc.frequency.exponentialRampToValueAtTime(792, now + 0.55);

      chimeGain.gain.setValueAtTime(0.0001, now);
      chimeGain.gain.linearRampToValueAtTime(0.04, now + 0.08);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now);
      chimeOsc.stop(now + 0.72);
    } catch {
      // Non-critical audio cue failure
    }
  }, [audioEnabled, isTransitioning, isTabVisible]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        oscNodesRef.current.forEach(({ osc }) => {
          try {
            osc.stop();
          } catch {
            // Already stopped
          }
        });
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
        masterGainRef.current = null;
      }
    };
  }, []);

  return (
    <button
      type="button"
      className={`hud-pill ${audioEnabled ? 'hud-pill--active' : ''}`}
      onClick={toggleAudio}
      aria-pressed={audioEnabled}
      aria-label={audioEnabled ? 'Mute ambient audio' : 'Enable ambient audio'}
      title={audioEnabled ? 'Sound On (Click to mute)' : 'Sound Off (Muted by default)'}
    >
      {audioEnabled ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
      <span>{audioEnabled ? 'Sound On' : 'Muted'}</span>
    </button>
  );
}
