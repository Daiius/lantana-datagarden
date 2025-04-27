
import { z } from 'zod';
import mitt from 'mitt';

import { router, publicProcedure } from '../trpc';

import {
  get,
  list,
  update,
  add,
  remove,
  Data,
  dataSchema,
  Ids,
  ParentIds,
} from '../lib/data';
import { createSubscription } from '../lib/common';

type DataEvents = {
  onAdd: Data;
  onRemove: Ids;
  onUpdate: Data;
}

export const ee = mitt<DataEvents>();

const idsSchema = dataSchema.pick({
  projectId: true,
  columnGroupId: true,
  id: true,
});

const parentIdsSchema = dataSchema.pick({
  projectId: true,
  columnGroupId: true,
}).extend({
  columnGroupId: z.union([
    z.number(),
    z.array(z.number()),
  ]),
});

const filter = (data: ParentIds, input: ParentIds) => (
     data.columnGroupId === input.columnGroupId
  && data.projectId     === input.projectId
);

export const dataRouter = router({
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(parentIdsSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(dataSchema)
    .mutation(async ({ input }) => {
      const newData = await update(input);
      ee.emit('onUpdate', newData);
    }),
  // 特定 id のデータが更新されたことを通知するイベント
  onUpdate: publicProcedure
    .input(parentIdsSchema)
    .subscription(({ input }) => createSubscription({
        eventEmitter: ee,
        eventName: 'onUpdate',
        filter: data => filter(data, input),
    })),
  add: publicProcedure
    .input(dataSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      const newData = await add(input);
      ee.emit('onAdd', newData);
    }),
  remove: publicProcedure
    .input(idsSchema)
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }),
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

