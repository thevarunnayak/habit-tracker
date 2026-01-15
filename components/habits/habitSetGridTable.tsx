"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HabitEntry = {
  date: string | Date;
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

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatColLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** ✅ if entry missing => NOT_DONE */
function isHabitDoneForEntry(h: Habit, e: HabitEntry | null) {
  if (!e) return { state: "NOT_DONE" as const };
  if (e.status === "SKIPPED") return { state: "SKIPPED" as const };

  switch (h.type) {
    case "CHECK":
      return { state: e.checked ? "DONE" : "NOT_DONE" };

    case "PROGRESS": {
      const val = e.valueInt ?? 0;
      const target = h.targetInt ?? 0;
      if (val <= 0) return { state: "NOT_DONE" };
      if (target > 0 && val >= target) return { state: "DONE" };
      return { state: "PARTIAL" };
    }

    case "TIMER": {
      const val = e.durationSec ?? 0;
      const target = h.targetSec ?? 0;
      if (val <= 0) return { state: "NOT_DONE" };
      if (target > 0 && val >= target) return { state: "DONE" };
      return { state: "PARTIAL" };
    }

    case "RATING":
      return { state: (e.rating ?? 0) > 0 ? "DONE" : "NOT_DONE" };

    case "TEXT":
      return { state: e.textValue?.trim() ? "DONE" : "NOT_DONE" };

    case "MEASUREMENT":
      return { state: typeof e.valueFloat === "number" ? "DONE" : "NOT_DONE" };

    default:
      return { state: "NOT_DONE" as const };
  }
}

function Cell({ state }: { state: string }) {
  const cls =
    state === "DONE"
      ? "bg-green-100 text-green-700 border-green-200"
      : state === "PARTIAL"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : state === "NOT_DONE"
      ? "bg-red-100 text-red-700 border-red-200"
      : state === "SKIPPED"
      ? "bg-muted text-muted-foreground border-muted"
      : "bg-transparent text-muted-foreground border-border";

  const label =
    state === "DONE"
      ? "✅"
      : state === "PARTIAL"
      ? "🟡"
      : state === "NOT_DONE"
      ? "❌"
      : state === "SKIPPED"
      ? "⏭"
      : "❌";

  return (
    <div
      className={[
        "h-9 w-9 flex items-center justify-center rounded-md border text-[13px]",
        cls,
      ].join(" ")}
      title={state}
    >
      {label}
    </div>
  );
}

export default function HabitSetHabitsGridTable({
  habits,
  dates,
  rangeDays,
  habitSetCreatedAt,
  hasAtLeast7Days,
}: {
  habits: Habit[];
  dates: string[];
  rangeDays: number; // 7/14/30 or -1 for ALL
  habitSetCreatedAt: string; // ISO string
  hasAtLeast7Days: boolean; // ✅ FIXED TYPE
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateObjects = useMemo(() => dates.map((d) => new Date(d)), [dates]);

  const createdAt = useMemo(
    () => new Date(habitSetCreatedAt),
    [habitSetCreatedAt]
  );

  const entryMap = useMemo(() => {
    const map = new Map<string, Map<string, HabitEntry>>();
    for (const h of habits) {
      const inner = new Map<string, HabitEntry>();
      for (const e of h.entries ?? []) {
        const day = isoDay(new Date(e.date));
        inner.set(day, e);
      }
      map.set(h.id, inner);
    }
    return map;
  }, [habits]);

  const habitCol = 260;
  const cellCol = 46;

  /** ✅ UNIVERSAL empty state checks */
  const showNoDataMessage =
    !hasAtLeast7Days || habits.length === 0 || dateObjects.length === 0;

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col justify-start items-start gap-2 space-y-0 w-full">
        <div className="flex flex-row items-center justify-between gap-3 w-full">
          <CardTitle>Habits History</CardTitle>

          <Select
            value={rangeDays === -1 ? "all" : String(rangeDays)}
            onValueChange={(v) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("range", v);
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Range" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground shadow-sm">
          ✅ Done • 🟡 Partial • ❌ Not done • ⏭ Skipped
        </div>

        {rangeDays === -1 ? (
          <p className="text-xs text-muted-foreground">
            Showing all data since{" "}
            <span className="font-medium">
              {createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
        ) : null}
      </CardHeader>

      {/* ✅ NO DATA / NOT ENOUGH DATA UI */}
      {showNoDataMessage ? (
        <CardContent className="pt-4">
          <div className="rounded-xl border bg-muted/30 p-5 space-y-2">
            <p className="font-medium">
              {hasAtLeast7Days ? "No data to show yet" : "Not enough data yet"}
            </p>

            <p className="text-sm text-muted-foreground">
              {!hasAtLeast7Days
                ? "Complete at least 7 days of habits and come back later 🙂"
                : "Start tracking habits daily to see your history table here."}
            </p>

            <div className="text-xs text-muted-foreground pt-1">
              Habits: <span className="font-medium">{habits.length}</span> •
              Days: <span className="font-medium">{dateObjects.length}</span>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="min-w-0">
          <div className="relative w-full overflow-x-auto">
            <div className="inline-block min-w-max align-top">
              {/* HEADER */}
              <div
                className="grid border-b"
                style={{
                  gridTemplateColumns: `${habitCol}px repeat(${dateObjects.length}, ${cellCol}px)`,
                }}
              >
                <div className="sticky left-0 z-30 bg-background border-r py-2 pr-1 md:pr-3 font-medium text-sm">
                  Habit
                </div>

                {dateObjects.map((d) => (
                  <div
                    key={d.toISOString()}
                    className="py-2 text-xs text-muted-foreground text-center"
                  >
                    {formatColLabel(d)}
                  </div>
                ))}
              </div>

              {/* ROWS */}
              <div className="divide-y">
                {habits.map((h) => {
                  const rowEntries = entryMap.get(h.id);

                  return (
                    <div
                      key={h.id}
                      className="grid items-center"
                      style={{
                        gridTemplateColumns: `${habitCol}px repeat(${dateObjects.length}, ${cellCol}px)`,
                      }}
                    >
                      <div className="sticky left-0 z-20 bg-background border-r py-2 pr-1 md:pr-3">
                        <p className="font-medium truncate" title={h.name}>
                          {h.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {h.type}
                          {h.unit ? ` • ${h.unit}` : ""}
                        </p>
                      </div>

                      {dateObjects.map((d) => {
                        const day = isoDay(d);
                        const entry = rowEntries?.get(day) ?? null;
                        const { state } = isHabitDoneForEntry(h, entry);

                        return (
                          <div key={day} className="py-2 flex justify-center">
                            <Cell state={state} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
