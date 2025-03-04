
import { db } from 'database/db';
import { eq, and } from 'drizzle-orm';
import {
  flows,
  columnGroups,
} from 'database/db/schema';
//import { v7 as uuidv7 } from 'uuid';

type ColumnGroup = typeof columnGroups.$inferSelect;
type Flow = typeof flows.$inferSelect;
type FlowWithColumnGroup = Flow & { columnGroups: ColumnGroup[][] };

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { createSelectSchema } from 'drizzle-zod';
import { observable, } from '@trpc/server/observable';
import { 
  getNested,
  listNested,
} from '../lib/flow';

// TODO 型推論が上手くいかないので手動で設定、注意
const selectSchema = createSelectSchema(flows)
  .extend({
    columnGroupIds: z.array(z.array(z.number())),
  });


import mitt from 'mitt';
type FlowEvents = {
  onUpdate: FlowWithColumnGroup,
  onUpdateList: Pick<Flow, 'projectId'> & {
    flows: FlowWithColumnGroup[];
  }
}

export const ee = mitt<FlowEvents>();

export const flowRouter = router({
  /**
   * 指定されたのflowの情報を取得します
   */
  get: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true,
    }))
    .query(async ({ input }) => 
      await db.query.flows.findFirst({
        where: and(
          eq(flows.id, input.id),
          eq(flows.projectId, input.projectId),
        ),
      })
    ),
  /**
   * 指定されたのflowのネストされた情報を取得します
   */
  getNested: publicProcedure
    .input(selectSchema.pick({
      id: true,
      projectId: true,
    }))
    .query(async ({ input }) => {
      return await getNested(input);
    }),
  /**
   * プロジェクトに属するflowを列挙します
   */
  list: publicProcedure
    .input(z.object({
      projectId: z.string()
    }))
    .query(async ({ input }) =>
       await db.query.flows.findMany({
         where: eq(flows.projectId, input.projectId)
       })
    ),
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
      await db.transaction(async tx => {
        // input中のcolumnGroupIdsについて、
        // 既存の値かどうかチェックする
        const existingColumnGroupIds = (
          await tx.query.columnGroups.findMany({
            where: eq(columnGroups.projectId, input.projectId),
            columns: { id: true },
          })
        ).map(cg => cg.id);

        const invalidIds = input.columnGroupIds
          .flatMap(group => group)
          .filter(id => !existingColumnGroupIds.includes(id));
        if (invalidIds.length > 0) throw new Error(
          `these flow.columnGroupIds does not exist in db: ${invalidIds.map(s => `'${s}'`).toString()}`
        );
        
        // inputに従ってデータ更新 
        await tx.update(flows)
          .set(input)
          .where(
            and(
              eq(flows.id, input.id),
              eq(flows.projectId, input.projectId),
            )
          );
      });
      const newFlow = await getNested({
        id: input.id, projectId: input.projectId
      });
      if (newFlow == null) throw new Error(
        `cannot find flow ${input.id}`
      );
      ee.emit('onUpdate', newFlow);
    }),
  add: publicProcedure
    .input(selectSchema.omit({ id: true}))
    .mutation(async ({ input }) => {
      await db.insert(flows).values({ ...input });
      const newList= await listNested({ projectId: input.projectId });
      ee.emit(
        'onUpdateList',
        { projectId: input.projectId, flows: newList }
      );
    }),
  delete: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      id: true 
    }))
    .mutation(async ({ input }) => {
      await db.delete(flows).where(
        and(
          eq(flows.projectId, input.projectId),
          eq(flows.id, input.id),
        )
      );
      const newList= await listNested({ projectId: input.projectId });
      ee.emit(
        'onUpdateList',
        { projectId: input.projectId, flows: newList }
      );
    }),
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

