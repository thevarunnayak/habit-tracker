"use client";

import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import { upsertHabitEntry } from "@/app/(app)/dashboard/actions";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HabitEntryDialog from "./habitEntryDialog";

import {
  CheckCircle2,
  FilePenLine,
  Gauge,
  Timer,
  Star,
  Type,
  Ruler,
  CheckCheck,
} from "lucide-react";
import { useGlobalLoader } from "../providers/globalLoaderProvider";

type Entry = {
  checked: boolean | null;
  valueInt: number | null;
  durationSec: number | null;
  rating: number | null;
  textValue: string | null;
  valueFloat: number | null;
};

type HabitCardProps = {
  habit: {
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

export default function HabitCard({ habit }: HabitCardProps) {
  const { showLoader } = useGlobalLoader();
  const [pending, startTransition] = useTransition();

  const status = useMemo(() => {
    if (habit.type === "CHECK") return habit.entry?.checked ? "done" : "none";

    if (habit.type === "PROGRESS") {
      const val = habit.entry?.valueInt ?? 0;
      const target = habit.targetInt ?? 0;
      if (val <= 0) return "none";
      if (target > 0 && val >= target) return "done";
      return "partial";
    }

    if (habit.type === "TIMER") {
      const val = habit.entry?.durationSec ?? 0;
      const target = habit.targetSec ?? 0;
      if (val <= 0) return "none";
      if (target > 0 && val >= target) return "done";
      return "partial";
    }

    if (habit.type === "RATING")
      return (habit.entry?.rating ?? 0) > 0 ? "done" : "none";

    if (habit.type === "TEXT")
      return habit.entry?.textValue?.trim() ? "done" : "none";

    if (habit.type === "MEASUREMENT")
      return typeof habit.entry?.valueFloat === "number" ? "done" : "none";

    return "none";
  }, [habit]);

  const bgClass =
    status === "done"
      ? "bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-900"
      : status === "partial"
      ? "bg-yellow-50/80 dark:bg-yellow-950/15 border-yellow-200 dark:border-yellow-900"
      : "bg-red-50/70 dark:bg-red-950/15 border-red-200 dark:border-red-900";

  const canQuick = habit.type === "CHECK" || habit.type === "PROGRESS";

  async function quickComplete() {
    startTransition(async () => {
      if (habit.type === "CHECK") {
        const next = !(habit.entry?.checked ?? false);
        showLoader()
        const res = await upsertHabitEntry({
          habitId: habit.id,
          type: "CHECK",
          checked: next,
        });

        if (!res.ok) {
          toast.error(res.message);
          return;
        }

        toast.success(next ? "Done" : "Undone");
        return;
      }

      if (habit.type === "PROGRESS") {
        const current = habit.entry?.valueInt ?? 0;
        const next = current + 1;

        const res = await upsertHabitEntry({
          habitId: habit.id,
          type: "PROGRESS",
          valueInt: next,
        });

        if (!res.ok) {
          toast.error(res.message);
          return;
        }

        toast.success("+1");
      }
    });
  }

  return (
    <Card
      className={[
        "w-full sm:w-[330px]",
        "h-12",
        "px-3",
        "rounded-xl border shadow-sm",
        bgClass,
      ].join(" ")}
    >
      <div className="h-full flex items-center gap-2">
        {/* LEFT fixed icon */}
        <HabitTypeIcon type={habit.type} />

        {/* TITLE takes remaining space */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate text-left" title={habit.name}>
            {habit.name}
          </p>
        </div>

        {/* RIGHT icons pinned */}
        <div className="flex items-center gap-1 shrink-0">
          {canQuick && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={pending}
              onClick={quickComplete}
              aria-label="Done"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}

          <HabitEntryDialog
            habit={habit}
            trigger={
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled={pending}
                aria-label="Log"
              >
                <FilePenLine className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
    </Card>
  );
}
