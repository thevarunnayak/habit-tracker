import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HabitTypeBadge from "@/components/habits/habitTypeBadge";

export default async function HabitSetDetailPage({
  params,
}: {
  params: Promise<{ habitSetId: string }>;
}) {
  const { habitSetId } = await params; // ✅ unwrap

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return notFound();

  const habitSet = await prisma.habitSet.findFirst({
    where: { id: habitSetId, userId: user.id },
    include: {
      habits: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!habitSet) return notFound();

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{habitSet.name}</h1>
          <p className="text-sm text-muted-foreground">
            All habits in this set.
          </p>
        </div>

        <Button asChild>
          <Link href={`/habits/new?setId=${habitSet.id}&lockSet=1`}>Add Habit</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Habits</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {habitSet.habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No habits yet. Add one to get started.
            </p>
          ) : (
            habitSet.habits.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.unit ? `Unit: ${h.unit}` : ""}
                  </p>
                </div>

                <HabitTypeBadge type={h.type} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
