import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

import mitt from 'mitt';

import { 
  get,
  list,
  update,
  add,
  remove,
  measurementColumnGroupSchema,
  MeasurementColumnGroup,
} from '../lib/measurement/columnGroup';

import { createSubscription } from '../lib/common';

type MeasurementColumnGroupEvents = {
  onAdd: MeasurementColumnGroup;
  onRemove: { projectId: string, id: number };
  onUpdate: MeasurementColumnGroup;
};

const ee = mitt<MeasurementColumnGroupEvents>();

const idsSchema = measurementColumnGroupSchema.pick({
  projectId: true,
  id: true,
});

const projectIdSchema = measurementColumnGroupSchema.pick({
  projectId: true,
});

type ProjectId = z.infer<typeof projectIdSchema>;

const filter = (data: ProjectId, input: ProjectId) => (
  data.projectId === input.projectId
);

export const columnGroupRouter = router({
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(projectIdSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(measurementColumnGroupSchema)
    .mutation(async ({ input }) => {
      const newValue = await update(input);
      ee.emit('onUpdate', newValue);
    }),
  onUpdate: publicProcedure
    .input(projectIdSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => filter(data, input),
    })),
  add: publicProcedure
    .input(measurementColumnGroupSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      const newValue = await add(input);
      ee.emit('onAdd', newValue);
    }),
  onAdd: publicProcedure
    .input(projectIdSchema)
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
    .input(projectIdSchema)
    .subscription(({ input }) => createSubscription({
        eventEmitter: ee,
        eventName: 'onRemove',
        filter: data => filter(data, input),
    })),
});

