"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell as PieCell, Label } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type Analytics = {
  totals: {
    expected: number;
    completed: number;
    skipped: number;
    incomplete: number;
  };
};

function LegendItem({
  label,
  value,
  colorVar,
}: {
  label: string;
  value: number;
  colorVar: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ background: `var(${colorVar})` }}
      />
      <span className="flex-1">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function HabitSetCompletionPie({
  analytics,
}: {
  analytics: Analytics;
}) {
  const expected = analytics?.totals?.expected ?? 0;
  const completed = analytics?.totals?.completed ?? 0;
  const skipped = analytics?.totals?.skipped ?? 0;
  const incomplete = analytics?.totals?.incomplete ?? 0;

  const pct = expected > 0 ? Math.round((completed / expected) * 100) : 0;

  const data = useMemo(
    () => [
      { key: "completed", name: "Completed", value: completed, color: "--color-completed" },
      { key: "incomplete", name: "Incomplete", value: incomplete, color: "--color-incomplete" },
      { key: "skipped", name: "Skipped", value: skipped, color: "--color-skipped" },
    ],
    [completed, incomplete, skipped]
  );

  const hasData = expected > 0;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">Completion</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            No data yet. Start logging habits to see analytics.
          </div>
        ) : (
          <>
            <ChartContainer
              config={{
                completed: { label: "Completed", color: "var(--chart-1)" },
                incomplete: { label: "Incomplete", color: "var(--chart-2)" },
                skipped: { label: "Skipped", color: "var(--chart-3)" },
              }}
              className="h-[260px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={104}
                  paddingAngle={3}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((slice) => (
                    <PieCell
                      key={slice.key}
                      fill={`var(${slice.color})`}
                      fillOpacity={slice.key === "completed" ? 1 : 0.75}
                    />
                  ))}

                  {/* ✅ Center label */}
                  <Label
                    position="center"
                    content={() => (
                      <text
                        x="50%"
                        y="45%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x="50%"
                          dy="-4"
                          className="fill-foreground text-xl font-semibold"
                        >
                          {pct}%
                        </tspan>
                        <tspan
                          x="50%"
                          dy="20"
                          className="fill-muted-foreground text-xs"
                        >
                          {completed}/{expected} completed
                        </tspan>
                      </text>
                    )}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* ✅ Better legend UI (no recharts TS issues) */}
            <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
              <LegendItem label="Completed" value={completed} colorVar="--color-completed" />
              <LegendItem label="Incomplete" value={incomplete} colorVar="--color-incomplete" />
              <LegendItem label="Skipped" value={skipped} colorVar="--color-skipped" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
