import { db } from 'database/db';
import {
  measurementColumns
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

export type MeasurementColumn = 
  typeof measurementColumns.$inferSelect;

import { createSelectSchema } from 'drizzle-zod';
export const measurementColumnSchema = createSelectSchema(
  measurementColumns
);

export const get = async ({
  projectId,
  columnGroupId,
  id
}: Pick<MeasurementColumn, 'id'|'projectId'|'columnGroupId'>) => 
await db.query.measurementColumns.findFirst({
  where:
    and(
      eq(measurementColumns.projectId, projectId),
      eq(measurementColumns.columnGroupId, columnGroupId),
      eq(measurementColumns.id, id),
    )
});

export const list = async ({
  projectId,
  columnGroupId,
}: Pick<MeasurementColumn, 'projectId'|'columnGroupId'>) =>
await db.query.measurementColumns.findMany({
  where:
    and(
      eq(measurementColumns.projectId, projectId),
      eq(measurementColumns.columnGroupId, columnGroupId),
    )
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
  const newValue = await get({
    id: newId,
    projectId: params.projectId,
    columnGroupId: params.columnGroupId,
  });
  if (newValue == null) throw new Error(
    `cannot get new measurementColumn ${newId}`
  );

  return newValue;
};

export const update = async (params: MeasurementColumn) => {
  await db.update(measurementColumns).set(params).where(
    and(
      eq(measurementColumns.projectId, params.projectId),
      eq(measurementColumns.columnGroupId, params.columnGroupId),
      eq(measurementColumns.id, params.id),
    )
  );
  const newValue = await get({
    projectId: params.projectId,
    columnGroupId: params.columnGroupId,
    id: params.id,
  });

  return newValue;
};

export const remove = async ({
  projectId,
  columnGroupId,
  id,
}: Pick<MeasurementColumn, 'projectId'|'columnGroupId'|'id'>) =>
await db.delete(measurementColumns).where(
  and(
    eq(measurementColumns.projectId, projectId),
    eq(measurementColumns.columnGroupId, columnGroupId),
    eq(measurementColumns.id, id),
  )
);

