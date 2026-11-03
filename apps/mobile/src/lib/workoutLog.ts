import { getCurrentUser } from './auth';

export interface LogEntry {
  date: string; // YYYY-MM-DD
  name: string;
  kcal: number;
  plan: 'gym' | 'home';
}

const storageKey = () => `fitplanner_workout_log_${getCurrentUser()?.id ?? 'guest'}`;

export const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function getLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(storageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLog(entries: LogEntry[]): void {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(entries));
  } catch (e) {
    console.error('Unable to save workout log:', e);
  }
}

export const isDone = (entries: LogEntry[], date: string, name: string): boolean =>
  entries.some((e) => e.date === date && e.name === name);

// Check if not yet done, uncheck if already done. Returns the updated list.
export function toggleDone(date: string, name: string, kcal: number, plan: 'gym' | 'home'): LogEntry[] {
  const entries = getLog();
  const next = isDone(entries, date, name)
    ? entries.filter((e) => !(e.date === date && e.name === name))
    : [...entries, { date, name, kcal, plan }];
  saveLog(next);
  return next;
}

export const totalKcal = (entries: LogEntry[]): number =>
  entries.reduce((sum, e) => sum + e.kcal, 0);