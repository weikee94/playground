import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { supabase } from '@/lib/supabase';
import { createBookmarkSchema } from '@/lib/schemas';
import type { Bookmark } from '@/lib/schemas';

export const bookmarkRouter = router({
  list: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Bookmark[];
  }),

  create: publicProcedure
    .input(createBookmarkSchema)
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          title: input.title,
          url: input.url,
          description: input.description ?? '',
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Bookmark;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', input.id);

      if (error) throw new Error(error.message);
      return { id: input.id };
    }),
});
