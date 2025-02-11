
import { db } from 'database/db';
import { projects } from 'database/db/schema';
import { eq } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from './trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
type ProjectEvents = {
  onUpdate: z.infer<typeof selectSchema>,
}

export const ee = mitt<ProjectEvents>();

const selectSchema = createSelectSchema(projects);

export const projectRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    //.output(selectSchema.optional())
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
    .input(selectSchema)
    .mutation(async ({ input }) => {
      await db.update(projects)
        .set({ ...input })
        .where(eq(projects.id, input.id));
      ee.emit('onUpdate', { ...input });
    }),
  onUpdate: publicProcedure
    .input(z.object({ id: z.string() }))
    .subscription(({ input }) =>
      observable<ProjectEvents['onUpdate']>(emit => {
        const handler = (data: ProjectEvents['onUpdate']) => {
          if (data.id === input.id) {
            emit.next({ ...data });
          }
        };
        ee.on('onUpdate', handler);
        return () => ee.off('onUpdate', handler);
      })
    )
});

