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
} from '../lib/measurement/data';

import { createSubscription } from '../lib/common';

type MeasurementEvents = {
  onUpdate: Measurement;
  onAdd: Measurement;
  onRemove: Pick<Measurement, 'id'|'projectId'|'columnGroupId'>;
}

const ee = mitt<MeasurementEvents>();

export const dataRouter = router({
  get: publicProcedure
    .input(
      measurementSchema.pick({
        id: true,
        projectId: true,
        columnGroupId: true,
      })
    )
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(
      measurementSchema.pick({
        projectId: true,
        columnGroupId: true,
      })
    )
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(
      measurementSchema
    )
    .mutation(async ({ input }) => {
      const newValue = await update(input);
      ee.emit('onUpdate', newValue);
    }),
  onUpdate: publicProcedure
    .input(
      measurementSchema.pick({
        projectId: true,
        id: true,
        columnGroupId: true,
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
    .input(
      measurementSchema.omit({ id: true })
    )
    .mutation(async ({ input }) => {
      const newValue = await add(input);
      ee.emit('onAdd', newValue);
    }),
  onAdd: publicProcedure
    .input(
      measurementSchema.pick({
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
      measurementSchema.pick({
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
      measurementSchema.pick({
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

