import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

import mitt from 'mitt';

import { 
  get,
  //getWithColumns,
  list,
  listWithColumns,
  update,
  add,
  remove,
  measurementColumnGroupSchema,
  MeasurementColumnGroup,
  MeasurementColumnGroupWithColumns,
} from '../lib/measurement/columnGroup';

import { createSubscription } from '../lib/common';

type MeasurementColumnGroupEvents = {
  onAdd: MeasurementColumnGroup;
  onAddWithColumns: MeasurementColumnGroupWithColumns;
  onRemove: { projectId: string, id: number };
  onUpdate: MeasurementColumnGroup;
};

const ee = mitt<MeasurementColumnGroupEvents>();

export const columnGroupRouter = router({
  get: publicProcedure
    .input(
      measurementColumnGroupSchema.pick({
        projectId: true,
        id: true,
      })
    )
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(measurementColumnGroupSchema.pick({
      projectId: true
    }))
    .query(async ({ input }) => await list(input)),
  listWithColumns: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ input }) => await listWithColumns(input)),
  update: publicProcedure
    .input(
      measurementColumnGroupSchema
    )
    .mutation(async ({ input }) => await update(input)),
  onUpdate: publicProcedure
    .input(
      measurementColumnGroupSchema.pick({
        projectId: true,
        id: true,
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => (
         data.projectId === input.projectId
      ),
    })),
  add: publicProcedure
    .input(
      measurementColumnGroupSchema
        .omit({ id: true })
    )
    .mutation(async ({ input }) => {
      const newValue = await add(input);
      ee.emit('onAdd', newValue);
    }),
  onAdd: publicProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onAdd',
        filter: data => (
          data.projectId === input.projectId
        ),
      }),
    ),
  onAddWithColumns: publicProcedure
    .input(
      measurementColumnGroupSchema.pick({ projectId: true })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAddWithColumns',
      filter: data => (
        data.projectId === input.projectId
      ),
    })),
  remove: publicProcedure
    .input(
      measurementColumnGroupSchema.pick({
        projectId: true,
        id: true,
      })
    )
    .mutation(async ({ input }) => await remove(input)),
  onRemove: publicProcedure
    .input(
      z.object({ projectId: z.string() })
    )
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onRemove',
        filter: data => data.projectId === input.projectId,
      }),
    ),
});

