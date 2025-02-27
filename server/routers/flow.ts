
import { db } from 'database/db';
import { eq, and, inArray } from 'drizzle-orm';
import {
  flows,
  columnGroups,
} from 'database/db/schema';

type ColumnGroup = typeof columnGroups.$inferSelect;
type Flow = typeof flows.$inferSelect;

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { createSelectSchema } from 'drizzle-zod';

const selectSchema = createSelectSchema(flows)
  .extend({
    columnGroupIds: z.array(z.array(z.string())),
  });

import mitt from 'mitt';
type FlowEvents = {
}

export const ee = mitt<FlowEvents>();

export const flowRouter = router({
  /**
   * 指定されたのflowの情報を取得します
   */
  get: publicProcedure
    .input(z.object({
      id: z.string(),
      projectId: z.string(),
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
      // projectに属するflowsをまとめて取得します
      const relatedFlows = await db.query.flows.findMany({
        where: eq(flows.projectId, input.projectId)
      });
      // 関連するcolumnGroupをまとめて取得します
      // TODO Map化して検索を易化する方がよいかも
      const relatedColumnGroups = await db.query.columnGroups
        .findMany({
          where: eq(columnGroups.projectId, input.projectId),
        });
      // それらのcolumnGroupsをネストされたオブジェクトに置き換えます
      const nestedRelatedFlows = relatedFlows
        .map(flow => ({
          ...flow,
          columnGroups:
            flow.columnGroupIds.map(group =>
              group.flatMap(id =>
                relatedColumnGroups.find(cg => cg.id === id)
                ?? []
              ) // undefined を値からも型からも取り除くイディオム
            )
        }));
      return nestedRelatedFlows;
    }),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => 
      await db.update(flows)
        .set(input)
        .where(
          and(
            eq(flows.id, input.id),
            eq(flows.projectId, input.projectId),
          )
        )
    ),
});

