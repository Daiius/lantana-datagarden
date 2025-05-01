
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

export type Ids = Pick<MeasurementColumnGroup, 'projectId'|'id'>;
export type ProjectId = Pick<MeasurementColumnGroup, 'projectId'>;

const whereIds = (ids: Ids) => and(
  eq(measurementColumnGroups.projectId, ids.projectId),
  eq(measurementColumnGroups.id, ids.id),
);

const whereProjectId = (projectId: ProjectId) =>
eq(measurementColumnGroups.projectId, projectId.projectId);

export const list = async (projectId: ProjectId) => 
await db.query.measurementColumnGroups.findMany({
  where: whereProjectId(projectId),
});

export const get = async (ids: Ids) => {
  const value = await db.query.measurementColumnGroups.findFirst({
    where: whereIds(ids)
  });
  if (value == null) throw new Error(
    `cannot find columnGroup ${ids.id}`
  );
  return value;
}

export const update = async (params: MeasurementColumnGroup) => {
  await db.update(measurementColumnGroups).set(params).where(whereIds(params));
  return await get(params);
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
  return await get({ ...params, id: newId });
}

export const remove = async (ids: Ids) => 
await db.delete(measurementColumnGroups).where(whereIds(ids));

