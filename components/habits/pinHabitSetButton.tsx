"use client";

import { togglePinHabitSet } from "@/app/(app)/habits/actions";
import { Button } from "@/components/ui/button";

export default function PinHabitSetButton({
  habitSetId,
  isPinned,
}: {
  habitSetId: string;
  isPinned: boolean;
}) {
  return (
    <form
      action={async () => {
        await togglePinHabitSet(habitSetId);
      }}
    >
      <Button variant={isPinned ? "default" : "outline"} size="sm" type="submit">
        {isPinned ? "Pinned" : "Pin"}
      </Button>
    </form>
  );
}
