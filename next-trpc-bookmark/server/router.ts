import { router } from './trpc';
import { bookmarkRouter } from './routers/bookmark';

export const appRouter = router({
  bookmark: bookmarkRouter,
});

export type AppRouter = typeof appRouter;
