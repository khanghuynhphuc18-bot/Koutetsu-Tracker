import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckSquare,
  Target,
  Timer,
  BookOpen,
  Layers,
  Award,
  Sparkles,
  CheckCircle2,
  Palette,
  Crown,
  ShieldAlert,
} from 'lucide-react';
import { THEME_PRESETS } from '../services/themes';

interface TutorialModalProps {
  isOpen: boolean;
  initialUsername: string;
  initialPresetId: string;
  onFinish: (username: string, initialGoalTitle: string, selectedPresetId: string) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  initialUsername,
  initialPresetId,
  onFinish,
}) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(initialUsername || '');
  const [initialGoal, setInitialGoal] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(initialPresetId || 'koutetsu-default');

  if (!isOpen) return null;

  const handleFinish = () => {
    const finalName = username.trim() || 'Bạn';
    onFinish(finalName, initialGoal.trim(), selectedPresetId);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b132b] border border-cyan-500/40 rounded-3xl w-full max-w-sm p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Step Progress Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              {step === 1 ? 'HƯỚNG DẪN TÍNH NĂNG' : 'THIẾT LẬP BAN ĐẦU'}
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 1 ? 'bg-cyan-400 w-6' : 'bg-slate-700 w-2.5'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 2 ? 'bg-cyan-400 w-6' : 'bg-slate-700 w-2.5'
              }`}
            />
          </div>
        </div>

        {/* STEP 1: CÁC TÍNH NĂNG TRONG APP (GỌN GÀNG, ĐẦY ĐỦ TẤT CẢ VÀ RÕ RÀNG VỀ MỤC TIÊU) */}
        {step === 1 && (
          <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
            {/* 1. MỤC TIÊU - GIẢI THÍCH CHI TIẾT CÁCH HOẠT ĐỘNG */}
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-red-900/60 border border-red-500/40 text-red-400 flex-shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Mục Tiêu: Cách hoạt động</span>
                  </h4>
                  <span className="text-[10px] text-red-300 font-semibold">
                    1 Tuần (7 ngày) & 1 Tháng (30 ngày)
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-200 space-y-1.5 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-red-900/40">
                <p>
                  🎯 <strong>Đặt mục tiêu:</strong> Tạo tối đa 2 mục tiêu có thời hạn để giữ sự tập trung cao độ.
                </p>
                <p>
                  ⏳ <strong>Thời hạn (Deadline):</strong> Mỗi ngày đếm ngược thời gian còn lại.
                </p>
                <p>
                  👑 <strong>Tự đánh giá kết quả:</strong>
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center gap-1.5 text-[10px] text-amber-300">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Chinh phục:</strong> Đạt mục tiêu (Vương miện)</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1.5 text-[10px] text-slate-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span><strong>Thất bại:</strong> Ghi nhận bài học (Khiên vỡ)</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Khi hết hạn, ứng dụng tự động mở bảng để bạn xác nhận hoặc gia hạn thêm ngày.
                </p>
              </div>
            </div>

            {/* 2. CÁC TÍNH NĂNG KHÁC */}
            <div className="space-y-2">
              {/* Thói quen */}
              <div className="p-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/70 flex items-start gap-2.5 shadow-sm">
                <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 flex-shrink-0 mt-0.5 text-cyan-400">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">Thói quen hôm nay</h4>
                  <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                    Tạo thói quen, tích hoàn thành hàng ngày. Phân 1 thói quen vào nhiều mục để hiển thị lên Biểu đồ hình.
                  </p>
                </div>
              </div>

              {/* Tập trung */}
              <div className="p-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/70 flex items-start gap-2.5 shadow-sm">
                <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 flex-shrink-0 mt-0.5 text-amber-400">
                  <Timer className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">Đồng hồ tập trung & Thiền thở</h4>
                  <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                    Đồng hồ bấm giờ / đếm ngược Pomodoro + bài tập Thở Hộp (Box Breathing) 4 nhịp xoa dịu thần kinh.
                  </p>
                </div>
              </div>

              {/* Nhật ký */}
              <div className="p-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/70 flex items-start gap-2.5 shadow-sm">
                <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 flex-shrink-0 mt-0.5 text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">Nhật ký</h4>
                  <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                    Ghi lại cảm xúc, chấm sao hài lòng với bản thân và đúc kết bài học cuối ngày.
                  </p>
                </div>
              </div>

              {/* Tiến độ & Biểu đồ hình */}
              <div className="p-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/70 flex items-start gap-2.5 shadow-sm">
                <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 flex-shrink-0 mt-0.5 text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">Tiến độ & Biểu đồ hình</h4>
                  <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                    Biểu đồ hình đa trục (Thể chất, Tinh thần, Tri thức, Xã hội... tạo thêm tối đa 8 mục) cùng biểu đồ cột chi tiết.
                  </p>
                </div>
              </div>

              {/* Hệ thống Rank */}
              <div className="p-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/70 flex items-start gap-2.5 shadow-sm">
                <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 flex-shrink-0 mt-0.5 text-yellow-400">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">Hệ thống Cấp Bậc (Rank)</h4>
                  <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                    Mỗi lần check thói quen tích điểm thăng hạng từ Sửu Nhi đến Chiến Thần, có màn hình vinh danh khi lên cấp.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25"
              >
                <span>Tiếp tục thiết lập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: THIẾT LẬP TÊN, MỤC TIÊU VÀ MÀU GIAO DIỆN */}
        {step === 2 && (
          <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
            <div className="text-center space-y-0.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Thiết Lập Ban Đầu
              </h3>
              <p className="text-[11px] text-slate-300">
                Nhập tên và chọn tông màu bạn thích:
              </p>
            </div>

            {/* Username Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-200">
                Tên của bạn:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: Minh, An, Long..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                autoFocus
              />
            </div>

            {/* Initial Goal (Optional) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-slate-200">
                  Mục tiêu tuần đầu tiên (Tùy chọn):
                </label>
                <span className="text-[9px] font-bold text-red-400 px-1.5 py-0.2 rounded bg-red-950/60 border border-red-500/30">
                  1 Tuần
                </span>
              </div>
              <input
                type="text"
                value={initialGoal}
                onChange={(e) => setInitialGoal(e.target.value)}
                placeholder="VD: Rèn luyện 15 phút mỗi ngày..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Theme Presets */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Màu sắc giao diện:</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/70 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div
                          className={`w-4 h-4 rounded-md bg-gradient-to-br ${preset.bgGradient} border border-slate-600 flex-shrink-0 flex items-center justify-center`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${preset.accentColor.replace(
                              'text-',
                              'bg-'
                            )}`}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-white truncate">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-cyan-400 stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Lùi
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-2/3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-lg shadow-cyan-500/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bắt đầu ngay</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
