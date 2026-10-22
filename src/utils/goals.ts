import { Goal, GoalType } from '../types';

export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekRange(date = new Date()): { start: string; end: string; label: string } {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  // In Vietnam, week starts Monday and ends Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (dateObj: Date) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  const start = formatDate(monday);
  const end = formatDate(sunday);

  return {
    start,
    end,
    label: `Tuần: ${start.slice(8)}/${start.slice(5, 7)} - ${end.slice(8)}/${end.slice(5, 7)}`,
  };
}

export function getCurrentMonthRange(date = new Date()): { start: string; end: string; label: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);

  const formatDate = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
    label: `Tháng ${m + 1}/${y}`,
  };
}

export function getDaysRemaining(endDateStr: string, todayStr = getTodayStr()): number {
  const end = new Date(endDateStr).getTime();
  const today = new Date(todayStr).getTime();
  const diffMs = end - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatGoalDateVi(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

export function isGoalOverdue(goal: Goal, todayStr = getTodayStr()): boolean {
  if (goal.status !== 'active') return false;
  return todayStr > goal.endDate;
}
