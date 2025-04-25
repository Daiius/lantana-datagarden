
import { router, publicProcedure } from '../trpc';
import { 
  get,
  list,
  update,
  add,
  remove,
  Flow,
  flowSchema,
  Ids,
  ProjectId,
} from '../lib/flow';

import { createSubscription } from '../lib/common';

import mitt from 'mitt';
type FlowEvents = {
  onUpdate: Flow,
  onAdd: Flow,
  onRemove: Ids,
}
export const ee = mitt<FlowEvents>();

const idsSchema = flowSchema.pick({
  projectId: true,
  id: true,
});

const projectIdSchema = flowSchema.pick({
  projectId: true
});

const filter = (data: ProjectId, input: ProjectId) =>
data.projectId === input.projectId;

export const flowRouter = router({
  /**
   * 指定されたのflowの情報を取得します
   *
   * 特定のflowについての表示に使用します
   */
  get: publicProcedure
    .input(idsSchema)
    .query(async ({ input }) => await get(input)),
  /**
   * プロジェクトに属するflowを列挙します
   */
  list: publicProcedure
    .input(projectIdSchema)
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(flowSchema)
    .mutation(async ({ input }) => {
      const newFlow = await update(input);
      ee.emit('onUpdate', newFlow);
    }),
  add: publicProcedure
    .input(flowSchema.omit({ id: true}))
    .mutation(async ({ input }) => {
      const newFlow = await add(input);
      ee.emit('onAdd', newFlow);
    }),
  remove: publicProcedure
    .input(idsSchema)
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }),
  onAdd: publicProcedure
    .input(projectIdSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onAdd',
      filter: data => filter(data, input),
    })),
  onRemove: publicProcedure
    .input(projectIdSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onRemove',
      filter: data => filter(data, input),
    })),
  onUpdate: publicProcedure
    .input(idsSchema)
    .subscription(({ input }) => createSubscription({
      eventEmitter: ee,
      eventName: 'onUpdate',
      filter: data => filter(data, input),
    })),
});

