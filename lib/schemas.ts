import { z } from "zod";

export const formattedEntrySchema = z.object({
  title: z.string().min(1),
  projectName: z.string().min(1),
  effortMinutes: z.coerce.number().min(1).default(60),
  effortPercent: z.coerce.number().optional(),
  assigneeName: z.string().nullable().optional(),
  startDate: z.string().min(1),
  endDate: z.string().nullable(),
  status: z.enum(["planned", "in_progress", "done"]),
  suggestionNote: z.string().nullable().optional(),
});

export type FormattedEntrySchema = z.infer<typeof formattedEntrySchema>;
