import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  Apple,
  Check,
  ExternalLink,
  Shield,
  Terminal,
  Maximize2,
  Sparkles,
  Laptop,
  CheckCircle2,
  FileCode,
  QrCode,
  Package,
  FolderArchive,
  Copy,
} from 'lucide-react';
import JSZip from 'jszip';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { KoutetsuLogo } from './KoutetsuLogo';

interface StandaloneAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFrameMode?: (mode: 'window' | 'fullscreen' | 'iphone' | 'android' | 'responsive') => void;
  initialTab?: 'android' | 'install' | 'launcher' | 'guide';
}

export const StandaloneAppModal: React.FC<StandaloneAppModalProps> = ({
  isOpen,
  onClose,
  onSelectFrameMode,
  initialTab = 'android',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'install' | 'launcher' | 'guide'>(
    initialTab || (isAndroid ? 'android' : 'install')
  );
  const [downloadedBat, setDownloadedBat] = useState(false);
  const [downloadedMac, setDownloadedMac] = useState(false);
  const [downloadedAndroidHtml, setDownloadedAndroidHtml] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadedZip, setDownloadedZip] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenActive(true);
        if (onSelectFrameMode) onSelectFrameMode('fullscreen');
      } else {
        await document.exitFullscreen();
        setIsFullscreenActive(false);
      }
    } catch {
      if (onSelectFrameMode) onSelectFrameMode('fullscreen');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      setCopiedUrl(false);
    }
  };

  const downloadAndroidLauncherHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#030712">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <title>Koutetsu Ryu Tracker - Standalone App</title>
</head>
<body style="margin:0;background:#030712;color:#38bdf8;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;">
  <h2>KOUTETSU RYU TRACKER</h2>
  <p>Đang khởi động ứng dụng...</p>
  <a href="${currentUrl}" style="color:#fff;background:#0284c7;padding:10px 20px;border-radius:8px;text-decoration:none;">MỞ ỨNG DỤNG NGAY</a>
  <script>
    setTimeout(function() { window.location.href = "${currentUrl}"; }, 500);
  </script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KoutetsuRyu-Android-App.html';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedAndroidHtml(true);
  };

  const downloadAndroidProjectZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      zip.file('README.txt', 'Huong dan cai dat Koutetsu Ryu Tracker tren Android');
      zip.file('app_url.txt', currentUrl);
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'KoutetsuRyu-Android-Package.zip';
      a.click();
      URL.revokeObjectURL(url);
      setDownloadedZip(true);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const downloadWindowsLauncher = () => {
    const batScript =
      `@echo off\r\n` +
      `title Koutetsu Ryu Tracker - Standalone App\r\n` +
      `start msedge --app="${currentUrl}" 2>nul || start chrome --app="${currentUrl}" 2>nul || start "" "${currentUrl}"\r\n` +
      `exit\r\n`;
    const blob = new Blob([batScript], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chay-KoutetsuRyu-App.bat';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedBat(true);
  };

  const downloadMacLauncher = () => {
    const shScript =
      `#!/bin/bash\n` +
      `open -na "Google Chrome" --args --app="${currentUrl}" 2>/dev/null || open -a Safari "${currentUrl}"\n`;
    const blob = new Blob([shScript], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chay-KoutetsuRyu-App.command';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedMac(true);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b132b] border border-cyan-500/40 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        <div className="p-4 sm:p-5 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KoutetsuLogo size="sm" allowUpload={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  TRUNG TÂM APP ĐỘC LẬP
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  STANDALONE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Cài đặt & tải file ứng dụng cho Android, Windows, Mac
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-950/70 px-3 pt-2 gap-1 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'android'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>File Android (.apk)</span>
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'install'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cài Đặt 1-Click</span>
          </button>
          <button
            onClick={() => setActiveTab('launcher')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'launcher'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>File Máy Tính (.bat / .cmd)</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {isInstalled && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Bạn đang chạy ứng dụng dưới dạng <strong>Standalone App</strong> (độc lập, không có thanh duyệt web)!
              </span>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Cài đặt ứng dụng trên Android</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Hệ điều hành Android hỗ trợ cài đặt trực tiếp dạng WebAPK hoặc tải file ứng dụng chạy độc lập:
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Cách 1: Tạo WebAPK Trực Tiếp (Khuyên nghị)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Khi mở trên Chrome Android, bấm menu 3 chấm ở góc trên phải, chọn <strong>"Cài đặt ứng dụng"</strong> (hoặc Thêm vào màn hình chính).
                </p>
                {isInstallable ? (
                  <button
                    onClick={async () => {
                      await install();
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
                  >
                    <Download className="w-4 h-4 stroke-[3]" />
                    CÀI ĐẶT NGAY
                  </button>
                ) : (
                  <button
                    onClick={downloadAndroidLauncherHtml}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <FileCode className="w-4 h-4" />
                    Tải File Chạy Android (.html)
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-md flex-shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-white font-bold">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Quét Bằng Camera Điện Thoại</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Dùng camera quét mã QR để mở app trực tiếp trên điện thoại.
                  </p>
                  <button
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã Sao Chép Link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao Chép Link Gửi Sang Điện Thoại</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Cài đặt trực tiếp vào thiết bị</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Khi cài đặt, app sẽ hiển thị như ứng dụng gốc với icon riêng, chạy độc lập không có thanh URL.
                </p>
              </div>

              {isInstallable ? (
                <button
                  onClick={async () => {
                    await install();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  CÀI ĐẶT APP NGAY
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (onSelectFrameMode) onSelectFrameMode('window');
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Monitor className="w-4 h-4" />
                    Chuyển sang Khung Cửa Sổ Desktop Standalone
                  </button>
                  <button
                    onClick={handleToggleFullscreen}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Maximize2 className="w-4 h-4 text-cyan-400" />
                    {isFullscreenActive ? 'Thoát Toàn Màn Hình' : 'Bật Toàn Màn Hình (F11)'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'launcher' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>File Khởi Chạy Desktop Nhanh</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Tải file khởi chạy về máy tính. Khi nhấp vào, app sẽ mở trong cửa sổ độc lập không có thanh URL.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={downloadWindowsLauncher}
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-cyan-500/40 text-left transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-cyan-400" /> Windows (.bat)
                    </span>
                    {downloadedBat ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Tải file Chay-KoutetsuRyu-App.bat về Desktop máy tính
                  </p>
                </button>

                <button
                  onClick={downloadMacLauncher}
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700 text-left transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-slate-300" /> macOS (.command)
                    </span>
                    {downloadedMac ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Tải file Chay-KoutetsuRyu-App.command cho Mac
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Koutetsu Ryu — 100% offline</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
