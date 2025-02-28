
import { db } from 'database/db';
import { 
  columnGroups,
  columns,
  data,
} from 'database/db/schema';
import { eq, and, asc } from 'drizzle-orm';

import {
  createInsertSchema,
  createSelectSchema,
} from 'drizzle-zod';

import { z } from 'zod';

import { router, publicProcedure } from '../trpc';
import { observable, } from '@trpc/server/observable';

import mitt from 'mitt';


const selectSchema = createSelectSchema(columnGroups);
const insertSchema = createInsertSchema(columnGroups);



//const literalUnionFromArray = 
//  <T extends readonly string[]>(values: T) =>
//    z.union(
//      values.map(v => z.literal(v)) as [
//        z.ZodLiteral<T[number]>,
//        z.ZodLiteral<T[number]>,
//        ...Array<z.ZodLiteral<T[number]>>
//      ]
//    );

export const getNestedColumnGroups = async ({
  projectId
}: {
  projectId: string
}) => await db.query.columnGroups.findMany({
  where: eq(columnGroups.projectId, projectId),
  with: {
    columns: {
      orderBy: [asc(columns.id)]
    },
  }
});
export const getNestedColumnGroup = async ({
  projectId,
  id,
}: {
  projectId: string;
  id: string;
}) => await db.query.columnGroups.findFirst({
  where: and(
    eq(columnGroups.projectId, projectId),
    eq(columnGroups.id, id),
  ),
  with: {
    columns: {
      orderBy: [asc(columns.id)]
    }
  }
});

type Element<T> = T extends (infer U)[] ? U : never;
type NestedColumnGroup = Element<Awaited<ReturnType<
  typeof getNestedColumnGroups>
>>

type ColumnGroupEvents = {
  onUpdate:     NestedColumnGroup,
  onUpdateList: NestedColumnGroup[],
}
export const ee = mitt<ColumnGroupEvents>();

export const columnGroupRouter = router({
  /**
   * 指定したidのカテゴリを取得します
   */
  get: publicProcedure
    .input(z.object({ 
      id: z.string(),
      projectId: z.string(),
    }))
    .output(selectSchema.optional())
    .query(async ({ input }) => 
       await db.query.columnGroups.findFirst({
         where: eq(columnGroups.id, input.id)
       })
    ),
  /**
   * 指定したprojectIdを持つカテゴリを取得します
   */
  listNested: publicProcedure
    .input(z.object({ 
      projectId: z.string(), 
    }))
    .query(async ({ input }) =>
      await db.query.columnGroups.findMany({
        where: eq(columnGroups.projectId, input.projectId),
        orderBy: [asc(columnGroups.id)],
        with: {
          columns: {
            orderBy: [asc(columns.id)],
          }
        }
      })
    ),
  list: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) =>
      await db.query.columnGroups.findMany({
        where: eq(columnGroups.projectId, input.projectId),
        orderBy: [asc(columnGroups.id)],
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
      await db.update(columnGroups)
        .set({ ...input })
        .where(
          and(
            eq(columnGroups.id, input.id),
            eq(columnGroups.projectId, input.projectId)
          )
        );
      const nestedColumnGroup = await getNestedColumnGroup(input);
      if (nestedColumnGroup == null) 
        throw new Error('failed to get updated nested column group');
      ee.emit('onUpdate', nestedColumnGroup);
    }),
  /**
   * 指定したidのカテゴリが更新された際に発生するイベントです
   */
  onUpdate: publicProcedure
    .input(z.object({ id: z.string(), projectId: z.string() }))
    .subscription(({ input }) =>
      observable<ColumnGroupEvents['onUpdate']>(emit => {
        const handler = (data: ColumnGroupEvents['onUpdate']) => {
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
    .input(selectSchema.partial({ id: true }))
    .mutation(async ({ input }) => {
      await db.insert(columnGroups).values({
        ...input
      });
      const nestedColumnGroups = await getNestedColumnGroups(input);
      ee.emit('onUpdateList', nestedColumnGroups);
    }),
  /**
   * 指定したColumnGroupを削除します
   *
   * 関連付けられたColumnsもDataも全て削除されます
   */
  remove: publicProcedure
    .input(z.object({
      id: z.string(),
      projectId: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.transaction(async tx => {
        await tx.delete(data).where(
          and(
            eq(data.columnGroupId, input.id),
            eq(data.projectId, input.projectId),
          ),
        );
        await tx.delete(columns).where(
          and(
            eq(columns.columnGroupId, input.id),
            eq(columns.projectId, input.projectId),
          )
        );
        await tx.delete(columnGroups).where(
          and(
            eq(columnGroups.id, input.id),
            eq(columnGroups.projectId, input.projectId),
          )
        );
      });
      const nestedColumnGroups = await getNestedColumnGroups(input);
      ee.emit('onUpdateList', nestedColumnGroups);
    }) ,
  /**
   * 新しいカテゴリが追加された際、同じプロジェクトに属する
   * 一連のcategoryの配列を返します
   */
  onUpdateList: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .subscription(({ input }) =>
      observable<ColumnGroupEvents['onUpdateList']>(emit => {
        const handler = (arg: ColumnGroupEvents['onUpdateList']) => {
          if (arg[0]?.projectId === input.projectId) {
            emit.next(arg);
          }
        };
        ee.on('onUpdateList', handler);
        return () => ee.off('onUpdateList', handler);
      })
    ),
});

