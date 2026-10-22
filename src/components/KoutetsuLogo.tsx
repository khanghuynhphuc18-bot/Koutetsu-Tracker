import React, { useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface KoutetsuLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  allowUpload?: boolean;
  className?: string;
}

export const KoutetsuLogo: React.FC<KoutetsuLogoProps> = ({
  size = 'md',
  allowUpload = false,
  className = '',
}) => {
  const [logoSrc, setLogoSrc] = useState<string>('/icon.svg');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const custom = localStorage.getItem('koutetsu_custom_logo');
    if (custom) {
      setLogoSrc(custom);
    }
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg p-0.5',
    md: 'w-11 h-11 rounded-xl p-1',
    lg: 'w-16 h-16 rounded-2xl p-1.5',
    xl: 'w-24 h-24 rounded-3xl p-2',
  }[size];

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          localStorage.setItem('koutetsu_custom_logo', base64);
          setLogoSrc(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div
        className={`relative group flex-shrink-0 bg-white shadow-md border border-slate-300 overflow-hidden ${sizeClasses} ${className}`}
        title="Biểu trưng Koutetsu Ryu"
      >
        <img
          src={logoSrc}
          alt="Koutetsu Ryu Logo"
          className="w-full h-full object-contain select-none cursor-pointer"
          onClick={() => setIsPreviewOpen(true)}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.indexOf('icon.svg') === -1) {
              target.src = '/icon.svg';
            }
          }}
        />
        {allowUpload && (
          <label
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            title="Tải ảnh logo gốc"
          >
            <Camera className="w-3.5 h-3.5 text-white drop-shadow" />
            <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
          </label>
        )}
      </div>

      {/* Full preview modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-150"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Logo Koutetsu Ryu
              </span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-2xl p-3 flex items-center justify-center border border-slate-300">
              <img
                src={logoSrc}
                alt="Logo Koutetsu Ryu"
                className="w-full max-h-[320px] object-contain select-none"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Chọn ảnh từ máy
                <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
              </label>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
