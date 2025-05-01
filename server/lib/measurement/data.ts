import { db } from 'database/db';
import { measurements } from 'database/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

export type Measurement = typeof measurements.$inferSelect;

export const measurementSchema = createSelectSchema(measurements);

export type Ids = Pick<Measurement, 'projectId'|'columnGroupId'|'id'>;
export type ParentIds = Pick<Measurement, 'projectId'|'columnGroupId'>;

const whereIds = (ids: Ids) => and(
  eq(measurements.projectId, ids.projectId),
  eq(measurements.columnGroupId, ids.columnGroupId),
  eq(measurements.id, ids.id),
);

const whereParentIds = (parentIds: ParentIds) => and(
  eq(measurements.projectId, parentIds.projectId),
  eq(measurements.columnGroupId, parentIds.columnGroupId),
);

export const get = async (ids: Ids) => {
  const value = await db.query.measurements.findFirst({
    where: whereIds(ids)
  });
  if (value == null) throw new Error(
    `cannot find measurement ${ids.id}`
  );
  return value;
};

export const list = async (parentIds: ParentIds) =>
await db.query.measurements.findMany({
  where: whereParentIds(parentIds)
});

export const update = async (params: Measurement) => {
  await db.update(measurements).set(params).where(whereIds(params));
  return await get(params);
};

export const add = async (params: Omit<Measurement, 'id'>) => {
  const newId = (
    await db.insert(measurements).values(params)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get newId of measurement`
  );
  return await get({ ...params, id: newId });
};

export const remove = async (ids: Ids) =>
await db.delete(measurements).where(whereIds(ids));

