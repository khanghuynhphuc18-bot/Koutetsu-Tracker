import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Wind,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  playTimerFinishChime,
  playBreathingInhaleSound,
  playBreathingExhaleSound,
  playBreathingBell,
  stopBreathingSound,
  triggerHaptic,
} from '../utils/haptics';

interface FocusSectionProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

type TimerMode = 'countup' | 'countdown' | 'custom';
type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

interface PhaseConfig {
  key: BreathingPhase;
  stepNum: number;
  label: string;
  sublabel: string;
  actionText: string;
  color: string;
  hexColor: string;
  glowColor: string;
  borderColor: string;
  badgeBg: string;
}

const BREATHING_CONFIG: Record<BreathingPhase, PhaseConfig> = {
  inhale: {
    key: 'inhale',
    stepNum: 1,
    label: 'HÍT VÀO',
    sublabel: 'Hít sâu qua mũi, căng phồng lồng ngực và bụng',
    actionText: 'Hít sâu từ từ qua mũi...',
    color: 'text-cyan-400',
    hexColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.45)',
    borderColor: 'border-cyan-400',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
  },
  hold1: {
    key: 'hold1',
    stepNum: 2,
    label: 'NÍN THỞ',
    sublabel: 'Nín thở nhẹ nhàng, duy trì tĩnh lặng',
    actionText: 'Nín thở nhẹ nhàng, cơ thể tĩnh lặng...',
    color: 'text-amber-300',
    hexColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    borderColor: 'border-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  exhale: {
    key: 'exhale',
    stepNum: 3,
    label: 'THỞ RA',
    sublabel: 'Thở ra chậm qua miệng, giải phóng căng thẳng',
    actionText: 'Thở ra chậm rãi, xẹp cơ hoành...',
    color: 'text-sky-400',
    hexColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    borderColor: 'border-sky-400',
    badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
  },
  hold2: {
    key: 'hold2',
    stepNum: 4,
    label: 'NÍN THỞ',
    sublabel: 'Nín thở buông lỏng, an định hơi thở trước chu kỳ mới',
    actionText: 'Nín thở buông lỏng, cơ thể an định...',
    color: 'text-emerald-400',
    hexColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    borderColor: 'border-emerald-400',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
};

export const FocusSection: React.FC<FocusSectionProps> = ({ soundEnabled, hapticEnabled }) => {
  // ==========================================
  // 1. FOCUS TIMER STATE
  // ==========================================
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [initialCountdownSeconds, setInitialCountdownSeconds] = useState(25 * 60);

  // Custom Input States
  const [customMinutes, setCustomMinutes] = useState(30);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  const countdownPresets = [
    { label: '15 phút', value: 15 * 60 },
    { label: '25 phút (Pomodoro)', value: 25 * 60 },
    { label: '45 phút', value: 45 * 60 },
    { label: '60 phút', value: 60 * 60 },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (timerMode === 'countup') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              setIsRunning(false);
              playTimerFinishChime(soundEnabled);
              triggerHaptic('success', hapticEnabled);
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode, soundEnabled, hapticEnabled]);

  const handleStartTimer = () => {
    if (timerMode !== 'countup' && seconds === 0) {
      setSeconds(initialCountdownSeconds);
    }
    setIsRunning(true);
    triggerHaptic('medium', hapticEnabled);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    triggerHaptic('light', hapticEnabled);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'countup') {
      setSeconds(0);
    } else if (timerMode === 'countdown') {
      setSeconds(initialCountdownSeconds);
    } else {
      setSeconds(customMinutes * 60 + customSeconds);
    }
    triggerHaptic('medium', hapticEnabled);
  };

  const handleSelectMode = (mode: TimerMode) => {
    setTimerMode(mode);
    setIsRunning(false);
    triggerHaptic('light', hapticEnabled);
    if (mode === 'countup') {
      setSeconds(0);
    } else if (mode === 'countdown') {
      setSeconds(initialCountdownSeconds);
    } else if (mode === 'custom') {
      setSeconds(customMinutes * 60 + customSeconds);
    }
  };

  const handleSelectCountdownPreset = (val: number) => {
    setInitialCountdownSeconds(val);
    setSeconds(val);
    setIsRunning(false);
    triggerHaptic('light', hapticEnabled);
  };

  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSecs = Math.max(1, customMinutes * 60 + customSeconds);
    setSeconds(totalSecs);
    setInitialCountdownSeconds(totalSecs);
    setIsEditingCustom(false);
    setIsRunning(false);
    triggerHaptic('light', hapticEnabled);
  };

  const formatTimerDisplay = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerProgress = () => {
    if (timerMode === 'countup') {
      return ((seconds % 3600) / 3600) * 100;
    }
    const total = initialCountdownSeconds > 0 ? initialCountdownSeconds : 1;
    return Math.max(0, Math.min(100, ((total - seconds) / total) * 100));
  };

  // ==========================================
  // 2. BOX BREATHING (THIỀN HỘP) STATE
  // ==========================================
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);
  const [breathingPace, setBreathingPace] = useState(4); // seconds per side (4-4-4-4)
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [breathingSoundActive, setBreathingSoundActive] = useState(true);
  const [breathingVolume, setBreathingVolume] = useState<'normal' | 'loud' | 'max'>('loud');

  // Exact progress along the cycle: 0 to 1
  const [perimeterProgress, setPerimeterProgress] = useState(0);

  // Exact coordinates of the animated leading dot:
  // Initial position: Top-Left start of the top edge
  const [dotCoords, setDotCoords] = useState<{ x: number; y: number }>({ x: 44, y: 24 });

  // Progress of current phase: 0 to 1
  const [phaseProgress, setPhaseProgress] = useState(0);

  const breathAnimRef = useRef<number | null>(null);
  const breathStartTimeRef = useRef<number | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // Geometry constants of the Box Breathing Square:
  // Canvas: 260 x 260
  // Inset: 24
  // Size: 212
  // Radius: 20
  const BOX_CANVAS_SIZE = 260;
  const BOX_INSET = 24;
  const BOX_SIZE = 212;
  const CORNER_R = 20;

  // Exact SVG Path definition for the Box:
  const boxPathD = `M ${BOX_INSET + CORNER_R} ${BOX_INSET} ` +
    `L ${BOX_INSET + BOX_SIZE - CORNER_R} ${BOX_INSET} ` +
    `A ${CORNER_R} ${CORNER_R} 0 0 1 ${BOX_INSET + BOX_SIZE} ${BOX_INSET + CORNER_R} ` +
    `L ${BOX_INSET + BOX_SIZE} ${BOX_INSET + BOX_SIZE - CORNER_R} ` +
    `A ${CORNER_R} ${CORNER_R} 0 0 1 ${BOX_INSET + BOX_SIZE - CORNER_R} ${BOX_INSET + BOX_SIZE} ` +
    `L ${BOX_INSET + CORNER_R} ${BOX_INSET + BOX_SIZE} ` +
    `A ${CORNER_R} ${CORNER_R} 0 0 1 ${BOX_INSET} ${BOX_INSET + BOX_SIZE - CORNER_R} ` +
    `L ${BOX_INSET} ${BOX_INSET + CORNER_R} ` +
    `A ${CORNER_R} ${CORNER_R} 0 0 1 ${BOX_INSET + CORNER_R} ${BOX_INSET} Z`;

  const calculateDotCoords = (progress: number) => {
    const straight = BOX_SIZE - 2 * CORNER_R; // 172
    const arc = (Math.PI * CORNER_R) / 2; // ~31.416
    const quarter = straight + arc; // ~203.416
    const total = quarter * 4; // ~813.664
    const dist = (progress % 1) * total;

    if (dist <= quarter) {
      if (dist <= straight) {
        return { x: BOX_INSET + CORNER_R + dist, y: BOX_INSET };
      }
      const arcD = dist - straight;
      const angle = (arcD / arc) * (Math.PI / 2);
      return {
        x: BOX_INSET + BOX_SIZE - CORNER_R + Math.sin(angle) * CORNER_R,
        y: BOX_INSET + CORNER_R - Math.cos(angle) * CORNER_R,
      };
    } else if (dist <= quarter * 2) {
      const d = dist - quarter;
      if (d <= straight) {
        return { x: BOX_INSET + BOX_SIZE, y: BOX_INSET + CORNER_R + d };
      }
      const arcD = d - straight;
      const angle = (arcD / arc) * (Math.PI / 2);
      return {
        x: BOX_INSET + BOX_SIZE - CORNER_R + Math.cos(angle) * CORNER_R,
        y: BOX_INSET + BOX_SIZE - CORNER_R + Math.sin(angle) * CORNER_R,
      };
    } else if (dist <= quarter * 3) {
      const d = dist - quarter * 2;
      if (d <= straight) {
        return { x: BOX_INSET + BOX_SIZE - CORNER_R - d, y: BOX_INSET + BOX_SIZE };
      }
      const arcD = d - straight;
      const angle = (arcD / arc) * (Math.PI / 2);
      return {
        x: BOX_INSET + CORNER_R - Math.sin(angle) * CORNER_R,
        y: BOX_INSET + BOX_SIZE - CORNER_R + Math.cos(angle) * CORNER_R,
      };
    } else {
      const d = dist - quarter * 3;
      if (d <= straight) {
        return { x: BOX_INSET, y: BOX_INSET + BOX_SIZE - CORNER_R - d };
      }
      const arcD = d - straight;
      const angle = (arcD / arc) * (Math.PI / 2);
      return {
        x: BOX_INSET + CORNER_R - Math.cos(angle) * CORNER_R,
        y: BOX_INSET + CORNER_R - Math.sin(angle) * CORNER_R,
      };
    }
  };

  useEffect(() => {
    if (!isBreathingRunning) {
      if (breathAnimRef.current) {
        cancelAnimationFrame(breathAnimRef.current);
        breathAnimRef.current = null;
      }
      breathStartTimeRef.current = null;
      return;
    }

    const totalCycleDuration = breathingPace * 4 * 1000;
    let lastPhaseTrigger = '';

    const loop = (timestamp: number) => {
      if (!breathStartTimeRef.current) {
        breathStartTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - breathStartTimeRef.current) % totalCycleDuration;
      const cycleProgress = elapsed / totalCycleDuration; // 0.0 to 1.0

      setPerimeterProgress(cycleProgress);

      const phaseIndex = Math.min(3, Math.floor(cycleProgress * 4));
      const phases: BreathingPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
      const phase = phases[phaseIndex] || 'inhale';

      const phaseElapsedMs = elapsed - phaseIndex * (totalCycleDuration / 4);
      const currPhaseProg = Math.max(0, Math.min(1, phaseElapsedMs / (totalCycleDuration / 4)));
      setPhaseProgress(currPhaseProg);

      const phaseRemainingSecs = Math.ceil((totalCycleDuration / 4 - phaseElapsedMs) / 1000);
      setCurrentPhase(phase);
      setPhaseSecondsLeft(Math.max(1, phaseRemainingSecs));

      // Calculate EXACT coordinates for the moving dot using SVG getPointAtLength
      // so the dot ALWAYS sits directly at the tip of the progress stroke!
      if (pathRef.current) {
        try {
          const totalLength = pathRef.current.getTotalLength();
          const point = pathRef.current.getPointAtLength(cycleProgress * totalLength);
          setDotCoords({ x: point.x, y: point.y });
        } catch {
          setDotCoords(calculateDotCoords(cycleProgress));
        }
      } else {
        setDotCoords(calculateDotCoords(cycleProgress));
      }

      // Trigger audio & haptics at phase transitions
      if (lastPhaseTrigger !== phase) {
        lastPhaseTrigger = phase;
        triggerHaptic('light', hapticEnabled);
        if (soundEnabled && breathingSoundActive) {
          const volMult = breathingVolume === 'max' ? 1.6 : breathingVolume === 'loud' ? 1.3 : 1.0;
          if (phase === 'inhale') {
            playBreathingInhaleSound(true, breathingPace, volMult);
          } else if (phase === 'exhale') {
            playBreathingExhaleSound(true, breathingPace, volMult);
          } else {
            playBreathingBell(true, volMult);
          }
        }

        if (phase === 'inhale' && timestamp - (breathStartTimeRef.current || 0) > 1000) {
          setCycleCount((prev) => prev + 1);
        }
      }

      breathAnimRef.current = requestAnimationFrame(loop);
    };

    breathStartTimeRef.current = null;
    breathAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (breathAnimRef.current) {
        cancelAnimationFrame(breathAnimRef.current);
      }
      stopBreathingSound();
    };
  }, [isBreathingRunning, breathingPace, soundEnabled, breathingSoundActive, breathingVolume, hapticEnabled]);

  const handleToggleBreathing = () => {
    if (isBreathingRunning) {
      setIsBreathingRunning(false);
      stopBreathingSound();
      triggerHaptic('medium', hapticEnabled);
    } else {
      setIsBreathingRunning(true);
      setCurrentPhase('inhale');
      setPhaseSecondsLeft(breathingPace);
      triggerHaptic('success', hapticEnabled);
    }
  };

  const handleResetBreathing = () => {
    setIsBreathingRunning(false);
    stopBreathingSound();
    setCurrentPhase('inhale');
    setPhaseSecondsLeft(breathingPace);
    setPerimeterProgress(0);
    setPhaseProgress(0);
    setCycleCount(0);
    setDotCoords({ x: 44, y: 24 });
    triggerHaptic('medium', hapticEnabled);
  };

  const handleSelectPace = (pace: number) => {
    setBreathingPace(pace);
    if (!isBreathingRunning) {
      setPhaseSecondsLeft(pace);
    }
    triggerHaptic('light', hapticEnabled);
  };

  const currentConfig = BREATHING_CONFIG[currentPhase];

  let innerScale = 0.72;
  if (isBreathingRunning) {
    if (currentPhase === 'inhale') {
      innerScale = 0.72 + phaseProgress * 0.28;
    } else if (currentPhase === 'hold1') {
      innerScale = 1.0;
    } else if (currentPhase === 'exhale') {
      innerScale = 1.0 - phaseProgress * 0.28;
    } else {
      innerScale = 0.72;
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* ======================================================== */}
      {/* SECTION 1: ĐỒNG HỒ (3 CHẾ ĐỘ) */}
      {/* ======================================================== */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                ĐỒNG HỒ BẤM GIỜ
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => handleSelectMode('countup')}
              className={`py-1 px-2.5 rounded-lg transition ${
                timerMode === 'countup'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Bấm giờ
            </button>
            <button
              onClick={() => handleSelectMode('countdown')}
              className={`py-1 px-2.5 rounded-lg transition ${
                timerMode === 'countdown'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Đếm ngược
            </button>
            <button
              onClick={() => handleSelectMode('custom')}
              className={`py-1 px-2.5 rounded-lg transition ${
                timerMode === 'custom'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Tùy chỉnh
            </button>
          </div>
        </div>

        {timerMode === 'countdown' && (
          <div className="flex flex-wrap items-center gap-1.5 justify-center pt-1">
            {countdownPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleSelectCountdownPreset(preset.value)}
                className={`text-[11px] px-3 py-1 rounded-lg border transition ${
                  initialCountdownSeconds === preset.value
                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-400 font-bold ring-1 ring-cyan-400/50'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {timerMode === 'custom' && (
          <div className="flex items-center justify-center gap-2 pt-1">
            {!isEditingCustom ? (
              <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
                <span className="text-slate-300">
                  Thời gian: <strong className="text-cyan-400 font-bold">{customMinutes} phút {customSeconds > 0 ? `${customSeconds}s` : ''}</strong>
                </span>
                <button
                  onClick={() => setIsEditingCustom(true)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold ml-2"
                >
                  Đổi thời gian
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCustomTime} className="flex items-center gap-2 bg-slate-950 border border-cyan-500/40 p-2 rounded-xl text-xs">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white font-mono"
                  />
                  <span className="text-slate-400 text-[11px]">phút</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-12 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white font-mono"
                  />
                  <span className="text-slate-400 text-[11px]">giây</span>
                </div>
                <button
                  type="submit"
                  className="bg-cyan-400 text-slate-950 px-3 py-1 rounded-lg font-bold text-xs hover:bg-cyan-300 transition"
                >
                  Xong
                </button>
              </form>
            )}
          </div>
        )}

        <div className="relative flex flex-col items-center justify-center py-6">
          <div className="w-56 h-56 rounded-full bg-slate-950/90 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 rounded-full transition-all duration-500 pointer-events-none"
              style={{
                background: `conic-gradient(rgba(34, 211, 238, 0.25) ${getTimerProgress()}%, transparent ${getTimerProgress()}% 100%)`,
              }}
            />
            <div className="w-48 h-48 rounded-full bg-[#0a1128] border border-slate-800 flex flex-col items-center justify-center z-10 shadow-inner">
              <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest mb-1 flex items-center gap-1">
                {timerMode === 'countup' && 'ĐANG BẤM GIỜ'}
                {timerMode === 'countdown' && 'ĐẾM NGƯỢC'}
                {timerMode === 'custom' && 'TÙY CHỈNH'}
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                {formatTimerDisplay(seconds)}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRunning ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600'
                  }`}
                />
                <span className="text-[10px] text-slate-400 font-medium">
                  {isRunning ? 'Đang chạy' : 'Đang tạm dừng'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={handleResetTimer}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95 shadow"
            title="Đặt lại đồng hồ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {!isRunning ? (
            <button
              onClick={handleStartTimer}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt đầu</span>
            </button>
          ) : (
            <button
              onClick={handlePauseTimer}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Tạm dừng</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: THIỀN HỘP (BOX BREATHING) */}
      {/* ======================================================== */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
        {/* Header & Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                THIỀN HỘP
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pace Selector (3s, 4s, 5s, 6s) */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              {[3, 4, 5, 6].map((p) => (
                <button
                  key={p}
                  onClick={() => handleSelectPace(p)}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${
                    breathingPace === p
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Mỗi nhịp ${p} giây`}
                >
                  {p}s
                </button>
              ))}
            </div>

            {/* Volume selector */}
            <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setBreathingVolume('normal')}
                className={`px-1.5 py-0.5 rounded-md transition ${
                  breathingVolume === 'normal'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Âm lượng: Vừa"
              >
                Vừa
              </button>
              <button
                onClick={() => setBreathingVolume('loud')}
                className={`px-1.5 py-0.5 rounded-md transition ${
                  breathingVolume === 'loud'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Âm lượng: To (Mặc định)"
              >
                To
              </button>
              <button
                onClick={() => setBreathingVolume('max')}
                className={`px-1.5 py-0.5 rounded-md transition ${
                  breathingVolume === 'max'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Âm lượng: Cực đại"
              >
                Cực đại
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setBreathingSoundActive(!breathingSoundActive)}
              className={`p-1.5 rounded-lg border text-xs transition ${
                breathingSoundActive
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={breathingSoundActive ? 'Âm thanh tiếng thở: BẬT' : 'Âm thanh tiếng thở: TẮT'}
            >
              {breathingSoundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Cycle Count Badge */}
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Chu kỳ: <strong className="text-cyan-400">{cycleCount}</strong>
            </span>
          </div>
        </div>

        {/* Quick Sound Testing Controls & Volume for mobile */}
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold">Âm lượng:</span>
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              {(['normal', 'loud', 'max'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setBreathingVolume(lvl)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    breathingVolume === lvl
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'normal' ? 'Vừa' : lvl === 'loud' ? 'To' : 'Cực đại'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const volMult = breathingVolume === 'max' ? 1.6 : breathingVolume === 'loud' ? 1.3 : 1.0;
                playBreathingInhaleSound(true, 3, volMult);
              }}
              className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 transition font-medium active:scale-95"
              title="Nghe thử tiếng hít vào chân thực"
            >
              Thử Hít
            </button>
            <button
              onClick={() => {
                const volMult = breathingVolume === 'max' ? 1.6 : breathingVolume === 'loud' ? 1.3 : 1.0;
                playBreathingExhaleSound(true, 3, volMult);
              }}
              className="text-[10px] px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-500/30 text-sky-300 hover:bg-sky-900/50 transition font-medium active:scale-95"
              title="Nghe thử tiếng thở ra chân thực"
            >
              Thử Thở
            </button>
          </div>
        </div>

        {/* Action Phase Text Banner */}
        <div className="text-center py-1">
          <div
            className={`text-2xl sm:text-3xl font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${currentConfig.color}`}
          >
            <span>{isBreathingRunning ? currentConfig.label : 'THIỀN HỘP'}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOX BREATHING CANVAS: SOLE PROGRESS STROKE DIRECTLY ON SQUARE + MOVING DOT */}
        {/* ======================================================== */}
        <div className="flex items-center justify-center py-2 sm:py-3 select-none">
          <div
            className="relative"
            style={{ width: BOX_CANVAS_SIZE, height: BOX_CANVAS_SIZE }}
          >
            {/* SVG Canvas for Track, Synchronized Progress Stroke on the Square & Dot */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox={`0 0 ${BOX_CANVAS_SIZE} ${BOX_CANVAS_SIZE}`}
            >
              <defs>
                <filter id="boxBreathingGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="haloGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="7" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 1. Underlying Base Background Square Frame (Dark Track) */}
              <path
                d={boxPathD}
                fill="none"
                stroke="#1e293b"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 2. Dotted Guide Center Track */}
              <path
                d={boxPathD}
                fill="none"
                stroke="#334155"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. DYNAMIC PROGRESS STROKE (The ONLY progress bar - located directly on the square path) */}
              <path
                ref={pathRef}
                d={boxPathD}
                pathLength="1000"
                fill="none"
                stroke={isBreathingRunning ? currentConfig.hexColor : '#334155'}
                strokeWidth={5}
                strokeDasharray="1000"
                strokeDashoffset={isBreathingRunning ? 1000 * (1 - perimeterProgress) : 1000}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#boxBreathingGlow)"
                className="transition-none"
              />

              {/* 4. DYNAMIC SYNCHRONIZED MOVING DOT (Exact tip of progress bar) */}
              {isBreathingRunning && (
                <g className="transition-none">
                  {/* Outer Pulsing Aura matching current phase color */}
                  <circle
                    cx={dotCoords.x}
                    cy={dotCoords.y}
                    r={14}
                    fill={currentConfig.hexColor}
                    opacity={0.35}
                    filter="url(#haloGlow)"
                  />
                  {/* Middle Ring */}
                  <circle
                    cx={dotCoords.x}
                    cy={dotCoords.y}
                    r={8}
                    fill={currentConfig.hexColor}
                    opacity={0.8}
                    filter="url(#boxBreathingGlow)"
                  />
                  {/* Inner Pure White High-Contrast Core Dot */}
                  <circle
                    cx={dotCoords.x}
                    cy={dotCoords.y}
                    r={4.5}
                    fill="#ffffff"
                    filter="url(#boxBreathingGlow)"
                  />
                </g>
              )}
            </svg>

            {/* Central Circle & Breathing Visualizer */}
            <div
              className={`absolute inset-[32px] rounded-3xl flex flex-col items-center justify-center text-center p-4 transition-all duration-500 overflow-hidden ${
                isBreathingRunning
                  ? 'bg-slate-950/85 border border-slate-800 shadow-2xl'
                  : 'bg-slate-950/50 border border-slate-800/60'
              }`}
              style={{
                boxShadow: isBreathingRunning ? `0 0 35px ${currentConfig.glowColor}` : 'none',
              }}
            >
              {/* Organic Breathing Pulse Sphere that breathes in & out in exact sync */}
              <div
                className="absolute w-36 h-36 rounded-full pointer-events-none transition-transform ease-linear duration-75"
                style={{
                  transform: `scale(${innerScale})`,
                  background: isBreathingRunning
                    ? `radial-gradient(circle, ${currentConfig.glowColor} 0%, transparent 70%)`
                    : 'transparent',
                }}
              />

              {isBreathingRunning ? (
                <div className="space-y-1.5 relative z-10">
                  {/* Big Seconds Countdown */}
                  <div
                    className={`text-5xl font-black font-mono transition-transform duration-200 scale-105 ${currentConfig.color}`}
                  >
                    {phaseSecondsLeft}
                  </div>
                  {/* Phase Title Badge */}
                  <div
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider inline-block ${currentConfig.badgeBg}`}
                  >
                    {currentConfig.label}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Wind className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Thở Hộp {breathingPace}-{breathingPace}-{breathingPace}-{breathingPace}
                  </span>
                </div>
              )}
            </div>

            {/* Corner Indicators */}
            <div className="absolute -top-1 left-3 text-[9px] font-bold text-cyan-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> 1. Hít vào ({breathingPace}s)
            </div>
            <div className="absolute -top-1 right-3 text-[9px] font-bold text-amber-300/90 flex items-center gap-1">
              2. Nín thở ({breathingPace}s) <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="absolute -bottom-1 right-3 text-[9px] font-bold text-sky-400/90 flex items-center gap-1">
              3. Thở ra ({breathingPace}s) <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            <div className="absolute -bottom-1 left-3 text-[9px] font-bold text-emerald-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 4. Nín thở ({breathingPace}s)
            </div>
          </div>
        </div>

        {/* Breathing Control Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleResetBreathing}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95 shadow"
            title="Đặt lại chu kỳ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {!isBreathingRunning ? (
            <button
              onClick={handleToggleBreathing}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-slate-950 font-black text-sm transition shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt đầu</span>
            </button>
          ) : (
            <button
              onClick={handleToggleBreathing}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Tạm dừng</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
