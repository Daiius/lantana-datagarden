
import { router, publicProcedure } from '../trpc';
import { 
  get,
  list,
  update,
  add,
  remove,
  FlowStep,
  flowStepSchema,
  Ids,
  ParentIds,
} from '../lib/flowStep';

import { createSubscription } from '../lib/common';


import mitt from 'mitt';
type FlowStepEvents = {
  onUpdate: FlowStep,
  onAdd: FlowStep,
  onRemove: Ids,
}
export const ee = mitt<FlowStepEvents>();

const idsSchema = flowStepSchema.pick({
  projectId: true,
  flowId: true,
  id: true,
});
const parentIdsSchema = flowStepSchema.pick({
  projectId: true,
  flowId: true,
});

const filter = (data: ParentIds, input: ParentIds) => (
     data.projectId === input.projectId
  && data.flowId === input.flowId
);

export const flowStepRouter = router({
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(parentIdsSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(flowStepSchema)
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
    .input(flowStepSchema.omit({ id: true })) 
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

