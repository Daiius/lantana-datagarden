import { router, publicProcedure } from '../trpc';

import { z } from 'zod';

import mitt from 'mitt';

import {
  get,
  list,
  add,
  remove,
  update,
  ColumnGroupToMeasurementWithMeasurements,
  columnGroupToMeasurementSchema,
} from '../lib/columnGroupMeasurement';
import { createSubscription } from '../lib/common';

export type ColumnGroupToMeasurementEvents = {
  'onUpdate': ColumnGroupToMeasurementWithMeasurements;
  'onAdd': ColumnGroupToMeasurementWithMeasurements;
  'onRemove': Pick<ColumnGroupToMeasurementWithMeasurements, 'projectId'|'columnGroupId'|'id'>;
};

const ee = mitt<ColumnGroupToMeasurementEvents>();


export const columnGroupMeasurementRouter = router({
  get: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        columnGroupId: z.number(),
        id: z.number(),
      })
    )
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        columnGroupId: z.number(),
      })
    )
    .query(async ({ input }) => await list(input)),
  add: publicProcedure
    .input(columnGroupToMeasurementSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      const newValue = await add(input);
      ee.emit('onAdd', newValue);
    }),
  onAdd: publicProcedure
    .input(
      columnGroupToMeasurementSchema.pick({
        projectId: true,
        columnGroupId: true,
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAdd',
      filter: data => (
           data.projectId === input.projectId
        && data.columnGroupId === input.columnGroupId
      ),
    })),
  remove: publicProcedure
    .input(
      columnGroupToMeasurementSchema.pick({
        projectId: true,
        columnGroupId: true,
        id: true,
      })
    )
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }),
  onRemove: publicProcedure
    .input(
      columnGroupToMeasurementSchema.pick({
        projectId: true,
        columnGroupId: true,
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onRemove',
      filter: data => (
           data.projectId === input.projectId
        && data.columnGroupId === input.columnGroupId
      ),
    })),
  update: publicProcedure
    .input(
      columnGroupToMeasurementSchema
    )
    .mutation(async ({ input }) => {
      const newValue = await update(input);
      ee.emit('onUpdate', newValue);
    }),
  onUpdate: publicProcedure
    .input(
      columnGroupToMeasurementSchema.pick({
        projectId: true,
        columnGroupId: true,
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => (
           data.projectId === input.projectId
        && data.columnGroupId === input.columnGroupId
      ),
    })),
});

