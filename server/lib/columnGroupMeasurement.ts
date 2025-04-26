import { db } from 'database/db';
import { and, eq } from 'drizzle-orm';
import {
  columnGroupMeasurements
} from 'database/db/schema';
import { createSelectSchema } from 'drizzle-zod';

export type ColumnGroupMeasurement = 
  typeof columnGroupMeasurements.$inferSelect;


export const columnGroupMeasurementSchema = createSelectSchema(
  columnGroupMeasurements
);

export type Ids = Pick<ColumnGroupMeasurement, 'projectId'|'columnGroupId'|'id'>;
export type ParentIds = Pick<ColumnGroupMeasurement, 'projectId'|'columnGroupId'>;

const whereIds = (ids: Ids) => and(
  eq(columnGroupMeasurements.projectId, ids.projectId),
  eq(columnGroupMeasurements.columnGroupId, ids.columnGroupId),
  eq(columnGroupMeasurements.id, ids.id),
);

const whereParentIds = (parentIds: ParentIds) => and(
  eq(columnGroupMeasurements.projectId, parentIds.projectId),
  eq(columnGroupMeasurements.columnGroupId, parentIds.columnGroupId),
);

export const get = async (ids: Ids) => {
  const value = await db.query.columnGroupMeasurements.findFirst({
    where: whereIds(ids),
  });
  if (value == null) throw new Error(
    `cannot get columnGroupMeasurement ${ids.id}`
  );
  return value;
}

export const list = async (parentIds: ParentIds) => 
await db.query.columnGroupMeasurements.findMany({
  where: whereParentIds(parentIds),
  with: {
    measurementColumnGroup: true
  }
});

export const add = async (
  params: Omit<ColumnGroupMeasurement, 'id'>
) => {
  const newId = (
    await db.insert(columnGroupMeasurements).values(params)
      .$returningId()
  )[0]?.id;

  if (newId == null) throw new Error(
    `cannot get new columnGroupMeasurement id`
  );

  return await get({ ...params, id: newId });
}

export const remove = async (ids: Ids) =>
await db.delete(columnGroupMeasurements).where(whereIds(ids));

export const update = async (params: ColumnGroupMeasurement) => {
  await db.update(columnGroupMeasurements).set(params).where(whereIds(params));

  return await get(params);
};

