
import { db } from 'database/db';
import { 
  CATEGORY_TYPES,
  columnDefinitions,
  data,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import {
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

import { 
  updateName,
  updateType,
} from '../lib/column';

import mitt from 'mitt';
type ColumnEvents = {
  onUpdate: z.infer<typeof selectSchema>,
  onUpdateList: z.infer<typeof selectSchema>[],
}

export const ee = mitt<ColumnEvents>();

const selectSchema = createSelectSchema(columnDefinitions);

const literalUnionFromArray = 
  <T extends readonly string[]>(values: T) =>
    z.union(
      values.map(v => z.literal(v)) as [
        z.ZodLiteral<T[number]>,
        z.ZodLiteral<T[number]>,
        ...Array<z.ZodLiteral<T[number]>>
      ]
    );

export const columnRouter = router({
  /** 単一の列データを取得します */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    //.output(selectSchema.optional())
    .query(async ({ input }) => 
       await db.query.columnDefinitions.findFirst({
         where: eq(columnDefinitions.id, input.id)
       })
    ),
  /** 指定したカテゴリに属する列データを取得します */
  list: publicProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ input }) =>
      await db.query.columnDefinitions.findMany({
        where: eq(columnDefinitions.categoryId, input.categoryId),
        orderBy: columnDefinitions.id,
      })
    ),
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {

      const lastData = await db.query.columnDefinitions.findFirst({
        where: and(
          eq(columnDefinitions.id, input.id),
          eq(columnDefinitions.categoryId, input.categoryId),
          eq(columnDefinitions.projectId, input.projectId),
        )
      });

      if (lastData == null) 
        throw new Error(`cannot find column with id ${input.id}`);

      if (lastData.name !== input.name) {
        const oldName = lastData.name;
        const newName = input.name;
        await updateName({
          id: input.id, 
          projectId: input.projectId, 
          categoryId: input.categoryId,
          oldName,
          newName,
        });
      }
      
      if (lastData.type !== input.type) {
        const oldType = lastData.type;
        const newType = input.type;
        await updateType({
          id: input.id,
          projectId: input.projectId,
          categoryId: input.categoryId,
          columnName: input.name,
          oldType,
          newType,
        });
      }

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
    ),
  onUpdateList: publicProcedure
    .input(z.object({ categoryId: z.string() }))
    .subscription(({ input }) =>
      observable<ColumnEvents['onUpdateList']>(emit => {
        const handler = (data: ColumnEvents['onUpdateList']) => {
          if (data[0]?.categoryId === input.categoryId) {
            emit.next(data);
          }
        };
        ee.on('onUpdateList', handler);
        return () => ee.off('onUpdateList', handler);
      })
    ),
});

