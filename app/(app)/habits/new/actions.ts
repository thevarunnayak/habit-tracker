"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHabitSchema } from "@/lib/validations/habit";
import { revalidatePath } from "next/cache";

type CreateHabitResult =
  | { ok: true; habitId: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Record<string, string>;
    };

export async function createHabit(
  formData: FormData
): Promise<CreateHabitResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { ok: false, message: "Unauthorized" };
    }

    // ✅ helpers to avoid NaN issues in zod (""/null → undefined)
    const getStr = (key: string) => String(formData.get(key) ?? "").trim();
    const getOptStr = (key: string) => {
      const v = String(formData.get(key) ?? "").trim();
      return v === "" ? undefined : v;
    };

    const raw = {
      habitSetId: getStr("habitSetId"),
      name: getStr("name"),
      type: getStr("type"),

      unit: getOptStr("unit"),

      targetInt: getOptStr("targetInt"),
      targetSec: getOptStr("targetSec"),
      ratingMax: getOptStr("ratingMax"),
      precision: getOptStr("precision"),
    };

    const parsed = createHabitSchema.safeParse(raw);

    // ✅ return field errors + message so UI shows proper feedback
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path?.[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }

      return {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { ok: false, message: "Unauthorized" };

    // Ensure habitSet belongs to user
    const set = await prisma.habitSet.findFirst({
      where: { id: parsed.data.habitSetId, userId: user.id },
      select: { id: true },
    });

    if (!set) return { ok: false, message: "Invalid habit set" };

    // ✅ TS-safe numeric extraction
    const targetInt =
      typeof parsed.data.targetInt === "number" ? parsed.data.targetInt : null;

    const targetSec =
      typeof parsed.data.targetSec === "number" ? parsed.data.targetSec : null;

    const ratingMax =
      typeof parsed.data.ratingMax === "number" ? parsed.data.ratingMax : null;

    const precision =
      typeof parsed.data.precision === "number" ? parsed.data.precision : null;

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        habitSetId: set.id,
        name: parsed.data.name,
        type: parsed.data.type,

        unit: parsed.data.unit || null,
        targetInt,
        targetSec,
        ratingMax,
        precision,
      },
      select: { id: true },
    });

    revalidatePath("/habits");
    revalidatePath("/dashboard");

    return { ok: true, habitId: habit.id };
  } catch (e) {
    console.error("createHabit error:", e);
    return { ok: false, message: "Something went wrong" };
  }
}
