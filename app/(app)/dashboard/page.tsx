import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getISTDayStart } from "@/lib/dates";

import DashboardToday from "@/components/dashboard/dashboardToday";
import DashboardStatsCard from "@/components/dashboard/dashboardStatsCard";

import { isHabitSetActiveToday } from "@/lib/dates/isHabitSetActiveToday";
import { getDashboardCompletionStats } from "@/lib/stats/dashboardStats";

type Range = "WEEK" | "MONTH" | "YEAR";

function parseRange(v: unknown): Range {
  if (v === "MONTH") return "MONTH";
  if (v === "YEAR") return "YEAR";
  return "WEEK";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const range = parseRange(sp.range);

  const session = await getServerSession(authOptions);

  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const today = getISTDayStart(new Date());

  const habitSets = user
    ? await prisma.habitSet.findMany({
        where: {
          userId: user.id,
          isArchived: false,
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: {
          habits: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            include: {
              entries: {
                where: { date: today },
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      })
    : [];

  const activeTodaySets = habitSets
    .filter((set) => isHabitSetActiveToday(set.activeDays, new Date()))
    .map((set) => ({
      ...set,
      habits: set.habits.map((h) => ({
        ...h,
        entry: h.entries[0] ?? null,
      })),
    }));

  const stats = user
    ? await getDashboardCompletionStats({ userId: user.id, range })
    : [];

  return (
    <>
      <DashboardToday habitSets={activeTodaySets} />
      <DashboardStatsCard initialData={stats} range={range} />
    </>
  );
}
