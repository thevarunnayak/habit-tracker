"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateHabitSetStreakStage } from "@/app/(app)/habits/[habitSetId]/actions";
import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const options = [
  { value: "BEGINNER", label: "Beginner (≥ 1 habit done)" },
  { value: "SEMI_PRO", label: "Semi Pro (≥ 50% habits done)" },
  { value: "LEGEND", label: "Legend (All habits done)" },
] as const;

type Stage = (typeof options)[number]["value"];

export default function HabitSetStreakStageDialog({
  habitSetId,
  streakStage,
}: {
  habitSetId: string;
  streakStage: Stage;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Stage>(streakStage);
  const [pending, startTransition] = useTransition();

  // ✅ keep value synced when server changes / dialog opens later
  const currentLabel = useMemo(() => {
    return options.find((o) => o.value === streakStage)?.label ?? "Streak";
  }, [streakStage]);

  function onSave() {
    startTransition(async () => {
      const res = await updateHabitSetStreakStage({
        habitSetId,
        streakStage: value,
      });

      if (!res.ok) {
        toast.error(res.message || "Failed to update streak preference");
        return;
      }

      toast.success("Streak preference updated");
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setValue(streakStage); // ✅ reset selection when opening
      }}
    >
      <Tooltip>
    <TooltipTrigger asChild>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          aria-label="Streak preference"
        >
          <Flame className="h-4 w-4" />
        </Button>
      </DialogTrigger>
    </TooltipTrigger>

    <TooltipContent>Streak preference</TooltipContent>
  </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Streak Preference</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Choose your streak rule</Label>

            <Select
              value={value}
              onValueChange={(v) => setValue(v as Stage)}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a stage" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              This affects how your habit set streak is computed.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={onSave}
              disabled={pending || value === streakStage}
            >
              {pending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
