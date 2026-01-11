import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewHabitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Habit</h1>
        <p className="text-sm text-muted-foreground">
          Add a new habit and assign it to a habit set.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Habit Form</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          We will build this form in Step 3.2 (DB + create habit logic).
        </CardContent>
      </Card>
    </div>
  );
}
