
import { db } from 'database/db';
import { 
  columns,
//  data,
} from 'database/db/schema';
import { eq, and, asc } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

import { 
  deleteColumn,
  updateName,
  updateType,
} from '../lib/column';

//import { v7 as uuidv7 } from 'uuid';

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
    .input(selectSchema.pick({
      id: true,
      projectId: true,
      columnGroupId: true,
    }))
    .query(async ({ input }) => 
       await db.query.columns.findFirst({
         where: and(
           eq(columns.id, input.id),
           eq(columns.projectId, input.projectId),
           eq(columns.columnGroupId, input.columnGroupId),
         ),
       })
    ),
  /** 指定した列グループに属する列データを取得します */
  list: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      columnGroupId: true,
    }))
    .query(async ({ input }) =>
      await db.query.columns.findMany({
        where: and(
          eq(columns.columnGroupId, input.columnGroupId),
          eq(columns.projectId, input.projectId),
        ),
        orderBy: [asc(columns.id)],
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
          name: input.name,
          oldType,
          newType,
        });
      }

      ee.emit('onUpdate', { ...input });
    }),
  add: publicProcedure
    .input(selectSchema.partial({ id: true }))
    .mutation(async ({ input }) => {
      await db.insert(columns).values(
        { ...input }
      );
      const newList = await db.query.columns.findMany({
        where: and(
          eq(columns.projectId, input.projectId),
          eq(columns.columnGroupId, input.columnGroupId),
        ),
        orderBy: [asc(columns.id)],
      });
      ee.emit('onUpdateList', newList); 
    }),
  /**
   * 列を削除します
   *
   * DataテーブルにJSON形式で記録されているデータも削除されます
   */
  remove: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true,
      columnGroupId: true,
    }))
    .mutation(async ({ input }) => {
      // 該当する列をDataから削除します
      await deleteColumn(input);

      const newList = await db.query.columns.findMany({
        where: and(
          eq(columns.projectId, input.projectId),
          eq(columns.columnGroupId, input.columnGroupId),
        ),
        orderBy: [asc(columns.id)],
      });
      ee.emit('onUpdateList', newList); 
    }),
  onUpdate: publicProcedure
    .input(selectSchema.pick({ 
      id: true, 
      projectId: true,
      columnGroupId: true,
    }))
    .subscription(({ input }) =>
      observable<ColumnEvents['onUpdate']>(emit => {
        const handler = (data: ColumnEvents['onUpdate']) => {
          if ( data.id         === input.id
            && data.columnGroupId === input.columnGroupId
            && data.projectId === input.projectId
          ) {
            emit.next({ ...data });
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    ),
  onUpdateList: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      columnGroupId: true,
    }))
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

