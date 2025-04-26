
import { and, eq } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

import { db } from 'database/db';
import { flowSteps } from 'database/db/schema';

export type FlowStep = typeof flowSteps.$inferSelect;

export const flowStepSchema = createSelectSchema(flowSteps);

export type Ids = Pick<FlowStep, 'projectId'|'flowId'|'id'>;
export type ParentIds = Pick<FlowStep, 'projectId'|'flowId'>;

const whereIds = (ids: Ids) => and(
  eq(flowSteps.projectId, ids.projectId),
  eq(flowSteps.flowId, ids.flowId),
  eq(flowSteps.id, ids.id),
);

const whereParentIds = (parentIds: ParentIds) => and(
  eq(flowSteps.projectId, parentIds.projectId),
  eq(flowSteps.flowId, parentIds.flowId),
);

export const get = async (ids: Ids) => {
  const value = await db.query.flowSteps.findFirst({ where: whereIds(ids) });
  if (value == null) throw new Error(`cannot find flowStep id ${ids.id}`);
  return value;
}

export const list = async (parentIds: ParentIds) =>
await db.query.flowSteps.findMany({
  where: whereParentIds(parentIds),
  orderBy: [flowSteps.sort ?? flowSteps.id],
});

export const update = async (params: FlowStep) => {
  await db.update(flowSteps).set(params).where(whereIds(params));
  return await get(params);
};

export const add = async (params: Omit<FlowStep, 'id'>) => {
  const newId =(
    await db.insert(flowSteps).values(params)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get new id of flow step`
  );

  return await get({ ...params, id: newId });
};

export const remove = async (ids: Ids) =>
await db.delete(flowSteps).where(whereIds(ids));

