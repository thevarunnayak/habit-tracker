"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const typeColorMap: Record<string, string> = {
  CHECK: "var(--chart-1)",
  PROGRESS: "var(--chart-2)",
  TIMER: "var(--chart-3)",
  RATING: "var(--chart-4)",
  TEXT: "var(--chart-5)",
  MEASUREMENT: "var(--chart-6)",
};

function LegendItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      <span className="flex-1">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function HabitSetHabitTypesPie({ analytics }: { analytics: any }) {
  const items = analytics?.habitTypes ?? [];

  const data = useMemo(
    () =>
      items.map((i: any) => ({
        key: i.type,
        name: i.type,
        value: i.count,
        color: typeColorMap[i.type] ?? "hsl(var(--muted))",
        label: `${i.type[0].toUpperCase()}${i.type.slice(1).toLowerCase()}`
      })),
    [items]
  );

  const total = data.reduce((a: any, b: any) => a + (b.value ?? 0), 0);

  const hasData = total > 0;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">Habit Types</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            No habits found in this set yet.
          </div>
        ) : (
          <>
            <ChartContainer
              config={{
                CHECK: { label: "CHECK", color: typeColorMap.CHECK },
                PROGRESS: { label: "PROGRESS", color: typeColorMap.PROGRESS },
                TIMER: { label: "TIMER", color: typeColorMap.TIMER },
                RATING: { label: "RATING", color: typeColorMap.RATING },
                TEXT: { label: "TEXT", color: typeColorMap.TEXT },
                MEASUREMENT: {
                  label: "MEASUREMENT",
                  color: typeColorMap.MEASUREMENT,
                },
              }}
              className="h-[240px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={96}
                  paddingAngle={3}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {data.map((slice: any) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* ✅ Custom legend (works always for Pie) */}
            <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
              {data.map((d:any) => (
                <LegendItem
                  key={d.key}
                  label={d.label}
                  value={d.value}
                  color={d.color}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
