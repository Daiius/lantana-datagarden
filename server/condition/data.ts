
import { 
  data,
} from 'database/db/schema';

import { z } from 'zod';
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
  onRemove: { 
    id: number; 
    projectId: string;
    columnGroupId: number | number[]; 
  };
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
    .input(
      z.object({ 
        projectId: z.string(), 
        columnGroupId: z.union([
          z.number(),
          z.array(z.number()),
        ])
      })
    )
    .query(async ({ input }) => await list(input)),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      const newData = await update(input);
      ee.emit('onUpdate', newData);
    }),
  // 特定 id のデータが更新されたことを通知するイベント
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
  onAdd: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        columnGroupId: z.union([
          z.number(),
          z.array(z.number()),
        ]),
      })
    )
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onAdd',
        filter: data => (
             data.projectId === input.projectId
          && Array.isArray(input.columnGroupId)
             ? input.columnGroupId.includes(data.columnGroupId)
             : data.columnGroupId === input.columnGroupId
        ),
      })
    ),
  onRemove: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        columnGroupId: z.union([
          z.number(),
          z.array(z.number())
        ]),
      })
    )
    .subscription(({ input }) =>
      createSubscription({
        eventEmitter: ee,
        eventName: 'onRemove',
        filter: data => (
             data.projectId === input.projectId
          && data.columnGroupId === input.columnGroupId
        ),
      })
    ),
});

