import { z } from "zod";

export const formattedEntrySchema = z.object({
  title: z.string().min(1),
  projectName: z.string().min(1),
  effortMinutes: z.coerce.number().min(1).default(60),
  assigneeName: z.string().nullable().optional(),
  startDate: z.string().min(1),
  endDate: z.string().nullable(),
  status: z.enum(["planned", "in_progress", "done"]),
  suggestionNote: z.string().nullable().optional(),
});

export type FormattedEntrySchema = z.infer<typeof formattedEntrySchema>;

export const taskChangeProposalSchema = z.object({
  action: z.enum(["update", "delete"]),
  taskId: z.string().min(1),
  changes: z
    .object({
      title: z.string().optional(),
      projectName: z.string().optional(),
      assigneeName: z.string().nullable().optional(),
      status: z.enum(["planned", "in_progress", "done"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().nullable().optional(),
      effortMinutes: z.coerce.number().min(1).optional(),
    })
    .default({}),
});

export type TaskChangeProposalSchema = z.infer<typeof taskChangeProposalSchema>;
