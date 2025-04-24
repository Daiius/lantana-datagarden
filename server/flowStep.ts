import {
  flowSteps,
} from 'database/db/schema';


import { router, publicProcedure } from './trpc';
import { createSelectSchema } from 'drizzle-zod';
import { 
  get,
  list,
  update,
  add,
  remove,
  FlowStep,
} from './lib/flowStep';

import { createSubscription } from './lib/common';

const flowStepSchema = createSelectSchema(flowSteps);

import mitt from 'mitt';
type FlowStepEvents = {
  onUpdate: FlowStep,
  onAdd: FlowStep,
  onRemove: Pick<FlowStep, 'id' | 'projectId' | 'flowId'>,
}

export const ee = mitt<FlowStepEvents>();

export const flowRouter = router({
  get: publicProcedure
    .input(
      flowStepSchema.pick({
        projectId: true,
        id: true,
        flowId: true,
      })
    )
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(
      flowStepSchema.pick({
        projectId: true,
        flowId: true,
      })
    )
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(flowStepSchema)
    .mutation(async ({ input }) => {
      const newValue = await update(input);
      ee.emit('onUpdate', newValue);
    }),
  onUpdate: publicProcedure
    .input(
      flowStepSchema.pick({
        projectId: true,
        flowId: true,
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => (
           data.projectId === input.projectId
        && data.flowId === input.flowId
      ),
    })),
  add: publicProcedure
    .input(
      flowStepSchema.omit({ id: true })
    )
    .mutation(async ({ input }) => {
      const newValue = await add(input);
      ee.emit('onAdd', newValue);
    }),
  onAdd: publicProcedure
    .input(
      flowStepSchema.pick({
        projectId: true,
        flowId: true,
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAdd',
      filter: data => (
           data.projectId === input.projectId
        && data.flowId === input.flowId
      ),
    })),
  remove: publicProcedure
    .input(
      flowStepSchema.pick({
        projectId: true,
        flowId: true,
        id: true,
      })
    )
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }),
  onRemove: publicProcedure
    .input(
      flowStepSchema.pick({
        projectId: true,
        flowId: true,
      })
    )
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onRemove',
      filter: data => (
           data.projectId === input.projectId
        && data.flowId === input.flowId
      ),
    })),
});

