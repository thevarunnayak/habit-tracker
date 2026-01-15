import { z } from "zod";

export const upsertHabitEntrySchema = z.object({
  habitId: z.string().min(1),
  type: z.string().min(1),

  // ✅ optional date (ISO) for future use
  date: z.string().datetime().optional(),

  status: z.enum(["COMPLETED", "SKIPPED"]).optional(),

  checked: z.boolean().optional(),
  valueInt: z.number().int().optional(),
  durationSec: z.number().int().optional(),
  runningSince: z.string().nullable().optional(), // you already use this
  rating: z.number().int().optional(),
  textValue: z.string().optional(),
  valueFloat: z.number().optional(),
});
