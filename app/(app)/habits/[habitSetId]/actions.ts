"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { recomputeHabitSetStreak } from "@/lib/streak/recomputeHabitSetStreak";

type ActionResult = { ok: true } | { ok: false; message: string };

async function getAuthedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user;
}

/**
 * ✅ Update schedule (activeDays)
 */
export async function updateHabitSetSchedule(input: {
  habitSetId: string;
  activeDays: number;
}): Promise<ActionResult> {
  try {
    const user = await getAuthedUser();
    if (!user) return { ok: false, message: "Unauthorized" };

    if (
      typeof input.activeDays !== "number" ||
      input.activeDays < 0 ||
      input.activeDays > 127
    ) {
      return { ok: false, message: "Invalid schedule" };
    }

    const set = await prisma.habitSet.findFirst({
      where: { id: input.habitSetId, userId: user.id },
      select: { id: true },
    });

    if (!set) return { ok: false, message: "Habit set not found" };

    await prisma.habitSet.update({
      where: { id: set.id },
      data: { activeDays: input.activeDays },
    });

    // ✅ schedule affects streak
    await recomputeHabitSetStreak(set.id);

    revalidatePath("/dashboard");
    revalidatePath("/habits");
    revalidatePath(`/habits/${set.id}`);

    return { ok: true };
  } catch (e) {
    console.error("updateHabitSetSchedule error:", e);
    return { ok: false, message: "Something went wrong" };
  }
}

/**
 * ✅ Update streak stage for a habit set
 * BEGINNER / SEMI_PRO / LEGEND
 */
export async function updateHabitSetStreakStage(input: {
  habitSetId: string;
  streakStage: "BEGINNER" | "SEMI_PRO" | "LEGEND";
}): Promise<ActionResult> {
  try {
    const user = await getAuthedUser();
    if (!user) return { ok: false, message: "Unauthorized" };

    if (!["BEGINNER", "SEMI_PRO", "LEGEND"].includes(input.streakStage)) {
      return { ok: false, message: "Invalid stage" };
    }

    const set = await prisma.habitSet.findFirst({
      where: { id: input.habitSetId, userId: user.id },
      select: { id: true },
    });

    if (!set) return { ok: false, message: "Habit set not found" };

    await prisma.habitSet.update({
      where: { id: set.id },
      data: { streakStage: input.streakStage },
    });

    // ✅ stage affects streak logic, so recompute
    await recomputeHabitSetStreak(set.id);

    revalidatePath("/dashboard");
    revalidatePath("/habits");
    revalidatePath(`/habits/${set.id}`);

    return { ok: true };
  } catch (e) {
    console.error("updateHabitSetStreakStage error:", e);
    return { ok: false, message: "Something went wrong" };
  }
}

/**
 * ✅ Optional dev action: force recompute streak manually
 */
export async function recomputeHabitSetStreakAction(
  habitSetId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthedUser();
    if (!user) return { ok: false, message: "Unauthorized" };

    const set = await prisma.habitSet.findFirst({
      where: { id: habitSetId, userId: user.id },
      select: { id: true },
    });

    if (!set) return { ok: false, message: "Habit set not found" };

    await recomputeHabitSetStreak(set.id);

    revalidatePath("/dashboard");
    revalidatePath("/habits");
    revalidatePath(`/habits/${set.id}`);

    return { ok: true };
  } catch (e) {
    console.error("recomputeHabitSetStreakAction error:", e);
    return { ok: false, message: "Something went wrong" };
  }
}
