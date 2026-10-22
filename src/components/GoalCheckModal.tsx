import React from 'react';
import { Target, Crown, Calendar, Sparkles, X, ChevronRight } from 'lucide-react';
import { Goal } from '../types';
import { formatGoalDateVi } from '../utils/goals';
import { BrokenShieldIcon } from './BrokenShieldIcon';

interface GoalCheckModalProps {
  isOpen: boolean;
  goal: Goal | null;
  onConquer: (goalId: string) => void;
  onFail: (goalId: string) => void;
  onExtend?: (goalId: string, additionalDays: number) => void;
  onClose: () => void;
}

export const GoalCheckModal: React.FC<GoalCheckModalProps> = ({
  isOpen,
  goal,
  onConquer,
  onFail,
  onExtend,
  onClose,
}) => {
  if (!isOpen || !goal) return null;

  const isWeekly = goal.type === 'weekly';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0b132b] border border-amber-500/50 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl shadow-amber-950/40 text-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">
                ĐÃ ĐẾN MỐC THỜI GIAN
              </span>
              <h3 className="text-xs font-bold text-white">
                Kiểm Tra Tiến Độ Mục Tiêu
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Goal details banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {isWeekly ? 'Mục tiêu ngắn hạn (Tuần)' : 'Mục tiêu dài hạn (Tháng)'}
            </span>
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatGoalDateVi(goal.endDate)}
            </span>
          </div>

          <div className="text-sm font-bold text-white leading-snug">
            "{goal.title}"
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
            Kỳ hạn đặt ra cho mục tiêu này đã kết thúc. Bạn đã hoàn thành mục tiêu rèn luyện này chưa?
          </p>
        </div>

        {/* Choice buttons */}
        <div className="space-y-2 pt-1">
          {/* Conquered option */}
          <button
            type="button"
            onClick={() => onConquer(goal.id)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition transform active:scale-95"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>ĐÃ HOÀN THÀNH (CHINH PHỤC)</span>
          </button>

          {/* Failed option */}
          <button
            type="button"
            onClick={() => onFail(goal.id)}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <BrokenShieldIcon className="w-4 h-4 text-slate-400" />
            <span>Chưa Đạt (Ghi Nhận Thất Bại)</span>
          </button>

          {/* Extend option */}
          {onExtend && (
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Cần thêm thời gian?</span>
              <button
                type="button"
                onClick={() => onExtend(goal.id, isWeekly ? 3 : 7)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
              >
                Gia hạn thêm {isWeekly ? '3 ngày' : '7 ngày'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
