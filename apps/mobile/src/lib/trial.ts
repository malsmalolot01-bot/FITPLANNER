const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function getDaysLeft(endValue: string | null | undefined, fallback = 0): number {
  if (!endValue) return fallback;
  const end = new Date(endValue.includes('T') ? endValue : endValue.replace(' ', 'T'));
  if (Number.isNaN(end.getTime())) return fallback;
  const diff = Math.round(
    (startOfDay(end).getTime() - startOfDay(new Date()).getTime()) / 86400000
  );
  return Math.max(0, diff);
}