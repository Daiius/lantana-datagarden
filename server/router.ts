
import { db } from 'database/db';
import { projects } from 'database/db/schema';
import { eq } from 'drizzle-orm';
import { on } from 'node:events';

import { z } from  'zod';

import { publicProcedure, router } from './trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
import { EventEmitter } from 'node:events';
type ProjectEvents = {
  onUpdateProjectTitle: { projectId: string, newTitle: string },
}

//export const projectEventEmitter = mitt<ProjectEvents>();
const projectEventEmitter = new EventEmitter();

export const appRouter = router({ 
  greeting: publicProcedure
    .output(z.string())
    .query(() => 'hello, tPRC!'),
  projectTitle: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .output(z.string().optional())
    .query(async ({ input }) => {
      const project = await db.query.projects.findFirst({ 
        where: eq(projects.id, input.projectId)
      });
      return project?.name;
    }),
  updateProjectTitle: publicProcedure
    .input(z.object({ projectId: z.string(), newTitle: z.string() }))
    .mutation(async ({ input }) => {
      console.log('updateProjectTitle()');
      await db.update(projects)
        .set({ name: input.newTitle })
        .where(eq(projects.id, input.projectId));
      projectEventEmitter.emit('onUpdateProjectTitle', {
        ...input
      });
    }),
  onUpdateProjectTitle: publicProcedure
    //.input(z.object({ randomNumber: z.number() }))
    //.output(z.object({ randomNumber: z.number() }))
    .subscription(() => 
      observable<{ randomNumber: number }>(emit => {
        const handler = () => {
          emit.next({ randomNumber: Math.random() });
        };
        projectEventEmitter.on('onUpdateProjectTitle', handler);

        return () =>  {
          projectEventEmitter.off('onUpdateProjectTitle', handler)
        };
      })
    ),

});

export type AppRouter = typeof appRouter;

