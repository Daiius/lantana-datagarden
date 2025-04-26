
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

import { db } from 'database/db';
import { flowStepColumnGroups } from 'database/db/schema';

export type FlowStepColumnGroup = typeof flowStepColumnGroups.$inferSelect;

const groupingSchema = z.union([
  z.object({
    type: z.literal('parent'),
  }),
  z.object({
    type: z.literal('column'),
    columnName: z.string(),
  }),
  z.null(),
]);

export const flowStepColumnGroupSchema = createSelectSchema(flowStepColumnGroups)
  .extend({
    grouping: groupingSchema,
  });

export type Ids = Pick<FlowStepColumnGroup, 'projectId'|'flowStepId'|'id'>;
export type ParentIds = Pick<FlowStepColumnGroup, 'projectId'|'flowStepId'>;

const whereIds = (ids: Ids) => {
  const { projectId, flowStepId, id } = ids;
  return and(
    eq(flowStepColumnGroups.projectId, projectId),
    eq(flowStepColumnGroups.flowStepId, flowStepId),
    eq(flowStepColumnGroups.id, id),
  );
}

const whereParentIds = (parentIds: ParentIds) => {
  const { projectId, flowStepId } = parentIds;
  return and(
    eq(flowStepColumnGroups.projectId, projectId),
    eq(flowStepColumnGroups.flowStepId, flowStepId),
  );
};


export const get = async (ids: Ids) => {
  const value = await db.query.flowStepColumnGroups.findFirst({
    where: whereIds(ids),
  });
  if (value == null) throw new Error(
    `cannot find flow-step column-group ${ids.id}`
  );
  return value;
};

export const list = async (parentIds: ParentIds) =>
await db.query.flowStepColumnGroups.findMany({
  where: whereParentIds(parentIds),
  orderBy:
    [flowStepColumnGroups.sort ?? flowStepColumnGroups.id]
});

export const update = async (params: FlowStepColumnGroup) => {
  await db.update(flowStepColumnGroups).set(params).where(
    whereIds(params)
  )
  return await get(params);
};

export const add = async (params: Omit<FlowStepColumnGroup, 'id'>) => {
  const newId = (
    await db.insert(flowStepColumnGroups).values(params)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get new id of flow-step column-group`
  );

  return await get({ ...params, id: newId });
};

export const remove = async (ids: Ids) =>
await db.delete(flowStepColumnGroups).where(whereIds(ids));

