"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";



import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDefaultStreakStage } from "@/app/(app)/settings/action";

type Stage = "BEGINNER" | "SEMI_PRO" | "LEGEND";

export default function SettingsForm({
  defaultStreakStage,
}: {
  defaultStreakStage: Stage;
}) {
  const [stage, setStage] = useState<Stage>(defaultStreakStage);
  const [pending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      const res = await updateDefaultStreakStage(stage);

      if (!res.ok) {
        toast.error(res.message || "Failed to update settings");
        return;
      }

      toast.success("Settings saved");
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Default Streak Stage</Label>

        <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
          <SelectTrigger className="w-full" disabled={pending}>
            <SelectValue placeholder="Select a stage" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="BEGINNER">
              Beginner (atleast 1 habit done)
            </SelectItem>
            <SelectItem value="SEMI_PRO">Semi Pro (50% done)</SelectItem>
            <SelectItem value="LEGEND">Legend (100% done)</SelectItem>
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          This will be the default streak rule for newly created habit sets.
        </p>
      </div>

      <Button disabled={pending} onClick={onSave}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
