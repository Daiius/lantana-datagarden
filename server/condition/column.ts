
import { columns } from 'database/db/schema';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { router, publicProcedure } from '../trpc';

import { 
  get,
  list,
  update,
  add,
  remove,
} from '../lib/column';
import { createSubscription } from '../lib/common';

import mitt from 'mitt';
type Column = typeof columns.$inferSelect;
type ColumnEvents = {
  onAdd: Column,
  onRemove: Pick<Column, 'id' | 'projectId' | 'columnGroupId'>,
  onUpdate: Column,
}

export const ee = mitt<ColumnEvents>();

const selectSchema = createSelectSchema(columns);


export const columnRouter = router({
  /** 単一の列データを取得します */
  get: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true,
      columnGroupId: true,
    }))
    .query(async ({ input }) => await get(input)),
  /** 指定した列グループに属する列データを取得します */
  list: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      columnGroupId: true,
    }))
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      console.log('update procedure called! %o', input);
      const newColumn = await update(input);
      ee.emit('onUpdate', newColumn);
      console.log('update event emitted! %o', newColumn);
    }),
  add: publicProcedure
    .input(selectSchema.partial({ id: true }))
    .mutation(async ({ input }) => {
      const newColumn = await add(input);
      if (newColumn == null) throw new Error(
        `cannot find added column`
      );
      ee.emit('onAdd', newColumn);
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
      await remove(input);
      ee.emit('onRemove', input);
    }),
  onUpdate: publicProcedure
    .input(selectSchema.pick({ 
      id: true, 
      projectId: true,
      columnGroupId: true,
    }))
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => {
        console.log('filter: %o', data);
        return ( 
             data.id            === input.id
          && data.columnGroupId === input.columnGroupId
          && data.projectId     === input.projectId
        );
      },
    })),
  onAdd: publicProcedure
    .input(selectSchema.pick({
      projectId: true,
      columnGroupId: true,
    }))
    .subscription(({ input }) =>
      createSubscription({
        filter: data => (
             data.projectId === input.projectId
          && data.columnGroupId === input.columnGroupId
        ),
        eventEmitter: ee,
        eventName: 'onAdd',
      })
    ),
  onRemove: publicProcedure
    .input(selectSchema.pick({
      projectId: true,
      columnGroupId: true,
    }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onRemove',
        filter: data => (
             data.projectId === input.projectId
          && data.columnGroupId === data.columnGroupId
        ),
      })
    ),
});

