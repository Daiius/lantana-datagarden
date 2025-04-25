
import { db } from 'database/db';
import {
  measurementColumnGroups,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

export const measurementColumnGroupSchema = createSelectSchema(
  measurementColumnGroups
);
export type MeasurementColumnGroup = 
  typeof measurementColumnGroups.$inferSelect;

export const list = async ({
  projectId
}: {
  projectId: string;
}) => await db.query.measurementColumnGroups.findMany({
  where: eq(measurementColumnGroups.projectId, projectId),
});

export const get = async ({
  projectId,
  id,
}: {
  projectId: string;
  id: number;
}) => {
  const value = await db.query.measurementColumnGroups.findFirst({
    where: and(
      eq(measurementColumnGroups.projectId, projectId),
      eq(measurementColumnGroups.id, id),
    )
  });
  if (value == null) throw new Error(
    `cannot find columnGroup ${id}`
  );
  return value;
}

export const update = async (
  params: MeasurementColumnGroup
) => {
  await db.update(measurementColumnGroups).set(params).where(
    and(
      eq(measurementColumnGroups.projectId, params.projectId),
      eq(measurementColumnGroups.id, params.id),
    )
  );
  const newValue = await get({
    projectId: params.projectId,
    id: params.id,
  });

  return newValue;
};


/**
 * 新規columnGroupを、paramsに従って追加します
 * 
 * 追加されたエントリを返却します
 */
export const add = async (
  params: Omit<MeasurementColumnGroup, 'id'>
) => {
  const newId = (
    await db.insert(measurementColumnGroups).values(params)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get new id of measurementColumnGroup`
  );
  const newColumnGroup = await get({
    projectId: params.projectId,
    id: newId
  });
  if (newColumnGroup == null) throw new Error(
    `cannot get added measurementColumnGroup ${newId}`
  );
  return newColumnGroup;
}

export const remove = async ({
  projectId,
  id
}: {
  projectId: string;
  id: number;
}) => await db.delete(measurementColumnGroups).where(
  and(
    eq(measurementColumnGroups.projectId, projectId),
    eq(measurementColumnGroups.id, id),
  )
);

