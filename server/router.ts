

import { z } from  'zod';

import { publicProcedure, router } from './trpc';

import { projectRouter } from './project';
import { categoryRouter } from './category';


export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  project: projectRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;

