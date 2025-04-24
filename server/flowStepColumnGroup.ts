import { router, publicProcedure } from './trpc';
import {
  get,
  list,
  update,
  add,
  remove,
  FlowStepColumnGroup,
  flowStepColumnGroupSchema,
  Ids,
  ParentIds,
} from './lib/flowStepColumnGroup';
import mitt from 'mitt';
import { createSubscription } from './lib/common';

type FlowStepColumnGroupEvents = {
  onUpdate: FlowStepColumnGroup;
  onAdd: FlowStepColumnGroup;
  onRemove: Ids;
};
const ee = mitt<FlowStepColumnGroupEvents>();

const idsSchema = flowStepColumnGroupSchema.pick({
  projectId: true,
  flowStepId: true,
  id: true,
});

const parentIdsSchema = flowStepColumnGroupSchema.pick({
  projectId: true,
  flowStepId: true,
});

const filter = (data: ParentIds, input: ParentIds) => (
     data.projectId  === input.projectId
  && data.flowStepId === input.flowStepId
);

export const flowStepColumnGroupRouter = router({
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(parentIdsSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(flowStepColumnGroupSchema)
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
    .input(
      flowStepColumnGroupSchema.omit({ id :true })
    )
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

