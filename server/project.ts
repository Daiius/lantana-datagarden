
import { db } from 'database/db';
import { projects } from 'database/db/schema';
import { eq } from 'drizzle-orm';

import {
  createInsertSchema,
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from './trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
type ProjectEvents = {
  onUpdate: z.infer<typeof updateSchema>,
}

export const ee = mitt<ProjectEvents>();

const selectSchema = createSelectSchema(projects);
const insertSchema = createInsertSchema(projects);
const updateSchema = insertSchema.extend({
  id: selectSchema.shape.id,
});

export const projectRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(selectSchema.optional())
    .query(async ({ input }) => 
       await db.query.projects.findFirst({
         where: eq(projects.id, input.id)
       })
    ),
  /** TODO ユーザが属するプロジェクトだけ返却する様に！ */
  list: publicProcedure
    .query(async () =>
      await db.query.projects.findMany()
    ),
  update: publicProcedure
    .input(updateSchema)
    .mutation(async ({ input }) => {
      await db.update(projects)
        .set({ ...input })
        .where(eq(projects.id, input.id));
      ee.emit('onUpdate', { ...input });
    }),
  onUpdate: publicProcedure
    .subscription(() =>
      observable<ProjectEvents['onUpdate']>(emit => {
        const handler = (data: ProjectEvents['onUpdate']) => {
          emit.next({ ...data });
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    )
});

