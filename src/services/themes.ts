import { ThemePreset, CustomThemeConfig } from '../types';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'koutetsu-default',
    name: 'Mặc định (Xanh Đen)',
    bgGradient: 'from-[#070d1e] via-[#0b132b] to-[#1c2541]',
    cardBg: 'bg-[#1c2541]/90',
    subcardBg: 'bg-[#131d38]',
    accentColor: 'text-cyan-400',
    accentBorder: 'border-cyan-500/40',
    accentGlow: 'shadow-cyan-500/20',
    textColor: 'text-slate-100',
  },
  {
    id: 'neon-gold',
    name: 'Vàng Neon Hào Khí (Gradient)',
    bgGradient: 'from-[#0d0c00] via-[#231d02] to-[#3d3304]',
    cardBg: 'bg-[#231d02]/95',
    subcardBg: 'bg-[#171301]',
    accentColor: 'text-yellow-400',
    accentBorder: 'border-yellow-400/60',
    accentGlow: 'shadow-[0_0_25px_rgba(250,204,21,0.35)]',
    textColor: 'text-yellow-50',
  },
  {
    id: 'neon-cyber-yellow',
    name: 'Vàng Kim Neon Siêu Sáng',
    bgGradient: 'from-[#120f01] via-[#2b2403] to-[#473b06]',
    cardBg: 'bg-[#2b2403]/95',
    subcardBg: 'bg-[#1a1501]',
    accentColor: 'text-yellow-300',
    accentBorder: 'border-yellow-300/70',
    accentGlow: 'shadow-[0_0_30px_rgba(253,224,71,0.4)]',
    textColor: 'text-yellow-50',
  },
  {
    id: 'blue',
    name: 'Xanh Lam Gradient',
    bgGradient: 'from-[#031525] via-[#072540] to-[#0c3960]',
    cardBg: 'bg-[#0c3960]/90',
    subcardBg: 'bg-[#082845]',
    accentColor: 'text-sky-400',
    accentBorder: 'border-sky-500/40',
    accentGlow: 'shadow-sky-500/20',
    textColor: 'text-sky-100',
  },
  {
    id: 'green',
    name: 'Xanh Ngọc Gradient',
    bgGradient: 'from-[#022c22] via-[#064e3b] to-[#065f46]',
    cardBg: 'bg-[#064e3b]/85',
    subcardBg: 'bg-[#033628]',
    accentColor: 'text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    accentGlow: 'shadow-emerald-500/20',
    textColor: 'text-emerald-50',
  },
  {
    id: 'red',
    name: 'Đỏ Thẫm Gradient',
    bgGradient: 'from-[#200505] via-[#450a0a] to-[#5c0f0f]',
    cardBg: 'bg-[#450a0a]/85',
    subcardBg: 'bg-[#2b0808]',
    accentColor: 'text-red-400',
    accentBorder: 'border-red-500/40',
    accentGlow: 'shadow-red-500/20',
    textColor: 'text-red-50',
  },
  {
    id: 'purple',
    name: 'Tím Neon Gradient',
    bgGradient: 'from-[#130722] via-[#2e1065] to-[#4c0570]',
    cardBg: 'bg-[#2e1065]/85',
    subcardBg: 'bg-[#1f0b42]',
    accentColor: 'text-purple-400',
    accentBorder: 'border-purple-500/40',
    accentGlow: 'shadow-purple-500/20',
    textColor: 'text-purple-50',
  },
  {
    id: 'orange',
    name: 'Cam Hổ Phách Gradient',
    bgGradient: 'from-[#1c0d02] via-[#451a03] to-[#692906]',
    cardBg: 'bg-[#451a03]/85',
    subcardBg: 'bg-[#2b1002]',
    accentColor: 'text-amber-400',
    accentBorder: 'border-amber-500/40',
    accentGlow: 'shadow-amber-500/20',
    textColor: 'text-amber-50',
  },
  {
    id: 'black',
    name: 'Đen Huyền Bí Gradient',
    bgGradient: 'from-[#000000] via-[#09090b] to-[#18181b]',
    cardBg: 'bg-[#18181b]/95',
    subcardBg: 'bg-[#0f0f11]',
    accentColor: 'text-zinc-300',
    accentBorder: 'border-zinc-700',
    accentGlow: 'shadow-none',
    textColor: 'text-white',
  },
  {
    id: 'gray',
    name: 'Xám Titan Gradient',
    bgGradient: 'from-[#111827] via-[#1f2937] to-[#374151]',
    cardBg: 'bg-[#1f2937]/90',
    subcardBg: 'bg-[#111827]',
    accentColor: 'text-slate-300',
    accentBorder: 'border-slate-600',
    accentGlow: 'shadow-slate-500/10',
    textColor: 'text-slate-100',
  },
];

export const DEFAULT_THEME: CustomThemeConfig = {
  presetId: 'koutetsu-default',
  isCustom: false,
  customType: 'gradient',
  customGradientStart: '#070d1e',
  customGradientEnd: '#1c2541',
  customSolidColor: '#070d1e',
  customImageUrl: '',
  customOverlayDarkness: 0.6,
  customBlur: 0,
};

export function getActiveThemePreset(config?: CustomThemeConfig): ThemePreset {
  if (!config) return THEME_PRESETS[0];
  const found = THEME_PRESETS.find((p) => p.id === config.presetId);
  return found || THEME_PRESETS[0];
}

export function computeBackgroundStyles(config?: CustomThemeConfig): React.CSSProperties {
  if (!config || !config.isCustom) return {};

  if (config.customType === 'image' && config.customImageUrl) {
    return {
      backgroundImage: `url(${config.customImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: config.customBlur ? `blur(${config.customBlur}px)` : undefined,
    };
  }

  if (config.customType === 'color' && config.customSolidColor) {
    return {
      backgroundColor: config.customSolidColor,
    };
  }

  if (config.customType === 'gradient' && config.customGradientStart && config.customGradientEnd) {
    return {
      background: `linear-gradient(to bottom, ${config.customGradientStart}, ${config.customGradientEnd})`,
    };
  }

  return {};
}

/**
 * Resizes and compresses an uploaded wallpaper image file into an optimized base64 string
 * to prevent localStorage quota issues and ensure fast load times.
 */
export function processWallpaperUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          // Export high-quality, lightweight JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        reject(new Error('Không thể tải hình ảnh này. Vui lòng thử hình khác.'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc tệp từ thiết bị'));
    };
    reader.readAsDataURL(file);
  });
}
