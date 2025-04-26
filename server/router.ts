
import { z } from  'zod';

import { publicProcedure, router } from './trpc';

import { projectRouter } from './project';
import { tableRouter } from './table';
import { flowRouter } from './flow';
import { measurementRouter } from './measurement';
import { conditionRouter } from './condition';

export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  project: projectRouter,
  table: tableRouter,
  flow: flowRouter,
  measurement: measurementRouter,
  condition: conditionRouter
});

export type AppRouter = typeof appRouter;


