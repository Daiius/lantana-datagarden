
import { 
  data,
} from 'database/db/schema';

import {
  createSelectSchema,
} from 'drizzle-zod';


import { router, publicProcedure } from '../trpc';

import mitt from 'mitt';
import {
  get,
  list,
  update,
  add,
  remove,
} from '../lib/data';
import { createSubscription } from '../lib/common';

type Data = typeof data.$inferSelect;

type DataEvents = {
  onAdd: Data;
  onRemove: Pick<Data, 'id' | 'projectId' | 'columnGroupId'>;
  onUpdate: Data;
  onUpdateList: Pick<Data, 'projectId' | 'columnGroupId'> & {
    newList: Data[];
    newId?: number;
  };
}

export const ee = mitt<DataEvents>();

const selectSchema = createSelectSchema(data);

export const dataRouter = router({
  get: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true,
      columnGroupId: true,
      id: true,
    }))
    .query(async ({ input }) => await get(input)),
  list: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true,
      columnGroupId: true,
    }))
    .query(async ({ input }) => await list(input)),

  /**
   * 特定のフローに関連付けられたdataを取得します
   *
   * TODO これはtable表示時に必要になる動作なので
   * tablesルートに移動したい
   * 2025-03-23 時点で不使用なので一旦コメントアウト
   */
  //listByFlow: publicProcedure
  //  .input(z.object({
  //    projectId: z.string(),
  //    flowId: z.number(),
  //  }))
  //  .query(async ({ input }) => {
  //    const flow = await db.query.flows.findFirst({
  //      where: and(
  //        eq(flows.projectId, input.projectId), 
  //        eq(flows.id, input.flowId),
  //      )
  //    });
  //    if (flow == null) throw new Error(
  //      `cannot find flow with id ${input.flowId}`
  //    );
  //    const flatColumnGroupIds = flow.columnGroupIds.flatMap(g => g);
  //    return await db.query.data.findMany({
  //      where: and(
  //        eq(data.projectId, input.projectId),
  //        inArray(data.columnGroupId, flatColumnGroupIds),
  //      ),
  //    });
  //  }),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      const newData = await update(input);
      ee.emit('onUpdate', newData);
    }),
  onUpdate: publicProcedure
    .input(selectSchema.pick({ 
      id: true, 
      columnGroupId: true,
      projectId: true,
    }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onUpdate',
        filter: data => (
             data.id            === input.id
          && data.columnGroupId === input.columnGroupId
          && data.projectId     === input.projectId
        ),
      }) 
    ),
  // データ追加、削除などlist更新のイベント
  onUpdateList: publicProcedure
    .input(selectSchema.pick({ 
      columnGroupId: true,
      projectId: true,
    }))
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onUpdateList',
        filter: data => ( 
             data.columnGroupId === input.columnGroupId
          && data.projectId     === input.projectId
        ),
      })
    ),
  add: publicProcedure
    .input(selectSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      const newData = await add(input);
      ee.emit('onAdd', newData);
      const newList = await list(input);
      ee.emit('onUpdateList', { 
        projectId: input.projectId,
        columnGroupId: input.columnGroupId,
        newList,
        newId: newData.id,
      });
    }),
  remove: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      columnGroupId: true,
      id: true,
    }))
    .mutation(async ({ input }) => {
      const removedIds = await remove(input);
      ee.emit('onRemove', removedIds);

      const newList = await list(input);
      ee.emit('onUpdateList', {
        projectId: input.projectId,
        columnGroupId: input.columnGroupId,
        newList,
        newId: undefined,
      });
    }),
});

