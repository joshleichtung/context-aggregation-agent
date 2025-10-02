import { z } from 'zod';

export const SourceTypeSchema = z.enum(['slack', 'google_doc', 'web']);

export const ContextItemSchema = z.object({
  id: z.string().uuid(),
  sourceType: SourceTypeSchema,
  sourceId: z.string(),
  content: z.string(),
  metadata: z.object({
    author: z.string().optional(),
    timestamp: z.string().optional(),
    title: z.string().optional(),
  }),
  tags: z.array(z.string()),
});

export type ContextItem = z.infer<typeof ContextItemSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
