"use client";

import { Info } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Analytics = {
  totals: {
    expected: number;
    completed: number;
    skipped: number;
    incomplete: number;
  };
};

function TitleWithInfo({
  title,
  tooltip,
}: {
  title: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </p>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
            aria-label={`${title} info`}
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </button>
        </TooltipTrigger>

        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default function HabitSetInsightsCards({
  analytics,
}: {
  analytics: Analytics;
}) {
  const expected = analytics?.totals?.expected ?? 0;
  const completed = analytics?.totals?.completed ?? 0;
  const skipped = analytics?.totals?.skipped ?? 0;
  const incomplete = analytics?.totals?.incomplete ?? 0;

  const completionPct =
    expected > 0 ? Math.round((completed / expected) * 100) : 0;

  const items = [
    {
      label: "Expected",
      value: expected,
      tooltip:
        "Total number of habit completions possible in this range (only counting active days + habits created by that date).",
    },
    {
      label: "Completed",
      value: completed,
      tooltip:
        "Total habits logged as COMPLETED in this range (only those counted as expected).",
    },
    {
      label: "Incomplete",
      value: incomplete,
      tooltip:
        "Expected habits that were NOT completed (and not skipped). This indicates missing completion for the day.",
    },
    {
      label: "Completion %",
      value: `${completionPct}%`,
      tooltip:
        "Completion rate = Completed ÷ Expected. Skipped does not increase completion.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((i) => (
        <Card key={i.label} className="min-w-0">
          <CardHeader className="pb-2 pt-4">
            <TitleWithInfo title={i.label} tooltip={i.tooltip} />
          </CardHeader>

          <CardContent className="pb-4">
            <p className="text-3xl font-semibold leading-none">{i.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
