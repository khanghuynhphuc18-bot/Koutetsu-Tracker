// Web Audio API and Native Vibration helpers with delicate, subtle volume
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Subtle pleasant sound when completing a habit
export function playCompleteHabitSound(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {}
}

// Subtle gentle sound when uncompleting a habit
export function playUncompleteHabitSound(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.07);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {}
}

// Subtle micro-chime for 100% daily completion
export function playCompleteChime(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.05;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.04, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  } catch (e) {}
}

export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light', enabled = true) {
  if (!enabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    if (type === 'light') {
      navigator.vibrate(8);
    } else if (type === 'medium') {
      navigator.vibrate(15);
    } else if (type === 'success') {
      navigator.vibrate([12, 40, 15]);
    }
  } catch (e) {}
}

// Timer completion sound (triad chime)
export function playTimerFinishChime(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.06, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (e) {}
}

// ========================================================
// REALISTIC BREATH AUDIO ENGINE
// Uses stereo filtered pink noise + vocal tract formants
// for authentic human inhalation and exhalation sounds
// ========================================================
let breathNoiseBuffer: AudioBuffer | null = null;
let currentBreathStopFn: (() => void) | null = null;

function getBreathNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (breathNoiseBuffer && breathNoiseBuffer.sampleRate === ctx.sampleRate) {
    return breathNoiseBuffer;
  }
  const duration = 10;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise algorithm (Kellet filter) for natural airy acoustic texture
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.13;
      b6 = white * 0.115926;
    }
  }
  breathNoiseBuffer = buffer;
  return buffer;
}

export function stopBreathingSound() {
  if (currentBreathStopFn) {
    try {
      currentBreathStopFn();
    } catch (e) {}
    currentBreathStopFn = null;
  }
}

// Inhale sound: Authentic deep human inhalation (air suction swell, nasal formant sweep, rich loud volume)
export function playBreathingInhaleSound(soundEnabled = true, duration = 4, volumeMultiplier = 1.0) {
  if (!soundEnabled) return;
  stopBreathingSound();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const safeDuration = Math.max(1.5, duration);

    // 1. Noise buffer source (Airflow)
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = getBreathNoiseBuffer(ctx);
    noiseSource.loop = true;

    // Filter 1: Main nasal/throat formant (sweeps up as air intake expands)
    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'bandpass';
    formantFilter.Q.setValueAtTime(1.8, now);
    formantFilter.frequency.setValueAtTime(400, now);
    formantFilter.frequency.exponentialRampToValueAtTime(1150, now + safeDuration * 0.78);
    formantFilter.frequency.linearRampToValueAtTime(800, now + safeDuration);

    // Filter 2: Lowpass warmth to prevent harsh hiss
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1400, now);
    lowpass.frequency.linearRampToValueAtTime(3000, now + safeDuration * 0.75);
    lowpass.frequency.linearRampToValueAtTime(1600, now + safeDuration);

    // Gain envelope: Smooth human inhalation swell (much louder volume)
    const masterGain = ctx.createGain();
    const peakGain = Math.min(0.95, 0.58 * volumeMultiplier);

    masterGain.gain.setValueAtTime(0.001, now);
    // Smooth swell up to peak around 75% of duration
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, peakGain * 0.35), now + safeDuration * 0.3);
    masterGain.gain.linearRampToValueAtTime(peakGain, now + safeDuration * 0.75);
    // Natural deceleration as lungs fill at the top
    masterGain.gain.linearRampToValueAtTime(peakGain * 0.6, now + safeDuration * 0.92);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + safeDuration);

    // 2. Chest expansion sub-resonance (warm low hum of body resonance)
    const chestOsc = ctx.createOscillator();
    const chestGain = ctx.createGain();
    chestOsc.type = 'sine';
    chestOsc.frequency.setValueAtTime(95, now);
    chestOsc.frequency.linearRampToValueAtTime(130, now + safeDuration * 0.75);
    chestGain.gain.setValueAtTime(0.001, now);
    chestGain.gain.linearRampToValueAtTime(0.08 * volumeMultiplier, now + safeDuration * 0.7);
    chestGain.gain.exponentialRampToValueAtTime(0.0001, now + safeDuration);

    // Route audio graph
    noiseSource.connect(formantFilter);
    formantFilter.connect(lowpass);
    lowpass.connect(masterGain);

    chestOsc.connect(chestGain);
    chestGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    noiseSource.start(now);
    chestOsc.start(now);
    noiseSource.stop(now + safeDuration);
    chestOsc.stop(now + safeDuration);

    currentBreathStopFn = () => {
      try {
        const stopTime = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(stopTime);
        masterGain.gain.linearRampToValueAtTime(0.0001, stopTime + 0.08);
        setTimeout(() => {
          try {
            noiseSource.stop();
            chestOsc.stop();
          } catch (e) {}
        }, 90);
      } catch (e) {}
    };
  } catch (e) {}
}

// Exhale sound: Authentic deep human exhalation (warm, relaxing oral sigh & airflow decay, rich loud volume)
export function playBreathingExhaleSound(soundEnabled = true, duration = 4, volumeMultiplier = 1.0) {
  if (!soundEnabled) return;
  stopBreathingSound();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const safeDuration = Math.max(1.5, duration);

    // 1. Noise buffer source (Airflow)
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = getBreathNoiseBuffer(ctx);
    noiseSource.loop = true;

    // Filter 1: Main oral/chest formant (starts open and descends into deep calm sigh)
    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'bandpass';
    formantFilter.Q.setValueAtTime(1.5, now);
    formantFilter.frequency.setValueAtTime(920, now);
    formantFilter.frequency.exponentialRampToValueAtTime(320, now + safeDuration * 0.85);

    // Filter 2: Lowpass filter (soothing, gentle release without harsh high frequencies)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2400, now);
    lowpass.frequency.exponentialRampToValueAtTime(580, now + safeDuration * 0.8);

    // Gain envelope: Gentle initial gust then long relaxing decay (much louder volume)
    const masterGain = ctx.createGain();
    const peakGain = Math.min(0.95, 0.60 * volumeMultiplier);

    masterGain.gain.setValueAtTime(0.001, now);
    // Soft attack into full breath release in 0.35s
    masterGain.gain.linearRampToValueAtTime(peakGain, now + 0.35);
    // Steady warm exhalation
    masterGain.gain.linearRampToValueAtTime(peakGain * 0.75, now + safeDuration * 0.55);
    // Peaceful decay into complete stillness
    masterGain.gain.linearRampToValueAtTime(peakGain * 0.25, now + safeDuration * 0.85);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + safeDuration);

    // 2. Deep soothing body resonance
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(110, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(75, now + safeDuration * 0.8);
    bodyGain.gain.setValueAtTime(0.05 * volumeMultiplier, now + 0.2);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + safeDuration * 0.7);

    // Route audio graph
    noiseSource.connect(formantFilter);
    formantFilter.connect(lowpass);
    lowpass.connect(masterGain);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    noiseSource.start(now);
    bodyOsc.start(now);
    noiseSource.stop(now + safeDuration);
    bodyOsc.stop(now + safeDuration);

    currentBreathStopFn = () => {
      try {
        const stopTime = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(stopTime);
        masterGain.gain.linearRampToValueAtTime(0.0001, stopTime + 0.08);
        setTimeout(() => {
          try {
            noiseSource.stop();
            bodyOsc.stop();
          } catch (e) {}
        }, 90);
      } catch (e) {}
    };
  } catch (e) {}
}

// Phase transition chime: Tibetan singing bowl ping (528Hz calming tone with rich warm resonance)
export function playBreathingBell(soundEnabled = true, volumeMultiplier = 1.0) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Fundamental: 528Hz
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);
    gain1.gain.setValueAtTime(0.20 * volumeMultiplier, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // Harmonic overtone: 1056Hz
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1056, now);
    gain2.gain.setValueAtTime(0.08 * volumeMultiplier, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.8);
  } catch (e) {}
}

// Heroic triumphant fanfare for Rank Up celebration
export function playRankUpFanfare(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.12 }, // C5
      { freq: 659.25, time: 0.10, dur: 0.12 }, // E5
      { freq: 783.99, time: 0.20, dur: 0.15 }, // G5
      { freq: 987.77, time: 0.32, dur: 0.18 }, // B5
      { freq: 1046.50, time: 0.46, dur: 0.45 }, // C6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + time;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    });
  } catch (e) {}
}

