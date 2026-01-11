import { Badge } from "@/components/ui/badge";

export default function HabitTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    CHECK: "Check",
    PROGRESS: "Progress",
    TIMER: "Timer",
    RATING: "Rating",
    TEXT: "Text",
    MEASUREMENT: "Measurement",
  };

  return <Badge variant="secondary">{map[type] ?? type}</Badge>;
}
