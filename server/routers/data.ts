
import { db } from 'database/db';
import { 
  data,
  columnDefinitions,
  validate,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
type DataEvents = {
  onUpdate:     z.infer<typeof selectSchema>,
  onUpdateList: z.infer<typeof selectSchema>[],
}

export const ee = mitt<DataEvents>();

const selectSchema = createSelectSchema(data);

export const dataRouter = router({
  get: publicProcedure
    .input(z.object({ 
      projectId: z.string(),
      categoryId: z.string(),
      id: z.string(),
    }))
    .query(async ({ input }) => 
       await db.query.data.findFirst({
         where: and(
           eq(data.projectId, input.projectId),
           eq(data.categoryId, input.categoryId),
           eq(data.id, input.id),
         )
       })
    ),
  list: publicProcedure
    .input(z.object({ 
      projectId: z.string(),
      categoryId: z.string(),
    }))
    .query(async ({ input }) =>
      await db.query.data.findMany({
        where: and(
          eq(data.projectId, input.projectId),
          eq(data.categoryId, input.categoryId),
        ),
        orderBy: data.id,
      })
    ),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      // 列名や型データの取得
      const relatedColumns = await db.select()
        .from(columnDefinitions)
        .where(
          and(
            eq(columnDefinitions.projectId, input.projectId),
            eq(columnDefinitions.categoryId, input.categoryId),
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
            eq(data.categoryId, input.categoryId),
            eq(data.id, input.id),
          )
        );

      // 変更通知
      ee.emit('onUpdate', input);
    }),
  onUpdate: publicProcedure
    .input(z.object({ 
      id: z.string(), 
      categoryId: z.string(),
      projectId: z.string(),
    }))
    .subscription(({ input }) =>
      observable<DataEvents['onUpdate']>(emit => {
        const handler = (data: DataEvents['onUpdate']) => {
          if ( data.id         === input.id
            && data.categoryId === input.categoryId
            && data.projectId  === input.projectId
          ) {
            emit.next({ ...data });
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    ),
  onUpdateList: publicProcedure
    .input(z.object({ 
      categoryId: z.string(),
      projectId: z.string(),
    }))
    .subscription(({ input }) =>
      observable<DataEvents['onUpdateList']>(emit => {
        const handler = (data: DataEvents['onUpdateList']) => {
          if ( data[0]?.categoryId === input.categoryId
            && data[0]?.projectId  === input.projectId
          ) {
            emit.next(data);
          }
        };
        ee.on('onUpdateList', handler);
        return () => ee.off('onUpdateList', handler);
      })
    ),
});

