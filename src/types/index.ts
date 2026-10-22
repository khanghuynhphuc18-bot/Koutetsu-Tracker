export interface Habit {
  id: string;
  title: string;
  frequency?: 'daily' | 'weekdays' | 'weekends';
  category?: string; // backwards compatibility
  categories?: string[]; // multi-category support
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_HABIT_CATEGORIES: string[] = [
  'Thể chất',
  'Tinh thần',
  'Tri thức',
  'Xã hội',
];

export const MAX_HABIT_CATEGORIES = 8;
export const MIN_HABIT_CATEGORIES = 3;

export type HabitLogs = Record<string, Record<string, boolean>>;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
}

export type GoalType = 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'conquered' | 'failed';

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: GoalStatus;
  resolvedAt?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood?: 'steady' | 'fire' | 'calm' | 'triumph' | 'tired';
  rating?: number; // 1 - 5
  habitsCompletedCount?: number;
  habitsTotalCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
  synced: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
}

export interface ThemePreset {
  id: string;
  name: string;
  bgGradient: string;
  cardBg: string;
  subcardBg: string;
  accentColor: string;
  accentBorder: string;
  accentGlow: string;
  textColor: string;
}

export interface CustomThemeConfig {
  presetId: string;
  isCustom: boolean;
  customType: 'gradient' | 'color' | 'image';
  customGradientStart: string;
  customGradientEnd: string;
  customSolidColor: string;
  customImageUrl: string;
  customOverlayDarkness: number; // 0 to 1
  customBlur: number; // px
  reduceTranslucency?: boolean; // When true, UI cards become solid opaque for maximum clarity
}

export type DeviceFrameMode = 'responsive' | 'iphone' | 'android' | 'fullscreen' | 'window';

export interface AppState {
  hasCompletedTutorial: boolean;
  username: string;
  goals: Goal[];
  quote?: string;
  author: string;
  habits: Habit[];
  habitCategories?: string[]; // max 8, min 3
  logs: HabitLogs;
  tasks: Task[];
  journalEntries: JournalEntry[];
  selectedDate: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: CustomThemeConfig;
  deviceFrame: DeviceFrameMode;
  lastAcknowledgedRank?: string;
}

