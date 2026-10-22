import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  habitTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  habitTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-[#1c2541] border border-red-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>Xác nhận xóa thói quen</span>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-slate-200">
            Bạn có chắc chắn muốn xóa thói quen{' '}
            <strong className="text-white bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700 inline-block my-1">
              "{habitTitle}"
            </strong>{' '}
            khỏi danh sách?
          </p>
          <p className="text-[11px] text-slate-400">
            Lịch sử hoàn thành trước đây của thói quen này vẫn được bảo toàn trong tổng điểm Rank của bạn.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-xs bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-red-600/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
};
