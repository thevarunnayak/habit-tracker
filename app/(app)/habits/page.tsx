import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FloatingAddButton from "@/components/layout/floatingAddButton";

export default function HabitsPage() {
  return (
    <div className="space-y-6 relative">
      {/* header row with right aligned button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Habits</h1>
          <p className="text-sm text-muted-foreground">
            Manage your habit sets and habits here.
          </p>
        </div>

        <Link href="/habits/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Habit Sets</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This page will show the full list of habit sets you created.
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      <FloatingAddButton href="/habits/new" />
    </div>
  );
}
