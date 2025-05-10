import { router, publicProcedure } from '../trpc';
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
  getFlowId,
} from '../lib/flowStepColumnGroup';
import mitt from 'mitt';
import {
  createEventHandler,
} from '../lib/common';
import {
  tableFollowingColumnGroupsEventEmitter
} from '../events';

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

/** flowStepColumnGroup の更新時、関連するfollowingColumnGroupsを更新します */
const updateFollowingColumnGroups = async (data: Ids) => {
  const flowId = await getFlowId(data);
  if (flowId != null) {
    tableFollowingColumnGroupsEventEmitter.emit(
      'onUpdate', 
      {
        id: flowId,
        projectId: data.projectId,
      }
    ); 
  }
};

// followingColumnGroups更新処理の呼び出しを、
// onUpdate, onAdd, onRemoveイベントハンドラと関連付けます
// 一度登録するだけなのでee.offは省略
ee.on(
  'onUpdate',
  args => updateFollowingColumnGroups(args),
);
ee.on(
  'onAdd',
  args => updateFollowingColumnGroups(args),
);
ee.on(
  'onRemove',
  args => updateFollowingColumnGroups(args),
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
    .subscription(({ input }) => createEventHandler({
      ee,
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
    .subscription(({ input }) => createEventHandler({
      ee,
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
    .subscription(({ input }) => createEventHandler({
      ee,
      eventName: 'onRemove',
      filter: data => filter(data, input),
    })),
});

