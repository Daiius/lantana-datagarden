
import { db } from 'database/db';
import { 
  columnDefinitions,
  data,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from './trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
type ColumnEvents = {
  onUpdate: z.infer<typeof selectSchema>,
}

export const ee = mitt<ColumnEvents>();

const selectSchema = createSelectSchema(columnDefinitions);

export const columnRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    //.output(selectSchema.optional())
    .query(async ({ input }) => 
       await db.query.columnDefinitions.findFirst({
         where: eq(columnDefinitions.id, input.id)
       })
    ),
  /** TODO ユーザが属するプロジェクトだけ返却する様に！ */
  list: publicProcedure
    .query(async () =>
      await db.query.columnDefinitions.findMany()
    ),
  updateName: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
  
      await db.transaction(async tx => {
        const lastData = await tx.query.columnDefinitions.findFirst({
          where: and(
            eq(columnDefinitions.id, input.id),
            eq(columnDefinitions.categoryId, input.categoryId),
            eq(columnDefinitions.projectId, input.projectId),
          )
        });

        if (lastData == null) 
          throw new Error(`cannot find column with id ${input.id}`);

        const lastName = lastData.name;
        const newName = input.name;

        // 確実に名前だけ更新する
        await tx.update(columnDefinitions)
          .set({ ...lastData, name: newName })
          .where(
            and(
              eq(columnDefinitions.id, input.id),
              eq(columnDefinitions.categoryId, input.categoryId),
              eq(columnDefinitions.projectId, input.projectId),
            )
          );

        // TODO CAUTION WARNING WEIRED NASTY
        // なんかもうリソース使いまくるのが目に見える...
        // JSONのキー名だけ変更する機能が無いので、
        // 全部手元にロードして元データを削除し、
        // 更新後のデータを記録しなおすしかないっぽい
        const dataToUpdate = await db.select().from(data)
          .where(
            and(
              eq(data.categoryId, input.categoryId),
              eq(data.projectId, input.projectId),
            )
          );

        const updatedData = dataToUpdate.map(d => ({
          ...d, 
          data: 
            Object.entries(d.data)
              .map(([k, v]) => 
                ({ [k === lastName ? newName : k]: v })
              )
              .reduce((acc, curr) => ({ ...acc, ...curr }))
        }));

        console.log('dataToUpdate:\n%o', dataToUpdate);
        console.log('updatedData :\n%o', updatedData);

        for (const d of updatedData ) {
          await db.update(data)
            .set(d)
            .where(
              and(
                eq(data.id, d.id),
                eq(data.categoryId, d.categoryId),
                eq(data.projectId, d.projectId),
              )
            )
        }
      })

      ee.emit('onUpdate', { ...input });
    }),
  onUpdate: publicProcedure
    .input(z.object({ 
      id: z.string(), 
      categoryId: z.string(),
    }))
    .subscription(({ input }) =>
      observable<ColumnEvents['onUpdate']>(emit => {
        const handler = (data: ColumnEvents['onUpdate']) => {
          if ( data.id         === input.id
            && data.categoryId === input.categoryId
          ) {
            emit.next({ ...data });
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    )
});

