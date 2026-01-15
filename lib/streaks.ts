import { HabitType } from "@prisma/client";

type Entry = {
  date: Date;
  checked: boolean | null;
  valueInt: number | null;
  durationSec: number | null;
  rating: number | null;
  textValue: string | null;
  valueFloat: number | null;
};

type Habit = {
  id: string;
  type: HabitType;
  isActive: boolean;
  targetInt: number | null;
  targetSec: number | null;
  ratingMax: number | null;
  precision: number | null;
  entries: Entry[];
};

function isHabitDoneForDate(habit: Habit, entry: Entry | undefined) {
  if (!entry) return false;

  switch (habit.type) {
    case "CHECK":
      return entry.checked === true;

    case "PROGRESS":
      if (!habit.targetInt) return typeof entry.valueInt === "number" && entry.valueInt > 0;
      return typeof entry.valueInt === "number" && entry.valueInt >= habit.targetInt;

    case "TIMER":
      if (!habit.targetSec) return typeof entry.durationSec === "number" && entry.durationSec > 0;
      return typeof entry.durationSec === "number" && entry.durationSec >= habit.targetSec;

    case "RATING":
      return typeof entry.rating === "number" && entry.rating > 0;

    case "TEXT":
      return !!entry.textValue?.trim();

    case "MEASUREMENT":
      return typeof entry.valueFloat === "number";

    default:
      return false;
  }
}

function keyFromDate(d: Date) {
  // normalized day key: YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function computeHabitSetCurrentStreak({
  today,
  habits,
}: {
  today: Date;
  habits: Habit[];
}) {
  const activeHabits = habits.filter((h) => h.isActive);

  // if no habits, streak should be 0 (no completion)
  if (activeHabits.length === 0) return 0;

  // build per habit entry map: dateKey -> entry
  const habitEntryMaps = activeHabits.map((habit) => {
    const map = new Map<string, Entry>();
    for (const e of habit.entries) {
      map.set(keyFromDate(e.date), e);
    }
    return { habit, map };
  });

  let streak = 0;

  // iterate backward day by day from today
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dayKey = keyFromDate(date);

    // habitSet is done only if ALL active habits are done
    const allDone = habitEntryMaps.every(({ habit, map }) => {
      const entry = map.get(dayKey);
      return isHabitDoneForDate(habit, entry);
    });

    if (!allDone) break;

    streak++;
  }

  return streak;
}
