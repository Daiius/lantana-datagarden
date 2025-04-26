
import { router, publicProcedure } from '../trpc';

import { 
  get,
  list,
  update,
  add,
  remove,
  columnSchema,
  Column,
  Ids,
  ParentIds,
} from '../lib/column';
import { createSubscription } from '../lib/common';

import mitt from 'mitt';
type ColumnEvents = {
  onAdd: Column,
  onRemove: Ids,
  onUpdate: Column,
}

export const ee = mitt<ColumnEvents>();

const idsSchema = columnSchema.pick({
  projectId: true,
  columnGroupId: true,
  id: true,
});
const parentIdsSchema = columnSchema.pick({
  projectId: true,
  columnGroupId: true,
});

const filter = (data: ParentIds, input: ParentIds) => (
     data.projectId === input.projectId
  && data.columnGroupId === input.columnGroupId
);

export const columnRouter = router({
  /** 単一の列データを取得します */
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  /** 指定した列グループに属する列データを取得します */
  list: publicProcedure
    .input(parentIdsSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(columnSchema)
    .mutation(async ({ input }) => {
      const newColumn = await update(input);
      ee.emit('onUpdate', newColumn);
    }),
  add: publicProcedure
    .input(columnSchema.partial({ id: true }))
    .mutation(async ({ input }) => {
      const newColumn = await add(input);
      ee.emit('onAdd', newColumn);
    }),
  /**
   * 列を削除します
   *
   * DataテーブルにJSON形式で記録されているデータも削除されます
   */
  remove: publicProcedure
    .input(idsSchema)
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }),
  onUpdate: publicProcedure
    .input(parentIdsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => filter(data, input),
    })),
  onAdd: publicProcedure
    .input(parentIdsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAdd',
      filter: data => filter(data, input),
    })),
  onRemove: publicProcedure
    .input(parentIdsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onRemove',
      filter: data => filter(data, input),
    })),
});

