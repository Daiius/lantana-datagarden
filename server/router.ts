
import { db } from 'database/db';
import { projects } from 'database/db/schema';
import { eq } from 'drizzle-orm';
//import { on } from 'node:events';

import { z } from  'zod';

import { publicProcedure, router } from './trpc';
import { observable, } from '@trpc/server/observable';

// 型指定できない、残念
import { EventEmitter } from 'events';
declare module 'events' {
  class EventEmitter {
    emit(
      eventName: 'onUpdateProjectTitle', 
      args: { projectId: string, newTitle: string },
    ): void
  }
}

export const projectEventEmitter = new EventEmitter();

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
        //...input

      });
    }),
  onUpdateProjectTitle: publicProcedure
    //.input(z.object({ projectId: z.string() }))
    //.output(z.object({ projectId: z.string(), newTitle: z.string() }))
    .subscription(({ input }) => {
      return observable<{ projectId: string, newTitle: string }>(emit => {
        const onUpdate = ({projectId, newTitle}: { projectId: string, newTitle: string }) => {
          emit.next({ projectId, newTitle });
        };

        projectEventEmitter.on('onUpdateProjectTitle', onUpdate);

        return () => projectEventEmitter.off('onUpdateProjectTitle', onUpdate);
      });
    }),

});

export type AppRouter = typeof appRouter;

