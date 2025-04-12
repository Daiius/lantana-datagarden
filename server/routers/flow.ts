import {
  flows,
} from 'database/db/schema';

type Flow = typeof flows.$inferSelect;

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { createSelectSchema } from 'drizzle-zod';
import { observable, } from '@trpc/server/observable';
import { 
  get,
  list,
  update,
  add,
  remove,
  getNested,
  getNestedWithData,
  listNested,
} from '../lib/flow';

import { createSubscription } from '../lib/common';

const groupingSchema = z.union([
  z.object({
    type: z.literal('parent')
  }),
  z.object({
    type: z.literal('column'),
    columnName: z.string(),
  }),
  z.undefined(),
]);

const columnGroupingSchema = z.object({
  id: z.number(),
  grouping: groupingSchema,
});

// TODO 型推論が上手くいかないので手動で設定、注意
const selectSchema = createSelectSchema(flows)
  .extend({
    flowSteps: z.array(
      z.object({
        columnGroupWithGroupings: z.array(columnGroupingSchema),
        mode: z.enum(['list', 'merge']),
      }),
    ),
  });


type GetNestedType = NonNullable<Awaited<ReturnType<typeof getNested>>>;
type GetNestedWithDataType = NonNullable<Awaited<ReturnType<typeof getNestedWithData>>>;

import mitt from 'mitt';
type FlowEvents = {
  onUpdate: GetNestedType,
  onUpdateNested: GetNestedWithDataType,
  onAdd: GetNestedType,
  onRemove: Pick<Flow, 'id' | 'projectId'>,
  onUpdateList: Pick<Flow, 'projectId'> & {
    flows: GetNestedType[];
  }
}

export const ee = mitt<FlowEvents>();

export const flowRouter = router({
  /**
   * 指定されたのflowの情報を取得します
   *
   * 特定のflowについての表示に使用します
   */
  get: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true,
    }))
    .query(async ({ input }) => await get(input)),
  /**
   * 指定されたのflowのネストされた情報を取得します
   */
  getNested: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true,
    }))
    .query(async ({ input }) => await getNested(input)),

  /**
   * データも含むflow情報を取得します
   *
   * TODO 本来はtable処理用なのでそちらに移動します
   */
  getNestedWithData: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true
    }))
    .query(async ({ input }) => await getNestedWithData(input)),
  /**
   * プロジェクトに属するflowを列挙します
   */
  list: publicProcedure
    .input(z.object({
      projectId: z.string()
    }))
    .query(async ({ input }) => await list(input)),
  /**
   * プロジェクトに属するflowを列挙します
   *
   * columnGroupsをネストされたオブジェクトとして取得します
   */
  listNested: publicProcedure
    .input(z.object({
      projectId: z.string()
    }))
    .query(async ({ input }) => {
      return await listNested(input);
    }),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      const newFlow = await update(input);
      ee.emit('onUpdate', newFlow);

      const newFlowNested = await getNestedWithData(input);
      ee.emit('onUpdateNested', newFlowNested);
    }),
  add: publicProcedure
    .input(selectSchema.omit({ id: true}))
    .mutation(async ({ input }) => {
      const newFlow = await add(input);
      const newNestedFlow = await getNested(newFlow);
      ee.emit('onAdd', newNestedFlow);
    }),
  remove: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      id: true 
    }))
    .mutation(async ({ input }) => {
      await remove(input);
      ee.emit('onRemove', input);
      const newList= await listNested({ projectId: input.projectId });
      ee.emit(
        'onUpdateList',
        { projectId: input.projectId, flows: newList }
      );
    }),
  onAdd: publicProcedure
    .input(selectSchema.pick({ projectId: true }))
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
    .input(selectSchema.pick({ projectId: true }))
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
    .input(selectSchema.pick({ 
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
  onUpdateNested: publicProcedure
    .input(selectSchema.pick({
      projectId: true,
      id: true
    }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onUpdateNested',
        filter: data => (
             data.id === input.id
          && data.projectId === input.projectId
        ),
      })
    ),
  onUpdateList: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .subscription(({ input }) =>
      observable<FlowEvents['onUpdateList']>(emit => {
        const handler = (flows: FlowEvents['onUpdateList']) => {
          if (flows.projectId === input.projectId) {
            emit.next(flows);
          }
        };
        ee.on('onUpdateList', handler);
        return () => ee.off('onUpdateList', handler);
      })
    ),
});

