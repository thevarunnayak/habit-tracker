"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createHabit } from "@/app/(app)/habits/new/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/auth/fieldError";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HabitSetOption = {
  id: string;
  name: string;
};

const habitTypes = [
  { value: "CHECK", label: "Check (Done/Not Done)" },
  { value: "PROGRESS", label: "Progress (Target counter)" },
  { value: "TIMER", label: "Timer (Track duration)" },
  { value: "RATING", label: "Rating (1 to N)" },
  { value: "TEXT", label: "Text (Journal/Note)" },
  { value: "MEASUREMENT", label: "Measurement (Log value)" },
] as const;

type HabitType = (typeof habitTypes)[number]["value"];

export default function HabitCreateForm({
  habitSets,
  defaultSetId,
  lockHabitSet,
}: {
  habitSets: HabitSetOption[];
  defaultSetId?: string;
  lockHabitSet?: boolean;
})
{
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // base fields
  const [habitSetId, setHabitSetId] = useState<string>(
    defaultSetId && habitSets.some((s) => s.id === defaultSetId)
      ? defaultSetId
      : habitSets[0]?.id || ""
  );
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("CHECK");

  // optional config fields
  const [unit, setUnit] = useState("");

  const [targetInt, setTargetInt] = useState(""); // PROGRESS
  const [targetMin, setTargetMin] = useState(""); // TIMER (minutes -> sec)
  const [ratingMax, setRatingMax] = useState("5"); // RATING
  const [precision, setPrecision] = useState("1"); // MEASUREMENT

  // errors
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ✅ fix: ensure habitSetId never stays empty after habitSets load
  useEffect(() => {
    if (!habitSetId) {
      if (defaultSetId && habitSets.some((s) => s.id === defaultSetId)) {
        setHabitSetId(defaultSetId);
      } else if (habitSets[0]?.id) {
        setHabitSetId(habitSets[0].id);
      }
    }
  }, [habitSets, defaultSetId, habitSetId]);

  function resetErrors() {
    setServerError("");
    setFieldErrors({});
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetErrors();

    const formData = new FormData();
    formData.set("habitSetId", habitSetId);
    formData.set("name", name);
    formData.set("type", type);
    formData.set("unit", unit);

    // dynamic fields
    if (type === "PROGRESS") {
      formData.set("targetInt", targetInt);
    }

    if (type === "TIMER") {
      const mins = Number(targetMin || 0);
      // ✅ always send targetSec so Zod validation works correctly
      formData.set("targetSec", String(mins * 60));
    }

    if (type === "RATING") {
      formData.set("ratingMax", ratingMax);
    }

    if (type === "MEASUREMENT") {
      formData.set("precision", precision);
    }

    startTransition(async () => {
      const res = await createHabit(formData);

      if (!res.ok) {
        console.log("createHabit error:", res);
        setServerError(res.message || "Failed to create habit");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      router.push("/habits");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Habit</h1>
        <p className="text-sm text-muted-foreground">
          Create a new habit and assign it to a habit set.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Habit</CardTitle>
        </CardHeader>

        <CardContent>
          {habitSets.length === 0 ? (
            <div className="text-sm text-muted-foreground space-y-3">
              <p>You need to create a habit set before adding habits.</p>
              <Button onClick={() => router.push("/habits")}>
                Go to Habits
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              {/* Habit Set */}
              <div className="space-y-1">
                <Label>Habit Set</Label>
                <Select
                  value={habitSetId}
                  onValueChange={(v) => setHabitSetId(v)}
                  disabled={isPending || lockHabitSet}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a habit set" />
                  </SelectTrigger>
                  <SelectContent>
                    {habitSets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={fieldErrors.habitSetId} />
              </div>

              {/* Habit Name */}
              <div className="space-y-1">
                <Label htmlFor="name">Habit Name</Label>
                <Input
                  id="name"
                  placeholder="Drink Water"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
                <FieldError message={fieldErrors.name} />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <Label>Habit Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => {
                    setType(v as HabitType);
                    setFieldErrors({});
                    setServerError("");
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select habit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {habitTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={fieldErrors.type} />
              </div>

              {/* Unit */}
              {(type === "PROGRESS" ||
                type === "TIMER" ||
                type === "MEASUREMENT") && (
                <div className="space-y-1">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder={
                      type === "PROGRESS"
                        ? "glasses"
                        : type === "TIMER"
                        ? "minutes"
                        : "kg / steps / calories"
                    }
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional (example: glasses, mins, steps)
                  </p>
                  <FieldError message={fieldErrors.unit} />
                </div>
              )}

              {/* PROGRESS */}
              {type === "PROGRESS" && (
                <div className="space-y-1">
                  <Label htmlFor="targetInt">Target Value</Label>
                  <Input
                    id="targetInt"
                    type="number"
                    placeholder="8"
                    value={targetInt}
                    onChange={(e) => setTargetInt(e.target.value)}
                    disabled={isPending}
                  />
                  <FieldError message={fieldErrors.targetInt} />
                </div>
              )}

              {/* TIMER */}
              {type === "TIMER" && (
                <div className="space-y-1">
                  <Label htmlFor="targetMin">Target Duration (minutes)</Label>
                  <Input
                    id="targetMin"
                    type="number"
                    placeholder="60"
                    value={targetMin}
                    onChange={(e) => setTargetMin(e.target.value)}
                    disabled={isPending}
                  />
                  <FieldError message={fieldErrors.targetSec} />
                </div>
              )}

              {/* RATING */}
              {type === "RATING" && (
                <div className="space-y-1">
                  <Label htmlFor="ratingMax">Rating Max</Label>
                  <Input
                    id="ratingMax"
                    type="number"
                    min={2}
                    max={10}
                    placeholder="5"
                    value={ratingMax}
                    onChange={(e) => setRatingMax(e.target.value)}
                    disabled={isPending}
                  />
                  <FieldError message={fieldErrors.ratingMax} />
                </div>
              )}

              {/* MEASUREMENT */}
              {type === "MEASUREMENT" && (
                <div className="space-y-1">
                  <Label htmlFor="precision">Precision (decimal places)</Label>
                  <Input
                    id="precision"
                    type="number"
                    min={0}
                    max={4}
                    placeholder="1"
                    value={precision}
                    onChange={(e) => setPrecision(e.target.value)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: 0 for steps, 1 for weight, 2 for body fat %
                  </p>
                  <FieldError message={fieldErrors.precision} />
                </div>
              )}

              {/* TEXT */}
              {type === "TEXT" && (
                <p className="text-sm text-muted-foreground">
                  Text habits don’t require extra configuration. You’ll enter
                  the text daily from the dashboard.
                </p>
              )}

              <FieldError message={serverError} />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating..." : "Create Habit"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
