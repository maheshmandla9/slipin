import type { DailyLog } from '../types';

const dayStr = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Streak = consecutive calendar days (ending today or yesterday) with a completed
 * debrief, across all personas. Yesterday-ending streaks survive until today's
 * debrief happens — a streak only breaks after a fully missed day.
 */
export function computeStreak(logs: DailyLog[], now = new Date()): number {
  const debriefDays = new Set(logs.filter((l) => l.debrief).map((l) => l.date));
  const cursor = new Date(now);
  if (!debriefDays.has(dayStr(cursor))) cursor.setDate(cursor.getDate() - 1); // allow "yesterday" anchor
  let streak = 0;
  while (debriefDays.has(dayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
