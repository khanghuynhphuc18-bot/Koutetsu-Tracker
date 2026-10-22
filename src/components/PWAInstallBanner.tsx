import React, { useState } from 'react';
import { Download, Smartphone, Check, X, Laptop, Terminal } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { StandaloneAppModal } from './StandaloneAppModal';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'card' | 'compact';
  onSelectFrameMode?: (mode: 'window' | 'fullscreen' | 'iphone' | 'android' | 'responsive') => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  variant = 'banner',
  onSelectFrameMode,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [showStandaloneModal, setShowStandaloneModal] = useState(false);
  const [modalTab, setModalTab] = useState<'android' | 'install' | 'launcher' | 'guide'>('android');
  const [dismissed, setDismissed] = useState(false);

  const openModal = (tab: 'android' | 'install' | 'launcher' | 'guide' = 'android') => {
    setModalTab(tab);
    setShowStandaloneModal(true);
  };

  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Đang chạy <strong>Ứng dụng độc lập (Standalone App)</strong></span>
          </div>
          <button
            onClick={() => openModal('android')}
            className="text-[10px] bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 px-2 py-1 rounded-lg border border-emerald-600 transition"
          >
            Tùy chọn file
          </button>
          {showStandaloneModal && (
            <StandaloneAppModal
              isOpen={showStandaloneModal}
              onClose={() => setShowStandaloneModal(false)}
              onSelectFrameMode={onSelectFrameMode}
              initialTab={modalTab}
            />
          )}
        </div>
      );
    }
    return null;
  }

  if (dismissed && variant === 'banner') {
    return null;
  }

  if (variant === 'card') {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1836] via-slate-900 to-slate-900 border border-cyan-500/50 space-y-3.5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-400/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  TRUNG TÂM APP ĐỘC LẬP & FILE ANDROID
                </h4>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  ANDROID & DESKTOP
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Cài đặt & tải file ứng dụng cho Android (.apk, WebAPK, .html) và máy tính Windows (.bat)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => openModal('android')}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-500/20"
          >
            <Smartphone className="w-4 h-4 stroke-[2.5]" />
            File Android (.apk)
          </button>

          {isInstallable ? (
            <button
              onClick={install}
              className="py-2.5 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-cyan-500/20"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Cài App 1-Click
            </button>
          ) : (
            <button
              onClick={() => openModal('install')}
              className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Laptop className="w-4 h-4" />
              Cài Đặt Trực Tiếp
            </button>
          )}

          <button
            onClick={() => openModal('launcher')}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            File PC (.bat)
          </button>
        </div>

        {showStandaloneModal && (
          <StandaloneAppModal
            isOpen={showStandaloneModal}
            onClose={() => setShowStandaloneModal(false)}
            onSelectFrameMode={onSelectFrameMode}
            initialTab={modalTab}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border-b border-cyan-500/40 px-3.5 py-2 flex items-center justify-between text-xs text-slate-200 shadow-md">
        <div
          onClick={() => openModal(isAndroid ? 'android' : 'install')}
          className="flex items-center gap-2 overflow-hidden mr-2 cursor-pointer hover:opacity-90 transition"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <span className="truncate text-[11px]">
            {isAndroid ? (
              <span>📲 <strong>File Android (.apk)</strong> & Cài Đặt App Độc Lập</span>
            ) : (
              <span>⚡ <strong>File Android (.apk)</strong> / Desktop (.bat) & Cài App</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => openModal('android')}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            <Smartphone className="w-3 h-3 stroke-[3]" />
            <span>File Android</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {showStandaloneModal && (
        <StandaloneAppModal
          isOpen={showStandaloneModal}
          onClose={() => setShowStandaloneModal(false)}
          onSelectFrameMode={onSelectFrameMode}
          initialTab={modalTab}
        />
      )}
    </>
  );
};
