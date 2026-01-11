import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateHabitSetDialog from "@/components/habits/createHabitSetDialog";
import PinHabitSetButton from "@/components/habits/pinHabitSetButton";
import { Button } from "@/components/ui/button";
import HabitTypeBadge from "@/components/habits/habitTypeBadge";

export default async function HabitsPage() {
  const session = await getServerSession(authOptions);

  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const habitSets = user
    ? await prisma.habitSet.findMany({
        where: { userId: user.id },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: {
          habits: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 5, // ✅ show only preview list on main habits page
          },
        },
      })
    : [];

  const hexToRgba = (hex: any, alpha = 0.1) => {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c: any) => c + c)
        .join("");
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Habits</h1>
          <p className="text-sm text-muted-foreground">
            Manage your habit sets and habits here.
          </p>
        </div>

        <div className="flex gap-2">
          <CreateHabitSetDialog />
          <Button asChild>
            <Link href="/habits/new">Add Habit</Link>
          </Button>
        </div>
      </div>

      {/* sets */}
      <div className="space-y-4">
        {habitSets.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No habit sets yet. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          habitSets.map((set) => (
            <Card
              key={set.id}
              style={{ backgroundColor: hexToRgba(set.color, 0.1) }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  {set.color ? (
                    <span
                      className="h-3 w-3 rounded-full border"
                      style={{ backgroundColor: set.color }}
                    />
                  ) : (
                    <span className="h-3 w-3 rounded-full border bg-muted" />
                  )}

                  <div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/habits/${set.id}`}
                        className="hover:underline"
                      >
                        {set.name}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {set.isPinned ? "Pinned" : "Not pinned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/habits/new?setId=${set.id}&lockSet=1`}>
                      Add Habit
                    </Link>
                  </Button>

                  <PinHabitSetButton
                    habitSetId={set.id}
                    isPinned={set.isPinned}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {set.habits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No habits in this set yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {set.habits.map((h) => (
                      <div
                        key={h.id}
                        className="w-full sm:w-72 md:w-76 flex items-start justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-tight truncate">
                            {h.name}
                            {h.unit ? (
                              <span className="text-xs text-muted-foreground font-normal">
                                {" "}
                                ({h.unit})
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <HabitTypeBadge type={h.type} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/habits/${set.id}`}>View all →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
