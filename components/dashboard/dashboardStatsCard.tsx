"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type Row = {
  date: string;
  completed: number;
  incomplete: number;
};

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  incomplete: {
    label: "Incomplete",
    color: "hsl(var(--chart-2))",
  },
};

export default function DashboardStatsCard({
  initialData,
  range,
}: {
  initialData: Row[];
  range: "WEEK" | "MONTH" | "YEAR";
}) {
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "INCOMPLETE">(
    "ALL"
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const formatDateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

  const chartData = useMemo(() => {
    const base = initialData.map((d) => ({
      ...d,
      date: formatDateLabel(d.date),
    }));

    if (filter === "COMPLETED") return base.map((d) => ({ ...d, incomplete: 0 }));
    if (filter === "INCOMPLETE") return base.map((d) => ({ ...d, completed: 0 }));

    return base;
  }, [initialData, filter]);

  const totalCompleted = initialData.reduce((a, b) => a + b.completed, 0);
  const totalIncomplete = initialData.reduce((a, b) => a + b.incomplete, 0);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">
            {range === "WEEK"
              ? "Weekly Overview"
              : range === "MONTH"
              ? "Monthly Overview"
              : "Yearly Overview"}
          </CardTitle>

          <p className="text-xs text-muted-foreground">
            ✅ {totalCompleted} completed • ❌ {totalIncomplete} incomplete
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ range comes from URL */}
          <Select
            value={range}
            onValueChange={(v) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("range", v);
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEEK">Week</SelectItem>
              <SelectItem value="MONTH">Month</SelectItem>
              <SelectItem value="YEAR">Year</SelectItem>
            </SelectContent>
          </Select>

          {/* filter stays client-side */}
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart data={chartData} barSize={16}>
            <CartesianGrid vertical={true} strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={10}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={10}
            />

            <ChartTooltip content={<ChartTooltipContent />} />

            <Bar
              dataKey="completed"
              stackId="a"
              fill="var(--chart-1)"
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
