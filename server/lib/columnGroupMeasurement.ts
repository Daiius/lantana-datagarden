import { db } from 'database/db';
import { and, eq } from 'drizzle-orm';
import {
  columnGroupToMeasurements
} from 'database/db/schema';
import type {
  MeasurementColumnGroup
} from '../lib/measurement/columnGroup';
import { createSelectSchema } from 'drizzle-zod';

export type ColumnGroupToMeasurement = 
  typeof columnGroupToMeasurements.$inferSelect;

export type ColumnGroupToMeasurementWithMeasurements =
  ColumnGroupToMeasurement & { measurements: MeasurementColumnGroup };

export const columnGroupToMeasurementSchema = createSelectSchema(
  columnGroupToMeasurements
);

export const get = async ({
  projectId,
  columnGroupId,
  id
}: Pick<ColumnGroupToMeasurement, 'id'|'projectId'|'columnGroupId'>) => {
  const value = await db.query.columnGroupToMeasurements.findFirst({
    where:
      and(
        eq(columnGroupToMeasurements.projectId, projectId),
        eq(columnGroupToMeasurements.columnGroupId, columnGroupId),
        eq(columnGroupToMeasurements.id, id),
      ),
    with: {
      measurements: true
    }
  });
  if (value == null) throw new Error(
    `cannot get columnGroupMeasurement ${id}`
  );
  return value;
}

export const list = async ({
  projectId,
  columnGroupId,
}: {
  projectId: string;
  columnGroupId: number;
}) => await db.query.columnGroupToMeasurements.findMany({
  where:
    and(
      eq(columnGroupToMeasurements.columnGroupId, columnGroupId),
      eq(columnGroupToMeasurements.projectId, projectId),
    ),
  with: {
    measurements: true
  }
});

export const add = async (
  params: Omit<ColumnGroupToMeasurement, 'id'>
) => {
  const newId = (
    await db.insert(columnGroupToMeasurements).values(params)
      .$returningId()
  )[0]?.id;

  if (newId == null) throw new Error(
    `cannot get new columnGroupToMeasurement id`
  );

  return await get({ 
    projectId: params.projectId, 
    columnGroupId: params.columnGroupId, 
    id: newId 
  });
}

export const remove = async ({
  projectId,
  columnGroupId,
  id
}: Pick<ColumnGroupToMeasurement, 'projectId'|'columnGroupId'|'id'>) =>
await db.delete(columnGroupToMeasurements).where(
  and(
    eq(columnGroupToMeasurements.projectId, projectId),
    eq(columnGroupToMeasurements.columnGroupId, columnGroupId),
    eq(columnGroupToMeasurements.id, id),
  )
);

export const update = async (params: ColumnGroupToMeasurement) => {
  await db.update(columnGroupToMeasurements).set(params).where(
    and(
      eq(columnGroupToMeasurements.projectId, params.projectId),
      eq(columnGroupToMeasurements.columnGroupId, params.columnGroupId),
      eq(columnGroupToMeasurements.id, params.id),
    )
  );

  return await get({
    projectId: params.projectId,
    columnGroupId: params.columnGroupId,
    id: params.id,
  });
};

