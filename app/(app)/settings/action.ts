"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Stage = "BEGINNER" | "SEMI_PRO" | "LEGEND";

export async function updateDefaultStreakStage(stage: Stage) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { ok: false, message: "Unauthorized" };

    await prisma.user.update({
      where: { email: session.user.email },
      data: { defaultStreakStage: stage },
    });

    revalidatePath("/settings");

    return { ok: true };
  } catch (e) {
    console.error("updateDefaultStreakStage error:", e);
    return { ok: false, message: "Something went wrong" };
  }
}
