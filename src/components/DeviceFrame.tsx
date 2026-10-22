import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  Maximize2,
  Minimize2,
  Minus,
  Square,
  X,
  Laptop,
} from 'lucide-react';
import { DeviceFrameMode } from '../types';

interface DeviceFrameProps {
  mode: DeviceFrameMode;
  onChangeMode: (mode: DeviceFrameMode) => void;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ mode, onChangeMode, children }) => {
  const [currentTime, setCurrentTime] = useState('09:41');
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      onChangeMode('fullscreen');
    } else {
      document.exitFullscreen().catch(() => {});
      onChangeMode('window');
    }
  };

  if (mode === 'fullscreen') {
    return (
      <div className="w-full h-full min-h-screen flex flex-col relative bg-[#070d1e]">
        <div className="fixed top-2 right-2 z-50 flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-2.5 py-1 rounded-full text-[10px] backdrop-blur-md shadow-lg transition">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Standalone Fullscreen
          </span>
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onChangeMode('window');
            }}
            className="hover:text-white p-0.5 rounded ml-1 bg-slate-800 hover:bg-slate-700"
            title="Thoát toàn màn hình"
          >
            <Minimize2 className="w-3 h-3 text-cyan-400" />
          </button>
        </div>
        {children}
      </div>
    );
  }

  if (mode === 'window') {
    return (
      <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center justify-center p-2 sm:p-6 relative selection:bg-cyan-500/30">
        <div className="hidden lg:flex items-center gap-1.5 mb-3 bg-slate-900/90 border border-slate-700/80 rounded-full px-3 py-1 shadow-lg backdrop-blur-md z-30">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1.5 flex items-center gap-1">
            <Laptop className="w-3 h-3 text-cyan-400" /> Chế độ hiển thị
          </span>
          <button
            onClick={() => onChangeMode('window')}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-400 text-slate-950 transition"
          >
            Cửa sổ Standalone
          </button>
          <button
            onClick={() => onChangeMode('responsive')}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium transition text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Tự do (Compact)
          </button>
          <button
            onClick={() => onChangeMode('iphone')}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium transition text-slate-300 hover:text-white hover:bg-slate-800"
          >
            iPhone 16 Pro
          </button>
          <button
            onClick={() => onChangeMode('android')}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium transition text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Android Pixel
          </button>
          <button
            onClick={toggleNativeFullscreen}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium transition text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Maximize2 className="w-3 h-3 inline mr-1 text-cyan-400" /> Toàn màn hình
          </button>
        </div>

        <div
          className={`w-full ${
            isWindowMaximized ? 'max-w-6xl h-[92vh]' : 'max-w-md sm:max-w-xl h-full sm:h-[880px]'
          } bg-[#0b132b] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-700/80 ring-1 ring-white/10 transition-all duration-300`}
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-xs select-none z-30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChangeMode('responsive')}
                className="w-3 h-3 rounded-full bg-red-500/90 hover:bg-red-400 transition flex items-center justify-center group"
                title="Đóng / Đổi chế độ"
              >
                <X className="w-2 h-2 text-slate-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={() => setIsWindowMaximized(!isWindowMaximized)}
                className="w-3 h-3 rounded-full bg-amber-500/90 hover:bg-amber-400 transition flex items-center justify-center group"
                title="Thu nhỏ / Phóng to cửa sổ"
              >
                <Minus className="w-2 h-2 text-slate-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={toggleNativeFullscreen}
                className="w-3 h-3 rounded-full bg-emerald-500/90 hover:bg-emerald-400 transition flex items-center justify-center group"
                title="Toàn màn hình không viền"
              >
                <Square className="w-2 h-2 text-slate-950 opacity-0 group-hover:opacity-100" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
              <img src="/icon.svg" alt="logo" className="w-3.5 h-3.5" />
              <span className="tracking-wide">Koutetsu Ryu Tracker — Standalone App</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                Ngoại Tuyến 100%
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <button
                onClick={toggleNativeFullscreen}
                className="hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition"
                title="Bật toàn màn hình"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#030712] flex flex-col items-center justify-center sm:py-6 sm:px-4 relative selection:bg-cyan-500/30">
      <div className="hidden lg:flex items-center gap-1.5 mb-3 bg-slate-900/90 border border-slate-700/80 rounded-full px-3 py-1 shadow-lg backdrop-blur-md z-30">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1.5 flex items-center gap-1">
          <Smartphone className="w-3 h-3 text-cyan-400" /> Thiết bị:
        </span>
        <button
          onClick={() => onChangeMode('window')}
          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium transition text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Laptop className="w-3 h-3 inline mr-1 text-cyan-400" /> Cửa sổ Standalone
        </button>
        <button
          onClick={() => onChangeMode('responsive')}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition ${
            mode === 'responsive'
              ? 'bg-cyan-400 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Tự do (Compact)
        </button>
        <button
          onClick={() => onChangeMode('iphone')}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition ${
            mode === 'iphone'
              ? 'bg-cyan-400 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          iPhone 16 Pro
        </button>
        <button
          onClick={() => onChangeMode('android')}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition ${
            mode === 'android'
              ? 'bg-cyan-400 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Android Pixel
        </button>
        <button
          onClick={toggleNativeFullscreen}
          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium transition text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Monitor className="w-3 h-3 inline mr-1" /> Toàn màn hình
        </button>
      </div>

      <div
        className={`w-full max-w-md h-full sm:h-[880px] bg-[#0b132b] sm:rounded-[44px] shadow-2xl flex flex-col overflow-hidden relative border border-slate-700/60 sm:ring-8 ${
          mode === 'iphone'
            ? 'sm:ring-slate-800 sm:border-slate-700'
            : mode === 'android'
            ? 'sm:ring-zinc-800 sm:border-zinc-700'
            : 'sm:ring-slate-800/80 sm:border-slate-700'
        }`}
      >
        <div className="hidden sm:flex items-center justify-between px-7 pt-3.5 pb-1 bg-transparent text-[11px] font-semibold text-slate-300 select-none z-30">
          <span className="font-mono text-xs">{currentTime}</span>
          {mode === 'iphone' ? (
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800" />
            </div>
          ) : mode === 'android' ? (
            <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-zinc-800" />
          ) : (
            <div className="h-2" />
          )}
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px]">5G</span>
            <Battery className="w-4 h-4 fill-slate-300" />
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        <div className="hidden sm:flex justify-center pb-2 pt-1 bg-transparent select-none z-30">
          {mode === 'iphone' ? (
            <div className="w-36 h-1 rounded-full bg-slate-500/60" />
          ) : mode === 'android' ? (
            <div className="flex items-center gap-8 text-slate-500 py-0.5">
              <div className="w-2.5 h-2.5 border-t border-l border-slate-500 -rotate-45" />
              <div className="w-3 h-3 rounded-full border border-slate-500" />
              <div className="w-2.5 h-2.5 border border-slate-500" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
