import {
  flows,
  columnGroups,
} from 'database/db/schema';

type ColumnGroup = typeof columnGroups.$inferSelect;
type Flow = typeof flows.$inferSelect;
type FlowWithColumnGroup = Flow & { columnGroups: ColumnGroup[][] };

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

// TODO 型推論が上手くいかないので手動で設定、注意
const selectSchema = createSelectSchema(flows)
  .extend({
    columnGroupWithGroupings: z.array(z.array(z.object({
      id: z.number(),
      grouping: z.string(),
    }))),
  });


import mitt from 'mitt';
type FlowEvents = {
  onUpdate: FlowWithColumnGroup,
  onAdd: FlowWithColumnGroup,
  onRemove: Pick<Flow, 'id' | 'projectId'>,
  onUpdateList: Pick<Flow, 'projectId'> & {
    flows: FlowWithColumnGroup[];
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
      observable<FlowEvents['onAdd']>(emit => {
        const handler = (e: FlowEvents['onAdd']) => {
          if (e.projectId === input.projectId) { emit.next(e); }
        };
        ee.on('onAdd', handler);
        return () => ee.off('onAdd', handler);
      })
    ),
  onRemove: publicProcedure
    .input(selectSchema.pick({ projectId: true }))
    .subscription(({ input }) =>
      observable<FlowEvents['onRemove']>(emit => {
        const handler = (e: FlowEvents['onRemove']) => {
          if (e.projectId === input.projectId) { emit.next(e) }
        };
        ee.on('onRemove', handler);
        return () => ee.off('onRemove', handler);
      })
    ),
  onUpdate: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      id: true 
    }))
    .subscription(({ input }) =>
      observable<FlowEvents['onUpdate']>(emit => {
        const handler = (flow: FlowEvents['onUpdate']) => {
          if ( flow.id        === input.id
            && flow.projectId === input.projectId
          ) {
            emit.next(flow);
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
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

