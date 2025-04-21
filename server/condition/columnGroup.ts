
import { 
  columnGroups,
} from 'database/db/schema';

import { createSelectSchema } from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';

import mitt from 'mitt';
import {
  get,
  list,
  update,
  add,
  remove,
} from '../lib/columnGroup';
import { createSubscription } from '../lib/common';


const selectSchema = createSelectSchema(columnGroups);

type ColumnGroup = z.infer<typeof selectSchema>;

type ColumnGroupEvents = {
  onAdd: ColumnGroup;
  onRemove: Pick<ColumnGroup, 'id'|'projectId'>;
  onUpdate:     ColumnGroup;
  onUpdateList: ColumnGroup;
}
export const ee = mitt<ColumnGroupEvents>();

export const columnGroupRouter = router({
  /**
   * 指定したidのカテゴリを取得します
   */
  get: publicProcedure
    .input(selectSchema.pick({ 
      id: true,
      projectId: true,
    }))
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => await list(input)),
  /**
   * 指定したidのカテゴリを更新します
   * onUpdateイベントが発行されます
   */
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      const newColumnGroup = await update(input);
      if (newColumnGroup == null) throw new Error(
        `cannot find updated columnGroup, ${input.id}`
      );
      if (newColumnGroup == null) 
        throw new Error('failed to get updated nested column group');
      ee.emit('onUpdate', newColumnGroup);
      ee.emit('onUpdateList', newColumnGroup);
    }),
  /**
   * 指定したidのカテゴリが更新された際に発生するイベントです
   */
  onUpdate: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true
    }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onUpdate',
        filter: data => (
             data.id        === input.id 
          && data.projectId === input.projectId
        ),
      })
    ),
  onUpdateList: publicProcedure
    .input(selectSchema.pick({ projectId: true }))
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdateList',
      filter: data => data.projectId === input.projectId
    })),
  /**
   * 新しいカテゴリを追加します
   *
   * 新しいデータが追加されると、
   * onAddイベントが発行され、同じprojectIdに紐づけられた
   * 一連のcategoriesを取得できます
   */
  add: publicProcedure
    .input(selectSchema.partial({ id: true }))
    .mutation(async ({ input }) => {
      const newColumnGroup = await add(input);
      ee.emit('onAdd', newColumnGroup);
    }),
  onAdd: publicProcedure
    .input(selectSchema.pick({ projectId: true }))
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAdd',
      filter: data => data.projectId === input.projectId
    })),
  /**
   * 指定したColumnGroupを削除します
   *
   * 関連付けられたColumnsもDataも全て削除されます
   */
  remove: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true,
    }))
    .mutation(async ({ input }) => {
      const removedIds = await remove(input);
      ee.emit('onRemove', removedIds);
    }) ,
  onRemove: publicProcedure
    .input(selectSchema.pick({ projectId: true }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onRemove',
        filter: data => (
          data.projectId === input.projectId
        ),
      })
    ),
});

