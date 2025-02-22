
import { z } from  'zod';

import { publicProcedure, router } from './trpc';

import { projectRouter } from './routers/project';
import { columnGroupsRouter } from './routers/columnGroups';
import { columnRouter } from './routers/column';
import { dataRouter } from './routers/data';
import { tableRouter } from './routers/table';

export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  project: projectRouter,
  columnGroups: columnGroupsRouter,
  column: columnRouter,
  data: dataRouter,
  table: tableRouter,
});

export type AppRouter = typeof appRouter;

