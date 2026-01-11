"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { habitSetSchema } from "@/lib/validations/habitSet";

type CreateHabitSetResult =
  | { ok: true; habitSetId: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: {
        name?: string;
        color?: string;
      };
    };

export async function createHabitSet(
  formData: FormData
): Promise<CreateHabitSetResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { ok: false, message: "Unauthorized" };
    }

    const raw = {
      name: String(formData.get("name") || ""),
      color: String(formData.get("color") || ""),
    };

    const parsed = habitSetSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path?.[0];
        if (typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      }

      return {
        ok: false,
        fieldErrors: {
          name: fieldErrors.name,
          color: fieldErrors.color,
        },
      };
    }

    const { name, color } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { ok: false, message: "Unauthorized" };

    const created = await prisma.habitSet.create({
      data: {
        userId: user.id,
        name,
        color: color || null,
      },
      select: { id: true },
    });

    revalidatePath("/habits");
    revalidatePath("/dashboard");

    return { ok: true, habitSetId: created.id };
  } catch (error) {
    console.error("createHabitSet error:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

type TogglePinResult =
  | { ok: true }
  | { ok: false; message?: string };

export async function togglePinHabitSet(
  habitSetId: string
): Promise<TogglePinResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { ok: false, message: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return { ok: false, message: "Unauthorized" };

    const habitSet = await prisma.habitSet.findFirst({
      where: { id: habitSetId, userId: user.id },
      select: { isPinned: true },
    });

    if (!habitSet) return { ok: false, message: "Not found" };

    await prisma.habitSet.update({
      where: { id: habitSetId },
      data: { isPinned: !habitSet.isPinned },
    });

    revalidatePath("/habits");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    console.error("togglePinHabitSet error:", error);
    return { ok: false, message: "Something went wrong" };
  }
}
