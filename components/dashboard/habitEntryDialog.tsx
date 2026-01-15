"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { upsertHabitEntry } from "@/app/(app)/dashboard/actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

import { ArrowLeftRight, Star } from "lucide-react";

type Entry = {
  checked: boolean | null;
  valueInt: number | null;
  durationSec: number | null;
  runningSince?: string | null;
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
  entry: Entry | null;
};

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function CircularStopwatch({
  elapsedSec,
  targetSec,
}: {
  elapsedSec: number;
  targetSec: number | null;
}) {
  const [showRemaining, setShowRemaining] = useState(false);

  const size = 170;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const pct =
    targetSec && targetSec > 0
      ? Math.min(100, Math.round((elapsedSec / targetSec) * 100))
      : 0;

  const offset = circumference - (pct / 100) * circumference;

  const remainingSec =
    targetSec && targetSec > 0 ? Math.max(0, targetSec - elapsedSec) : 0;

  const displaySec = showRemaining && targetSec ? remainingSec : elapsedSec;
  const canToggle = !!targetSec;

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-[170px] w-[170px]">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-muted"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-foreground"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        <button
          type="button"
          disabled={!canToggle}
          onClick={() => canToggle && setShowRemaining((v) => !v)}
          className={[
            "absolute inset-0 flex flex-col items-center justify-center text-center rounded-full",
            "focus:outline-none",
            canToggle ? "cursor-pointer" : "cursor-default",
          ].join(" ")}
          aria-label="Toggle elapsed / remaining time"
        >
          <div className="text-2xl font-semibold tabular-nums">
            {formatTime(displaySec)}
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            {!targetSec ? "No target" : showRemaining ? "Remaining" : "Elapsed"}
          </div>

          {targetSec ? (
            <div className="mt-1 text-[11px] text-muted-foreground">{pct}%</div>
          ) : null}

          {targetSec ? (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/80">
              <ArrowLeftRight className="h-3 w-3" />
              <span>Tap to toggle</span>
            </div>
          ) : null}
        </button>
      </div>
    </div>
  );
}

export default function HabitEntryDialog({
  habit,
  trigger,
}: {
  habit: Habit;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // tick state for TIMER
  const [tick, setTick] = useState(0);

  // local state
  const [checked, setChecked] = useState<boolean>(habit.entry?.checked ?? false);
  const [valueInt, setValueInt] = useState<number>(habit.entry?.valueInt ?? 0);

  const [durationSecBase, setDurationSecBase] = useState<number>(
    habit.entry?.durationSec ?? 0
  );

  const [runningSince, setRunningSince] = useState<Date | null>(() => {
    const iso = habit.entry?.runningSince;
    return iso ? new Date(iso) : null;
  });

  const [rating, setRating] = useState<number>(habit.entry?.rating ?? 0);
  const [textValue, setTextValue] = useState<string>(habit.entry?.textValue ?? "");
  const [valueFloat, setValueFloat] = useState<number>(habit.entry?.valueFloat ?? 0);

  // 🔊 ringtone
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // prevent multiple auto-stop triggers
  const autoStoppedRef = useRef(false);

  // elapsed seconds
  const liveDurationSec = useMemo(() => {
    if (!runningSince) return durationSecBase;
    const diff = Math.floor((Date.now() - runningSince.getTime()) / 1000);
    return durationSecBase + Math.max(0, diff);
  }, [durationSecBase, runningSince, tick]);

  // ticker
  useEffect(() => {
    if (!open) return;
    if (!runningSince) return;

    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [open, runningSince]);

  // reset state on open
  useEffect(() => {
    if (!open) return;

    setChecked(habit.entry?.checked ?? false);
    setValueInt(habit.entry?.valueInt ?? 0);

    setDurationSecBase(habit.entry?.durationSec ?? 0);
    const iso = habit.entry?.runningSince;
    setRunningSince(iso ? new Date(iso) : null);

    setRating(habit.entry?.rating ?? 0);
    setTextValue(habit.entry?.textValue ?? "");
    setValueFloat(habit.entry?.valueFloat ?? 0);

    setTick(0);
    autoStoppedRef.current = false;

    // init audio
    audioRef.current = new Audio("/timer-done.mp3");
  }, [open, habit]);

    // ✅ stop ringtone when dialog closes
  useEffect(() => {
    if (open) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, [open]);


  // ✅ AUTO STOP when target reached
  useEffect(() => {
    if (!open) return;
    if (habit.type !== "TIMER") return;
    if (!runningSince) return;

    const target = habit.targetSec;
    if (!target || target <= 0) return;

    if (autoStoppedRef.current) return;

    if (liveDurationSec >= target) {
      autoStoppedRef.current = true;

      startTransition(async () => {
        const res = await upsertHabitEntry({
          habitId: habit.id,
          type: "TIMER",
          durationSec: target,     // clamp to target
          runningSince: null,      // stop
        } as any);

        if (!res.ok) {
          toast.error(res.message || "Failed to stop timer");
          autoStoppedRef.current = false;
          return;
        }

        // stop local
        setDurationSecBase(target);
        setRunningSince(null);

        // 🔊 play ringtone
        try {
          await audioRef.current?.play();
        } catch {
          // browser may block autoplay - fine
        }

        toast.success("Timer completed ✅");
      });
    }
  }, [open, habit, runningSince, liveDurationSec, startTransition]);

  function saveEntry() {
    startTransition(async () => {
      const payload: any = { habitId: habit.id, type: habit.type };

      if (habit.type === "CHECK") payload.checked = checked;
      if (habit.type === "PROGRESS") payload.valueInt = valueInt;
      if (habit.type === "TIMER") payload.durationSec = liveDurationSec;
      if (habit.type === "RATING") payload.rating = rating;
      if (habit.type === "TEXT") payload.textValue = textValue;
      if (habit.type === "MEASUREMENT") payload.valueFloat = valueFloat;

      const res = await upsertHabitEntry(payload);

      if (!res.ok) {
        toast.error(res.message || "Failed to save entry");
        return;
      }

      toast.success("Saved!");
      setOpen(false);
    });
  }

  async function timerStart() {
    startTransition(async () => {
      const res = await upsertHabitEntry({
        habitId: habit.id,
        type: "TIMER",
        durationSec: durationSecBase,
        runningSince: new Date().toISOString(),
      } as any);

      if (!res.ok) {
        toast.error(res.message);
        return;
      }

      autoStoppedRef.current = false;
      setRunningSince(new Date());
      toast.success("Timer started");
    });
  }

  async function timerStop() {
    startTransition(async () => {
      const res = await upsertHabitEntry({
        habitId: habit.id,
        type: "TIMER",
        durationSec: liveDurationSec,
        runningSince: null,
      } as any);

      if (!res.ok) {
        toast.error(res.message);
        return;
      }

      setDurationSecBase(liveDurationSec);
      setRunningSince(null);
      toast.success("Timer stopped");
    });
  }

  const maxStars = habit.ratingMax ?? 5;

  const progressPct =
    habit.type === "PROGRESS" && habit.targetInt
      ? Math.min(100, Math.round((valueInt / habit.targetInt) * 100))
      : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button size="sm" variant="outline" className="flex-1">
            Log
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="truncate">{habit.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* CHECK */}
          {habit.type === "CHECK" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Mark as done for today.
              </p>

              <Button
                onClick={() => setChecked((v) => !v)}
                variant={checked ? "default" : "outline"}
                disabled={pending}
              >
                {checked ? "Completed ✅" : "Not completed"}
              </Button>
            </div>
          )}

          {/* PROGRESS */}
          {habit.type === "PROGRESS" && (
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-xs text-muted-foreground">
                    Target: {habit.targetInt ?? "?"} {habit.unit ?? ""}
                  </p>
                </div>

                <div className="text-sm font-semibold tabular-nums">
                  {valueInt}/{habit.targetInt ?? "?"}
                </div>
              </div>

              <Progress value={progressPct} />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending || valueInt <= 0}
                  onClick={() => setValueInt((v) => Math.max(0, v - 1))}
                >
                  -1
                </Button>

                <Input
                  type="number"
                  value={valueInt}
                  disabled={pending}
                  onChange={(e) => setValueInt(Number(e.target.value || 0))}
                />

                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setValueInt((v) => v + 1)}
                >
                  +1
                </Button>
              </div>
            </div>
          )}

          {/* TIMER */}
          {habit.type === "TIMER" && (
            <div className="space-y-4">
              <CircularStopwatch elapsedSec={liveDurationSec} targetSec={habit.targetSec} />

              <div className="flex gap-2 justify-center">
                {!runningSince ? (
                  <Button onClick={timerStart} disabled={pending}>
                    Start
                  </Button>
                ) : (
                  <Button onClick={timerStop} disabled={pending}>
                    Stop
                  </Button>
                )}

                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    autoStoppedRef.current = false;
                    setDurationSecBase(0);
                    setRunningSince(null);
                    setTick(0);
                  }}
                >
                  Reset
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Auto-stops & saves when target is reached.
              </p>
            </div>
          )}

          {/* RATING */}
          {habit.type === "RATING" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Rate today ({maxStars} max)
              </p>

              <div className="flex gap-2">
                {Array.from({ length: maxStars }).map((_, idx) => {
                  const v = idx + 1;
                  const active = rating >= v;

                  return (
                    <button
                      key={v}
                      type="button"
                      className="p-1"
                      onClick={() => setRating(v)}
                      disabled={pending}
                      aria-label={`Rate ${v}`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          active
                            ? "fill-current text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                Selected: {rating || "—"}
              </p>
            </div>
          )}

          {/* TEXT */}
          {habit.type === "TEXT" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Write today’s note.</p>

              <Textarea
                value={textValue}
                disabled={pending}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Write something..."
              />
            </div>
          )}

          {/* MEASUREMENT */}
          {habit.type === "MEASUREMENT" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Log today’s value {habit.unit ? `(${habit.unit})` : ""}.
              </p>

              <Input
                type="number"
                step={
                  habit.precision
                    ? Number(`0.${"0".repeat(habit.precision - 1)}1`)
                    : 1
                }
                value={valueFloat}
                disabled={pending}
                onChange={(e) => setValueFloat(Number(e.target.value || 0))}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="button" disabled={pending} onClick={saveEntry}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
