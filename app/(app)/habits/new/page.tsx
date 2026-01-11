import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HabitCreateForm from "@/components/habits/habitCreateForm";

export default async function NewHabitPage({
  searchParams,
}: {
  searchParams: Promise<{ setId?: string; lockSet?: string }>;
}) {
  const { setId, lockSet } = await searchParams;

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
        select: { id: true, name: true },
      })
    : [];

  return <HabitCreateForm habitSets={habitSets} defaultSetId={setId}  lockHabitSet={lockSet === "1"} />;
}
