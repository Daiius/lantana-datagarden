
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
      const relatedColumnGroup = 
        await db.query.columnGroups.findFirst({
          where: eq(columnGroups.projectId, input.projectId),
          with: {
            innerColumns: {
              with: { columns: true }
            }
          }
        });
      
      if (relatedColumnGroup == null) throw Error(
        `cannot find columnGroups with project ${input.projectId}`
      );

      const relatedColumns = relatedColumnGroup
        .innerColumns
        .flatMap(ic => ic.columns);

      const relatedData = await db.query.data.findMany({
        where: eq(
          data.innerColumnGroupId, 
          relatedColumnGroup.innerColumns[0]?.id as string,
        ),
      })

      return {
        columns: relatedColumns,
        data: relatedData,
      };
    }),
});

