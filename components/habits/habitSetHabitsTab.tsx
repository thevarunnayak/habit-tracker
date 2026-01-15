"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitSetHabitsList from "./habitSetHabitList";
import HabitSetHabitsGridTable from "./habitSetGridTable";

export default function HabitSetHabitsTabs({
  habits,
  dates,
  rangeDays,
  habitSetCreatedAt, // ✅ NEW
  hasAtLeast7Days
}: {
  habits: any[];
  dates: string[];
  rangeDays: number;
  habitSetCreatedAt: string; // ✅ NEW
  hasAtLeast7Days: boolean
}) {
  const [tab, setTab] = useState<"list" | "table">("list");

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as any)}
      className="w-full min-w-0"
    >
      {/* ✅ contain tabs row inside screen */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
      </div>

      {/* ✅ List View */}
      <TabsContent value="list" className="mt-4 min-w-0 overflow-hidden">
        <HabitSetHabitsList habits={habits} />
      </TabsContent>

      {/* ✅ Table View */}
      <TabsContent value="table" className="mt-4 min-w-0 overflow-hidden">
        <HabitSetHabitsGridTable
          habits={habits}
          dates={dates}
          rangeDays={rangeDays}
          habitSetCreatedAt={habitSetCreatedAt} // ✅ correct
          hasAtLeast7Days={hasAtLeast7Days}
        />
      </TabsContent>
    </Tabs>
  );
}
