import { eq, and } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

import { db } from 'database/db';
import {
  data,
  columns,
  validate,
} from 'database/db/schema';

import { list as listColumns } from './column';

export type Data = typeof data.$inferSelect;

export type Ids = Pick<Data, 'projectId'|'columnGroupId'|'id'>;
export type ParentIds = Pick<Data, 'projectId'|'columnGroupId'>;

export const dataSchema = createSelectSchema(data);

const whereIds = (ids: Ids) => and(
  eq(data.projectId, ids.projectId),
  eq(data.columnGroupId, ids.columnGroupId),
  eq(data.id, ids.id),
);

const whereParentIds = (parentIds: ParentIds) => and(
  eq(data.projectId, parentIds.projectId),
  eq(data.columnGroupId, parentIds.columnGroupId),
);

export const get = async (ids: Ids) => {
  const value = await db.query.data.findFirst({ where: whereIds(ids) });
  if (value == null) throw new Error(`cannot find data ${ids.id}`);
  return value;
}

export const list = async (parentIds: ParentIds) =>
await db.query.data.findMany({
  where: whereParentIds(parentIds),
  orderBy: data.id,
});

export const update = async (newData: Data) => {
  // 列名や型データの取得
  const relatedColumns = await db.select()
    .from(columns)
    .where(
      and(
        eq(columns.projectId, newData.projectId),
        eq(columns.columnGroupId, newData.columnGroupId),
      )
    );

  // 入力データのバリデーション
  Object.entries(newData.data).forEach(([k, v]) => {
    const column = relatedColumns.find(c => c.name === k);
    if (column == null) throw Error(`column ${k} does not exist`);
    if (!validate({ type: column.type, v })) {
      throw Error(`value ${v} is not valid for ${column.type}`); 
    }
  });

  // 入力データの書き込み
  await db.update(data).set(newData).where(whereIds(newData));
  return await get(newData);
};
/**
 * 指定された引数を元に、dataを追加します
 *
 * - columnGroupId からどのcolumnが含まれるべきか取得
 * - 関連するcolumnを取得してデータと照らし合わせる
 *   - 不足columnが有れば他もnullで追加、不適なcolumn名なら例外
 * - column関連のチェック・補完をしたデータを記録しnewIdを得る
 * - newIdでもってDataを取得、返却
 */
export const add = async (newData: Omit<Data, 'id'>) => {

  const relatedColumns = await listColumns(newData);
  if (relatedColumns.length === 0) throw new Error(
    `cannot add data with no columns`
  );

  const newDataWithCompletion = Object.fromEntries(
    relatedColumns.map(column => {
      const givenValue = newData.data[column.name];
      const v = givenValue === undefined
        ? null
        : givenValue;
      return [column.name, v];
    })
  );
  console.log(newDataWithCompletion);

  const newId = (
    await db.insert(data).values({
      ...newData,
      data: newDataWithCompletion,
    }).$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get new data id`
  );
  const addedData = await get({ ...newData, id: newId });
  return addedData;
};

export const remove = async (ids: Ids) =>
await db.delete(data).where(whereIds(ids));  

