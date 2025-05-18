import { db } from 'database/db';
import {
  measurementColumns
} from 'database/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export type MeasurementColumn = 
  typeof measurementColumns.$inferSelect;

import { createSelectSchema } from 'drizzle-zod';
export const measurementColumnSchema = createSelectSchema(
  measurementColumns
);

export type Ids = Pick<MeasurementColumn, 'projectId'|'columnGroupId'|'id'>;
export type ParentIds = {
  projectId: MeasurementColumn['projectId'];
  columnGroupId: MeasurementColumn['columnGroupId'] | MeasurementColumn['columnGroupId'][];
}

const whereIds = (ids: Ids) => and(
  eq(measurementColumns.projectId, ids.projectId),
  eq(measurementColumns.columnGroupId, ids.columnGroupId),
  eq(measurementColumns.id, ids.id),
);

const whereParentIds = (parentIds: ParentIds) => and(
  eq(measurementColumns.projectId, parentIds.projectId),
  Array.isArray(parentIds.columnGroupId)
  ? inArray(measurementColumns.columnGroupId, parentIds.columnGroupId)
  : eq(measurementColumns.columnGroupId, parentIds.columnGroupId),
);

export const get = async (ids: Ids) => {
  const value = await db.query.measurementColumns.findFirst({
    where: whereIds(ids)
  });
  if (value == null) throw new Error(
    `cannot get measurement column ${ids.id}`
  );
  return value;
}

export const list = async (parentIds: ParentIds) =>
await db.query.measurementColumns.findMany({
  where: whereParentIds(parentIds),
  orderBy: [measurementColumns.sort, measurementColumns.id],
});

export const add = async (
  params: Omit<MeasurementColumn, 'id'>
) => {
  const newId = (
    await db.insert(measurementColumns).values(params)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get new id of measurementColumn`
  );
  return await get({ ...params, id: newId });
};

export const update = async (params: MeasurementColumn) => {
  await db.update(measurementColumns).set(params).where(whereIds(params));
  return await get(params);
};

export const remove = async (ids: Ids) =>
await db.delete(measurementColumns).where(whereIds(ids));

