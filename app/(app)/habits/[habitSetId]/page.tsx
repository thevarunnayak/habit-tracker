import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getISTDayStart } from "@/lib/dates";

import HabitSetDetailHeader from "@/components/habits/habitSetDetailHeader";
import HabitSetHabitsTabs from "@/components/habits/habitSetHabitsTab";

/**
 * ✅ Returns calendar dates from:
 * - ALL => createdDay .. today
 * - else => max(createdDay, today-rangeDays+1) .. today
 */
function getPastDatesFromCreatedAt(rangeDays: number, createdAt: Date) {
  const today = getISTDayStart(new Date());
  const createdDay = getISTDayStart(new Date(createdAt));

  // ✅ if ALL => start from createdDay
  let start = createdDay;

  if (rangeDays !== -1) {
    const rangeStart = getISTDayStart(new Date(today));
    rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));

    // ✅ clamp
    start = rangeStart.getTime() < createdDay.getTime() ? createdDay : rangeStart;
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
  if (v === "all") return -1; // ✅ special flag for ALL

  const n = Number(v);
  if (n === 7) return 7;
  if (n === 14) return 14;
  if (n === 30) return 30;
  if (n === 90) return 90;
  if (n === 365) return 365;

  return 14;
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

  // ✅ First: get habitSet createdAt
  const habitSetMeta = await prisma.habitSet.findFirst({
    where: { id: habitSetId, userId: user.id },
    select: {
      id: true,
      createdAt: true,
    },
  });

  if (!habitSetMeta) return notFound();

  // ✅ minimum 7 days rule
  const today = getISTDayStart(new Date());
  const createdDay = getISTDayStart(new Date(habitSetMeta.createdAt));

  const totalAvailableDays =
    Math.floor((today.getTime() - createdDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const hasAtLeast7Days = totalAvailableDays >= 7;

  // ✅ date range clamped by createdAt
  const dates = getPastDatesFromCreatedAt(rangeDays, habitSetMeta.createdAt);

  const from = dates[0]!;
  const to = dates[dates.length - 1]!;

  // ✅ Now fetch full set + habits + entries only for selected range
  const habitSet = await prisma.habitSet.findFirst({
    where: { id: habitSetId, userId: user.id },
    include: {
      habits: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          entries: {
            where: {
              date: { gte: from, lte: to },
            },
            orderBy: { date: "asc" },
          },
        },
      },
    },
  });

  if (!habitSet) return notFound();

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
        hasAtLeast7Days={hasAtLeast7Days} // ✅ NEW
      />
    </div>
  );
}
