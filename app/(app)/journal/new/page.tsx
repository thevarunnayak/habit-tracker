"use client";

import { useRouter } from "next/navigation";
import JournalEditor from "@/components/journal/journalEditor";
import { createJournal } from "./action";

export default function NewJournalPage() {
  const router = useRouter();

  async function handleSave(content: any) {
    await createJournal({ content });
    router.push("/journal");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <JournalEditor onSave={handleSave} />
    </div>
  );
}
