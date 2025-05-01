import { router, publicProcedure } from '../trpc';

import mitt from 'mitt';

import {
  get,
  list,
  update,
  add,
  remove,
  Measurement,
  measurementSchema,
  Ids,
  ParentIds,
} from '../lib/measurement/data';

import { createSubscription } from '../lib/common';

type MeasurementEvents = {
  onUpdate: Measurement;
  onAdd: Measurement;
  onRemove: Ids;
}

const ee = mitt<MeasurementEvents>();

const idsSchema = measurementSchema.pick({
  projectId: true,
  columnGroupId: true,
  id: true,
});
const parentIdsSchema = measurementSchema.pick({
  projectId: true,
  columnGroupId: true,
});

const filter = (data: ParentIds, input: ParentIds) => (
     data.projectId === input.projectId
  && data.columnGroupId === input.columnGroupId
);

export const dataRouter = router({
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(parentIdsSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(measurementSchema)
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
    .input(measurementSchema.omit({ id: true }))
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

