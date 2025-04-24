import { db } from 'database/db';
import { flowSteps } from 'database/db/schema';

import { and, eq } from 'drizzle-orm';

export type FlowStep = typeof flowSteps.$inferSelect;

export const get = async ({
  projectId,
  flowId,
  id,
}: Pick<FlowStep, 'projectId'|'flowId'|'id'>) => {
  const value = await db.query.flowSteps.findFirst({
    where:
      and(
        eq(flowSteps.projectId, projectId),
        eq(flowSteps.flowId, flowId),
        eq(flowSteps.id, id),
      ),
  });

  if (value == null) throw new Error(
    `cannot find flowStep id ${id}`
  );
  return value;
}

export const list = async ({
  projectId,
  flowId,
}: Pick<FlowStep, 'projectId'|'flowId'>) =>
await db.query.flowSteps.findMany({
  where:
    and(
      eq(flowSteps.projectId, projectId),
      eq(flowSteps.flowId, flowId),
    ),
  orderBy: [flowSteps.sort ?? flowSteps.id],
});

export const update = async (params: FlowStep) => {
  await db.update(flowSteps).set(params).where(
    and(
      eq(flowSteps.projectId, params.projectId),
      eq(flowSteps.flowId, params.flowId),
      eq(flowSteps.id, params.id),
    ),
  );
  return await get({
    projectId: params.projectId,
    flowId: params.flowId,
    id: params.id
  });
};

export const add = async (params: Omit<FlowStep, 'id'>) => {
  const newId =(
    await db.insert(flowSteps).values(params)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get new id of flow step`
  );

  return await get({
    projectId: params.projectId,
    flowId: params.flowId,
    id: newId,
  });
};

export const remove = async ({
  projectId,
  flowId,
  id,
}: Pick<FlowStep, 'projectId'|'flowId'|'id'>) =>
await db.delete(flowSteps).where(
  and(
    eq(flowSteps.projectId, projectId),
    eq(flowSteps.flowId, flowId),
    eq(flowSteps.id, id),
  ),
);

