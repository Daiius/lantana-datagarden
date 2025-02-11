
import { db } from 'database/db';
import { categories } from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from './trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
type CategoryEvents = {
  onUpdate: z.infer<typeof selectSchema>,
}

export const ee = mitt<CategoryEvents>();

const selectSchema = createSelectSchema(categories);

export const categoryRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(selectSchema.optional())
    .query(async ({ input }) => 
       await db.query.categories.findFirst({
         where: eq(categories.id, input.id)
       })
    ),
  list: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) =>
      await db.query.categories.findMany({
        where: eq(categories.projectId, input.projectId)
      })
    ),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      await db.update(categories)
        .set({ ...input })
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.projectId, input.projectId)
          )
        );
      ee.emit('onUpdate', { ...input });
    }),
  onUpdate: publicProcedure
    .input(z.object({ id: z.string(), projectId: z.string() }))
    .subscription(({ input }) =>
      observable<CategoryEvents['onUpdate']>(emit => {
        const handler = (data: CategoryEvents['onUpdate']) => {
          if ( data.id === input.id 
            && data.projectId === input.projectId
          ) {
            emit.next({ ...data });
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    )
});

