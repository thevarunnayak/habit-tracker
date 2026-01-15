"use client";

import HabitTypeBadge from "@/components/habits/habitTypeBadge";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function getHabitStatus(h: Habit) {
  const e = h.entry;

  if (!e) return { label: "Not started", variant: "secondary" as const };

  if (h.type === "CHECK") {
    return e.checked
      ? { label: "Done", variant: "default" as const }
      : { label: "Not done", variant: "destructive" as const };
  }

  if (h.type === "PROGRESS") {
    const val = e.valueInt ?? 0;
    const target = h.targetInt ?? 0;
    if (val <= 0) return { label: "Not started", variant: "secondary" as const };
    if (target > 0 && val >= target) return { label: "Done", variant: "default" as const };
    return { label: "In progress", variant: "outline" as const };
  }

  if (h.type === "TIMER") {
    const val = e.durationSec ?? 0;
    const target = h.targetSec ?? 0;
    if (val <= 0) return { label: "Not started", variant: "secondary" as const };
    if (target > 0 && val >= target) return { label: "Done", variant: "default" as const };
    return { label: "In progress", variant: "outline" as const };
  }

  if (h.type === "RATING") {
    return (e.rating ?? 0) > 0
      ? { label: `Rated ${e.rating}`, variant: "default" as const }
      : { label: "Not rated", variant: "secondary" as const };
  }

  if (h.type === "TEXT") {
    return e.textValue?.trim()
      ? { label: "Logged", variant: "default" as const }
      : { label: "Empty", variant: "secondary" as const };
  }

  if (h.type === "MEASUREMENT") {
    return typeof e.valueFloat === "number"
      ? { label: `${e.valueFloat}`, variant: "default" as const }
      : { label: "Not logged", variant: "secondary" as const };
  }

  return { label: "—", variant: "secondary" as const };
}

export default function HabitSetHabitsTable({ habits }: { habits: Habit[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habits Table</CardTitle>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="py-2 pr-4 font-medium">Habit</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Unit</th>
              <th className="py-2 pr-4 font-medium">Status (Today)</th>
            </tr>
          </thead>

          <tbody>
            {habits.map((h) => {
              const status = getHabitStatus(h);

              return (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 max-w-[260px]">
                    <p className="font-medium truncate" title={h.name}>
                      {h.name}
                    </p>
                  </td>

                  <td className="py-3 pr-4">
                    <HabitTypeBadge type={h.type} />
                  </td>

                  <td className="py-3 pr-4">
                    {h.unit ? (
                      <span className="text-muted-foreground">{h.unit}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="py-3 pr-4">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
