"use client";

import { useActionState } from "react";
import { toast } from "sonner";

import { togglePinHabitSet } from "@/app/(app)/habits/actions";
import { Button } from "@/components/ui/button";

export default function PinHabitSetButton({
  habitSetId,
  isPinned,
}: {
  habitSetId: string;
  isPinned: boolean;
}) {
  const [_state, action, isPending] = useActionState(
    async (_prev: { ok: boolean }, _formData: FormData) => {
      try {
        const res = await togglePinHabitSet(habitSetId);

        if (!res.ok) {
          toast.error(res.message || "Failed to update pin status");
          return { ok: false };
        }

        toast.success(isPinned ? "Habit set unpinned" : "Habit set pinned");
        return { ok: true };
      } catch (err) {
        console.error("PinHabitSetButton error:", err);
        toast.error("Something went wrong. Please try again.");
        return { ok: false };
      }
    },
    { ok: true }
  );

  return (
    <form action={action}>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Updating..." : isPinned ? "Pinned" : "Pin"}
      </Button>
    </form>
  );
}
