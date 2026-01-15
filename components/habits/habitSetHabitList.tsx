import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import HabitEntryDialog from "@/components/dashboard/habitEntryDialog";

import {
  CheckCircle2,
  CheckCheck,
  FilePenLine,
  Gauge,
  Ruler,
  Star,
  Timer,
  Type,
} from "lucide-react";

type Entry = {
  checked: boolean | null;
  valueInt: number | null;
  durationSec: number | null;
  rating: number | null;
  textValue: string | null;
  valueFloat: number | null;
  runningSince?: string | null;
};

type Habit = {
  id: string;
  name: string;
  type: string;
  unit: string | null;

  targetInt: number | null;
  targetSec: number | null;
  ratingMax: number | null;
  precision: number | null;

  entry: Entry | null;
};

function HabitTypeIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 text-muted-foreground shrink-0";

  switch (type) {
    case "CHECK":
      return <CheckCheck className={cls} />;
    case "PROGRESS":
      return <Gauge className={cls} />;
    case "TIMER":
      return <Timer className={cls} />;
    case "RATING":
      return <Star className={cls} />;
    case "TEXT":
      return <Type className={cls} />;
    case "MEASUREMENT":
      return <Ruler className={cls} />;
    default:
      return <CheckCircle2 className={cls} />;
  }
}

function getHabitStatus(habit: Habit) {
  // CHECK
  if (habit.type === "CHECK") {
    return habit.entry?.checked ? "done" : "none";
  }

  // PROGRESS
  if (habit.type === "PROGRESS") {
    const val = habit.entry?.valueInt ?? 0;
    const target = habit.targetInt ?? 0;
    if (val <= 0) return "none";
    if (target > 0 && val >= target) return "done";
    return "partial";
  }

  // TIMER
  if (habit.type === "TIMER") {
    const val = habit.entry?.durationSec ?? 0;
    const target = habit.targetSec ?? 0;
    if (val <= 0) return "none";
    if (target > 0 && val >= target) return "done";
    return "partial";
  }

  // RATING
  if (habit.type === "RATING") {
    return (habit.entry?.rating ?? 0) > 0 ? "done" : "none";
  }

  // TEXT
  if (habit.type === "TEXT") {
    return habit.entry?.textValue?.trim() ? "done" : "none";
  }

  // MEASUREMENT
  if (habit.type === "MEASUREMENT") {
    return typeof habit.entry?.valueFloat === "number" ? "done" : "none";
  }

  return "none";
}

export default function HabitSetHabitsList({ habits }: { habits: Habit[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habits</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No habits yet. Add one to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((h) => {
              const status = getHabitStatus(h);

              const bgClass =
                status === "done"
                  ? "bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                  : status === "partial"
                  ? "bg-yellow-50/80 dark:bg-yellow-950/15 border-yellow-200 dark:border-yellow-900"
                  : "bg-red-50/70 dark:bg-red-950/15 border-red-200 dark:border-red-900";

              return (
                <div
                  key={h.id}
                  className={[
                    "flex items-center justify-between gap-3",
                    "rounded-xl border px-3 py-2 shadow-sm",
                    bgClass,
                  ].join(" ")}
                >
                  {/* left */}
                  <div className="flex items-center gap-2 min-w-0">
                    <HabitTypeIcon type={h.type} />

                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{h.name}</p>

                      {h.unit ? (
                        <p className="text-xs text-muted-foreground truncate">
                          Unit: {h.unit}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate">
                          {h.type}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <HabitEntryDialog
                      habit={h as any}
                      trigger={
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Log"
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
