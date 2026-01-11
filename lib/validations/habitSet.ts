import { z } from "zod";

export const habitSetSchema = z.object({
  name: z.string().trim().min(1, "Habit set name is required").max(40),
  color: z.string().trim().optional(),
});

export type HabitSetInput = z.infer<typeof habitSetSchema>;
