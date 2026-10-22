export interface RankTier {
  name: string;
  min: number;
  max: number | null;
  badgeBg: string;
  badgeText: string;
  border: string;
  description: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    name: 'Chưa có rank',
    min: 0,
    max: 0,
    badgeBg: 'bg-slate-800',
    badgeText: 'text-slate-400',
    border: 'border-slate-700',
    description: 'Bắt đầu hoàn thành thói quen đầu tiên để mở rank!',
  },
  {
    name: 'Sửu nhi',
    min: 1,
    max: 9,
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-400',
    border: 'border-emerald-500/50',
    description: 'Từ 1 lần hoàn thành trở lên.',
  },
  {
    name: 'Tập sự',
    min: 10,
    max: 29,
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-400',
    border: 'border-cyan-500/50',
    description: 'Từ 10 lần hoàn thành trở lên.',
  },
  {
    name: 'Võ giả',
    min: 30,
    max: 49,
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-blue-400',
    border: 'border-blue-500/50',
    description: 'Từ 30 lần hoàn thành trở lên.',
  },
  {
    name: 'Thiền sư',
    min: 50,
    max: 69,
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-300',
    border: 'border-purple-500/50',
    description: 'Từ 50 lần hoàn thành trở lên.',
  },
  {
    name: 'Thánh kiếm',
    min: 70,
    max: 119,
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-400',
    border: 'border-amber-500/50',
    description: 'Từ 70 đến 119 lần hoàn thành - Đỉnh cao rèn luyện.',
  },
  {
    name: 'Chiến thần',
    min: 120,
    max: null,
    badgeBg: 'bg-rose-950/80',
    badgeText: 'text-rose-400',
    border: 'border-rose-500/60',
    description: 'Từ 120 lần hoàn thành trở lên - Cảnh giới Chiến Thần.',
  },
];

export function getUserRank(totalCompleted: number): {
  current: RankTier;
  next: RankTier | null;
  neededForNext: number;
  progressPercent: number;
} {
  let currentTier = RANK_TIERS[0];
  let nextTier: RankTier | null = RANK_TIERS[1];

  for (let i = 0; i < RANK_TIERS.length; i++) {
    const tier = RANK_TIERS[i];
    if (totalCompleted >= tier.min) {
      if (tier.max === null || totalCompleted <= tier.max) {
        currentTier = tier;
        nextTier = RANK_TIERS[i + 1] || null;
        break;
      }
    }
  }

  let neededForNext = 0;
  let progressPercent = 100;

  if (nextTier) {
    neededForNext = Math.max(0, nextTier.min - totalCompleted);
    const range = nextTier.min - currentTier.min;
    const currentInRange = totalCompleted - currentTier.min;
    progressPercent = range > 0 ? Math.min(100, Math.round((currentInRange / range) * 100)) : 100;
  }

  return {
    current: currentTier,
    next: nextTier,
    neededForNext,
    progressPercent,
  };
}

export function getRankTierIndex(tierName: string): number {
  return RANK_TIERS.findIndex((t) => t.name === tierName);
}

