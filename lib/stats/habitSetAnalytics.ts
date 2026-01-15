import { prisma } from "@/lib/prisma";
import { getISTDayStart } from "@/lib/dates";

type Range = "WEEK" | "MONTH" | "YEAR" | "ALL";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function isSetActiveOnDay(activeDays: number, day: Date) {
  const jsDay = day.getDay(); // 0..6 (Sun..Sat)

  const bit =
    jsDay === 0
      ? 64 // Sun
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

function resolveRangeDays(range: Range) {
  if (range === "WEEK") return 7;
  if (range === "MONTH") return 30;
  if (range === "YEAR") return 365;
  return -1; // ALL
}

export async function getHabitSetAnalytics(input: {
  userId: string;
  habitSetId: string;
  range: Range;
}) {
  const today = getISTDayStart(new Date());

  const set = await prisma.habitSet.findFirst({
    where: {
      id: input.habitSetId,
      userId: input.userId,
      isArchived: false,
    },
    select: {
      id: true,
      activeDays: true,
      createdAt: true,
      streakStage: true,
      habits: {
        where: { isActive: true },
        select: {
          id: true,
          createdAt: true,
          type: true,
        },
      },
    },
  });

  if (!set) {
    return {
      ok: false as const,
      message: "Habit set not found",
    };
  }

  const createdAtDay = getISTDayStart(new Date(set.createdAt));
  const days = resolveRangeDays(input.range);

  // ✅ range start clamp
  let start = createdAtDay;
  if (days !== -1) {
    const tmp = getISTDayStart(new Date(today));
    tmp.setDate(tmp.getDate() - (days - 1));
    start = tmp.getTime() < createdAtDay.getTime() ? createdAtDay : tmp;
  }

  // ✅ build date list inclusive (start..today)
  const dateList: Date[] = [];
  {
    const cursor = getISTDayStart(new Date(start));
    while (cursor.getTime() <= today.getTime()) {
      dateList.push(getISTDayStart(new Date(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const habitIds = set.habits.map((h) => h.id);

  // ✅ entries in range
  const entries = await prisma.habitEntry.findMany({
    where: {
      userId: input.userId,
      habitId: { in: habitIds },
      date: { gte: start, lte: today },
    },
    select: {
      habitId: true,
      date: true,
      status: true,
    },
  });

  // dayKey -> habitId -> status
  const entryMap = new Map<string, Map<string, "COMPLETED" | "SKIPPED">>();
  for (const e of entries) {
    const dayKey = toISO(e.date);
    if (!entryMap.has(dayKey)) entryMap.set(dayKey, new Map());
    entryMap.get(dayKey)!.set(e.habitId, e.status);
  }

  // ✅ totals
  let expected = 0;
  let completed = 0;
  let skipped = 0;

  // ✅ time-series (for bar chart)
  const seriesMap = new Map<
    string,
    { date: string; expected: number; completed: number; skipped: number; incomplete: number }
  >();

  // init series map
  for (const day of dateList) {
    const key = toISO(day);
    seriesMap.set(key, {
      date: key,
      expected: 0,
      completed: 0,
      skipped: 0,
      incomplete: 0,
    });
  }

  for (const day of dateList) {
    const dayKey = toISO(day);

    // not active day = not counted at all
    if (!isSetActiveOnDay(set.activeDays, day)) continue;

    for (const h of set.habits) {
      const habitCreated = getISTDayStart(new Date(h.createdAt));
      if (habitCreated.getTime() > day.getTime()) continue;

      expected++;
      seriesMap.get(dayKey)!.expected++;

      const status = entryMap.get(dayKey)?.get(h.id);

      if (status === "COMPLETED") {
        completed++;
        seriesMap.get(dayKey)!.completed++;
      } else if (status === "SKIPPED") {
        skipped++;
        seriesMap.get(dayKey)!.skipped++;
      } else {
        // missing entry => incomplete
        seriesMap.get(dayKey)!.incomplete++;
      }
    }
  }

  const incomplete = Math.max(expected - completed - skipped, 0);

  // ✅ habitTypes for pie chart (fix)
  const byType = set.habits.reduce<Record<string, number>>((acc, h) => {
    acc[h.type] = (acc[h.type] ?? 0) + 1;
    return acc;
  }, {});

  const habitTypes = Object.entries(byType).map(([type, count]) => ({
    type,
    count,
  }));

  // ✅ series array sorted
  const series = Array.from(seriesMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    ok: true as const,
    habitSetId: set.id,
    from: start,
    to: today,

    totals: {
      expected,
      completed,
      skipped,
      incomplete,
    },

    // ✅ for types pie
    habitTypes,

    // ✅ keeping also for other UI usage
    byType,

    // ✅ required for bar chart
    series,
  };
}
