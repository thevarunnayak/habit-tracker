"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type Analytics = {
  series: {
    date: string; // yyyy-mm-dd
    completed: number;
    incomplete: number;
    skipped: number;
  }[];
};

export default function HabitSetLast7DaysBar({
  analytics,
}: {
  analytics: Analytics;
}) {
  const chartConfig = {
    completed: { label: "Completed", color: "var(--color-completed)" },
    incomplete: { label: "Incomplete", color: "var(--color-incomplete)" },
    skipped: { label: "Skipped", color: "var(--color-skipped)" }, // optional
  };

  const data = useMemo(() => {
    const base = analytics?.series ?? [];

    // ✅ take last 7 days only
    const last7 = base.slice(-7);

    return last7.map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    }));
  }, [analytics]);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">Last 7 Days</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart data={data} barSize={18}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />

            <ChartTooltip content={<ChartTooltipContent />} />

            {/* ✅ stacked */}
            <Bar
              dataKey="completed"
              stackId="a"
              fill="var(--chart-1)"
              radius={[8, 8, 8, 8]}
            />
            <Bar
              dataKey="skipped"
              stackId="a"
              fill="var(--chart-4)"
              radius={[8, 8, 8, 8]}
            />
            <Bar
              dataKey="incomplete"
              stackId="a"
              fill="var(--chart-2)"
              radius={[8, 8, 8, 8]}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
