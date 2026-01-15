"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { getISTDayStart } from "@/lib/dates";
import { upsertHabitEntrySchema } from "@/lib/validations/habitEntry";

import { recomputeHabitSetStreak } from "@/lib/streak/recomputeHabitSetStreak";

type UpsertEntryResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function upsertHabitEntry(
  input: unknown
): Promise<UpsertEntryResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { ok: false, message: "Unauthorized" };

    const parsed = upsertHabitEntrySchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path?.[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      return { ok: false, message: "Invalid input", fieldErrors };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { ok: false, message: "Unauthorized" };

    // ✅ today start (IST normalized)
    const today = getISTDayStart(new Date());

    // ✅ requested date (future support, but locked for now)
    const requestedDate = parsed.data.date
      ? getISTDayStart(new Date(parsed.data.date))
      : today;

    // ✅ LOCK: only allow today entries
    if (requestedDate.getTime() !== today.getTime()) {
      return {
        ok: false,
        message: "Entries are locked for past/future days.",
      };
    }

    // ✅ ensure habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id: parsed.data.habitId, userId: user.id, isActive: true },
      select: {
        id: true,
        type: true,
        habitSetId: true,
      },
    });

    if (!habit) return { ok: false, message: "Habit not found" };

    // ✅ prevent mismatch injection
    if (habit.type !== parsed.data.type) {
      return { ok: false, message: "Invalid habit type" };
    }

    // ✅ Build data based on type
    const data: any = {
      status: parsed.data.status ?? "COMPLETED",
      checked: null,
      valueInt: null,
      durationSec: null,
      rating: null,
      textValue: null,
      valueFloat: null,
      runningSince: null,
    };

    switch (habit.type) {
      case "CHECK":
        data.checked = parsed.data.checked ?? true;
        break;

      case "PROGRESS":
        if (typeof parsed.data.valueInt !== "number") {
          return { ok: false, message: "Progress value required" };
        }
        data.valueInt = parsed.data.valueInt;
        break;

      case "TIMER":
        if (typeof parsed.data.durationSec !== "number") {
          return { ok: false, message: "Duration required" };
        }
        data.durationSec = parsed.data.durationSec;

        if (parsed.data.runningSince === null) {
          data.runningSince = null; // stop
        } else if (typeof parsed.data.runningSince === "string") {
          data.runningSince = new Date(parsed.data.runningSince); // start/resume
        } else {
          // not provided => keep existing value in DB
          delete data.runningSince;
        }
        break;

      case "RATING":
        if (typeof parsed.data.rating !== "number") {
          return { ok: false, message: "Rating required" };
        }
        data.rating = parsed.data.rating;
        break;

      case "TEXT":
        if (!parsed.data.textValue?.trim()) {
          return { ok: false, message: "Text is required" };
        }
        data.textValue = parsed.data.textValue.trim();
        break;

      case "MEASUREMENT":
        if (typeof parsed.data.valueFloat !== "number") {
          return { ok: false, message: "Value required" };
        }
        data.valueFloat = parsed.data.valueFloat;
        break;
    }

    // ✅ UPSERT: 1 entry per habit per day
    await prisma.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId: habit.id,
          date: requestedDate,
        },
      },
      update: data,
      create: {
        userId: user.id,
        habitId: habit.id,
        date: requestedDate,
        ...data,
      },
    });

    // ✅ Update habit set streak cache
    await recomputeHabitSetStreak(habit.habitSetId);

    revalidatePath("/dashboard");
    revalidatePath("/habits");

    return { ok: true };
  } catch (e) {
    console.error("upsertHabitEntry error:", e);
    return { ok: false, message: "Something went wrong" };
  }
}
