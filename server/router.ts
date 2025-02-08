import { publicProcedure, router } from './trpc';

export const appRouter = router({ 
  greeting: publicProcedure.query(() => 'hello, tPRC!'),
});

export type AppRouter = typeof appRouter;

