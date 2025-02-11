
import { db } from 'database/db';
import { columnDefinitions } from 'database/db/schema';
import { eq } from 'drizzle-orm';

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
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      await db.update(columnDefinitions)
        .set({ ...input })
        .where(eq(columnDefinitions.id, input.id));
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

