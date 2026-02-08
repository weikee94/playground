import { z } from 'zod';

export const createBookmarkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  url: z.string().url('Must be a valid URL'),
  description: z.string().max(500).optional(),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  created_at: string;
}
