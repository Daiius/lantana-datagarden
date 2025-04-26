
import { projects } from 'database/db/schema';

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

import {
  get,
  list,
  update,
} from './lib/project';

export const ee = mitt<ProjectEvents>();

const selectSchema = createSelectSchema(projects);

export const projectRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => await get(input)),
  list: publicProcedure.query(async () => await list()),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      const newProject = await update(input);
      ee.emit('onUpdate', newProject);
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

