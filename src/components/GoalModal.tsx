import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { Goal, GoalType } from '../types';
import { getCurrentWeekRange, getCurrentMonthRange } from '../utils/goals';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
  activeGoals: Goal[];
  onSaveGoal: (goalData: {
    id?: string;
    type: GoalType;
    title: string;
    startDate: string;
    endDate: string;
  }) => void;
  onDeleteGoal?: (id: string) => void;
  preselectedType?: GoalType;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
  activeGoals,
  onSaveGoal,
  onDeleteGoal,
  preselectedType,
}) => {
  const [type, setType] = useState<GoalType>(preselectedType || 'weekly');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const weekRange = getCurrentWeekRange();
  const monthRange = getCurrentMonthRange();

  useEffect(() => {
    if (goalToEdit) {
      setType(goalToEdit.type);
      setTitle(goalToEdit.title);
      setStartDate(goalToEdit.startDate);
      setEndDate(goalToEdit.endDate);
    } else {
      const targetType = preselectedType || 'weekly';
      setType(targetType);
      setTitle('');
      if (targetType === 'weekly') {
        setStartDate(weekRange.start);
        setEndDate(weekRange.end);
      } else {
        setStartDate(monthRange.start);
        setEndDate(monthRange.end);
      }
    }
  }, [goalToEdit, isOpen, preselectedType]);

  const handleTypeChange = (newType: GoalType) => {
    setType(newType);
    if (!goalToEdit) {
      if (newType === 'weekly') {
        setStartDate(weekRange.start);
        setEndDate(weekRange.end);
      } else {
        setStartDate(monthRange.start);
        setEndDate(monthRange.end);
      }
    }
  };

  if (!isOpen) return null;

  // Check if active goal of this type already exists
  const existingActiveOfType = activeGoals.find(
    (g) => g.type === type && (!goalToEdit || g.id !== goalToEdit.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    if (existingActiveOfType) {
      alert(
        `Bạn đã có 1 mục tiêu ${
          type === 'weekly' ? 'ngắn hạn (tuần)' : 'dài hạn (tháng)'
        } đang thực hiện! Chỉ duy trì 1 mục tiêu mỗi loại (tối đa 2 mục tiêu).`
      );
      return;
    }

    onSaveGoal({
      id: goalToEdit?.id,
      type,
      title: title.trim(),
      startDate,
      endDate,
    });
    onClose();
  };

  const quickSuggestionsWeekly = [
    'Rèn luyện thể lực đủ 5 buổi tuần này',
    'Đọc xong 1 cuốn sách trong tuần',
    'Dậy trước 6:00 liên tục 7 ngày',
    'Thiền định 15 phút mỗi ngày',
  ];

  const quickSuggestionsMonthly = [
    'Giảm 2kg mỡ thừa và tăng sức bền',
    'Hoàn thành khóa học chuyên môn trong tháng',
    'Không thức khuya quá 23:30 suốt tháng',
    'Tích lũy 80 lần hoàn thành thói quen tháng này',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#1c2541] border border-red-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Red Target Icon */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-500/40 text-red-500 flex items-center justify-center">
              <Target className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                {goalToEdit ? 'Chỉnh Sửa Mục Tiêu' : 'Thiết Lập Mục Tiêu'}
              </h3>
              <p className="text-[10px] text-red-300 font-medium">Koutetsu Ryu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rule Note - Clean, no extra words about focusing */}
        <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-red-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span>Quy định mục tiêu:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Tối đa <strong>2 mục tiêu</strong>: 1 ngắn hạn theo tuần và 1 dài hạn theo tháng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Type Selector: Weekly vs Monthly */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Loại mục tiêu:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleTypeChange('weekly')}
                className={`py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                  type === 'weekly'
                    ? 'bg-red-500 text-slate-950 font-bold border-red-400 shadow-md shadow-red-500/20'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>🎯 Ngắn hạn (Tuần)</span>
                <span className="text-[9px] opacity-80 font-normal">Kỳ hạn 7 ngày</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('monthly')}
                className={`py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                  type === 'monthly'
                    ? 'bg-red-500 text-slate-950 font-bold border-red-400 shadow-md shadow-red-500/20'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>🧭 Dài hạn (Tháng)</span>
                <span className="text-[9px] opacity-80 font-normal">Kỳ hạn 30 ngày</span>
              </button>
            </div>
          </div>

          {/* Warning if already active */}
          {existingActiveOfType && !goalToEdit && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2 text-[11px] text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Đang có mục tiêu {type === 'weekly' ? 'tuần' : 'tháng'}: <em>"{existingActiveOfType.title}"</em>. Bạn cần hoàn thành hoặc chỉnh sửa mục tiêu đó trước.
              </span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Tiêu đề mục tiêu:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'weekly'
                  ? 'VD: Tập thể lực 5 buổi tuần này...'
                  : 'VD: Hoàn thành khóa học chuyên môn trong tháng...'
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400 transition"
              autoFocus
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Ngày bắt đầu:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Ngày kết thúc (Hạn chót):
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>
          </div>

          {/* Quick Suggestions */}
          {!goalToEdit && (
            <div>
              <span className="block text-[10px] text-slate-400 mb-1.5">Gợi ý nhanh:</span>
              <div className="space-y-1">
                {(type === 'weekly' ? quickSuggestionsWeekly : quickSuggestionsMonthly).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTitle(sug)}
                    className="w-full text-left text-[10px] p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
            {goalToEdit && onDeleteGoal ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteGoal(goalToEdit.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !!(existingActiveOfType && !goalToEdit)}
                className="px-5 py-2 text-xs bg-red-500 hover:bg-red-400 disabled:opacity-50 font-bold text-white rounded-xl transition shadow-lg shadow-red-500/20"
              >
                {goalToEdit ? 'Lưu thay đổi' : 'Tạo mục tiêu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
