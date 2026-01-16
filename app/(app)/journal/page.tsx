import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import JournalList from "@/components/journal/journalList";

export default async function JournalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return null;

  const journals = await prisma.journal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Journal</h1>
        <Button asChild>
          <Link href="/journal/new">Add Journal</Link>
        </Button>
      </div>

      {journals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No journal entries yet.
        </p>
      ) : (
        <JournalList journals={journals} />
      )}
    </div>
  );
}
