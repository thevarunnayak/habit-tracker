import { prisma } from "@/lib/prisma";
import { getISTDayStart } from "@/lib/dates";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * activeDays bitmask:
 * Mon=1 Tue=2 Wed=4 Thu=8 Fri=16 Sat=32 Sun=64
 * JS getDay(): 0=Sun..6=Sat
 */
function isSetActiveOnDay(activeDays: number, day: Date) {
  const jsDay = day.getDay(); // 0..6
  const bit =
    jsDay === 0
      ? 64
      : jsDay === 1
      ? 1
      : jsDay === 2
      ? 2
      : jsDay === 3
      ? 4
      : jsDay === 4
      ? 8
      : jsDay === 5
      ? 16
      : jsDay === 6
      ? 32
      : 0;

  return (activeDays & bit) !== 0;
}

type Range = "WEEK" | "MONTH" | "YEAR";

export async function getDashboardCompletionStats(input: {
  userId: string;
  range: Range;
}) {
  const today = getISTDayStart(new Date());

  const days = input.range === "WEEK" ? 7 : input.range === "MONTH" ? 30 : 365;

  const start = getISTDayStart(new Date(today));
  start.setDate(start.getDate() - (days - 1));

  // ✅ Build IST-normalized dateList (ascending)
  const dateList: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = getISTDayStart(new Date(start));
    d.setDate(d.getDate() + i);
    dateList.push(d);
  }

  /**
   * ✅ Fetch habitSets + habits
   * include createdAt to avoid counting sets/habits before they existed
   */
  const habitSets = await prisma.habitSet.findMany({
    where: {
      userId: input.userId,
      isArchived: false,
    },
    select: {
      id: true,
      activeDays: true,
      createdAt: true, // ✅ important
      habits: {
        where: { isActive: true },
        select: {
          id: true,
          createdAt: true, // ✅ important
        },
      },
    },
  });

  /**
   * ✅ Fetch COMPLETED entries only once
   * Map: isoDate -> Set(habitId)
   */
  const completedEntries = await prisma.habitEntry.findMany({
    where: {
      userId: input.userId,
      status: "COMPLETED",
      date: { gte: start, lte: today },
    },
    select: {
      habitId: true,
      date: true,
    },
  });

  const completedMap = new Map<string, Set<string>>();
  for (const e of completedEntries) {
    const key = toISODate(getISTDayStart(e.date));
    if (!completedMap.has(key)) completedMap.set(key, new Set());
    completedMap.get(key)!.add(e.habitId);
  }

  /**
   * ✅ Precompute expected habitIds for each date
   * This avoids nested loops repeatedly.
   */
  const expectedByDate = new Map<string, string[]>();

  for (const day of dateList) {
    const dayKey = toISODate(day);
    const expected: string[] = [];

    for (const set of habitSets) {
      const setStart = getISTDayStart(set.createdAt);

      // ✅ don't count sets before they existed
      if (setStart > day) continue;

      // ✅ schedule filter
      if (!isSetActiveOnDay(set.activeDays, day)) continue;

      for (const h of set.habits) {
        const habitStart = getISTDayStart(h.createdAt);

        // ✅ don't count habit before it existed
        if (habitStart > day) continue;

        expected.push(h.id);
      }
    }

    expectedByDate.set(dayKey, expected);
  }

  /**
   * ✅ Final: compute completed/incomplete per date
   */
  return dateList.map((day) => {
    const key = toISODate(day);

    const expectedHabitIds = expectedByDate.get(key) ?? [];
    const expected = expectedHabitIds.length;

    const completedSet = completedMap.get(key) ?? new Set<string>();

    // ✅ count completed only among expected habits
    let completed = 0;
    for (const hid of expectedHabitIds) {
      if (completedSet.has(hid)) completed++;
    }

    const incomplete = Math.max(expected - completed, 0);

    return {
      date: key,
      completed,
      incomplete,
    };
  });
}
