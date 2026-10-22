import React from 'react';
import { X, Award, CheckCircle, Info, Sparkles } from 'lucide-react';
import { RANK_TIERS, getUserRank } from '../utils/ranks';

interface RankGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTimeCompletedCount: number;
  onPreviewRankUp?: () => void;
}

export const RankGuideModal: React.FC<RankGuideModalProps> = ({
  isOpen,
  onClose,
  allTimeCompletedCount,
  onPreviewRankUp,
}) => {
  if (!isOpen) return null;

  const { current, next, neededForNext, progressPercent } = getUserRank(allTimeCompletedCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0b132b] border border-cyan-500/40 rounded-3xl max-w-sm w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hướng Dẫn Hệ Thống Rank
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CẤP BẬC HIỆN TẠI
                </span>
                <div className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                  <span className={current.badgeText}>{current.name}</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({allTimeCompletedCount} lần)
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${current.badgeBg} ${current.border} ${current.badgeText}`}
              >
                <Award className="w-5 h-5" />
              </div>
            </div>

            {next ? (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">
                    Lên cấp tiếp theo (<strong>{next.name}</strong>):
                  </span>
                  <span className="text-cyan-400 font-bold">Cần thêm {neededForNext} lần</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-rose-400 font-semibold pt-1 border-t border-slate-800">
                Đã đạt đỉnh cao nhất: Chiến Thần
              </div>
            )}
          </div>

          <div className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase text-[11px]">
              <Info className="w-3.5 h-3.5" /> Quy tắc tính điểm Rank:
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
              <li>
                <strong>Mỗi 1 lần tick thói quen = +1 điểm tích lũy</strong> vào tổng số lần hoàn thành.
              </li>
              <li>
                <strong>Không bao giờ giảm</strong>: Dù bận quên vài ngày điểm tích lũy vẫn được giữ nguyên.
              </li>
              <li>
                Lưu trữ trực tiếp trên máy, hoạt động hoàn toàn ngoại tuyến không cần wifi.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              BẢNG CẤP BẬC KOUTETSU RYU:
            </div>
            <div className="space-y-2">
              {RANK_TIERS.map((tier) => {
                const isCurrent = current.name === tier.name;
                const isPassed = allTimeCompletedCount >= tier.min;
                return (
                  <div
                    key={tier.name}
                    className={`p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                      isCurrent
                        ? 'bg-cyan-950/50 border-cyan-400 ring-1 ring-cyan-400/50'
                        : isPassed
                        ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                          tier.badgeBg
                        } ${tier.border} ${tier.badgeText}`}
                      >
                        {isPassed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span>{tier.min}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isCurrent ? 'text-white' : isPassed ? 'text-slate-200' : 'text-slate-500'
                            }`}
                          >
                            {tier.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                              Hiện tại
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tier.max === null
                            ? `Từ ${tier.min} lần hoàn thành trở lên`
                            : tier.min === 0
                            ? '0 lần hoàn thành (Khởi đầu)'
                            : `Từ ${tier.min} đến ${tier.max} lần hoàn thành`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-mono font-bold ${tier.badgeText}`}>
                        {tier.min}+
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3.5 border-t border-slate-700/80 bg-slate-900/80 flex items-center justify-between gap-2">
          {onPreviewRankUp ? (
            <button
              onClick={() => {
                onClose();
                onPreviewRankUp();
              }}
              className="text-[11px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-bold bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-1.5 rounded-lg transition"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" /> Xem màn hình chúc mừng
            </button>
          ) : (
            <span className="text-[10px] text-slate-400">Koutetsu Ryu Habit Tracker</span>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition shrink-0"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
