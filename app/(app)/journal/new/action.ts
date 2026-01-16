"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTitleFromContent } from "@/lib/journal/extractTitle";
import { revalidatePath } from "next/cache";

export async function createJournal({
  content,
}: {
  content: any;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  const title = extractTitleFromContent(content); // ✅ FIX

  await prisma.journal.create({
    data: {
      userId: user.id,
      title,                 // ✅ now present
      content,
      date: new Date(),
    },
  });

  revalidatePath("/journal");
}

export async function deleteJournal(journalId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  await prisma.journal.delete({
    where: {
      id: journalId,
      userId: user.id, // ✅ ownership check
    },
  });
}
