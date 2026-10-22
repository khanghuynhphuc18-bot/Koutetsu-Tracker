import { AppState, DEFAULT_HABIT_CATEGORIES, MAX_HABIT_CATEGORIES } from '../types';
import { DEFAULT_THEME } from './themes';

const STORAGE_KEY = 'koutetsu_tracker_v4_state';
const SYNC_QUEUE_KEY = 'koutetsu_tracker_v4_sync_queue';
const LAST_SYNC_KEY = 'koutetsu_tracker_v4_last_sync';

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const curr = new Date(y, m - 1, d);
  curr.setDate(curr.getDate() - 1);
  const year = curr.getFullYear();
  const month = String(curr.getMonth() + 1).padStart(2, '0');
  const day = String(curr.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Zero default habits per user instruction: "Đừng làm giúp user default habit."
export const INITIAL_STATE: AppState = {
  hasCompletedTutorial: false,
  username: '',
  goals: [],
  author: '',
  habits: [],
  habitCategories: [...DEFAULT_HABIT_CATEGORIES],
  logs: {},
  tasks: [],
  journalEntries: [],
  selectedDate: getTodayDateStr(),
  soundEnabled: true,
  hapticEnabled: true,
  theme: DEFAULT_THEME,
  deviceFrame: 'responsive',
};

export function loadStoredState(): AppState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);

    // Normalize habit categories (ensure max 8 and min defaults)
    let categories: string[] = Array.isArray(parsed.habitCategories) && parsed.habitCategories.length > 0
      ? parsed.habitCategories
      : [...DEFAULT_HABIT_CATEGORIES];

    // Deduplicate and cap at 8
    categories = Array.from(new Set(categories)).slice(0, MAX_HABIT_CATEGORIES);
    if (categories.length === 0) {
      categories = [...DEFAULT_HABIT_CATEGORIES];
    }

    // Normalize habits to ensure categories array is populated
    const rawHabits: any[] = Array.isArray(parsed.habits) ? parsed.habits : [];
    const normalizedHabits = rawHabits.map((h) => {
      let catList: string[] = [];
      if (Array.isArray(h.categories) && h.categories.length > 0) {
        catList = h.categories;
      } else if (typeof h.category === 'string' && h.category.trim()) {
        catList = [h.category.trim()];
      } else {
        catList = [categories[0] || 'Thể chất'];
      }
      return {
        ...h,
        categories: catList,
      };
    });

    return {
      ...INITIAL_STATE,
      ...parsed,
      goals: parsed.goals || [],
      habits: normalizedHabits,
      habitCategories: categories,
      logs: parsed.logs || {},
      tasks: parsed.tasks || [],
      journalEntries: parsed.journalEntries || [],
      theme: {
        ...DEFAULT_THEME,
        ...(parsed.theme || {}),
      },
      selectedDate: parsed.selectedDate || getTodayDateStr(),
    };
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return INITIAL_STATE;
  }
}


export function saveStoredState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

export function getSyncQueue(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveSyncQueue(queue: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Error saving sync queue:', e);
  }
}

export function getLastSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function saveLastSyncTime(time: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SYNC_KEY, time);
}

export function exportBackupData(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', `koutetsu_tracker_backup_${getTodayDateStr()}.json`);
  dlAnchorElem.click();
}
