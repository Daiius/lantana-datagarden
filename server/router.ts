

import { z } from  'zod';

import { publicProcedure, router } from './trpc';

import { projectRouter } from './project';


export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  project: projectRouter,
});

export type AppRouter = typeof appRouter;

