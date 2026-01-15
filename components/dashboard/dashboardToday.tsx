import { Card, CardContent } from "@/components/ui/card";
import HabitCard from "./habitCard";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Flame, CheckCircle2 } from "lucide-react";

type HabitEntry = {
  id: string;
  date: Date;
  status: "COMPLETED" | "SKIPPED";
  checked: boolean | null;
  valueInt: number | null;
  durationSec: number | null;
  rating: number | null;
  textValue: string | null;
  valueFloat: number | null;
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
  entries: HabitEntry[];
};

type HabitSet = {
  id: string;
  name: string;
  color: string | null;
  isPinned: boolean;

  // ✅ comes from HabitSet table
  currentStreak?: number | null;
  bestStreak?: number | null;

  habits: Habit[];
};

function isHabitDone(h: Habit) {
  const entry = h.entries?.[0] ?? null;
  if (!entry) return false;

  // if skipped => doesn't count as done (strict)
  if (entry.status === "SKIPPED") return false;

  switch (h.type) {
    case "CHECK":
      return entry.checked === true;

    case "PROGRESS":
      if (!h.targetInt) return typeof entry.valueInt === "number" && entry.valueInt > 0;
      return typeof entry.valueInt === "number" && entry.valueInt >= h.targetInt;

    case "TIMER":
      if (!h.targetSec) return typeof entry.durationSec === "number" && entry.durationSec > 0;
      return typeof entry.durationSec === "number" && entry.durationSec >= h.targetSec;

    case "RATING":
      return typeof entry.rating === "number" && entry.rating > 0;

    case "TEXT":
      return !!entry.textValue?.trim();

    case "MEASUREMENT":
      return typeof entry.valueFloat === "number";

    default:
      return false;
  }
}

export default function DashboardToday({ habitSets }: { habitSets: HabitSet[] }) {
  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Today</h1>
        <p className="text-sm text-muted-foreground">
          Track today’s habits with quick actions or detailed logs.
        </p>
      </div>

      {habitSets.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No habit sets found. Create a habit set and add habits to start.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {habitSets.map((set) => {
            const total = set.habits.length;

            const doneCount = set.habits.reduce((acc, h) => {
              return acc + (isHabitDone(h) ? 1 : 0);
            }, 0);

            const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

            return (
              <Card key={set.id} className="p-0">
                <AccordionItem value={set.id} className="border-none">
                  {/* Title row only */}
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      {/* dot */}
                      {set.color ? (
                        <span
                          className="h-3 w-3 rounded-full border shrink-0"
                          style={{ backgroundColor: set.color }}
                        />
                      ) : (
                        <span className="h-3 w-3 rounded-full border bg-muted shrink-0" />
                      )}

                      {/* name */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base font-semibold truncate">
                            {set.name}
                          </span>
                        </div>

                        {/* streak + completion line */}
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {/* streak */}
                          <span className="inline-flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {set.currentStreak ?? 0}
                            </span>
                          </span>

                          {/* completion */}
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="font-medium text-foreground">
                              {doneCount}/{total}
                            </span>
                            <span>done</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  {/* Expanded content */}
                  <AccordionContent className="px-4 pb-4 pt-1">
                    {set.habits.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No active habits inside this set.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {set.habits.map((habit) => (
                          <HabitCard
                            key={habit.id}
                            habit={{
                              ...habit,
                              entry: habit.entries?.[0] ?? null,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Card>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
