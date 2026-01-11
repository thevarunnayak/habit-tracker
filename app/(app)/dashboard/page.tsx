import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your habits progress for today 🚀
        </p>
      </div>

      {/* Analytics cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Habits Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">0</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">0 🔥</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">0%</CardContent>
        </Card>
      </div>

      {/* Habit Sets placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Sets</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Habit sets will show here (Health, Fitness, Study...) along with today’s
          completion actions (tick/progress).
        </CardContent>
      </Card>
    </div>
  );
}
