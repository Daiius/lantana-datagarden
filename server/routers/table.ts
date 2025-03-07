
import { db } from 'database/db';
import { 
  data,
  columns,
  columnGroups,
  flows,
  validate,
} from 'database/db/schema';
import { eq, and, asc } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
type TableEvents = {
}

export const ee = mitt<TableEvents>();

export const tableRouter = router({
  get: publicProcedure
    .input(z.object({ 
      projectId: z.string(),
      flowId: z.number(),
    }))
    .query(async ({ input }) => {
      const flow = await db.query.flows.findFirst({
        where: and(
          eq(flows.id, input.flowId),
          eq(flows.projectId, input.projectId)
        ),
        with: {
          columnGroups: {
            with: {
              data: true
            }
          }
        }
      });

      return flow;
    }),
});

