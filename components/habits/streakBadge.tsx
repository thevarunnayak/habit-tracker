import { Flame, Trophy } from "lucide-react";

export default function StreakBadge({
  streak,
  label = "Streak",
  variant = "current",
}: {
  streak: number;
  label?: string;
  variant?: "current" | "best";
}) {
  const Icon = variant === "best" ? Trophy : Flame;

  return (
    <div className="flex items-center gap-2 rounded-xl border px-3 py-2 bg-background">
      <div className="h-9 w-9 rounded-full border flex items-center justify-center">
        <Icon
          className={[
            "h-4 w-4",
            variant === "best" ? "text-yellow-600" : "text-orange-500",
          ].join(" ")}
        />
      </div>

      <div className="leading-tight">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="font-semibold tabular-nums">{streak} days</p>
      </div>
    </div>
  );
}
