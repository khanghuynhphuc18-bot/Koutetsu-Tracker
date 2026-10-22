import React from 'react';
import { Target, Crown, Edit2 } from 'lucide-react';
import { Goal, GoalType } from '../types';
import { getDaysRemaining, formatGoalDateVi, isGoalOverdue } from '../utils/goals';
import { BrokenShieldIcon } from './BrokenShieldIcon';

interface GoalSectionProps {
  goals: Goal[];
  onOpenCreateGoal: (type: GoalType) => void;
  onOpenEditGoal: (goal: Goal) => void;
  onOpenCheckGoal: (goal: Goal) => void;
  onConquerGoal: (goalId: string) => void;
  onFailGoal: (goalId: string) => void;
}

export const GoalSection: React.FC<GoalSectionProps> = ({
  goals,
  onOpenCreateGoal,
  onOpenEditGoal,
  onOpenCheckGoal,
  onConquerGoal,
  onFailGoal,
}) => {
  const activeGoals = goals.filter((g) => g.status === 'active');
  const weeklyGoal = activeGoals.find((g) => g.type === 'weekly');
  const monthlyGoal = activeGoals.find((g) => g.type === 'monthly');

  const renderGoalCard = (goal: Goal | undefined, type: GoalType) => {
    const isWeekly = type === 'weekly';
    const typeLabel = isWeekly ? 'Ngắn hạn (Mỗi tuần)' : 'Dài hạn (Mỗi tháng)';
    const typeBadge = isWeekly ? 'Tuần' : 'Tháng';

    if (!goal) {
      return (
        <button
          type="button"
          onClick={() => onOpenCreateGoal(type)}
          className="flex-1 min-h-[92px] p-3 rounded-2xl border border-dashed border-red-500/30 hover:border-red-400 bg-slate-900/40 hover:bg-slate-900/80 transition-all text-left flex flex-col justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isWeekly ? 'bg-red-400' : 'bg-rose-400'}`} />
              {typeLabel}
            </span>
            <span className="text-[10px] text-red-400 font-bold bg-red-950/70 border border-red-500/30 px-1.5 py-0.2 rounded-md group-hover:bg-red-900 transition">
              + Tạo
            </span>
          </div>
          <div className="text-xs text-slate-300 font-medium group-hover:text-red-300 transition py-1">
            + Đặt mục tiêu {typeBadge.toLowerCase()}
          </div>
          <div className="text-[9px] text-slate-500 font-light">
            {isWeekly ? 'Chu kỳ 7 ngày' : 'Chu kỳ 30 ngày'}
          </div>
        </button>
      );
    }

    const isOverdue = isGoalOverdue(goal);
    const daysRemaining = getDaysRemaining(goal.endDate);

    return (
      <div
        className={`flex-1 p-3 rounded-2xl border transition-all relative flex flex-col justify-between shadow-md ${
          isOverdue
            ? 'bg-amber-950/40 border-amber-500/60 shadow-amber-950/30'
            : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600'
        }`}
      >
        {/* Top Header of Card */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                isWeekly
                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}
            >
              {typeBadge}
            </span>
            {isOverdue ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                Hết hạn
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">
                {daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : 'Hôm nay đến hạn'}
              </span>
            )}
          </div>

          {/* Quick Edit */}
          <button
            type="button"
            onClick={() => onOpenEditGoal(goal)}
            className="p-1 rounded-lg text-slate-400 hover:text-red-300 hover:bg-slate-800 transition"
            title="Chỉnh sửa mục tiêu"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>

        {/* Goal Title */}
        <div className="text-xs font-bold text-white line-clamp-2 leading-snug my-1">
          {goal.title}
        </div>

        {/* Bottom Actions: Chinh phục / Thất bại */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 mt-1">
          <span className="text-[9px] text-slate-400 font-mono">
            Hạn: {formatGoalDateVi(goal.endDate)}
          </span>

          <div className="flex items-center gap-1">
            {isOverdue ? (
              <button
                type="button"
                onClick={() => onOpenCheckGoal(goal)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-1 shadow-sm"
              >
                <span>Xác nhận</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onConquerGoal(goal.id)}
                  className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 transition"
                  title="Đã chinh phục thành công (Vương miện vàng)"
                >
                  <Crown className="w-3.5 h-3.5 fill-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={() => onFailGoal(goal.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-300 transition"
                  title="Chưa đạt (Khiên bị vỡ xám)"
                >
                  <BrokenShieldIcon className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-2.5 space-y-2">
      {/* Header Bar with vivid red Target icon */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-red-500 fill-red-500/20" />
          <h3 className="text-[11px] font-black text-red-400 uppercase tracking-wider">
            MỤC TIÊU
          </h3>
        </div>
      </div>

      {/* 2 Target Goal Cards: 1 Weekly, 1 Monthly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {renderGoalCard(weeklyGoal, 'weekly')}
        {renderGoalCard(monthlyGoal, 'monthly')}
      </div>
    </div>
  );
};
