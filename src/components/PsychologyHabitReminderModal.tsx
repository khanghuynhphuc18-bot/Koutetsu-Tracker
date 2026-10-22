import React from 'react';
import { Brain, X, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface PsychologyHabitReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  pendingHabitTitle?: string;
  currentHabitsCount: number;
}

export const PsychologyHabitReminderModal: React.FC<PsychologyHabitReminderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingHabitTitle,
  currentHabitsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-gradient-to-b from-[#1c2541] to-[#0b132b] border border-amber-500/40 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl shadow-amber-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Góc Nhắc Nhở
              </h3>
              <p className="text-[10px] text-slate-400">Khoa học hình thành thói quen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Tạo hơn 3 thói quen cần chú ý!</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Bạn hiện đang có <strong className="text-cyan-400">{currentHabitsCount} thói quen</strong>.
            {pendingHabitTitle && (
              <span> Bạn đang muốn tạo thêm: <em className="text-amber-200">"{pendingHabitTitle}"</em>.</span>
            )}
          </p>
        </div>

        <div className="space-y-2 text-xs text-slate-300 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
          <div className="font-semibold text-white text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Vì sao tối đa 3 thói quen?
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
            <li>
              <strong className="text-amber-300">Ý chí hữu hạn:</strong> Năng lượng rèn luyện thói quen mỗi ngày có giới hạn.
            </li>
            <li>
              <strong className="text-amber-300">Nguy cơ bỏ cuộc:</strong> Cố gắng rèn nhiều hơn 3 thói quen mới dễ gây áp lực tâm lý.
            </li>
            <li>
              <strong className="text-cyan-300">Quy tắc vàng 3 thói quen:</strong> Rèn luyện kiên định 1 - 3 thói quen trước khi thêm mới.
            </li>
          </ul>
        </div>

        <div className="pt-1 space-y-2">
          {onConfirm ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Tôi hiểu, vẫn thêm thói quen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/80 transition"
              >
                Để sau, giữ tối đa 3 thói quen
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition"
            >
              Đã hiểu & Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
