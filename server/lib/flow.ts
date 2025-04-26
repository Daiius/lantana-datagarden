import { db } from 'database/db';
import { flows } from 'database/db/schema';
import { eq, and } from 'drizzle-orm';

import { createSelectSchema } from 'drizzle-zod';

export type Flow = typeof flows.$inferSelect;

export type Ids = Pick<Flow, 'projectId'|'id'>;
export type ProjectId = Pick<Flow, 'projectId'>;

export const flowSchema = createSelectSchema(flows);

const whereIds = (ids: Ids) => and(
  eq(flows.id, ids.id),
  eq(flows.projectId, ids.projectId),
);

const whereProjectId = (projectId: ProjectId) =>
eq(flows.projectId, projectId.projectId);

export const get = async (ids: Ids) => {
  const value = await db.query.flows.findFirst({
    where: whereIds(ids),
  });
  if (value == null) throw new Error(
    `cannot find flow ${ids.id}`
  );
  return value;
}


export const list = async (projectId: ProjectId) =>
await db.query.flows.findMany({ where: whereProjectId(projectId) });


export const update = async (newValue: Flow) => {
  await db.update(flows).set(newValue).where(whereIds(newValue));
  return await get(newValue);
};

export const add = async (newFlow: Omit<Flow, 'id'>) => {
  const newId = (
    await db.insert(flows).values(newFlow)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error('cannot get new id');

  return await get({ ...newFlow, id: newId });
}

export const remove = async (ids: Ids) => 
await db.delete(flows).where(whereIds(ids));

