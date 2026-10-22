import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { Habit, HabitLogs, MAX_HABIT_CATEGORIES, MIN_HABIT_CATEGORIES } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface RadarCategoryChartProps {
  categories: string[];
  habits: Habit[];
  logs: HabitLogs;
  selectedDate: string;
  todayStr: string;
  onAddCategory: (name: string) => boolean;
  onRemoveCategory: (name: string) => void;
  soundEnabled?: boolean;
  hapticEnabled?: boolean;
}

export const RadarCategoryChart: React.FC<RadarCategoryChartProps> = ({
  categories,
  habits,
  logs,
  selectedDate,
  todayStr,
  onAddCategory,
  onRemoveCategory,
  hapticEnabled = true,
}) => {
  const [viewMode, setViewMode] = useState<'selected' | 'week'>('selected');
  const [selectedCatIndex, setSelectedCatIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Calculate past 7 days for weekly aggregation
  const getPast7Days = () => {
    const dates: string[] = [];
    const [y, m, d] = selectedDate.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    for (let i = 0; i < 7; i++) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      curr.setDate(curr.getDate() - 1);
    }
    return dates;
  };

  const past7Days = getPast7Days();

  // Compute category statistics
  const categoryStats = categories.map((cat, idx) => {
    // Habits in this category
    const catHabits = habits.filter((h) => {
      if (Array.isArray(h.categories) && h.categories.length > 0) {
        return h.categories.includes(cat);
      }
      if (typeof h.category === 'string' && h.category.trim()) {
        return h.category.trim() === cat;
      }
      return idx === 0; // fallback first category
    });

    const totalHabits = catHabits.length;

    let completedCount = 0;
    let scorePercent = 0;

    if (viewMode === 'selected') {
      const dayLog = logs[selectedDate] || {};
      completedCount = catHabits.filter((h) => dayLog[h.id]).length;
      scorePercent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
    } else {
      // 7-day average completion rate
      let totalChecks = 0;
      let totalPossible = totalHabits * 7;
      past7Days.forEach((dateStr) => {
        const dayLog = logs[dateStr] || {};
        catHabits.forEach((h) => {
          if (dayLog[h.id]) totalChecks++;
        });
      });
      scorePercent = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0;
      completedCount = totalChecks;
    }

    return {
      name: cat,
      habits: catHabits,
      totalHabits,
      completedCount,
      scorePercent,
    };
  });

  // Geometry calculations
  const N = Math.max(3, categories.length);
  const cx = 175;
  const cy = 155;
  const R = 95;

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, ratio: number) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / N;
    const x = cx + ratio * R * Math.cos(angle);
    const y = cy + ratio * R * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate grid polygon points
  const getGridPolygonPoints = (ratio: number) => {
    return Array.from({ length: N })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, ratio);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Generate data polygon points
  const dataPolygonPoints = categoryStats
    .map((stat, i) => {
      // Minimum display ratio 0.10 so 0% is still visible near the hub
      const ratio = Math.max(0.1, stat.scorePercent / 100);
      const { x, y } = getCoordinates(i, ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setAddError('Mục này đã có trong biểu đồ');
      return;
    }
    if (categories.length >= MAX_HABIT_CATEGORIES) {
      setAddError(`Đã đạt tối đa ${MAX_HABIT_CATEGORIES} mục (Bát Giác)`);
      return;
    }
    const success = onAddCategory(trimmed);
    if (success) {
      setNewCatName('');
      setShowAddModal(false);
      setAddError(null);
      triggerHaptic('success', hapticEnabled);
    }
  };

  const activeStat = selectedCatIndex !== null ? categoryStats[selectedCatIndex] : null;

  return (
    <div className="bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title, Shape Badge, and Category Manager Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10 pb-1 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>BIỂU ĐỒ HÌNH</span>
              </h4>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Time range switch */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px]">
            <button
              onClick={() => {
                setViewMode('selected');
                triggerHaptic('light', hapticEnabled);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                viewMode === 'selected'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedDate === todayStr ? 'Hôm nay' : 'Ngày chọn'}
            </button>
            <button
              onClick={() => {
                setViewMode('week');
                triggerHaptic('light', hapticEnabled);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                viewMode === 'week'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 ngày qua
            </button>
          </div>

          {/* Add Category Button */}
          {categories.length < MAX_HABIT_CATEGORIES ? (
            <button
              onClick={() => {
                setShowAddModal(true);
                triggerHaptic('light', hapticEnabled);
              }}
              className="text-[11px] bg-cyan-400/15 hover:bg-cyan-400/25 border border-cyan-400/50 text-cyan-300 font-bold px-2.5 py-1 rounded-xl transition flex items-center gap-1 shadow-sm"
              title="Thêm mục rèn luyện mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mục</span>
            </button>
          ) : (
            <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-1 rounded-xl border border-slate-700 font-medium">
              Đủ 8 mục
            </span>
          )}
        </div>
      </div>

      {/* SVG Radar Chart Display */}
      <div className="relative flex flex-col items-center justify-center select-none py-1">
        <svg
          viewBox="0 0 350 310"
          className="w-full max-w-[340px] h-auto drop-shadow-[0_0_20px_rgba(34,211,238,0.15)] overflow-visible"
        >
          <defs>
            {/* Radar area fill gradient */}
            <radialGradient id="radarGlowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.10" />
            </radialGradient>
            {/* Grid glow filter */}
            <filter id="neonStrokeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22d3ee" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Concentric spiderweb grid rings */}
          {gridLevels.map((level, lIdx) => (
            <polygon
              key={`grid-${lIdx}`}
              points={getGridPolygonPoints(level)}
              fill="none"
              stroke={lIdx === gridLevels.length - 1 ? '#334155' : '#1e293b'}
              strokeWidth={lIdx === gridLevels.length - 1 ? '1.5' : '1'}
              strokeDasharray={lIdx < gridLevels.length - 1 ? '2 2' : undefined}
            />
          ))}

          {/* Radial axis lines from center to outer vertices */}
          {Array.from({ length: N }).map((_, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            return (
              <line
                key={`spoke-${i}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Web scale labels (50%, 100%) */}
          <text
            x={cx + 3}
            y={cy - R * 0.5 - 2}
            className="text-[8px] fill-slate-500 font-mono select-none"
          >
            50%
          </text>
          <text
            x={cx + 3}
            y={cy - R * 1.0 - 2}
            className="text-[8px] fill-cyan-400/80 font-mono font-bold select-none"
          >
            100%
          </text>

          {/* Dynamic Data Polygon (The filled radar shape) */}
          <polygon
            points={dataPolygonPoints}
            fill="url(#radarGlowGradient)"
            stroke="#22d3ee"
            strokeWidth="2.5"
            filter="url(#neonStrokeGlow)"
            className="transition-all duration-500 ease-out"
          />

          {/* Data Vertices and Outer Category Labels */}
          {categoryStats.map((stat, i) => {
            const ratio = Math.max(0.1, stat.scorePercent / 100);
            const { x: vx, y: vy } = getCoordinates(i, ratio);
            const { x: lx, y: ly, angle } = getCoordinates(i, 1.25);
            const isSelected = selectedCatIndex === i;

            // Compute text anchor based on angle
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (cos > 0.3) textAnchor = 'start';
            else if (cos < -0.3) textAnchor = 'end';

            const verticalShift = sin > 0.5 ? 12 : sin < -0.5 ? -4 : 4;

            return (
              <g key={`vertex-group-${stat.name}`} className="cursor-pointer">
                {/* Connecting subtle line to outer label if far */}
                <circle
                  cx={vx}
                  cy={vy}
                  r={isSelected ? 6 : 4.5}
                  className={`transition-all duration-300 ${
                    isSelected
                      ? 'fill-cyan-300 stroke-white stroke-2'
                      : 'fill-cyan-400 stroke-slate-900 stroke-2'
                  }`}
                  onClick={() => {
                    setSelectedCatIndex(isSelected ? null : i);
                    triggerHaptic('light', hapticEnabled);
                  }}
                />

                {/* Vertex Pulsing ring when selected */}
                {isSelected && (
                  <circle
                    cx={vx}
                    cy={vy}
                    r={9}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Outer Category Label Text */}
                <text
                  x={lx}
                  y={ly + verticalShift}
                  textAnchor={textAnchor}
                  onClick={() => {
                    setSelectedCatIndex(isSelected ? null : i);
                    triggerHaptic('light', hapticEnabled);
                  }}
                  className={`text-[10px] select-none font-bold transition-all duration-200 ${
                    isSelected
                      ? 'fill-cyan-300 font-black'
                      : stat.scorePercent > 0
                      ? 'fill-slate-200 hover:fill-cyan-400'
                      : 'fill-slate-400 hover:fill-slate-200'
                  }`}
                >
                  {stat.name}
                  <tspan
                    x={lx}
                    dy="11"
                    textAnchor={textAnchor}
                    className={`text-[9px] font-mono font-bold ${
                      stat.scorePercent >= 80
                        ? 'fill-emerald-400'
                        : stat.scorePercent > 0
                        ? 'fill-cyan-400'
                        : 'fill-slate-500'
                    }`}
                  >
                    {stat.scorePercent}%
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Category Detail Banner */}
        {activeStat && (
          <div className="w-full mt-2 p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="font-bold text-white text-sm">{activeStat.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                  {activeStat.totalHabits} thói quen
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-cyan-400 font-mono text-sm">
                  {activeStat.scorePercent}%
                </span>
                {categories.length > MIN_HABIT_CATEGORIES && (
                  categoryToDelete === activeStat.name ? (
                    <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 rounded-lg px-2 py-0.5 animate-in fade-in duration-150">
                      <span className="text-[10px] text-red-200">Xóa?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveCategory(activeStat.name);
                          setCategoryToDelete(null);
                          setSelectedCatIndex(null);
                          triggerHaptic('medium', hapticEnabled);
                        }}
                        className="text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold px-1.5 py-0.5 rounded"
                      >
                        Có
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(null)}
                        className="text-[10px] text-slate-300 hover:text-white px-1"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryToDelete(activeStat.name);
                        triggerHaptic('light', hapticEnabled);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition"
                      title="Xóa mục này khỏi biểu đồ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCatIndex(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List of habits in this category */}
            <div className="space-y-1.5 pt-1">
              {activeStat.habits.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">
                  Chưa có thói quen nào thuộc mục này. Hãy chỉnh sửa thói quen và gán vào mục "{activeStat.name}".
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeStat.habits.map((h) => {
                    const isChecked = !!(logs[selectedDate] && logs[selectedDate][h.id]);
                    return (
                      <div
                        key={h.id}
                        className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate flex-1 pr-1">{h.title}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isChecked ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isChecked ? 'Đã xong' : 'Chưa xong'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Grid Cards (Summary Breakdown) */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
          <span>DANH SÁCH {categories.length} MỤC</span>
          <span>{viewMode === 'selected' ? 'TIẾN ĐỘ HÔM NAY' : 'TRUNG BÌNH 7 NGÀY'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categoryStats.map((stat, i) => {
            const isSelected = selectedCatIndex === i;
            return (
              <div
                key={stat.name}
                onClick={() => {
                  setSelectedCatIndex(isSelected ? null : i);
                  triggerHaptic('light', hapticEnabled);
                }}
                className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate">{stat.name}</span>
                  <span className="text-[10px] font-mono font-bold text-cyan-400">
                    {stat.scorePercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span>{stat.totalHabits} thói quen</span>
                  {viewMode === 'selected' && (
                    <span>
                      {stat.completedCount}/{stat.totalHabits}
                    </span>
                  )}
                </div>
                {/* Micro progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${stat.scorePercent}%` }}
                    className={`h-full transition-all duration-300 rounded-full ${
                      stat.scorePercent >= 80
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Category (Max 8 Capped) */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#141d38] border border-cyan-400/50 rounded-3xl w-full max-w-xs p-5 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Thêm Mục Rèn Luyện</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-200">
                  Tên mục mới (Hiện có {categories.length}/8 mục):
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (addError) setAddError(null);
                  }}
                  placeholder="VD: Sự nghiệp, Tài chính, Gia đình..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  maxLength={15}
                  autoFocus
                />
                <p className="text-[10px] text-slate-400">
                  Biểu đồ sẽ tự động nâng cấp thành đa giác tương ứng ({categories.length + 1} giác).
                </p>
              </div>

              {addError && (
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-cyan-500/20"
                >
                  Thêm mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
