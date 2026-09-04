import { z } from "zod";
import type { FormattedEntry } from "@/types/chat";

export const formattedEntrySchema = z.object({
  title: z.string().min(1),
  projectName: z.string().min(1),
  effortPercent: z.number().min(0).max(200),
  startDate: z.string().min(1),
  endDate: z.string().nullable(),
  status: z.enum(["planned", "in_progress", "done"]),
});

export type FormattedEntrySchema = z.infer<typeof formattedEntrySchema>;

// Compile-time check: the zod-inferred shape must stay structurally
// consistent with the hand-written FormattedEntry type in types/chat.ts.
const _typeConsistencyCheck: FormattedEntrySchema = {} as FormattedEntry;
void _typeConsistencyCheck;
