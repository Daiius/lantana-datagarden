
import { z } from  'zod';

import { publicProcedure, router } from './trpc';

import { projectRouter } from './routers/project';
import { categoryRouter } from './routers/category';
import { columnRouter } from './routers/column';
import { dataRouter } from './routers/data';

export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  project: projectRouter,
  category: categoryRouter,
  column: columnRouter,
  data: dataRouter,
});

export type AppRouter = typeof appRouter;

