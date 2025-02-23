
import { db } from 'database/db';
import { 
  data,
  columns,
  columnGroups,
  validate,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

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
    }))
    .query(async ({ input }) => {
      const relatedColumnGroups = 
        await db.query.columnGroups.findMany({
          where: eq(columnGroups.projectId, input.projectId),
          with: {
            columns: true
          }
        });

      const nestedData =
        await db.query.data.findMany({
          where: and(
            eq(data.projectId, input.projectId),
          ),
        });
      return {
        data: nestedData,
        columns: relatedColumnGroups,
      };
    }),
});

