"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateHabitSetSchedule } from "@/app/(app)/habits/[habitSetId]/actions";
import { CalendarDays } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const days = [
  { label: "Mon", bit: 1 },
  { label: "Tue", bit: 2 },
  { label: "Wed", bit: 4 },
  { label: "Thu", bit: 8 },
  { label: "Fri", bit: 16 },
  { label: "Sat", bit: 32 },
  { label: "Sun", bit: 64 },
];

function isDayOn(mask: number, bit: number) {
  return (mask & bit) === bit;
}

function toggleDay(mask: number, bit: number) {
  return isDayOn(mask, bit) ? mask & ~bit : mask | bit;
}

export default function HabitSetScheduleDialog({
  habitSetId,
  activeDays,
}: {
  habitSetId: string;
  activeDays: number;
}) {
  const [open, setOpen] = useState(false);
  const [mask, setMask] = useState(activeDays ?? 127);
  const [pending, startTransition] = useTransition();

  const preset = useMemo(() => {
    if (mask === 127) return "Everyday";
    if (mask === 31) return "Weekdays";
    return "Custom";
  }, [mask]);

  function save() {
    startTransition(async () => {
      const res = await updateHabitSetSchedule({
        habitSetId,
        activeDays: mask,
      });

      if (!res.ok) {
        toast.error(res.message || "Failed to update schedule");
        return;
      }

      toast.success("Occurrence updated");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
<Tooltip>
  <TooltipTrigger asChild>
    <DialogTrigger asChild>
      <Button size="icon" variant="outline" aria-label="Occurrence">
        <CalendarDays className="h-4 w-4" />
      </Button>
    </DialogTrigger>
  </TooltipTrigger>

  <TooltipContent>Occurrence</TooltipContent>
</Tooltip>


      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Occurrence</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* presets */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant={mask === 127 ? "default" : "outline"}
              size="sm"
              onClick={() => setMask(127)}
              disabled={pending}
            >
              Everyday
            </Button>

            <Button
              type="button"
              variant={mask === 31 ? "default" : "outline"}
              size="sm"
              onClick={() => setMask(31)}
              disabled={pending}
            >
              Weekdays
            </Button>

            <Button
              type="button"
              variant={preset === "Custom" ? "default" : "outline"}
              size="sm"
              onClick={() => {}}
              disabled={pending}
            >
              Custom
            </Button>
          </div>

          {/* day toggles */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const on = isDayOn(mask, d.bit);
              return (
                <Button
                  key={d.label}
                  type="button"
                  variant={on ? "default" : "outline"}
                  className="h-10 px-0"
                  onClick={() => setMask((m) => toggleDay(m, d.bit))}
                  disabled={pending}
                >
                  {d.label}
                </Button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-medium">{preset}</span>
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>

            <Button type="button" onClick={save} disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
