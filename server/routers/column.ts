
import { db } from 'database/db';
import { 
  columns,
//  data,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

import { 
  updateName,
  updateType,
} from '../lib/column';

import mitt from 'mitt';
type ColumnEvents = {
  onUpdate: z.infer<typeof selectSchema>,
  onUpdateList: z.infer<typeof selectSchema>[],
}

export const ee = mitt<ColumnEvents>();

const selectSchema = createSelectSchema(columns);

//const literalUnionFromArray = 
//  <T extends readonly string[]>(values: T) =>
//    z.union(
//      values.map(v => z.literal(v)) as [
//        z.ZodLiteral<T[number]>,
//        z.ZodLiteral<T[number]>,
//        ...Array<z.ZodLiteral<T[number]>>
//      ]
//    );

export const columnRouter = router({
  /** 単一の列データを取得します */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    //.output(selectSchema.optional())
    .query(async ({ input }) => 
       await db.query.columns.findFirst({
         where: eq(columns.id, input.id)
       })
    ),
  /** 指定した列グループに属する列データを取得します */
  list: publicProcedure
    .input(z.object({ columnGroupId: z.string() }))
    .query(async ({ input }) =>
      await db.query.columns.findMany({
        where: eq(columns.columnGroupId, input.columnGroupId),
        orderBy: columns.id,
      })
    ),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {

      const lastData = await db.query.columns.findFirst({
        where: and(
          eq(columns.id, input.id),
          eq(columns.columnGroupId, input.columnGroupId),
          eq(columns.projectId, input.projectId),
        )
      });

      if (lastData == null) 
        throw new Error(`cannot find column with id ${input.id}`);

      if (lastData.name !== input.name) {
        const oldName = lastData.name;
        const newName = input.name;
        await updateName({
          id: input.id, 
          projectId: input.projectId, 
          columnGroupId: input.columnGroupId,
          oldName,
          newName,
        });
      }
      
      if (lastData.type !== input.type) {
        const oldType = lastData.type;
        const newType = input.type;
        await updateType({
          id: input.id,
          projectId: input.projectId,
          columnGroupId: input.columnGroupId,
          columnName: input.name,
          oldType,
          newType,
        });
      }

      ee.emit('onUpdate', { ...input });
    }),
  onUpdate: publicProcedure
    .input(z.object({ 
      id: z.string(), 
      columnGroupId: z.string(),
    }))
    .subscription(({ input }) =>
      observable<ColumnEvents['onUpdate']>(emit => {
        const handler = (data: ColumnEvents['onUpdate']) => {
          if ( data.id         === input.id
            && data.columnGroupId === input.columnGroupId
          ) {
            emit.next({ ...data });
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    ),
  onUpdateList: publicProcedure
    .input(z.object({ columnGroupId: z.string() }))
    .subscription(({ input }) =>
      observable<ColumnEvents['onUpdateList']>(emit => {
        const handler = (data: ColumnEvents['onUpdateList']) => {
          if (data[0]?.columnGroupId === input.columnGroupId) {
            emit.next(data);
          }
        };
        ee.on('onUpdateList', handler);
        return () => ee.off('onUpdateList', handler);
      })
    ),
});

