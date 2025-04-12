import { db } from 'database/db';
import {
  data,
  columns,
  validate,
  JsonData,
} from 'database/db/schema';

import { eq, and, inArray } from 'drizzle-orm';

import { getNested as getColumnGroup } from './columnGroup';

type Data = typeof data.$inferSelect;

export const get = async (
  { id, projectId, columnGroupId }
  : Pick<Data, 'id'|'projectId'|'columnGroupId'>
) =>
  await db.query.data.findFirst({
    where: and(
      eq(data.projectId, projectId),
      eq(data.columnGroupId, columnGroupId),
      eq(data.id, id),
    )
  });

export const list = async (
  { projectId, columnGroupId }
  : {
    projectId: string;
    columnGroupId: number | number[];
  }
) =>
  await db.query.data.findMany({
    where: and(
      eq(data.projectId, projectId),
      Array.isArray(columnGroupId)
      ? inArray(data.columnGroupId, columnGroupId)
      : eq(data.columnGroupId, columnGroupId),
    ),
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
  await db.update(data)
    .set(newData)
    .where(
      and(
        eq(data.projectId, newData.projectId),
        eq(data.columnGroupId, newData.columnGroupId),
        eq(data.id, newData.id),
      )
    );
  const updatedData = await get(newData);
  if (updatedData == null) throw new Error(
    `cannot find updated data ${newData.id}`
  );
  return updatedData;
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

  const relatedColumnGroup = await getColumnGroup({
    projectId: newData.projectId,
    id: newData.columnGroupId,
  });
  if (relatedColumnGroup == null) throw new Error(
    `cannot find related columnGroup: ${newData.columnGroupId}`
  );

  Object.keys(newData.data).forEach(columnName => {
    if (
      !(columnName in relatedColumnGroup.columns.map(c => c.name))
    ) {
      throw new Error(
        `column ${columnName} is not defined in columnGroup ${relatedColumnGroup.id}`
      );
    }
  });

  const newDataWithCompletion = Object.fromEntries(
    relatedColumnGroup.columns.map(column => {
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
  if (addedData == null) throw new Error(
    `cannot get new data ${newId}`
  );
  return addedData;
};

export const remove = async (
  { id, projectId, columnGroupId }
  : Pick<Data, 'id' | 'projectId' | 'columnGroupId'>
) => {
  await db.delete(data).where(
    and(
      eq(data.projectId, projectId),
      eq(data.columnGroupId, columnGroupId),
      eq(data.id, id),
    )
  );  
  return { id, projectId, columnGroupId };
};

