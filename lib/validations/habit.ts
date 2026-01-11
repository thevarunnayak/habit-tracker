import { z } from "zod";

export const habitTypeEnum = z.enum([
  "CHECK",
  "PROGRESS",
  "TIMER",
  "RATING",
  "TEXT",
  "MEASUREMENT",
]);

// ✅ helper to treat "" as undefined (so optional fields don't become 0)
const emptyToUndefined = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  }, schema);

export const createHabitSchema = z
  .object({
    habitSetId: z.string().min(1, "Habit set is required"),
    name: z.string().trim().min(1, "Habit name is required").max(60),
    type: habitTypeEnum,

    unit: z.string().trim().optional(),

    targetInt: emptyToUndefined(z.coerce.number().int().positive()).optional(),
    targetSec: emptyToUndefined(z.coerce.number().int().positive()).optional(),

    ratingMax: emptyToUndefined(z.coerce.number().int().min(2).max(10)).optional(),

    precision: emptyToUndefined(z.coerce.number().int().min(0).max(4)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PROGRESS") {
      if (!data.targetInt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetInt"],
          message: "Target value is required for Progress habits",
        });
      }
    }

    if (data.type === "TIMER") {
      if (!data.targetSec) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetSec"],
          message: "Target duration is required for Timer habits",
        });
      }
    }

    if (data.type === "RATING") {
      if (!data.ratingMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ratingMax"],
          message: "Rating max is required (ex: 5)",
        });
      }
    }
  });

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
