
import { db } from 'database/db';
import { CATEGORY_TYPES, COLUMN_DEFINITION_DATA_TYPES, categories } from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import {
  createInsertSchema,
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';
type CategoryEvents = {
  onUpdate:     z.infer<typeof selectSchema>,
  onUpdateList: z.infer<typeof selectSchema>[],
}

export const ee = mitt<CategoryEvents>();

const selectSchema = createSelectSchema(categories);
const insertSchema = createInsertSchema(categories);

const literalUnionFromArray = 
  <T extends readonly string[]>(values: T) =>
    z.union(
      values.map(v => z.literal(v)) as [
        z.ZodLiteral<T[number]>,
        z.ZodLiteral<T[number]>,
        ...Array<z.ZodLiteral<T[number]>>
      ]
    );

export const categoryRouter = router({
  /**
   * 指定したidのカテゴリを取得します
   */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(selectSchema.optional())
    .query(async ({ input }) => 
       await db.query.categories.findFirst({
         where: eq(categories.id, input.id)
       })
    ),
  /**
   * 指定したprojectIdを持つカテゴリを取得します
   */
  list: publicProcedure
    .input(z.object({ 
      projectId: z.string(), 
      type: literalUnionFromArray(CATEGORY_TYPES).optional(),
    }))
    .query(async ({ input }) =>
      await db.query.categories.findMany({
        where: and(
          eq(categories.projectId, input.projectId),
          input.type ? eq(categories.type, input.type) : undefined,
        )
      })
    ),
  /**
   * 指定したidのカテゴリを更新します
   * onUpdateイベントが発行されます
   */
  update: publicProcedure
    .input(selectSchema)
    .mutation(async ({ input }) => {
      console.log('input: %o', input);
      await db.update(categories)
        .set({ ...input })
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.projectId, input.projectId)
          )
        ) ;
      ee.emit('onUpdate', { ...input });
    }),
  /**
   * 指定したidのカテゴリが更新された際に発生するイベントです
   */
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
    ),
  /**
   * 新しいカテゴリを追加します
   *
   * 新しいデータが追加されると、
   * onAddイベントが発行され、同じprojectIdに紐づけられた
   * 一連のcategoriesを取得できます
   */
  add: publicProcedure
    .input(insertSchema)
    .mutation(async ({ input }) => {
      await db.insert(categories).values({
        ...input
      });
      const relatedCategories = await db.select()
        .from(categories)
        .where(eq(categories.projectId, input.projectId));
      ee.emit('onUpdateList', relatedCategories);
    }),
  /**
   * 新しいカテゴリが追加された際、同じプロジェクトに属する
   * 一連のcategoryの配列を返します
   */
  onUpdateList: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .subscription(({ input }) =>
      observable<CategoryEvents['onUpdateList']>(emit => {
        const handler = (arg: CategoryEvents['onUpdateList']) => {
          if (arg[0]?.projectId === input.projectId) {
            emit.next(arg);
          }
        };
        ee.on('onUpdateList', handler);
        return () => ee.off('onUpdateList', handler);
      })
    ),
});

