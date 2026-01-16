import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getISTDayStart } from "@/lib/dates";

import HabitSetDetailHeader from "@/components/habits/habitSetDetailHeader";
import HabitSetHabitsTabs from "@/components/habits/habitSetHabitsTab";
import { getHabitSetAnalytics } from "@/lib/stats/habitSetAnalytics";

/**
 * ✅ Returns calendar dates from:
 * - ALL => createdDay .. today
 * - else => max(createdDay, today-rangeDays+1) .. today
 */
function getPastDatesFromCreatedAt(rangeDays: number, createdAt: Date) {
  const today = getISTDayStart(new Date());
  const createdDay = getISTDayStart(new Date(createdAt));

  let start = createdDay;

  if (rangeDays !== -1) {
    const rangeStart = getISTDayStart(new Date(today));
    rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));
    start =
      rangeStart.getTime() < createdDay.getTime()
        ? createdDay
        : rangeStart;
  }

  const arr: Date[] = [];
  const cursor = getISTDayStart(new Date(start));

  while (cursor.getTime() <= today.getTime()) {
    arr.push(getISTDayStart(new Date(cursor)));
    cursor.setDate(cursor.getDate() + 1);
  }

  return arr;
}

function parseRange(v: unknown) {
  if (v === "all") return -1;
  const n = Number(v);
  if ([7, 14, 30, 90, 365].includes(n)) return n;
  return 14;
}

/** ✅ NEW */
function mapRangeDaysToAnalyticsRange(
  rangeDays: number
): "WEEK" | "MONTH" | "YEAR" | "ALL" {
  if (rangeDays === -1) return "ALL";
  if (rangeDays <= 7) return "WEEK";
  if (rangeDays <= 30) return "MONTH";
  return "YEAR";
}

export default async function HabitSetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ habitSetId: string }>;
  searchParams?: Promise<{ range?: string }>;
}) {
  const { habitSetId } = await params;
  const sp = (await searchParams) ?? {};
  const rangeDays = parseRange(sp.range);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return notFound();

  // ✅ HabitSet metadata
  const habitSetMeta = await prisma.habitSet.findFirst({
    where: { id: habitSetId, userId: user.id },
    select: { id: true, createdAt: true },
  });
  if (!habitSetMeta) return notFound();

  // ✅ minimum 7 days rule
  const today = getISTDayStart(new Date());
  const createdDay = getISTDayStart(new Date(habitSetMeta.createdAt));
  const totalAvailableDays =
    Math.floor(
      (today.getTime() - createdDay.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  const hasAtLeast7Days = totalAvailableDays >= 7;

  // ✅ date range for table
  const dates = getPastDatesFromCreatedAt(rangeDays, habitSetMeta.createdAt);
  const from = dates[0]!;
  const to = dates[dates.length - 1]!;

  // ✅ fetch habits + entries
  const habitSet = await prisma.habitSet.findFirst({
    where: { id: habitSetId, userId: user.id },
    include: {
      habits: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          entries: {
            where: { date: { gte: from, lte: to } },
            orderBy: { date: "asc" },
          },
        },
      },
    },
  });
  if (!habitSet) return notFound();

  // ✅ FIX: analytics now uses SAME range
  const analyticsRange = mapRangeDaysToAnalyticsRange(rangeDays);

  const analytics = await getHabitSetAnalytics({
    userId: user.id,
    habitSetId,
    range: analyticsRange,
  });

  return (
    <div className="space-y-6">
      <HabitSetDetailHeader
        habitSet={habitSet as any}
        habitsCount={habitSet.habits.length}
      />

      <HabitSetHabitsTabs
        habits={habitSet.habits as any}
        dates={dates.map((d) => d.toISOString())}
        rangeDays={rangeDays}
        habitSetCreatedAt={habitSetMeta.createdAt.toISOString()}
        hasAtLeast7Days={hasAtLeast7Days}
        analytics={analytics}
      />
    </div>
  );
}
