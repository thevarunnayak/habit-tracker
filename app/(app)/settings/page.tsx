import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "@/components/settings/settingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      defaultStreakStage: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Streak Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm defaultStreakStage={user.defaultStreakStage} />
        </CardContent>
      </Card>
    </div>
  );
}
