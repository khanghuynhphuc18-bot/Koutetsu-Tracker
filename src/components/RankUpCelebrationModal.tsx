import React, { useEffect } from 'react';
import { Award, Sparkles, Trophy, ArrowRight, X, Flame } from 'lucide-react';
import { RankTier } from '../utils/ranks';

interface RankUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousRank: RankTier | null;
  newRank: RankTier;
  allTimeCount: number;
}

export const RankUpCelebrationModal: React.FC<RankUpCelebrationModalProps> = ({
  isOpen,
  onClose,
  previousRank,
  newRank,
  allTimeCount,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Container Card */}
      <div
        className="bg-gradient-to-b from-[#141d38] via-[#0b132b] to-[#060a17] border-2 border-yellow-400/80 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-[0_0_50px_rgba(250,204,21,0.35)] text-slate-100 relative overflow-hidden select-none animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition z-20 border border-slate-700"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon */}
        <div className="text-center space-y-1 relative z-10 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/60 text-yellow-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Thăng Cấp Thành Công</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </div>

          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 uppercase tracking-tight drop-shadow-sm pt-2">
            CHÚC MỪNG LÊN RANK!
          </h2>
          <p className="text-xs text-slate-300">
            Ghi nhận sự kiên trì và bước đột phá của bạn!
          </p>
        </div>

        {/* Center Crest & Visual Rank Display */}
        <div className="relative flex flex-col items-center justify-center py-2 z-10">
          {/* Animated Halo Rings */}
          <div className="absolute w-36 h-36 rounded-full border border-yellow-400/30 animate-ping opacity-25" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-yellow-400/40 animate-spin [animation-duration:12s]" />

          {/* Central Rank Badge */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-500/30 via-slate-900 to-black border-2 border-yellow-400 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(250,204,21,0.5)] relative z-10">
            <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] mb-0.5" />
            <span className="text-[10px] font-black tracking-wider text-yellow-200 uppercase">
              RANK MỚI
            </span>
          </div>
        </div>

        {/* Transition Badge: Old Rank -> New Rank */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2.5 text-xs font-bold">
            {previousRank && (
              <>
                <span className={`px-2.5 py-1 rounded-xl border text-[11px] ${previousRank.badgeBg} ${previousRank.border} ${previousRank.badgeText} opacity-70`}>
                  {previousRank.name}
                </span>
                <ArrowRight className="w-4 h-4 text-yellow-400 shrink-0" />
              </>
            )}
            <span className={`px-3 py-1.5 rounded-xl border-2 text-sm font-black uppercase tracking-wider ${newRank.badgeBg} ${newRank.border} ${newRank.badgeText} shadow-[0_0_20px_rgba(250,204,21,0.4)] ring-1 ring-yellow-400/50`}>
              {newRank.name}
            </span>
          </div>

          <p className="text-center text-xs text-slate-300 leading-relaxed pt-1">
            {newRank.description}
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-yellow-300 font-mono font-semibold pt-1 border-t border-slate-800/80">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Đã hoàn thành tích lũy: <strong>{allTimeCount} lần</strong></span>
          </div>
        </div>

        {/* Inspirational Words */}
        <p className="text-center text-[11px] text-slate-400 italic px-2 relative z-10">
          "Ý chí kiên định như lưỡi kiếm tôi trong ngọn lửa rèn. Mỗi thói quen hoàn thành là một bước tiến đến đỉnh cao."
        </p>

        {/* Confirm Action Button */}
        <div className="pt-1 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide uppercase transition shadow-[0_0_25px_rgba(250,204,21,0.45)] transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 stroke-[2.5]" />
            <span>Tiếp Tục Rèn Luyện</span>
          </button>
        </div>
      </div>
    </div>
  );
};
