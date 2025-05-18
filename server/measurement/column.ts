import { router, publicProcedure } from '../trpc';

import mitt from 'mitt';

import {
  get,
  list,
  update,
  add,
  remove,
  MeasurementColumn,
  measurementColumnSchema,
  ParentIds,
  Ids,
} from '../lib/measurement/column';

import { createSubscription } from '../lib/common';
import { z } from 'zod';

type MeasurementColumnEvents = {
  onUpdate: MeasurementColumn;
  onAdd: MeasurementColumn;
  onRemove: Ids;
};

const idsSchema = measurementColumnSchema.pick({
  projectId: true,
  columnGroupId: true,
  id: true,
});
const parentIdsSchema = measurementColumnSchema.pick({
  projectId: true,
  columnGroupId: true,
}).extend({
  columnGroupId: z.union([
    z.number(),
    z.array(z.number()),
  ]),
});

const filter = (data: ParentIds, input: ParentIds) => (
     data.projectId === input.projectId
  && data.columnGroupId === input.columnGroupId
);

const ee = mitt<MeasurementColumnEvents>();

export const columnRouter = router({
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(parentIdsSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(measurementColumnSchema)
    .mutation(async ({ input }) => {
      const newValue = await update(input);
      ee.emit('onUpdate', newValue);
    }),
  onUpdate: publicProcedure
    .input(parentIdsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => filter(data, input),
    })),
  add: publicProcedure
    .input(measurementColumnSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      const newValue = await add(input);
      ee.emit('onAdd', newValue);
    }),
  onAdd: publicProcedure
    .input(parentIdsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAdd',
      filter: data => filter(data, input),
    })),
  remove: publicProcedure
    .input(idsSchema)
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }),
  onRemove: publicProcedure
    .input(parentIdsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onRemove',
      filter: data => filter(data, input),
    })),
});

