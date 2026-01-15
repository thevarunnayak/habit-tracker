"use client";

import HabitSetCompletionPie from "./habitSetCompletionPie";
import HabitSetHabitTypesPie from "./habitSetHabitTypesPie";
import HabitSetInsightsCards from "./habitSetInsightCard";
import HabitSetLast7DaysBar from "./habitSetLast7DaysBar";


export default function HabitSetAnalyticsTab({ analytics }: { analytics: any }) {
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <HabitSetInsightsCards analytics={analytics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HabitSetCompletionPie analytics={analytics} />
        <HabitSetHabitTypesPie analytics={analytics} />
      </div>

      <HabitSetLast7DaysBar analytics={analytics} />
    </div>
  );
}
