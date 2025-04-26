import { router, publicProcedure } from '../trpc';

import mitt from 'mitt';

import {
  get,
  list,
  add,
  remove,
  update,
  ColumnGroupMeasurement,
  columnGroupMeasurementSchema,
  Ids,
  ParentIds,
} from '../lib/columnGroupMeasurement';
import { createSubscription } from '../lib/common';

export type ColumnGroupMeasurementEvents = {
  'onUpdate': ColumnGroupMeasurement;
  'onAdd': ColumnGroupMeasurement;
  'onRemove': Ids;
};

const ee = mitt<ColumnGroupMeasurementEvents>();

const idsSchema = columnGroupMeasurementSchema.pick({
  projectId: true,
  columnGroupId: true,
  id: true,
});
const parentIdsSchema = columnGroupMeasurementSchema.pick({
  projectId: true,
  columnGroupId: true,
});

const filter = (data: ParentIds, input: ParentIds) => (
     data.projectId === input.projectId
  && data.columnGroupId === input.columnGroupId
);

export const columnGroupMeasurementRouter = router({
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(parentIdsSchema)
    .query(async ({ input }) => await list(input)),
  add: publicProcedure
    .input(columnGroupMeasurementSchema.omit({ id: true }))
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
  update: publicProcedure
    .input(columnGroupMeasurementSchema)
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
});

