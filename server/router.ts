
import { z } from  'zod';

import { publicProcedure, router } from './trpc';

import { projectRouter } from './routers/project';
import { columnGroupRouter } from './routers/columnGroup';
import { columnRouter } from './routers/column';
import { dataRouter } from './routers/data';
import { tableRouter } from './routers/table';
import { flowRouter } from './routers/flow';

export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  project: projectRouter,
  columnGroup: columnGroupRouter,
  column: columnRouter,
  data: dataRouter,
  table: tableRouter,
  flow: flowRouter,
});

export type AppRouter = typeof appRouter;

