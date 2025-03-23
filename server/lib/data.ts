import { db } from 'database/db';
import {
  data,
  columns,
  validate,
} from 'database/db/schema';

import { eq, and } from 'drizzle-orm';

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
  : Pick<Data, 'projectId'|'columnGroupId'>
) =>
  await db.query.data.findMany({
    where: and(
      eq(data.projectId, projectId),
      eq(data.columnGroupId, columnGroupId),
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

export const add = async (newData: Omit<Data, 'id'>) => {
  const newId = (
    await db.insert(data).values(newData).$returningId()
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

