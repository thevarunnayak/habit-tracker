"use client";

import { useMemo, useState } from "react";
import DeleteJournalButton from "./deleteJournalButton";
import JournalContent from "./journalContent";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

export default function JournalList({ journals }: { journals: any[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return journals;
    const q = query.toLowerCase();
    return journals.filter((j) => j.title.toLowerCase().includes(q));
  }, [query, journals]);

  return (
    <div className="space-y-4 w-full">
      {/* Search */}
      <Input
        placeholder="Search journals..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No matching journals found.
        </p>
      ) : (
        <Accordion type="multiple" className="w-full space-y-3">
          {filtered.map((j) => (
            /* ✅ BORDER LIVES HERE */
            <div
              key={j.id}
              className="relative w-full rounded-lg border bg-background"
            >
              <AccordionItem
                value={j.id}
                className="border-0"
              >
                {/* Trigger */}
                <AccordionTrigger
                  className="
                    flex w-full items-center justify-between
                    px-4 py-3 pr-12
                    hover:no-underline
                  "
                >
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-medium truncate">
                      {j.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(j.createdAt).toLocaleDateString("en-IN")} •{" "}
                      {new Date(j.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </AccordionTrigger>

                {/* Delete button (absolute, safe) */}
                <div className="absolute right-3 top-3">
                  <DeleteJournalButton journalId={j.id} />
                </div>

                {/* Content */}
                <AccordionContent className="px-4 pb-4">
                  <JournalContent content={j.content} />
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      )}
    </div>
  );
}
