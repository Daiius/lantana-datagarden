import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

import mitt from 'mitt';

import {
  get,
  list,
  update,
  add,
  remove,
  MeasurementColumn,
  measurementColumnSchema,
} from '../lib/measurement/column';

import { createSubscription } from '../lib/common';

type MeasurementColumnEvents = {
  onUpdate: MeasurementColumn;
  onAdd: MeasurementColumn;
  onRemove: Pick<MeasurementColumn, 'id'|'projectId'|'columnGroupId'>;
};

const ee = mitt<MeasurementColumnEvents>();

export const columnRouter = router({
  get: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        columnGroupId: z.number(),
        id: z.number(),
      })
    )
    .query(async ({ input }) => {
      const value = await get(input);
      if (value == null) throw new Error (
        `cannot find column ${input.id}`
      );
      return value;
    }),
  list: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        columnGroupId: z.number(),
      })
    )
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(measurementColumnSchema)
    .mutation(async ({ input }) => {
      const newValue = await update(input);
      ee.emit('onUpdate', newValue);
    }),
  onUpdate: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        columnGroupId: z.number(),
        id: z.number(),
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => (
           data.projectId === input.projectId
        && data.columnGroupId === input.columnGroupId
        && data.id === input.id
      ),
    })),
  add: publicProcedure
    .input(measurementColumnSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      const newValue = await add(input);
      ee.emit('onAdd', newValue);
    }),
  onAdd: publicProcedure
    .input(
      measurementColumnSchema.pick({
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
      measurementColumnSchema.pick({
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
      measurementColumnSchema.pick({
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
});

