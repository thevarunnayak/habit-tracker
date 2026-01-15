import { z } from "zod";

export const habitSetScheduleSchema = z.object({
  habitSetId: z.string().min(1),
  activeDays: z.number().int().min(0).max(127),
});
