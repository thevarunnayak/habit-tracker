import { prisma } from "@/lib/prisma";
import { getISTDayStart } from "@/lib/dates";

function isBitActive(activeDays: number, date: Date) {
  const day = date.getDay();
  const bit =
    day === 0 ? 64 :
    day === 1 ? 1 :
    day === 2 ? 2 :
    day === 3 ? 4 :
    day === 4 ? 8 :
    day === 5 ? 16 :
    day === 6 ? 32 : 0;

  return (activeDays & bit) !== 0;
}

function isHabitDoneForEntry(habit: any, entry: any | null) {
  if (!entry) return false;
  if (entry.status === "SKIPPED") return false;

  switch (habit.type) {
    case "CHECK":
      return entry.checked === true;

    case "PROGRESS":
      if (!habit.targetInt) return typeof entry.valueInt === "number" && entry.valueInt > 0;
      return typeof entry.valueInt === "number" && entry.valueInt >= habit.targetInt;

    case "TIMER":
      if (!habit.targetSec) return typeof entry.durationSec === "number" && entry.durationSec > 0;
      return typeof entry.durationSec === "number" && entry.durationSec >= habit.targetSec;

    case "RATING":
      return typeof entry.rating === "number" && entry.rating > 0;

    case "TEXT":
      return !!entry.textValue?.trim();

    case "MEASUREMENT":
      return typeof entry.valueFloat === "number";

    default:
      return false;
  }
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function recomputeHabitSetStreak(habitSetId: string) {
  const today = getISTDayStart(new Date());
  const start = getISTDayStart(new Date(today));
  start.setDate(start.getDate() - 364); // last 365 days window

  // ✅ 1 query: get habitset + habits
  const set = await prisma.habitSet.findUnique({
    where: { id: habitSetId },
    select: {
      id: true,
      activeDays: true,
      isArchived: true,
      streakStage: true,
      bestStreak: true,
      currentStreak: true,
      streakBrokenAt: true,
      lastStreakDate: true,
      habits: {
        where: { isActive: true },
        select: {
          id: true,
          type: true,
          targetInt: true,
          targetSec: true,
        },
      },
    },
  });

  if (!set) return 0;
  if (set.isArchived) return 0;
  if (set.habits.length === 0) {
    await prisma.habitSet.update({
      where: { id: habitSetId },
      data: { currentStreak: 0 },
    });
    return 0;
  }

  const habitIds = set.habits.map((h) => h.id);

  // ✅ 2nd query: all entries for 365 days at once
  const entries = await prisma.habitEntry.findMany({
    where: {
      habitId: { in: habitIds },
      date: { gte: start, lte: today },
    },
    select: {
      habitId: true,
      date: true,
      status: true,
      checked: true,
      valueInt: true,
      durationSec: true,
      rating: true,
      textValue: true,
      valueFloat: true,
    },
  });

  // habitId -> dayIso -> entry
  const entryMap = new Map<string, Map<string, any>>();
  for (const hId of habitIds) entryMap.set(hId, new Map());

  for (const e of entries) {
    const dayKey = isoDay(getISTDayStart(new Date(e.date)));
    entryMap.get(e.habitId)?.set(dayKey, e);
  }

  const totalHabits = set.habits.length;

  const isSetCompletedForDay = (d: Date) => {
    if (!isBitActive(set.activeDays, d)) return false;

    const dayKey = isoDay(d);
    let doneCount = 0;

    for (const h of set.habits) {
      const entry = entryMap.get(h.id)?.get(dayKey) ?? null;
      const done = isHabitDoneForEntry(h, entry);
      if (done) doneCount++;
    }

    if (set.streakStage === "BEGINNER") return doneCount >= 1;
    if (set.streakStage === "SEMI_PRO") return doneCount / totalHabits >= 0.5;
    return doneCount === totalHabits; // LEGEND
  };

  // ✅ compute streak backward without DB
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = getISTDayStart(new Date(today));
    d.setDate(d.getDate() - i);

    if (!isSetCompletedForDay(d)) break;
    streak++;
  }

  const best = Math.max(set.bestStreak ?? 0, streak);
  const completedToday = isSetCompletedForDay(today);

  let streakBrokenAt: Date | null = set.streakBrokenAt ?? null;
  if ((set.currentStreak ?? 0) > 0 && streak === 0) {
    streakBrokenAt = today;
  }

  const lastStreakDate = completedToday ? today : set.lastStreakDate ?? null;

  await prisma.habitSet.update({
    where: { id: habitSetId },
    data: {
      currentStreak: streak,
      bestStreak: best,
      lastStreakDate,
      streakBrokenAt,
    },
  });

  return streak;
}
