import Link from "next/link";

import { Button } from "@/components/ui/button";
import StreakBadge from "@/components/habits/streakBadge";
import HabitSetScheduleDialog from "@/components/habits/habitSetScheduleDialog";
import HabitSetStreakStageDialog from "@/components/habits/habitSetStreakDaialog";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Plus } from "lucide-react";

export default function HabitSetDetailHeader({
  habitSet,
  habitsCount,
}: {
  habitSet: {
    id: string;
    name: string;
    isPinned: boolean;
    currentStreak: number | null;
    bestStreak: number | null;
    streakStage: string;
    activeDays: number;
  };
  habitsCount: number;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      {/* left */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{habitSet.name}</h1>

        <p className="text-sm text-muted-foreground">
          {habitsCount} habits
          <span className="mx-2 opacity-60">•</span>
          {habitSet.isPinned ? "Pinned" : "Not pinned"}
        </p>
      </div>

      {/* right */}
      <div className="flex flex-wrap items-center gap-2">
        <StreakBadge
          streak={habitSet.currentStreak ?? 0}
          label="Current"
          variant="current"
        />

        <StreakBadge
          streak={habitSet.bestStreak ?? 0}
          label="Best"
          variant="best"
        />

        {/* Add Habit icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" variant="outline" aria-label="Add habit">
              <Link href={`/habits/new?setId=${habitSet.id}&lockSet=1`}>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Habit</TooltipContent>
        </Tooltip>

        {/* Streak stage */}
        <HabitSetStreakStageDialog
          habitSetId={habitSet.id}
          streakStage={habitSet.streakStage as any}
        />

        {/* Occurrence */}
        <HabitSetScheduleDialog
          habitSetId={habitSet.id}
          activeDays={habitSet.activeDays}
        />
      </div>
    </div>
  );
}
