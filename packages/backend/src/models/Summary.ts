import { z } from 'zod';

export const SummarySchema = z.object({
  id: z.string().uuid(),
  topic: z.string(),
  summaryText: z.string(),
  relatedContextIds: z.array(z.string().uuid()),
  createdAt: z.string().optional(),
});

export type Summary = z.infer<typeof SummarySchema>;
