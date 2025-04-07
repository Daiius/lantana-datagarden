import { db } from 'database/db';
import {
  flows,
  columns,
  columnGroups,
} from 'database/db/schema';
import {
  eq, and, inArray, asc
} from 'drizzle-orm';

type Flow = typeof flows.$inferSelect;

export const get = async ({
  projectId,
  id,
}: Pick<Flow, 'id' | 'projectId'>) => 
  await db.query.flows.findFirst({
    where: and(
      eq(flows.id, id),
      eq(flows.projectId, projectId),
    ),
  });


export const list = async ({
  projectId,
}: Pick<Flow, 'projectId'>) =>
  await db.query.flows.findMany({
    where: eq(flows.projectId, projectId)
  });

/*
 * 指定したidのflowを、columnGroupまでネストして返します
 */
export const getNested = async ({
  projectId,
  id,
}: Pick<Flow, 'id' | 'projectId'>) => {
  const relatedFlow = await db.query.flows.findFirst({
    where: and(
      eq(flows.id, id),
      eq(flows.projectId, projectId),
    ),
  });
  if (relatedFlow == null) throw new Error(
    `cannot find flow ${id}`,
  );
  const relatedColumnGroups = await db.query.columnGroups.findMany({
    where: and(
      eq(columnGroups.projectId, projectId),
      inArray(
        columnGroups.id,
        relatedFlow.columnGroupWithGroupings
          .flatMap(v => v.map(vv => vv.id)),
      ),
    ),
  });

  return {
    ...relatedFlow,
    columnGroups:
      relatedFlow.columnGroupWithGroupings.map(group =>
        group.flatMap(gg =>
          relatedColumnGroups.find(columnGroup => 
            columnGroup.id === gg.id
          )
          ?? []
        )
      ),
  };
};

export const getNestedWithData = async ({
  projectId,
  id,
}: Pick<Flow, 'id' | 'projectId'>) => {
  const relatedFlow = await db.query.flows.findFirst({
    where: and(
      eq(flows.id, id),
      eq(flows.projectId, projectId),
    ),
  });
  if (relatedFlow == null) throw new Error(
    `cannot find flow ${id}`,
  );
  const relatedColumnGroups = await db.query.columnGroups.findMany({
    where: and(
      eq(columnGroups.projectId, projectId),
      inArray(
        columnGroups.id,
        relatedFlow.columnGroupWithGroupings.flatMap(v => 
          v.map(vv => vv.id)
        ),
      ),
    ),
    with: { 
      data: true,
      columns: {
        orderBy: [asc(columns.id)],
      },
    }
  });

  return {
    ...relatedFlow,
    columnGroups:
      relatedFlow.columnGroupWithGroupings.map(group =>
        group.flatMap(g =>
          relatedColumnGroups.find(columnGroup => 
            columnGroup.id === g.id
          )
          ?? []
        )
      ),
  };
}

export const listNested = async ({
  projectId
}: {
  projectId: string
}) => {
  // projectに属するflowsをまとめて取得します
  const relatedFlows = await db.query.flows.findMany({
    where: eq(flows.projectId, projectId)
  });
  // 関連するcolumnGroupをまとめて取得します
  // TODO Map化して検索を易化する方がよいかも
  const relatedColumnGroups = await db.query.columnGroups
    .findMany({
      where: eq(columnGroups.projectId, projectId),
    });
  // それらのcolumnGroupsをネストされたオブジェクトに置き換えます
  const nestedRelatedFlows = relatedFlows
    .map(flow => ({
      ...flow,
      columnGroups:
        flow.columnGroupWithGroupings.map(group =>
          group.flatMap(g =>
            relatedColumnGroups.find(cg => cg.id === g.id)
            ?? []
          ) // undefined を値からも型からも取り除くイディオム
        )
    }));
  return nestedRelatedFlows;
};

export const update = async (flow: Flow) => {
  await db.transaction(async tx => {
    // flow中のcolumnGroupIdsについて、
    // 既存の値かどうかチェックする
    const existingColumnGroupIds = (
      await tx.query.columnGroups.findMany({
        where: eq(columnGroups.projectId, flow.projectId),
        columns: { id: true },
      })
    ).map(cg => cg.id);

    const invalidIds = flow.columnGroupWithGroupings
      .flatMap(group => group.map(cg => cg.id))
      .filter(id => !existingColumnGroupIds.includes(id));
    if (invalidIds.length > 0) throw new Error(
      `these flow.columnGroupIds does not exist in db: ${invalidIds.map(s => `'${s}'`).toString()}`
    );
    
    // flowに従ってデータ更新 
    await tx.update(flows)
      .set(flow)
      .where(
        and(
          eq(flows.id, flow.id),
          eq(flows.projectId, flow.projectId),
        )
      );
  });
  const newFlow = await getNested({
    id: flow.id, projectId: flow.projectId
  });
  if (newFlow == null) throw new Error(
    `cannot find flow ${flow.id}`
  );

  return newFlow;
};

export const add = async (
  newFlowData: Omit<Flow, 'id'>
): Promise<Flow> => {
  const newId = (
    await db.insert(flows).values({ ...newFlowData })
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error('cannot get new id');

  return { ...newFlowData, id: newId };
}

export const remove = async (
  { id, projectId }: Pick<Flow, 'id' | 'projectId'>
) => 
  await db.delete(flows).where(
    and(
      eq(flows.projectId, projectId),
      eq(flows.id, id),
    )
  );

