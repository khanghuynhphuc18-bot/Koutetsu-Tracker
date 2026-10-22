import React, { useState } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Check,
  RefreshCw,
  Upload,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { CustomThemeConfig } from '../types';
import { THEME_PRESETS, processWallpaperUpload } from '../services/themes';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: CustomThemeConfig;
  onSaveTheme: (theme: CustomThemeConfig) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSaveTheme,
}) => {
  const [themeDraft, setThemeDraft] = useState<CustomThemeConfig>({
    ...currentTheme,
    reduceTranslucency: currentTheme?.reduceTranslucency !== undefined ? currentTheme.reduceTranslucency : true,
    customOverlayDarkness: currentTheme?.customOverlayDarkness ?? 0.65,
  });
  const [activeTab, setActiveTab] = useState<'presets' | 'custom_wallpaper'>('presets');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const updated: CustomThemeConfig = {
      ...themeDraft,
      presetId,
      isCustom: false,
    };
    setThemeDraft(updated);
    onSaveTheme(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsProcessingUpload(true);
    try {
      const dataUrl = await processWallpaperUpload(file);
      const updated: CustomThemeConfig = {
        ...themeDraft,
        isCustom: true,
        customType: 'image',
        customImageUrl: dataUrl,
        reduceTranslucency: true, // Enables frosted glass effect on cards
        customOverlayDarkness: 0, // 0 = 100% original brightness (no darkening)
        customBlur: 0, // 0 = sharp, unblurred wallpaper
      };
      setThemeDraft(updated);
      onSaveTheme(updated);
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setIsProcessingUpload(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleRemoveCustomWallpaper = () => {
    const updated: CustomThemeConfig = {
      ...themeDraft,
      isCustom: false,
      customImageUrl: '',
    };
    setThemeDraft(updated);
    onSaveTheme(updated);
  };

  const handleUpdateSetting = (updates: Partial<CustomThemeConfig>) => {
    const updated: CustomThemeConfig = {
      ...themeDraft,
      ...updates,
    };
    setThemeDraft(updated);
    onSaveTheme(updated);
  };

  const hasCustomWallpaper = themeDraft.isCustom && !!themeDraft.customImageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-[#0f172a] border border-cyan-500/40 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              HÌNH NỀN & GIAO DIỆN
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Bộ màu chuẩn
          </button>
          <button
            onClick={() => setActiveTab('custom_wallpaper')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'custom_wallpaper'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Tải hình nền riêng
            {hasCustomWallpaper && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: PRESET COLOR THEMES */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-300 font-medium">
                Chọn một bộ tông màu gradient có sẵn:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = !themeDraft.isCustom && themeDraft.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/60 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${preset.bgGradient} border border-slate-600 shadow-sm flex items-center justify-center shrink-0`}
                        >
                          <div className={`w-3 h-3 rounded-full ${preset.accentColor.replace('text-', 'bg-')}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{preset.name}</div>
                          <div className="text-[10px] text-slate-400">Tối ưu cho hiển thị sắc nét</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM WALLPAPER UPLOAD & TRANSLUCENCY CONTROLS */}
          {activeTab === 'custom_wallpaper' && (
            <div className="space-y-4">
              {/* Upload Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Tải ảnh từ máy làm hình nền</span>
                  </div>
                  {hasCustomWallpaper && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Đang áp dụng
                    </span>
                  )}
                </div>

                {/* Upload Button */}
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 p-4 rounded-xl text-center transition flex flex-col items-center justify-center gap-2">
                    <Upload className="w-6 h-6 text-cyan-400" />
                    <div>
                      <span className="text-xs font-bold text-cyan-300">
                        {isProcessingUpload ? 'Đang nén & tối ưu ảnh...' : 'Nhấn để chọn ảnh từ điện thoại / máy tính'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Hỗ trợ PNG, JPG, WebP. Tự động tối ưu dung lượng.
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isProcessingUpload}
                    className="hidden"
                  />
                </label>

                {uploadError && (
                  <p className="text-xs text-red-400 font-medium">{uploadError}</p>
                )}

                {/* Thumbnail Preview & Remove Button */}
                {hasCustomWallpaper && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl bg-cover bg-center border border-slate-700 shrink-0 shadow-sm"
                        style={{ backgroundImage: `url(${themeDraft.customImageUrl})` }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">Hình nền của bạn</div>
                        <div className="text-[10px] text-slate-400">Đã lưu trong ứng dụng</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCustomWallpaper}
                      className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-semibold transition flex items-center gap-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Gỡ ảnh</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TRANSLUCENCY & READABILITY OPTIMIZATIONS */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Tối ưu độ dễ nhìn cho UI</span>
                </div>

                {/* Translucency Switch */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-semibold">Hiệu ứng UI mờ (Kính mờ cho thẻ):</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSetting({
                          reduceTranslucency: !themeDraft.reduceTranslucency,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        themeDraft.reduceTranslucency !== false
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      {themeDraft.reduceTranslucency !== false ? 'BẬT (Khuyên dùng)' : 'TẮT'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Tạo hiệu ứng kính mờ (frosted glass) cho các thẻ UI giúp đọc chữ và số dễ dàng, trong khi hình nền vẫn sáng nét, không bị tối.
                  </p>
                </div>

                {/* Wallpaper Darkness Overlay */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-semibold">Lớp tối phủ hình nền:</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {Math.round((themeDraft.customOverlayDarkness ?? 0) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '0% (Gốc)', value: 0 },
                      { label: '25%', value: 0.25 },
                      { label: '50%', value: 0.5 },
                      { label: '75%', value: 0.75 },
                    ].map((lvl) => {
                      const isSel = Math.abs((themeDraft.customOverlayDarkness ?? 0) - lvl.value) < 0.08;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => handleUpdateSetting({ customOverlayDarkness: lvl.value })}
                          className={`py-1.5 rounded-xl text-[11px] font-bold border transition ${
                            isSel
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wallpaper Blur */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-semibold">Độ mờ nét ảnh (Blur):</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {themeDraft.customBlur || 0}px
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Sắc nét (0px)', value: 0 },
                      { label: 'Mờ nhẹ (3px)', value: 3 },
                      { label: 'Mờ sâu (6px)', value: 6 },
                    ].map((b) => {
                      const isSel = (themeDraft.customBlur || 0) === b.value;
                      return (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => handleUpdateSetting({ customBlur: b.value })}
                          className={`py-1.5 rounded-xl text-[11px] font-bold border transition ${
                            isSel
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={() => handleSelectPreset('koutetsu-default')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" /> Mặc định
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
