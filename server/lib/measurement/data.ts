import { db } from 'database/db';
import { measurements } from 'database/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

export type Measurement = typeof measurements.$inferSelect;

export const measurementSchema = createSelectSchema(measurements);

export const get = async ({
  projectId,
  columnGroupId,
  id
}: Pick<Measurement, 'id'|'columnGroupId'|'projectId'>) => {
  const value = await db.query.measurements.findFirst({
    where:
      and(
        eq(measurements.projectId, projectId),
        eq(measurements.columnGroupId, columnGroupId),
        eq(measurements.id, id),
      )
  });
  if (value == null) throw new Error(
    `cannot find measurement ${id}`
  );
  return value;
};

export const list = async ({
  projectId,
  columnGroupId,
}: Pick<Measurement, 'projectId'|'columnGroupId'>) =>
await db.query.measurements.findMany({
  where:
    and(
      eq(measurements.projectId, projectId),
      eq(measurements.columnGroupId, columnGroupId),
    )
});

export const update = async (params: Measurement) => {
  await db.update(measurements).set(params).where(
    and(
      eq(measurements.projectId, params.projectId),
      eq(measurements.columnGroupId, params.columnGroupId),
      eq(measurements.id, params.id),
    )
  );
  const newValue = await get({
    projectId: params.projectId,
    columnGroupId: params.columnGroupId,
    id: params.id
  });
  return newValue;
};

export const add = async (params: Omit<Measurement, 'id'>) => {
  const newId = (
    await db.insert(measurements).values(params)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get newId of measurement`
  );
  const newValue = await get({
    projectId: params.projectId,
    columnGroupId: params.columnGroupId,
    id: newId
  });
  return newValue;
};

export const remove = async ({
  projectId,
  columnGroupId,
  id,
}: Pick<Measurement, 'id'|'columnGroupId'|'projectId'>) =>
await db.delete(measurements).where(
  and(
    eq(measurements.projectId, projectId),
    eq(measurements.columnGroupId, columnGroupId),
    eq(measurements.id, id),
  )
);

