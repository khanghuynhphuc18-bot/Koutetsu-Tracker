/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  BarChart2,
  User,
  Plus,
  RotateCcw,
  Pencil,
  Edit2,
  Trash2,
  Volume2,
  VolumeX,
  Vibrate,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  Check,
  X,
  Flame,
  Award,
  Trophy,
  Laptop,
  BookOpen,
  ChevronRight,
  StickyNote,
  Brain,
  Timer,
  ChevronDown,
  ChevronUp,
  Crown,
  Target,
  Palette,
  Layers,
  ChevronRight as ChevronRightIcon,
  AlertTriangle,
  Image as ImageIcon,
  ShieldCheck,
} from 'lucide-react';
import {
  AppState,
  Habit,
  Task,
  SyncStatus,
  JournalEntry,
  Goal,
  GoalType,
  DEFAULT_HABIT_CATEGORIES,
  MAX_HABIT_CATEGORIES,
  MIN_HABIT_CATEGORIES,
} from './types';
import {
  loadStoredState,
  saveStoredState,
  getTodayDateStr,
  exportBackupData,
  INITIAL_STATE,
} from './services/storage';
import {
  subscribeToSyncStatus,
  enqueueSyncAction,
  triggerSync,
  getLatestSyncStatus,
} from './services/syncEngine';
import { THEME_PRESETS, getActiveThemePreset, computeBackgroundStyles, processWallpaperUpload } from './services/themes';
import {
  playCompleteHabitSound,
  playUncompleteHabitSound,
  playCompleteChime,
  playRankUpFanfare,
  triggerHaptic,
} from './utils/haptics';
import { getUserRank, getRankTierIndex, RANK_TIERS, RankTier } from './utils/ranks';
import { isGoalOverdue, formatGoalDateVi } from './utils/goals';
import { DeviceFrame } from './components/DeviceFrame';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { TutorialModal } from './components/TutorialModal';
import { HabitModal } from './components/HabitModal';
import { CalendarModal } from './components/CalendarModal';
import { RankGuideModal } from './components/RankGuideModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { StandaloneAppModal } from './components/StandaloneAppModal';
import { JournalSection } from './components/JournalSection';
import { PsychologyHabitReminderModal } from './components/PsychologyHabitReminderModal';
import { FocusSection } from './components/FocusSection';
import { GoalSection } from './components/GoalSection';
import { GoalModal } from './components/GoalModal';
import { GoalCheckModal } from './components/GoalCheckModal';
import { BrokenShieldIcon } from './components/BrokenShieldIcon';
import { RankUpCelebrationModal } from './components/RankUpCelebrationModal';
import { RadarCategoryChart } from './components/RadarCategoryChart';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';

export default function App() {
  const [state, setState] = useState<AppState>(loadStoredState);
  const [activeTab, setActiveTab] = useState<'today' | 'focus' | 'journal' | 'progress' | 'settings'>('today');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getLatestSyncStatus);

  // Modals
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRankGuideOpen, setIsRankGuideOpen] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);
  const [standaloneModalTab, setStandaloneModalTab] = useState<'android' | 'install' | 'launcher' | 'guide'>('android');
  const [isPsychologyModalOpen, setIsPsychologyModalOpen] = useState(false);
  const [pendingHabit, setPendingHabit] = useState<{
    title: string;
    frequency: 'daily' | 'weekdays' | 'weekends';
    categories: string[];
  } | null>(null);

  // Goals State & Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalModalPreselectedType, setGoalModalPreselectedType] = useState<GoalType | undefined>(undefined);
  const [checkGoalModalGoal, setCheckGoalModalGoal] = useState<Goal | null>(null);

  // Rank Up Celebration State
  const [rankUpData, setRankUpData] = useState<{
    previousRank: RankTier | null;
    newRank: RankTier;
  } | null>(null);

  // Collapsible sections (hidden by default)
  const [isNotesTasksOpen, setIsNotesTasksOpen] = useState(false);
  const [isBarChartOpen, setIsBarChartOpen] = useState(false);
  const [isSevenDayHistoryOpen, setIsSevenDayHistoryOpen] = useState(false);

  // Settings accordions (closed by default)
  const [openSettingsSections, setOpenSettingsSections] = useState<Record<string, boolean>>({
    theme: false,
    sound: false,
    frame: false,
    sync: false,
    backup: false,
    tutorial: false,
    reset: false,
  });

  const toggleSettingsSection = (sec: string) => {
    setOpenSettingsSections((prev) => ({
      ...prev,
      [sec]: !prev[sec],
    }));
    triggerHaptic('light', state.hapticEnabled);
  };

  // Reset confirmation state & actions
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [isClearHabitsConfirming, setIsClearHabitsConfirming] = useState(false);
  const [resetFeedbackMessage, setResetFeedbackMessage] = useState<string | null>(null);

  // Username edit state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  // Custom Wallpaper & Theme Modal State
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isUploadingWallpaper, setIsUploadingWallpaper] = useState(false);
  const [wallpaperUploadError, setWallpaperUploadError] = useState<string | null>(null);

  const handleUploadWallpaperFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWallpaperUploadError(null);
    setIsUploadingWallpaper(true);
    try {
      const dataUrl = await processWallpaperUpload(file);
      setState((prev) => ({
        ...prev,
        theme: {
          ...prev.theme,
          isCustom: true,
          customType: 'image',
          customImageUrl: dataUrl,
          reduceTranslucency: true, // Enables frosted glass effect on cards
          customOverlayDarkness: 0, // 0 = 100% original wallpaper brightness (no darkening)
          customBlur: 0, // 0 = sharp, unblurred wallpaper
        },
      }));
      enqueueSyncAction('UPDATE_SETTINGS', { hasCustomWallpaper: true });
      triggerHaptic('success', state.hapticEnabled);
    } catch (err: any) {
      setWallpaperUploadError(err.message || 'Lỗi khi tải ảnh lên');
      triggerHaptic('medium', state.hapticEnabled);
    } finally {
      setIsUploadingWallpaper(false);
      e.target.value = '';
    }
  };

  const handleRemoveWallpaper = () => {
    setState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        isCustom: false,
        customImageUrl: '',
      },
    }));
    enqueueSyncAction('UPDATE_SETTINGS', { hasCustomWallpaper: false });
    triggerHaptic('light', state.hapticEnabled);
  };

  const handleToggleReduceTranslucency = () => {
    setState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        reduceTranslucency: prev.theme?.reduceTranslucency === false ? true : false,
      },
    }));
    triggerHaptic('light', state.hapticEnabled);
  };

  const handleSetOverlayDarkness = (darkness: number) => {
    setState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        customOverlayDarkness: darkness,
      },
    }));
    triggerHaptic('light', state.hapticEnabled);
  };

  // 1. Delete habits & checklist data only (keeps settings/name)
  const handleClearHabits = () => {
    setState((prev) => ({
      ...prev,
      habits: [],
      logs: {},
      tasks: [],
      journalEntries: [],
      goals: [],
    }));
    setIsClearHabitsConfirming(false);
    setResetFeedbackMessage('Đã xóa sạch toàn bộ thói quen và lịch sử check-in!');
    setTimeout(() => setResetFeedbackMessage(null), 3500);
    triggerHaptic('success', true);
  };

  // 2. Full app reset to pristine defaults
  const handleResetApp = () => {
    try {
      localStorage.removeItem('koutetsu_tracker_v4_state');
      localStorage.removeItem('koutetsu_tracker_v4_sync_queue');
      localStorage.removeItem('koutetsu_tracker_v4_last_sync');
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    const fresh: AppState = {
      ...INITIAL_STATE,
      habits: [],
      logs: {},
      tasks: [],
      goals: [],
      journalEntries: [],
      habitCategories: [...DEFAULT_HABIT_CATEGORIES],
      selectedDate: getTodayDateStr(),
      hasCompletedTutorial: true,
      lastAcknowledgedRank: undefined,
    };
    saveStoredState(fresh);
    setState(fresh);
    setIsResetConfirming(false);
    setResetFeedbackMessage('Đã khôi phục cài đặt gốc ban đầu!');
    setTimeout(() => setResetFeedbackMessage(null), 3500);
    triggerHaptic('success', true);
  };

  // Tasks input & filter
  const [newTaskInput, setNewTaskInput] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Column chart state in Progress tab
  const [chartDaysRange, setChartDaysRange] = useState<7 | 14>(7);
  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null);

  // Categories helper
  const activeCategories = state.habitCategories && state.habitCategories.length > 0
    ? state.habitCategories
    : DEFAULT_HABIT_CATEGORIES;

  const handleAddCategory = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (activeCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return false;
    if (activeCategories.length >= MAX_HABIT_CATEGORIES) return false;
    const updated = [...activeCategories, trimmed];
    setState((prev) => ({
      ...prev,
      habitCategories: updated,
    }));
    enqueueSyncAction('UPDATE_HABIT_CATEGORIES', { habitCategories: updated });
    return true;
  };

  const handleRemoveCategory = (name: string) => {
    if (activeCategories.length <= MIN_HABIT_CATEGORIES) return;
    const updated = activeCategories.filter((c) => c !== name);
    const fallback = updated[0] || 'Thể chất';
    setState((prev) => ({
      ...prev,
      habitCategories: updated,
      habits: prev.habits.map((h) => {
        const remaining = (h.categories || []).filter((c) => c !== name);
        return {
          ...h,
          categories: remaining.length > 0 ? remaining : [fallback],
          category: remaining.length > 0 ? remaining[0] : fallback,
        };
      }),
    }));
    enqueueSyncAction('UPDATE_HABIT_CATEGORIES', { habitCategories: updated });
  };


  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  useEffect(() => {
    if (!state.hasCompletedTutorial) {
      setIsTutorialOpen(true);
    }
  }, [state.hasCompletedTutorial]);

  const activePreset = getActiveThemePreset(state.theme);
  const backgroundCustomStyle = computeBackgroundStyles(state.theme);

  const todayStr = getTodayDateStr();
  const isViewingToday = state.selectedDate === todayStr;

  // Check if any active goal is overdue and automatically prompt user
  useEffect(() => {
    const overdue = state.goals.find(
      (g) => g.status === 'active' && isGoalOverdue(g, todayStr)
    );
    if (overdue && !checkGoalModalGoal) {
      setCheckGoalModalGoal(overdue);
    }
  }, [state.goals, todayStr, checkGoalModalGoal]);

  const formatDisplayDateVi = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
    return `${days[dateObj.getDay()]}, ${d} THÁNG ${m}`;
  };

  const selectedDayLog = state.logs[state.selectedDate] || {};
  const completedTodayCount = state.habits.filter((h) => selectedDayLog[h.id]).length;
  const todayPercent = state.habits.length > 0 ? Math.round((completedTodayCount / state.habits.length) * 100) : 0;

  const calculateAllTimeCompletedCount = (): number => {
    let total = 0;
    Object.values(state.logs).forEach((dayLog) => {
      if (dayLog && typeof dayLog === 'object') {
        Object.values(dayLog).forEach((isChecked) => {
          if (isChecked) total++;
        });
      }
    });
    return total;
  };

  const allTimeCompletedCount = calculateAllTimeCompletedCount();
  const userRankData = getUserRank(allTimeCompletedCount);

  // Auto-detect Rank Up and trigger congratulation screen
  useEffect(() => {
    if (!state.lastAcknowledgedRank) {
      setState((prev) => ({
        ...prev,
        lastAcknowledgedRank: userRankData.current.name,
      }));
    } else {
      const prevIndex = getRankTierIndex(state.lastAcknowledgedRank);
      const currIndex = getRankTierIndex(userRankData.current.name);
      if (currIndex > prevIndex) {
        const prevTier = RANK_TIERS.find((t) => t.name === state.lastAcknowledgedRank) || null;
        setRankUpData({
          previousRank: prevTier,
          newRank: userRankData.current,
        });
        playRankUpFanfare(state.soundEnabled);
        triggerHaptic('success', state.hapticEnabled);
        setState((prev) => ({
          ...prev,
          lastAcknowledgedRank: userRankData.current.name,
        }));
      }
    }
  }, [allTimeCompletedCount, state.lastAcknowledgedRank, state.soundEnabled, state.hapticEnabled, userRankData.current]);

  // Goal Lists for Progress Tab
  const conqueredGoals = state.goals.filter((g) => g.status === 'conquered');
  const failedGoals = state.goals.filter((g) => g.status === 'failed');

  const calculateStreak = () => {
    if (state.habits.length === 0) return 0;
    let streak = 0;
    let curr = new Date();
    while (true) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      const dayLog = state.logs[dStr] || {};
      const doneCount = state.habits.filter((h) => dayLog[h.id]).length;
      if (doneCount > 0) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        if (dStr === todayStr) {
          curr.setDate(curr.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  const toggleHabitCheck = (dateStr: string, habitId: string) => {
    const currentChecked = !!(state.logs[dateStr] && state.logs[dateStr][habitId]);
    const newChecked = !currentChecked;
    if (newChecked) {
      const currentAllTime = calculateAllTimeCompletedCount();
      const currentRank = getUserRank(currentAllTime).current;
      const nextRank = getUserRank(currentAllTime + 1).current;

      if (getRankTierIndex(nextRank.name) > getRankTierIndex(currentRank.name)) {
        setRankUpData({
          previousRank: currentRank,
          newRank: nextRank,
        });
        playRankUpFanfare(state.soundEnabled);
        triggerHaptic('success', state.hapticEnabled);
      } else {
        playCompleteHabitSound(state.soundEnabled);
        triggerHaptic('medium', state.hapticEnabled);
      }
    } else {
      playUncompleteHabitSound(state.soundEnabled);
      triggerHaptic('light', state.hapticEnabled);
    }

    setState((prev) => {
      const updatedLogs = {
        ...prev.logs,
        [dateStr]: {
          ...(prev.logs[dateStr] || {}),
          [habitId]: newChecked,
        },
      };
      if (dateStr === todayStr && newChecked) {
        const done = prev.habits.filter((h) => updatedLogs[dateStr]?.[h.id]).length;
        if (done === prev.habits.length && prev.habits.length > 0) {
          playCompleteChime(prev.soundEnabled);
          triggerHaptic('success', prev.hapticEnabled);
        }
      }
      return {
        ...prev,
        logs: updatedLogs,
        lastAcknowledgedRank: newChecked
          ? getUserRank(calculateAllTimeCompletedCount() + 1).current.name
          : prev.lastAcknowledgedRank,
      };
    });
    enqueueSyncAction('TOGGLE_HABIT', { dateStr, habitId, checked: newChecked });
  };

  const commitSaveHabit = (
    title: string,
    frequency: 'daily' | 'weekdays' | 'weekends',
    categories: string[] = [activeCategories[0] || 'Thể chất']
  ) => {
    const finalCats = categories.length > 0 ? categories : [activeCategories[0] || 'Thể chất'];
    const newHabit: Habit = {
      id: 'h_' + Date.now(),
      title,
      frequency,
      categories: finalCats,
      category: finalCats[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));
    enqueueSyncAction('ADD_HABIT', newHabit);
    setPendingHabit(null);
    setIsHabitModalOpen(false);
    playCompleteHabitSound(state.soundEnabled);
    triggerHaptic('light', state.hapticEnabled);
  };

  const handleSaveHabit = (
    title: string,
    frequency: 'daily' | 'weekdays' | 'weekends',
    categories: string[] = [activeCategories[0] || 'Thể chất']
  ) => {
    const finalCats = categories.length > 0 ? categories : [activeCategories[0] || 'Thể chất'];
    if (habitToEdit) {
      setState((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitToEdit.id
            ? {
                ...h,
                title,
                frequency,
                categories: finalCats,
                category: finalCats[0],
                updatedAt: new Date().toISOString(),
              }
            : h
        ),
      }));
      enqueueSyncAction('EDIT_HABIT', {
        id: habitToEdit.id,
        title,
        frequency,
        categories: finalCats,
      });
      setHabitToEdit(null);
      setIsHabitModalOpen(false);
    } else {
      if (state.habits.length >= 3) {
        setPendingHabit({ title, frequency, categories: finalCats });
        setIsPsychologyModalOpen(true);
        setHabitToEdit(null);
        return;
      }
      commitSaveHabit(title, frequency, finalCats);
      setHabitToEdit(null);
    }
  };

  const handleDeleteHabit = (id: string) => {
    const habit = state.habits.find((h) => h.id === id);
    if (habit) {
      setHabitToDelete(habit);
    }
  };

  const confirmDeleteHabit = () => {
    if (!habitToDelete) return;
    const id = habitToDelete.id;
    setState((prev) => {
      const newLogs = { ...prev.logs };
      Object.keys(newLogs).forEach((dateKey) => {
        if (newLogs[dateKey] && newLogs[dateKey][id] !== undefined) {
          const dayLog = { ...newLogs[dateKey] };
          delete dayLog[id];
          newLogs[dateKey] = dayLog;
        }
      });
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== id),
        logs: newLogs,
      };
    });
    enqueueSyncAction('DELETE_HABIT', { id });
    triggerHaptic('medium', state.hapticEnabled);
    setHabitToDelete(null);
  };

  // Goals Handlers
  const handleSaveGoal = (goalData: {
    id?: string;
    type: GoalType;
    title: string;
    startDate: string;
    endDate: string;
  }) => {
    const now = new Date().toISOString();
    if (goalData.id) {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === goalData.id
            ? { ...g, ...goalData, updatedAt: now }
            : g
        ),
      }));
      enqueueSyncAction('EDIT_GOAL', goalData);
    } else {
      const newGoal: Goal = {
        id: 'goal_' + Date.now(),
        type: goalData.type,
        title: goalData.title,
        startDate: goalData.startDate,
        endDate: goalData.endDate,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal],
      }));
      enqueueSyncAction('ADD_GOAL', newGoal);
    }
    playCompleteHabitSound(state.soundEnabled);
    triggerHaptic('light', state.hapticEnabled);
    setIsGoalModalOpen(false);
    setGoalToEdit(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId),
    }));
    enqueueSyncAction('DELETE_GOAL', { id: goalId });
    triggerHaptic('medium', state.hapticEnabled);
    setIsGoalModalOpen(false);
    setGoalToEdit(null);
  };

  const handleConquerGoal = (goalId: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              status: 'conquered',
              resolvedAt: todayStr,
              updatedAt: new Date().toISOString(),
            }
          : g
      ),
    }));
    enqueueSyncAction('CONQUER_GOAL', { id: goalId, resolvedAt: todayStr });
    playCompleteChime(state.soundEnabled);
    triggerHaptic('success', state.hapticEnabled);
    if (checkGoalModalGoal?.id === goalId) {
      setCheckGoalModalGoal(null);
    }
  };

  const handleFailGoal = (goalId: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              status: 'failed',
              resolvedAt: todayStr,
              updatedAt: new Date().toISOString(),
            }
          : g
      ),
    }));
    enqueueSyncAction('FAIL_GOAL', { id: goalId, resolvedAt: todayStr });
    playUncompleteHabitSound(state.soundEnabled);
    triggerHaptic('medium', state.hapticEnabled);
    if (checkGoalModalGoal?.id === goalId) {
      setCheckGoalModalGoal(null);
    }
  };

  const handleExtendGoal = (goalId: string, additionalDays: number) => {
    const target = state.goals.find((g) => g.id === goalId);
    if (!target) return;
    const currEnd = new Date(target.endDate);
    currEnd.setDate(currEnd.getDate() + additionalDays);
    const year = currEnd.getFullYear();
    const month = String(currEnd.getMonth() + 1).padStart(2, '0');
    const day = String(currEnd.getDate()).padStart(2, '0');
    const newEndDate = `${year}-${month}-${day}`;

    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? { ...g, endDate: newEndDate, updatedAt: new Date().toISOString() }
          : g
      ),
    }));
    enqueueSyncAction('EXTEND_GOAL', { id: goalId, newEndDate });
    triggerHaptic('light', state.hapticEnabled);
    setCheckGoalModalGoal(null);
  };

  // Task Actions
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: Task = {
      id: 't_' + Date.now(),
      title: newTaskInput.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    setNewTaskInput('');
    enqueueSyncAction('ADD_TASK', newTask);
    triggerHaptic('light', state.hapticEnabled);
  };

  const handleToggleTask = (id: string) => {
    const task = state.tasks.find((t) => t.id === id);
    const willBeDone = task ? !task.completed : true;
    if (willBeDone) {
      playCompleteHabitSound(state.soundEnabled);
    } else {
      playUncompleteHabitSound(state.soundEnabled);
    }
    triggerHaptic('light', state.hapticEnabled);
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
    enqueueSyncAction('TOGGLE_TASK', { id });
  };

  const handleDeleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    enqueueSyncAction('DELETE_TASK', { id });
  };

  const handleSaveJournalEntry = (entryData: {
    id?: string;
    date: string;
    title: string;
    content: string;
    mood?: 'steady' | 'fire' | 'calm' | 'triumph' | 'tired';
    rating?: number;
    habitsCompletedCount?: number;
    habitsTotalCount?: number;
  }) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const existingIndex = prev.journalEntries.findIndex(
        (e) => (entryData.id && e.id === entryData.id) || e.date === entryData.date
      );
      if (existingIndex >= 0) {
        const updated = [...prev.journalEntries];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...entryData,
          updatedAt: now,
        };
        return { ...prev, journalEntries: updated };
      } else {
        const newEntry: JournalEntry = {
          id: entryData.id || 'j_' + Date.now(),
          date: entryData.date,
          title: entryData.title,
          content: entryData.content,
          mood: entryData.mood,
          rating: entryData.rating,
          habitsCompletedCount: entryData.habitsCompletedCount,
          habitsTotalCount: entryData.habitsTotalCount,
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, journalEntries: [newEntry, ...prev.journalEntries] };
      }
    });
    enqueueSyncAction('SAVE_JOURNAL', entryData);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((e) => e.id !== id),
    }));
    enqueueSyncAction('DELETE_JOURNAL', { id });
  };

  const handleEditUsername = () => {
    const val = prompt('Nhập tên của bạn:', state.username);
    if (val && val.trim()) {
      setState((prev) => ({ ...prev, username: val.trim() }));
      enqueueSyncAction('UPDATE_USER', { username: val.trim() });
    }
  };

  const handleTutorialFinish = (uname: string, initialGoalTitle: string, selectedPresetId: string) => {
    const newGoals: Goal[] = [...state.goals];
    if (initialGoalTitle.trim()) {
      const week = todayStr;
      const endD = new Date();
      endD.setDate(endD.getDate() + 7);
      const endYear = endD.getFullYear();
      const endMonth = String(endD.getMonth() + 1).padStart(2, '0');
      const endDay = String(endD.getDate()).padStart(2, '0');
      newGoals.push({
        id: 'goal_' + Date.now(),
        type: 'weekly',
        title: initialGoalTitle.trim(),
        startDate: week,
        endDate: `${endYear}-${endMonth}-${endDay}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setState((prev) => ({
      ...prev,
      hasCompletedTutorial: true,
      username: uname || 'Kiếm Khách',
      goals: newGoals,
      theme: {
        ...prev.theme,
        presetId: selectedPresetId,
        isCustom: false,
      },
    }));
    setIsTutorialOpen(false);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.habits)) {
            setState({
              ...parsed,
              goals: parsed.goals || [],
            });
            alert('Khôi phục dữ liệu sao lưu thành công!');
          }
        } catch (err) {
          alert('Tệp sao lưu không hợp lệ!');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderWeeklyDots = () => {
    const dots = [];
    const today = new Date();
    let loggedCount = 0;
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      const dayLog = state.logs[dStr] || {};
      const doneCount = state.habits.filter((h) => !!dayLog[h.id]).length;
      const hasCompletedAny = doneCount > 0;
      if (hasCompletedAny) loggedCount++;

      const isCurrentSelected = state.selectedDate === dStr;
      const isToday = dStr === todayStr;
      const dayLabel = isToday ? 'H.nay' : dayNames[d.getDay()];

      dots.push(
        <button
          key={dStr}
          type="button"
          onClick={() => {
            setState((prev) => ({ ...prev, selectedDate: dStr }));
            triggerHaptic('light', state.hapticEnabled);
          }}
          className={`py-1.5 px-0.5 sm:px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 border text-center active:scale-95 ${
            isCurrentSelected
              ? 'bg-cyan-500/25 border-cyan-400 ring-1 ring-cyan-400/70 text-white shadow-md shadow-cyan-500/20'
              : hasCompletedAny
              ? 'bg-slate-900/90 border-cyan-500/30 text-slate-200 hover:border-cyan-400/50'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
          title={`${dStr}: ${doneCount}/${state.habits.length}`}
        >
          <span className={`text-[9px] font-bold ${isToday ? 'text-cyan-400' : isCurrentSelected ? 'text-white' : 'text-slate-400'}`}>
            {dayLabel}
          </span>
          <span className="text-[11px] font-mono font-bold leading-tight">
            {parseInt(day, 10)}
          </span>
          <div
            className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all ${
              hasCompletedAny
                ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] scale-110'
                : 'bg-slate-700'
            }`}
          />
        </button>
      );
    }
    return { dots, loggedCount };
  };

  const { dots: weeklyDots, loggedCount: weeklyLoggedCount } = renderWeeklyDots();

  const getProgress7Days = () => {
    const history = [];
    const today = new Date();
    let totalPerc = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      const dayLog = state.logs[dStr] || {};
      const done = state.habits.filter((h) => dayLog[h.id]).length;
      const total = state.habits.length;
      const perc = total > 0 ? Math.round((done / total) * 100) : 0;
      totalPerc += perc;
      history.push({
        dateStr: dStr,
        dayLabel: i === 0 ? 'Hôm nay' : i === 1 ? 'Hôm qua' : formatDisplayDateVi(dStr).split(',')[0],
        formattedDate: `${day}/${month}`,
        done,
        total,
        perc,
      });
    }
    const avgPerc = Math.round(totalPerc / 7);
    return { history, avgPerc };
  };

  const { history: sevenDayHistory, avgPerc: weeklyAvgPercent } = getProgress7Days();

  const getDailyCompletionChartData = (daysCount: number) => {
    const list = [];
    const today = new Date();
    let maxDone = 1;
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      const dayLog = state.logs[dStr] || {};
      const done = state.habits.filter((h) => dayLog[h.id]).length;
      if (done > maxDone) maxDone = done;
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const shortDay = dayNames[d.getDay()];
      list.push({
        dateStr: dStr,
        shortDay,
        formattedDate: `${day}/${month}`,
        fullDateVi: `${shortDay}, ${day}/${month}/${year}`,
        done,
        total: state.habits.length,
        perc: state.habits.length > 0 ? Math.round((done / state.habits.length) * 100) : 0,
        isToday: dStr === todayStr,
      });
    }
    return { list, maxDone };
  };

  const chartData = getDailyCompletionChartData(chartDaysRange);

  const filteredTasks = state.tasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  return (
    <DeviceFrame
      mode={state.deviceFrame}
      onChangeMode={(mode) => setState((prev) => ({ ...prev, deviceFrame: mode }))}
    >
      <div
        className={`w-full h-full flex flex-col overflow-hidden relative select-none ${
          (state.theme?.isCustom && state.theme?.customImageUrl && state.theme?.reduceTranslucency !== false) ||
          state.theme?.reduceTranslucency === true
            ? 'theme-custom-wallpaper'
            : ''
        }`}
      >
        {/* Background Layer: Custom Image Wallpaper OR Preset Gradient */}
        {state.theme?.isCustom && state.theme?.customImageUrl ? (
          <>
            <div
              className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
              style={{
                backgroundImage: `url(${state.theme.customImageUrl})`,
                filter: state.theme.customBlur ? `blur(${state.theme.customBlur}px)` : undefined,
              }}
            />
            {/* Optional Darkness Overlay only if user explicitly configured > 0 */}
            {(state.theme.customOverlayDarkness || 0) > 0 && (
              <div
                className="absolute inset-0 pointer-events-none z-0 bg-black transition-opacity duration-300"
                style={{
                  opacity: state.theme.customOverlayDarkness,
                }}
              />
            )}
          </>
        ) : (
          <div
            className={`absolute inset-0 pointer-events-none z-0 bg-gradient-to-b ${activePreset.bgGradient}`}
          />
        )}

        {/* CLEAN, FOCUSED APP HEADER - Does not blur wallpaper when custom image is used */}
        <header
          className={`p-4 sm:p-5 pb-3 pt-3 sm:pt-4 sticky top-0 z-20 transition-all ${
            state.theme?.isCustom && state.theme?.customImageUrl
              ? 'bg-transparent border-b border-white/10'
              : 'bg-gradient-to-b from-black/60 via-slate-950/40 to-transparent backdrop-blur-md border-b border-slate-700/30'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {state.username ? `Chào mừng, ${state.username}` : 'Chào mừng bạn'}
            </h2>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition"
                title="Chọn ngày"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isViewingToday ? 'Hôm nay' : state.selectedDate.slice(5)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setIsRankGuideOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${userRankData.current.badgeBg} ${userRankData.current.border} ${userRankData.current.badgeText}`}
                title="Nhấn xem bảng Rank"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{userRankData.current.name}</span>
              </button>
            </div>
          </div>

          {/* MỤC TIÊU TẬP TRUNG */}
          <GoalSection
            goals={state.goals}
            onOpenCreateGoal={(type) => {
              setGoalModalPreselectedType(type);
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            onOpenEditGoal={(goal) => {
              setGoalToEdit(goal);
              setGoalModalPreselectedType(goal.type);
              setIsGoalModalOpen(true);
            }}
            onOpenCheckGoal={(goal) => {
              setCheckGoalModalGoal(goal);
            }}
            onConquerGoal={handleConquerGoal}
            onFailGoal={handleFailGoal}
          />

          {!isViewingToday && (
            <div className="mt-2.5 bg-cyan-950/80 border border-cyan-500/40 rounded-xl p-2 text-xs flex items-center justify-between text-cyan-200">
              <span>Đang xem lịch sử ngày {state.selectedDate}</span>
              <button
                onClick={() => setState((prev) => ({ ...prev, selectedDate: todayStr }))}
                className="text-[10px] bg-cyan-400 text-slate-950 font-bold px-2 py-1 rounded-lg hover:bg-cyan-300 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Về Hôm Nay
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/50">
            <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-700/60 text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 inline" /> CHUỖI
              </div>
              <div className="text-base font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                <span>{streakDays}</span> <span className="text-[10px] font-normal text-slate-400">ngày</span>
              </div>
            </div>
            <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-700/60 text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {isViewingToday ? 'HÔM NAY' : 'TIẾN ĐỘ'}
              </div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">{todayPercent}%</div>
            </div>
            <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-700/60 text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ĐÃ XONG</div>
              <div className="text-base font-bold text-white mt-0.5">
                <span>{completedTodayCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>NGÀY GHI NHẬN TUẦN NÀY</span>
            <span className="font-bold text-cyan-400">{weeklyLoggedCount}/7 NGÀY</span>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mt-1.5">{weeklyDots}</div>
        </header>

        {/* MAIN SCROLLABLE VIEWPORT */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-4 relative z-10">
          {/* TAB 1: TODAY CHECKLIST & GHI CHÚ */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {isViewingToday ? 'THÓI QUEN HÔM NAY' : `THÓI QUEN NGÀY ${state.selectedDate}`}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setHabitToEdit(null);
                    setIsHabitModalOpen(true);
                  }}
                  className="text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm thói quen
                </button>
              </div>

              {state.habits.length > 3 && (
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-2.5 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <span>Nhắc nhở: Tạo quá 3 thói quen cần chú ý</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      Bạn đang có <strong className="text-cyan-400">{state.habits.length} thói quen</strong>. Nên ưu tiên rèn luyện 1 - 3 thói quen cốt lõi trước.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingHabit(null);
                      setIsPsychologyModalOpen(true);
                    }}
                    className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-500/40 transition flex-shrink-0 self-center"
                  >
                    Chi tiết
                  </button>
                </div>
              )}

              <div className="space-y-2.5">
                {state.habits.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 p-4 space-y-2">
                    <p className="text-xs font-medium text-slate-300">
                      Chưa có thói quen nào. Hãy thêm để bắt đầu rèn luyện!
                    </p>
                    <button
                      onClick={() => {
                        setHabitToEdit(null);
                        setIsHabitModalOpen(true);
                      }}
                      className="text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 rounded-xl transition inline-block"
                    >
                      + Tạo thói quen ngay
                    </button>
                  </div>
                ) : (
                  state.habits.map((habit) => {
                    const isChecked = !!selectedDayLog[habit.id];
                    return (
                      <div
                        key={habit.id}
                        className={`group flex items-center justify-between p-3.5 rounded-2xl border transition duration-200 ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-950/30'
                            : 'bg-slate-900/80 border-slate-700/80 text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <div
                          onClick={() => toggleHabitCheck(state.selectedDate, habit.id)}
                          className="flex items-center gap-3.5 flex-1 cursor-pointer min-w-0"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                              isChecked
                                ? 'bg-cyan-400 border-cyan-400 text-slate-950 font-bold'
                                : 'border-slate-500 bg-slate-950/70 hover:border-cyan-400'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-sm font-medium block truncate ${
                                isChecked ? 'line-through opacity-75 text-slate-300' : 'text-white'
                              }`}
                            >
                              {habit.title}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              {habit.frequency && habit.frequency !== 'daily' && (
                                <span className="text-[10px] text-slate-400">
                                  {habit.frequency === 'weekdays' ? 'Thứ 2 - Thứ 6' : 'Cuối tuần'}
                                </span>
                              )}
                              {habit.categories && habit.categories.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {habit.categories.map((c) => (
                                    <span
                                      key={c}
                                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700/60 font-semibold"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isChecked
                                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isChecked ? 'Đã xong' : 'Chưa check'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHabitToEdit(habit);
                              setIsHabitModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/60 transition"
                            title="Sửa thói quen"
                            aria-label="Sửa thói quen"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHabit(habit.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/60 transition"
                            title="Xóa thói quen"
                            aria-label="Xóa thói quen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* GHI CHÚ & VIỆC CẦN LÀM (HIDE BY DEFAULT VỚI MŨI TÊN MỞ/ĐÓNG) */}
              <div className="bg-slate-900/90 border border-slate-700/90 rounded-2xl p-4 space-y-3.5 shadow-lg transition-all duration-200">
                <div
                  onClick={() => {
                    setIsNotesTasksOpen((prev) => !prev);
                    triggerHaptic('light', state.hapticEnabled);
                  }}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span>GHI CHÚ & VIỆC CẦN LÀM</span>
                        <span className="text-[10px] text-cyan-400 font-bold font-mono">
                          ({state.tasks.filter((t) => t.completed).length}/{state.tasks.length})
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {isNotesTasksOpen
                          ? 'Nhấn vào để thu gọn'
                          : 'Nhấn vào mũi tên để mở danh sách'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      {state.tasks.filter((t) => t.completed).length}/{state.tasks.length} ĐÃ XONG
                    </span>
                    <div className="p-1 rounded-lg text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/40 transition">
                      {isNotesTasksOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {isNotesTasksOpen && (
                  <div className="space-y-3.5 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
                    <form onSubmit={handleAddTask} className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        placeholder="Nhập ghi chú hoặc việc cần làm..."
                        className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                      />
                      <button
                        type="submit"
                        disabled={!newTaskInput.trim()}
                        className="bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold px-4 rounded-xl text-xs transition flex items-center gap-1 shadow-md shadow-cyan-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm
                      </button>
                    </form>

                    <div className="flex gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setTaskFilter('all')}
                        className={`px-3 py-1 rounded-lg transition ${
                          taskFilter === 'all'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        Tất cả ({state.tasks.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskFilter('pending')}
                        className={`px-3 py-1 rounded-lg transition ${
                          taskFilter === 'pending'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        Đang làm ({state.tasks.filter((t) => !t.completed).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskFilter('completed')}
                        className={`px-3 py-1 rounded-lg transition ${
                          taskFilter === 'completed'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        Đã xong ({state.tasks.filter((t) => t.completed).length})
                      </button>
                    </div>

                    {filteredTasks.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className="pressable flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs hover:border-slate-700 transition"
                          >
                            <div
                              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                              onClick={() => handleToggleTask(task.id)}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                  task.completed
                                    ? 'bg-cyan-400 border-cyan-400 text-slate-950 font-bold'
                                    : 'border-slate-500 bg-slate-900'
                                }`}
                              >
                                {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span
                                className={`truncate ${
                                  task.completed ? 'line-through text-slate-400' : 'text-slate-200'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="text-slate-400 hover:text-red-400 hover:bg-red-950/40 p-1.5 rounded-lg transition ml-2 flex-shrink-0"
                              title="Xóa ghi chú"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TẬP TRUNG (BOX BREATHING THIỀN ĐỊNH & ĐỒNG HỒ) */}
          {activeTab === 'focus' && (
            <FocusSection
              soundEnabled={state.soundEnabled}
              hapticEnabled={state.hapticEnabled}
            />
          )}

          {/* TAB 3: JOURNAL (NHẬT KÝ RÈN LUYỆN) */}
          {activeTab === 'journal' && (
            <JournalSection
              journalEntries={state.journalEntries}
              selectedDate={state.selectedDate}
              habitsCompletedCount={completedTodayCount}
              habitsTotalCount={state.habits.length}
              onSaveEntry={handleSaveJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
              onSelectDate={(newDate) => setState((prev) => ({ ...prev, selectedDate: newDate }))}
              soundEnabled={state.soundEnabled}
              hapticEnabled={state.hapticEnabled}
            />
          )}

          {/* TAB 4: PROGRESS & HISTORY */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                TIẾN ĐỘ & MỤC TIÊU
              </h3>

              {/* 1. BIỂU ĐỒ ĐA GIÁC (LỤC GIÁC/BÁT GIÁC) THEO MỤC RÈN LUYỆN */}
              <RadarCategoryChart
                categories={activeCategories}
                habits={state.habits}
                logs={state.logs}
                selectedDate={state.selectedDate}
                todayStr={todayStr}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
                soundEnabled={state.soundEnabled}
                hapticEnabled={state.hapticEnabled}
              />

              {/* 2. BIỂU ĐỒ CỘT THÓI QUEN (HIDE BY DEFAULT VỚI MŨI TÊN MỞ/ĐÓNG) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3.5 shadow-xl transition-all duration-200">
                <div
                  onClick={() => {
                    setIsBarChartOpen((prev) => !prev);
                    triggerHaptic('light', state.hapticEnabled);
                  }}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span>Biểu đồ cột: Thói Quen Hoàn Thành</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {isBarChartOpen
                          ? 'Nhấn vào để thu gọn biểu đồ cột'
                          : 'Nhấn vào mũi tên để xem chi tiết theo ngày'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      {chartDaysRange} ngày
                    </span>
                    <div className="p-1 rounded-lg text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/40 transition">
                      {isBarChartOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {isBarChartOpen && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
                    <div className="flex items-center justify-end">
                      <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChartDaysRange(7);
                          }}
                          className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
                            chartDaysRange === 7
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          7 ngày
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChartDaysRange(14);
                          }}
                          className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
                            chartDaysRange === 14
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          14 ngày
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="h-44 w-full flex items-end justify-between gap-1 sm:gap-2 px-1.5 pb-2 pt-6 border border-slate-800 bg-slate-950/70 rounded-xl">
                        {chartData.list.map((dayItem) => {
                          const heightPercent =
                            chartData.maxDone > 0
                              ? Math.max(
                                  dayItem.done > 0 ? 12 : 5,
                                  Math.round((dayItem.done / chartData.maxDone) * 100)
                                )
                              : 5;
                          const isSelected =
                            selectedChartDay === dayItem.dateStr ||
                            (!selectedChartDay && dayItem.isToday);
                          return (
                            <div
                              key={dayItem.dateStr}
                              onClick={() => {
                                setSelectedChartDay(dayItem.dateStr);
                                triggerHaptic('light', state.hapticEnabled);
                              }}
                              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                            >
                              <span
                                className={`text-[10px] font-bold font-mono transition-transform duration-200 mb-1 ${
                                  dayItem.done > 0
                                    ? isSelected
                                      ? 'text-cyan-300 scale-125'
                                      : 'text-cyan-400 group-hover:scale-110'
                                    : 'text-slate-600'
                                }`}
                              >
                                {dayItem.done}
                              </span>

                              <div className="w-full max-w-[24px] sm:max-w-[28px] h-28 flex items-end justify-center">
                                <div
                                  style={{ height: `${heightPercent}%` }}
                                  className={`w-full rounded-t-lg transition-all duration-300 relative ${
                                    dayItem.done > 0
                                      ? isSelected
                                        ? 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-cyan-300 shadow-lg shadow-cyan-500/50 ring-2 ring-white/70'
                                        : 'bg-gradient-to-t from-cyan-700/80 to-cyan-400/90 group-hover:from-cyan-600 group-hover:to-cyan-300'
                                      : 'bg-slate-800/40 border border-dashed border-slate-700/50'
                                  }`}
                                >
                                  {dayItem.done > 0 && (
                                    <div className="w-full h-1 bg-white/70 rounded-t-lg" />
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 text-center">
                                <span
                                  className={`block text-[10px] font-semibold leading-tight ${
                                    dayItem.isToday
                                      ? 'text-cyan-400 font-bold'
                                      : isSelected
                                      ? 'text-white'
                                      : 'text-slate-400 group-hover:text-slate-300'
                                  }`}
                                >
                                  {dayItem.shortDay}
                                </span>
                                <span className="block text-[8px] text-slate-500 font-mono leading-none mt-0.5">
                                  {dayItem.formattedDate}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {(() => {
                      const activeDetail = chartData.list.find(
                        (d) => d.dateStr === (selectedChartDay || todayStr)
                      );
                      if (!activeDetail) return null;
                      return (
                        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {activeDetail.isToday ? 'Hôm nay' : 'Ngày'}:{' '}
                              <strong className="text-slate-200">{activeDetail.fullDateVi}</strong>
                            </div>
                            <div className="text-white font-bold text-xs mt-0.5">
                              Hoàn thành:{' '}
                              <span className="text-cyan-400">{activeDetail.done}</span>/
                              {activeDetail.total} thói quen ({activeDetail.perc}%)
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setState((prev) => ({
                                ...prev,
                                selectedDate: activeDetail.dateStr,
                              }));
                              setActiveTab('today');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 flex items-center gap-1 transition shadow-sm"
                          >
                            Đến ngày <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 2. MỤC TIÊU ĐÃ CHINH PHỤC (ICON VƯƠNG MIỆN MÀU VÀNG) */}
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
                      <Crown className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        MỤC TIÊU ĐÃ CHINH PHỤC
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {conqueredGoals.length} CHIẾN CÔNG
                  </span>
                </div>

                {conqueredGoals.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                    <p>Chưa có mục tiêu nào được chinh phục.</p>
                    <p className="text-[11px] text-slate-500">
                      Hãy hoàn thành mục tiêu ngắn hạn hoặc dài hạn để khắc tên vào bảng vinh danh!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conqueredGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between text-xs hover:border-amber-500/50 transition"
                      >
                        <div className="space-y-1 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                            <span className="font-bold text-white line-clamp-1">{goal.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-semibold">
                              {goal.type === 'weekly' ? 'Tuần' : 'Tháng'}
                            </span>
                            <span>Kỳ hạn: {formatGoalDateVi(goal.endDate)}</span>
                            {goal.resolvedAt && (
                              <span className="text-amber-300">
                                • Chinh phục: {formatGoalDateVi(goal.resolvedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30 flex-shrink-0">
                          Thành công
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. MỤC TIÊU THẤT BẠI (ICON KHIÊN BỊ VỠ MÀU XÁM) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 shadow-sm">
                      <BrokenShieldIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        MỤC TIÊU THẤT BẠI
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {failedGoals.length} LẦN
                  </span>
                </div>

                {failedGoals.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                    <p>Chưa có mục tiêu nào thất bại.</p>
                    <p className="text-[11px] text-slate-500">
                      Giữ vững phong độ kiên định!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {failedGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                      >
                        <div className="space-y-1 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <BrokenShieldIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold text-slate-300 line-clamp-1">{goal.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                              {goal.type === 'weekly' ? 'Tuần' : 'Tháng'}
                            </span>
                            <span>Hạn kết thúc: {formatGoalDateVi(goal.endDate)}</span>
                            {goal.resolvedAt && (
                              <span>• Ghi nhận: {formatGoalDateVi(goal.resolvedAt)}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 flex-shrink-0">
                          Chưa đạt
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. TRUNG BÌNH 7 NGÀY QUA */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Trung bình 7 ngày qua</span>
                  <span className="text-cyan-400 font-bold text-sm">{weeklyAvgPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${weeklyAvgPercent}%` }}
                  />
                </div>
              </div>

              {/* 5. LỊCH SỬ 7 NGÀY QUA - ẨN MẶC ĐỊNH, CÓ MŨI TÊN NHẤN ĐỂ MỞ */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setIsSevenDayHistoryOpen(!isSevenDayHistoryOpen);
                    triggerHaptic('light', state.hapticEnabled);
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-semibold text-slate-200">
                      Lịch Sử 7 Ngày Qua
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      ({isSevenDayHistoryOpen ? 'Nhấn để thu gọn' : 'Nhấn để xem'})
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition">
                    {isSevenDayHistoryOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isSevenDayHistoryOpen && (
                  <div className="p-4 pt-1 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-200">
                    {sevenDayHistory.map((item) => (
                      <div
                        key={item.dateStr}
                        className="flex items-center justify-between text-xs py-2 border-b border-slate-700/60 last:border-0 cursor-pointer hover:bg-slate-800/40 px-2 rounded-lg transition"
                        onClick={() => {
                          setState((prev) => ({ ...prev, selectedDate: item.dateStr }));
                          setActiveTab('today');
                        }}
                      >
                        <span className="text-slate-300">
                          {item.dayLabel} ({item.formattedDate})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-medium">
                            {item.done}/{item.total}
                          </span>
                          <span className="text-cyan-400 font-bold w-12 text-right">
                            {item.perc}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: HỒ SƠ & CÀI ĐẶT */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                HỒ SƠ & CÀI ĐẶT
              </h3>

              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-3.5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    {!isEditingUsername ? (
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          {state.username || 'Bạn'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setUsernameInput(state.username || '');
                            setIsEditingUsername(true);
                            triggerHaptic('light', state.hapticEnabled);
                          }}
                          className="text-slate-400 hover:text-cyan-400 p-1"
                          title="Đổi tên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const trimmed = usernameInput.trim();
                          if (trimmed) {
                            setState((prev) => ({ ...prev, username: trimmed }));
                            enqueueSyncAction('UPDATE_USER', { username: trimmed });
                          }
                          setIsEditingUsername(false);
                          triggerHaptic('success', state.hapticEnabled);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="bg-slate-950 border border-cyan-400 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none w-36"
                          autoFocus
                          maxLength={20}
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-300 transition"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingUsername(false)}
                          className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 transition"
                        >
                          Hủy
                        </button>
                      </form>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${userRankData.current.badgeBg} ${userRankData.current.border} ${userRankData.current.badgeText}`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        Cấp: {userRankData.current.name}
                      </span>
                    </div>
                  </div>
                </div>

                {userRankData.next && (
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">
                        Tiến lên <strong>{userRankData.next.name}</strong>:
                      </span>
                      <span className="text-cyan-400 font-bold">
                        Cần thêm {userRankData.neededForNext} lần
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${userRankData.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsRankGuideOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Xem hướng dẫn các cấp Rank & Quy tắc điểm</span>
                </button>

                {/* All-Time Habit Total Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-slate-950 border border-cyan-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      TỔNG SỐ LẦN HOÀN THÀNH TỪ TRƯỚC ĐẾN NAY
                    </div>
                    <div className="text-xl font-black text-white mt-0.5">
                      <span className="text-cyan-400">{allTimeCompletedCount}</span>{' '}
                      <span className="text-xs font-normal text-slate-300">lần hoàn thành</span>
                    </div>
                  </div>
                  <Trophy className="w-7 h-7 text-amber-400 flex-shrink-0" />
                </div>

                {/* Goals Overview in Settings */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Mục Tiêu Tập Trung
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-amber-400" /> {conqueredGoals.length} đạt
                      </span>
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <BrokenShieldIcon className="w-3 h-3 text-slate-400" /> {failedGoals.length} hỏng
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    Mục tiêu ngắn hạn tuần và dài hạn tháng để dồn sự tập trung cao độ.
                  </p>

                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGoalModalPreselectedType('weekly');
                        setGoalToEdit(null);
                        setIsGoalModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 text-center transition"
                    >
                      + Mục tiêu tuần
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGoalModalPreselectedType('monthly');
                        setGoalToEdit(null);
                        setIsGoalModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-[11px] font-bold text-blue-300 text-center transition"
                    >
                      + Mục tiêu tháng
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveTab('journal');
                    triggerHaptic('light', state.hapticEnabled);
                  }}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        NHẬT KÝ
                      </div>
                      <div className="text-xs font-bold text-white">
                        <span className="text-cyan-400 font-extrabold">{state.journalEntries.length}</span> trang nhật ký
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-medium group-hover:underline">
                    Xem nhật ký
                  </span>
                </div>
              </div>

              {/* 1. BẢNG CHỌN MÀU GIAO DIỆN & HÌNH NỀN (ACCORDION) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 transition-all duration-200">
                <div
                  onClick={() => toggleSettingsSection('theme')}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        MÀU SẮC & HÌNH NỀN
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {openSettingsSections.theme
                          ? 'Nhấn để thu gọn bảng màu'
                          : state.theme?.isCustom && state.theme?.customImageUrl
                          ? 'Hình nền tùy chỉnh • Đã tối ưu độ dễ nhìn'
                          : `Đang dùng: ${activePreset.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      {state.theme?.isCustom && state.theme?.customImageUrl ? 'Hình nền riêng' : activePreset.name}
                    </span>
                    <div className="p-1 text-slate-400 group-hover:text-cyan-300 transition">
                      {openSettingsSections.theme ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {openSettingsSections.theme && (
                  <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                    {/* A. TẢI HÌNH NỀN RIÊNG */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white">Hình nền cá nhân</span>
                        </div>
                        {state.theme?.isCustom && state.theme?.customImageUrl && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Đang áp dụng
                          </span>
                        )}
                      </div>

                      {/* Upload Button */}
                      <label className="block w-full cursor-pointer">
                        <div className="border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 p-3 rounded-xl text-center transition flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-cyan-300">
                            {isUploadingWallpaper ? 'Đang tối ưu ảnh...' : 'Tải ảnh từ máy làm hình nền'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadWallpaperFile}
                          disabled={isUploadingWallpaper}
                          className="hidden"
                        />
                      </label>

                      {wallpaperUploadError && (
                        <p className="text-xs text-red-400 font-medium">{wallpaperUploadError}</p>
                      )}

                      {/* Wallpaper preview & remove */}
                      {state.theme?.isCustom && state.theme?.customImageUrl && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl bg-cover bg-center border border-slate-700 shrink-0"
                              style={{ backgroundImage: `url(${state.theme.customImageUrl})` }}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">Hình nền của bạn</div>
                              <div className="text-[10px] text-slate-400">Đã lưu trữ an toàn</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveWallpaper}
                            className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-semibold transition flex items-center gap-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Gỡ ảnh</span>
                          </button>
                        </div>
                      )}

                      {/* B. TÙY CHỌN UI MỜ (FROSTED GLASS) & ĐỘ TỐI HÌNH NỀN */}
                      <div className="pt-2.5 border-t border-slate-800/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-slate-200 font-semibold">Hiệu ứng UI mờ (Kính mờ cho thẻ):</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleReduceTranslucency}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                              state.theme?.reduceTranslucency !== false
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                : 'bg-slate-900 text-slate-400 border-slate-700'
                            }`}
                          >
                            {state.theme?.reduceTranslucency !== false ? 'BẬT (Khuyên dùng)' : 'TẮT'}
                          </button>
                        </div>

                        {/* Overlay Darkness quick picker */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Lớp tối phủ hình nền:</span>
                            <span className="font-mono text-cyan-400 font-bold">
                              {Math.round((state.theme?.customOverlayDarkness ?? 0) * 100)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { label: '0% (Gốc)', value: 0 },
                              { label: '25%', value: 0.25 },
                              { label: '50%', value: 0.5 },
                              { label: '75%', value: 0.75 },
                            ].map((lvl) => {
                              const isSel = Math.abs((state.theme?.customOverlayDarkness ?? 0) - lvl.value) < 0.08;
                              return (
                                <button
                                  key={lvl.value}
                                  type="button"
                                  onClick={() => handleSetOverlayDarkness(lvl.value)}
                                  className={`py-1 rounded-lg text-[10px] font-bold border transition ${
                                    isSel
                                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  {lvl.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* C. BỘ MÀU CHUẨN */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-300">Hoặc chọn bộ màu gradient có sẵn:</span>
                        <button
                          type="button"
                          onClick={() => setIsThemeModalOpen(true)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline"
                        >
                          Tùy biến nâng cao
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {THEME_PRESETS.map((preset) => {
                          const isSelected = state.theme.presetId === preset.id && !state.theme.isCustom;
                          return (
                            <button
                              key={preset.id}
                              onClick={() => {
                                setState((prev) => ({
                                  ...prev,
                                  theme: {
                                    ...prev.theme,
                                    presetId: preset.id,
                                    isCustom: false,
                                  },
                                }));
                                enqueueSyncAction('UPDATE_SETTINGS', { themePreset: preset.id });
                                triggerHaptic('light', state.hapticEnabled);
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                                isSelected
                                  ? 'border-cyan-400 bg-cyan-950/50 ring-1 ring-cyan-400'
                                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-5 h-5 rounded-md bg-gradient-to-br ${preset.bgGradient} border border-slate-600 flex-shrink-0 flex items-center justify-center`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${preset.accentColor.replace('text-', 'bg-')}`} />
                                </div>
                                <span className="text-xs font-medium text-white truncate">{preset.name}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ÂM THANH & RUNG XÚC GIÁC (ACCORDION) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 transition-all duration-200">
                <div
                  onClick={() => toggleSettingsSection('sound')}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        ÂM THANH & RUNG PHẢN HỒI
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {openSettingsSections.sound
                          ? 'Nhấn để thu gọn cài đặt âm thanh'
                          : `Âm thanh: ${state.soundEnabled ? 'Bật' : 'Tắt'} • Rung: ${state.hapticEnabled ? 'Bật' : 'Tắt'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      {state.soundEnabled ? 'Đang bật' : 'Tắt'}
                    </span>
                    <div className="p-1 text-slate-400 group-hover:text-cyan-300 transition">
                      {openSettingsSections.sound ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {openSettingsSections.sound && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        {state.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                        <span>Âm thanh hoàn thành thói quen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playCompleteHabitSound(true)}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded border border-slate-700"
                        >
                          Thử âm
                        </button>
                        <button
                          onClick={() => setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            state.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                              state.soundEnabled ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Vibrate className="w-4 h-4 text-cyan-400" />
                        <span>Rung xúc giác (Haptic)</span>
                      </div>
                      <button
                        onClick={() => setState((prev) => ({ ...prev, hapticEnabled: !prev.hapticEnabled }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          state.hapticEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                            state.hapticEnabled ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. KHUNG THIẾT BỊ & CÀI ĐẶT APP (ACCORDION) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 transition-all duration-200">
                <div
                  onClick={() => toggleSettingsSection('frame')}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        KHUNG THIẾT BỊ & PWA
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {openSettingsSections.frame
                          ? 'Nhấn để thu gọn chế độ khung'
                          : `Chế độ: ${state.deviceFrame} • Hỗ trợ Standalone PWA`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      {state.deviceFrame}
                    </span>
                    <div className="p-1 text-slate-400 group-hover:text-cyan-300 transition">
                      {openSettingsSections.frame ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {openSettingsSections.frame && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => setState((prev) => ({ ...prev, deviceFrame: 'window' }))}
                        className={`p-2 rounded-xl border text-center transition col-span-2 sm:col-span-1 ${
                          state.deviceFrame === 'window'
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5 inline mr-1" /> Cửa sổ Standalone
                      </button>
                      <button
                        onClick={() => setState((prev) => ({ ...prev, deviceFrame: 'responsive' }))}
                        className={`p-2 rounded-xl border text-center transition ${
                          state.deviceFrame === 'responsive'
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        Tự do (Compact)
                      </button>
                      <button
                        onClick={() => setState((prev) => ({ ...prev, deviceFrame: 'iphone' }))}
                        className={`p-2 rounded-xl border text-center transition ${
                          state.deviceFrame === 'iphone'
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        iPhone 16 Pro
                      </button>
                      <button
                        onClick={() => setState((prev) => ({ ...prev, deviceFrame: 'android' }))}
                        className={`p-2 rounded-xl border text-center transition ${
                          state.deviceFrame === 'android'
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        Android Pixel
                      </button>
                      <button
                        onClick={() => setState((prev) => ({ ...prev, deviceFrame: 'fullscreen' }))}
                        className={`p-2 rounded-xl border text-center transition ${
                          state.deviceFrame === 'fullscreen'
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        Toàn màn hình
                      </button>
                    </div>

                    <PWAInstallBanner
                      variant="card"
                      onSelectFrameMode={(m) => setState((prev) => ({ ...prev, deviceFrame: m }))}
                    />
                  </div>
                )}
              </div>

              {/* 4. ĐỒNG BỘ NGOẠI TUYẾN (ACCORDION) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 transition-all duration-200">
                <div
                  onClick={() => toggleSettingsSection('sync')}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      {syncStatus.isOnline ? (
                        <Cloud className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <CloudOff className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        ĐỒNG BỘ NGOẠI TUYẾN
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {openSettingsSections.sync
                          ? 'Nhấn để thu gọn trạng thái mạng'
                          : syncStatus.isOnline
                          ? 'Trực tuyến • Tự động đồng bộ'
                          : 'Ngoại tuyến (Lưu máy an toàn)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border ${
                        syncStatus.isOnline
                          ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-950/70 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {syncStatus.isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                    </span>
                    <div className="p-1 text-slate-400 group-hover:text-cyan-300 transition">
                      {openSettingsSections.sync ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {openSettingsSections.sync && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                    <div className="space-y-1 text-[11px] text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between">
                        <span>Kết nối mạng:</span>
                        <span className={syncStatus.isOnline ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                          {syncStatus.isOnline ? 'Trực tuyến' : 'Ngoại tuyến (Lưu máy)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thay đổi chờ đồng bộ:</span>
                        <span className="font-mono text-cyan-400">{syncStatus.pendingCount} tác vụ</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerSync(true)}
                      disabled={syncStatus.isSyncing}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                      <span>Đồng bộ ngay</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 5. SAO LƯU & KHÔI PHỤC DỮ LIỆU (ACCORDION) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 transition-all duration-200">
                <div
                  onClick={() => toggleSettingsSection('backup')}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        SAO LƯU & KHÔI PHỤC
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {openSettingsSections.backup
                          ? 'Nhấn để thu gọn'
                          : 'Xuất hoặc nhập tệp dữ liệu JSON'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      JSON
                    </span>
                    <div className="p-1 text-slate-400 group-hover:text-cyan-300 transition">
                      {openSettingsSections.backup ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {openSettingsSections.backup && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                    <button
                      onClick={() => exportBackupData(state)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> Xuất tệp JSON
                    </button>
                    <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" /> Nhập tệp JSON
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* 6. HƯỚNG DẪN & GIỚI THIỆU (ACCORDION) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 transition-all duration-200">
                <div
                  onClick={() => toggleSettingsSection('tutorial')}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        HƯỚNG DẪN BAN ĐẦU
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {openSettingsSections.tutorial
                          ? 'Nhấn để thu gọn'
                          : 'Xem lại màn hình chào mừng & giới thiệu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                      Mở lại
                    </span>
                    <div className="p-1 text-slate-400 group-hover:text-cyan-300 transition">
                      {openSettingsSections.tutorial ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {openSettingsSections.tutorial && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Mở lại bảng giới thiệu triết lý rèn luyện, các cấp Rank và cách đặt thói quen hiệu quả.
                    </p>
                    <button
                      onClick={() => setIsTutorialOpen(true)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Xem lại hướng dẫn ban đầu</span>
                    </button>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center space-y-0.5 text-xs">
                      <div className="font-bold text-cyan-400 uppercase tracking-widest text-[11px]">
                        ỨNG DỤNG THEO DÕI THÓI QUEN
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Thể chất • Tinh thần • Tri thức • Xã hội
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. VÙNG AN TOÀN: XÓA & ĐẶT LẠI DỮ LIỆU (ACCORDION) */}
              <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4 space-y-3 transition-all duration-200">
                <div
                  onClick={() => toggleSettingsSection('reset')}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-800/60 group-hover:scale-105 transition-transform">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                        XÓA & ĐẶT LẠI DỮ LIỆU
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {openSettingsSections.reset
                          ? 'Nhấn để thu gọn'
                          : 'Xóa thói quen hoặc khôi phục ứng dụng về ban đầu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-red-400 bg-red-950/80 border border-red-800/60 px-2 py-0.5 rounded-lg">
                      Tùy chọn
                    </span>
                    <div className="p-1 text-slate-400 group-hover:text-red-400 transition">
                      {openSettingsSections.reset ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {openSettingsSections.reset && (
                  <div className="space-y-3.5 pt-2 border-t border-red-900/50 animate-in fade-in duration-200">
                    {resetFeedbackMessage && (
                      <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 duration-150">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{resetFeedbackMessage}</span>
                      </div>
                    )}

                    {/* NÚT 1: XÓA THÓI QUEN & NHẬT KÝ */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">1. Xóa danh sách thói quen</span>
                        <span className="text-[10px] text-slate-400">Giữ lại tên & giao diện</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Xóa toàn bộ thói quen, lịch sử tích ngày và nhật ký để bắt đầu lên danh sách thói quen mới.
                      </p>

                      {!isClearHabitsConfirming ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsClearHabitsConfirming(true);
                            setIsResetConfirming(false);
                            triggerHaptic('medium', state.hapticEnabled);
                          }}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-red-300 font-bold border border-red-800/60 text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa sạch thói quen & nhật ký</span>
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl bg-red-950/90 border border-red-500 space-y-2.5 animate-in zoom-in-95 duration-150">
                          <div className="flex items-center gap-1.5 text-red-200 text-xs font-bold">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Xác nhận xóa sạch thói quen?</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsClearHabitsConfirming(false)}
                              className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleClearHabits}
                              className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black"
                            >
                              Đồng ý xóa
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NÚT 2: ĐẶT LẠI TOÀN BỘ ỨNG DỤNG */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-300">2. Đặt lại toàn bộ dữ liệu</span>
                        <span className="text-[10px] text-red-400 font-bold bg-red-950 px-1.5 py-0.2 rounded border border-red-800/60">Khôi phục gốc</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Đưa ứng dụng về trạng thái nguyên bản mới cài đặt, xóa toàn bộ thói quen, cấp rank và cài đặt.
                      </p>

                      {!isResetConfirming ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsResetConfirming(true);
                            setIsClearHabitsConfirming(false);
                            triggerHaptic('medium', state.hapticEnabled);
                          }}
                          className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold border border-red-800 text-xs rounded-xl transition shadow-lg shadow-red-950/40 flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Đặt lại toàn bộ ứng dụng (Reset All)</span>
                        </button>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-red-950/90 border-2 border-red-500 space-y-3 animate-in zoom-in-95 duration-150">
                          <div className="flex items-center gap-2 text-red-200 text-xs font-black">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Xác nhận khôi phục cài đặt gốc ban đầu?</span>
                          </div>
                          <p className="text-[10px] text-red-200/90 leading-relaxed">
                            Hành động này sẽ xóa vĩnh viễn dữ liệu thói quen và cấp rank của bạn trên thiết bị. Bạn có chắc chắn không?
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsResetConfirming(false);
                                triggerHaptic('light', state.hapticEnabled);
                              }}
                              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                              Hủy bỏ
                            </button>
                            <button
                              type="button"
                              onClick={handleResetApp}
                              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition shadow-lg shadow-red-900/60"
                            >
                              Đồng ý đặt lại
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav className="bg-[#070d1e]/95 border-t border-slate-800/90 px-2 py-2 flex items-center justify-around z-20 backdrop-blur-md">
          <button
            onClick={() => {
              setActiveTab('today');
              triggerHaptic('light', state.hapticEnabled);
            }}
            className={`flex flex-col items-center gap-1 transition py-0.5 px-2 rounded-xl ${
              activeTab === 'today' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px]">Hôm nay</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('focus');
              triggerHaptic('light', state.hapticEnabled);
            }}
            className={`flex flex-col items-center gap-1 transition py-0.5 px-2 rounded-xl ${
              activeTab === 'focus' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span className="text-[10px]">Tập trung</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('journal');
              triggerHaptic('light', state.hapticEnabled);
            }}
            className={`flex flex-col items-center gap-1 transition relative py-0.5 px-2 rounded-xl ${
              activeTab === 'journal' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Nhật ký</span>
            {state.journalEntries.some((e) => e.date === todayStr) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-0.5 right-2" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('progress');
              triggerHaptic('light', state.hapticEnabled);
            }}
            className={`flex flex-col items-center gap-1 transition py-0.5 px-2 rounded-xl ${
              activeTab === 'progress' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px]">Tiến độ</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              triggerHaptic('light', state.hapticEnabled);
            }}
            className={`flex flex-col items-center gap-1 transition py-0.5 px-2 rounded-xl ${
              activeTab === 'settings' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Cài đặt</span>
          </button>
        </nav>

        {/* MODALS */}
        {/* Goal Create / Edit Modal */}
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => {
            setIsGoalModalOpen(false);
            setGoalToEdit(null);
          }}
          goalToEdit={goalToEdit}
          activeGoals={state.goals.filter((g) => g.status === 'active')}
          onSaveGoal={handleSaveGoal}
          onDeleteGoal={handleDeleteGoal}
          preselectedType={goalModalPreselectedType}
        />

        {/* Goal Deadline Evaluation Check Modal */}
        <GoalCheckModal
          isOpen={!!checkGoalModalGoal}
          goal={checkGoalModalGoal}
          onConquer={handleConquerGoal}
          onFail={handleFailGoal}
          onExtend={handleExtendGoal}
          onClose={() => setCheckGoalModalGoal(null)}
        />

        {/* Habit Create / Edit Modal */}
        <HabitModal
          isOpen={isHabitModalOpen}
          onClose={() => {
            setIsHabitModalOpen(false);
            setHabitToEdit(null);
          }}
          habitToEdit={habitToEdit}
          availableCategories={activeCategories}
          onAddCategory={handleAddCategory}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          existingHabitsCount={state.habits.length}
        />

        {/* Psychology Habit Limit Warning Modal */}
        <PsychologyHabitReminderModal
          isOpen={isPsychologyModalOpen}
          onClose={() => {
            setIsPsychologyModalOpen(false);
            setPendingHabit(null);
          }}
          onConfirm={
            pendingHabit
              ? () => commitSaveHabit(pendingHabit.title, pendingHabit.frequency, pendingHabit.categories)
              : undefined
          }
          pendingHabitTitle={pendingHabit?.title}
          currentHabitsCount={state.habits.length}
        />

        {/* Calendar Date Navigator */}
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          selectedDate={state.selectedDate}
          onSelectDate={(newDate) => {
            setState((prev) => ({ ...prev, selectedDate: newDate }));
          }}
        />

        {/* First Time Tutorial Modal */}
        <TutorialModal
          isOpen={isTutorialOpen}
          initialUsername={state.username}
          initialPresetId={state.theme.presetId}
          onFinish={handleTutorialFinish}
        />

        {/* Rank Guide Modal */}
        <RankGuideModal
          isOpen={isRankGuideOpen}
          onClose={() => setIsRankGuideOpen(false)}
          allTimeCompletedCount={allTimeCompletedCount}
          onPreviewRankUp={() => {
            setRankUpData({
              previousRank: userRankData.current,
              newRank: userRankData.next || userRankData.current,
            });
            playRankUpFanfare(state.soundEnabled);
            triggerHaptic('success', state.hapticEnabled);
          }}
        />

        {/* Celebratory Rank Up Screen */}
        <RankUpCelebrationModal
          isOpen={!!rankUpData}
          onClose={() => setRankUpData(null)}
          previousRank={rankUpData?.previousRank || null}
          newRank={rankUpData?.newRank || userRankData.current}
          allTimeCount={allTimeCompletedCount}
        />

        {/* Custom In-App Confirm Delete Modal */}
        <ConfirmDeleteModal
          isOpen={!!habitToDelete}
          habitTitle={habitToDelete?.title || ''}
          onConfirm={confirmDeleteHabit}
          onCancel={() => setHabitToDelete(null)}
        />

        {/* Standalone App Options Modal */}
        <StandaloneAppModal
          isOpen={isStandaloneModalOpen}
          onClose={() => setIsStandaloneModalOpen(false)}
          onSelectFrameMode={(mode) => setState((prev) => ({ ...prev, deviceFrame: mode }))}
          initialTab={standaloneModalTab}
        />

        {/* Custom Theme & Wallpaper Customizer Modal */}
        <ThemeCustomizerModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={state.theme}
          onSaveTheme={(theme) => {
            setState((prev) => ({ ...prev, theme }));
            enqueueSyncAction('UPDATE_SETTINGS', { theme });
          }}
        />
      </div>
    </DeviceFrame>
  );
}
