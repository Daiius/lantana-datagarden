
import { router, publicProcedure } from '../trpc';

import mitt from 'mitt';
import {
  get,
  list,
  update,
  add,
  remove,
  columnGroupSchema,
  ColumnGroup,
  Ids,
  ProjectId,
} from '../lib/columnGroup';
import { createSubscription } from '../lib/common';

const idsSchema = columnGroupSchema.pick({
  projectId: true,
  id: true,
});
const projectIdSchema = columnGroupSchema.pick({
  projectId: true,
});

type ColumnGroupEvents = {
  onAdd: ColumnGroup;
  onRemove: Pick<ColumnGroup, 'id'|'projectId'>;
  onUpdate:     ColumnGroup;
}
export const ee = mitt<ColumnGroupEvents>();

const filter = (data: ProjectId, input: ProjectId) =>
  data.projectId === input.projectId;

export const columnGroupRouter = router({
  /**
   * 指定したidのカテゴリを取得します
   */
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(projectIdSchema)
    .query(async ({ input }) => await list(input)),
  /**
   * 指定したidのカテゴリを更新します
   * onUpdateイベントが発行されます
   */
  update: publicProcedure
    .input(columnGroupSchema)
    .mutation(async ({ input }) => {
      const newColumnGroup = await update(input);
      ee.emit('onUpdate', newColumnGroup);
    }),
  /**
   * 指定したidのカテゴリが更新された際に発生するイベントです
   */
  onUpdate: publicProcedure
    .input(projectIdSchema)
    .subscription(({ input }) => createSubscription({
        eventEmitter: ee,
        eventName: 'onUpdate',
        filter: data => filter(data, input),
      })
    ),
  add: publicProcedure
    .input(columnGroupSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      const newColumnGroup = await add(input);
      ee.emit('onAdd', newColumnGroup);
    }),
  onAdd: publicProcedure
    .input(projectIdSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAdd',
      filter: data => filter(data, input),
    })),
  /**
   * 指定したColumnGroupを削除します
   *
   * 関連付けられたColumnsもDataも全て削除されます
   */
  remove: publicProcedure
    .input(idsSchema)
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }) ,
  onRemove: publicProcedure
    .input(projectIdSchema)
    .subscription(({ input }) => createSubscription({
        eventEmitter: ee,
        eventName: 'onRemove',
        filter: data => filter(data, input),
    })),
});

