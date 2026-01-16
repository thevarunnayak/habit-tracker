"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteJournal } from "@/app/(app)/journal/new/action";

export default function DeleteJournalButton({
  journalId,
}: {
  journalId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this journal entry?")) return;

        startTransition(async () => {
          await deleteJournal(journalId);
          toast.success("Journal deleted");
        });
      }}
      aria-label="Delete journal"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
