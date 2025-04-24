import {
  flows,
} from 'database/db/schema';

type Flow = typeof flows.$inferSelect;

import { z } from 'zod';

import { router, publicProcedure } from './trpc';
import { createSelectSchema } from 'drizzle-zod';
import { 
  get,
  list,
  update,
  add,
  remove,
} from './lib/flow';

import { createSubscription } from './lib/common';

const flowSchema = createSelectSchema(flows);

import mitt from 'mitt';
type FlowEvents = {
  onUpdate: Flow,
  onAdd: Flow,
  onRemove: Pick<Flow, 'id' | 'projectId'>,
}

export const ee = mitt<FlowEvents>();

export const flowRouter = router({
  /**
   * 指定されたのflowの情報を取得します
   *
   * 特定のflowについての表示に使用します
   */
  get: publicProcedure
    .input(flowSchema.pick({
      id: true,
      projectId: true,
    }))
    .query(async ({ input }) => await get(input)),
  /**
   * プロジェクトに属するflowを列挙します
   */
  list: publicProcedure
    .input(z.object({
      projectId: z.string()
    }))
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
    .input(flowSchema.pick({ 
      projectId: true, 
      id: true 
    }))
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
    }),
  onAdd: publicProcedure
    .input(flowSchema.pick({ projectId: true }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onAdd',
        filter: data => (
          data.projectId === input.projectId
        ),
      })
    ),
  onRemove: publicProcedure
    .input(flowSchema.pick({ projectId: true }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onRemove',
        filter: data => (
          data.projectId === input.projectId
        ),
      })
    ),
  onUpdate: publicProcedure
    .input(flowSchema.pick({ 
      projectId: true, 
      id: true 
    }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onUpdate',
        filter: data => (
             data.id === input.id
          && data.projectId === input.projectId
        ),
      })
    ),
});

