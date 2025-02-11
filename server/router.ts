

import { z } from  'zod';

import { publicProcedure, router } from './trpc';

import { projectRouter } from './project';
import { categoryRouter } from './category';
import { columnRouter } from './column';


export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  project: projectRouter,
  category: categoryRouter,
  column: columnRouter,
});

export type AppRouter = typeof appRouter;

