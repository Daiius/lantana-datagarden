
import { db } from 'database/db';
import { 
  data,
  columns,
  validate,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import {
  createSelectSchema,
  //createInsertSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

//import { v7 as uuidv7 } from 'uuid';

type Data = typeof data.$inferSelect;

import mitt from 'mitt';
type DataEvents = {
  onUpdate:     z.infer<typeof selectSchema>,
  onUpdateList: Pick<Data, 'projectId' | 'columnGroupId'> & {
    newList: z.infer<typeof selectSchema>[]
  },
}

export const ee = mitt<DataEvents>();

const selectSchema = createSelectSchema(data);
//const insertSchema = createInsertSchema(data);

export const dataRouter = router({
  get: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true,
      columnGroupId: true,
      id: true,
    }))
    .query(async ({ input }) => 
       await db.query.data.findFirst({
         where: and(
           eq(data.projectId, input.projectId),
           eq(data.columnGroupId, input.columnGroupId),
           eq(data.id, input.id),
         )
       })
    ),
  list: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true,
      columnGroupId: true,
    }))
    .query(async ({ input }) =>
      await db.query.data.findMany({
        where: and(
          eq(data.projectId, input.projectId),
          eq(data.columnGroupId, input.columnGroupId),
        ),
        orderBy: data.id,
      })
    ),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      // 列名や型データの取得
      const relatedColumns = await db.select()
        .from(columns)
        .where(
          and(
            eq(columns.projectId, input.projectId),
            eq(columns.columnGroupId, input.columnGroupId),
          )
        );

      // 入力データのバリデーション
      Object.entries(input.data).forEach(([k, v]) => {
        const column = relatedColumns.find(c => c.name === k);
        if (column == null) throw Error(`column ${k} does not exist`);
        if (!validate({ type: column.type, v })) {
          throw Error(`value ${v} is not valid for ${column.type}`); 
        }
      });

      // 入力データの書き込み
      await db.update(data)
        .set(input)
        .where(
          and(
            eq(data.projectId, input.projectId),
            eq(data.columnGroupId, input.columnGroupId),
            eq(data.id, input.id),
          )
        );

      // 変更通知
      ee.emit('onUpdate', input);
    }),
  onUpdate: publicProcedure
    .input(selectSchema.pick({ 
      id: true, 
      columnGroupId: true,
      projectId: true,
    }))
    .subscription(({ input }) =>
      observable<DataEvents['onUpdate']>(emit => {
        const handler = (data: DataEvents['onUpdate']) => {
          if ( data.id            === input.id
            && data.columnGroupId === input.columnGroupId
            && data.projectId     === input.projectId
          ) {
            emit.next({ ...data });
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    ),
  // データ追加、削除などlist更新のイベント
  onUpdateList: publicProcedure
    .input(selectSchema.pick({ 
      columnGroupId: true,
      projectId: true,
    }))
    .subscription(({ input }) =>
      observable<DataEvents['onUpdateList']>(emit => {
        const handler = (data: DataEvents['onUpdateList']) => {
          if ( data.columnGroupId === input.columnGroupId
            && data.projectId     === input.projectId
          ) {
            emit.next(data);
          }
        };
        ee.on('onUpdateList', handler);
        return () => ee.off('onUpdateList', handler);
      })
    ),
  add: publicProcedure
    .input(selectSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      await db.insert(data).values(input);
      // list からコードを持ってきただけなので
      // 改良の余地ありかも
      const newList = await db.query.data.findMany({
        where: and(
          eq(data.projectId, input.projectId),
          eq(data.columnGroupId, input.columnGroupId),
        ),
        orderBy: data.id,
      })
      ee.emit('onUpdateList', { 
        projectId: input.projectId,
        columnGroupId: input.columnGroupId,
        newList,
      });
    }),
  remove: publicProcedure
    .input(selectSchema.pick({ 
      projectId: true, 
      columnGroupId: true,
      id: true,
    }))
    .mutation(async ({ input }) => {
      await db.delete(data).where(
        and(
          eq(data.projectId, input.projectId),
          eq(data.columnGroupId, input.columnGroupId),
          eq(data.id, input.id),
        )
      );  
      // list からコードを持ってきただけなので
      // 改良の余地ありかも
      const newList = await db.query.data.findMany({
        where: and(
          eq(data.projectId, input.projectId),
          eq(data.columnGroupId, input.columnGroupId),
        ),
        orderBy: data.id,
      })
      ee.emit('onUpdateList', {
        projectId: input.projectId,
        columnGroupId: input.columnGroupId,
        newList
      });
    }),
});

