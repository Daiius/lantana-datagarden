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
        relatedFlow.columnGroupIds.flatMap(s => s),
      ),
    ),
  });

  return {
    ...relatedFlow,
    columnGroups:
      relatedFlow.columnGroupIds.map(group =>
        group.flatMap(id =>
          relatedColumnGroups.find(columnGroup => columnGroup.id === id)
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
        relatedFlow.columnGroupIds.flatMap(s => s),
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
      relatedFlow.columnGroupIds.map(group =>
        group.flatMap(id =>
          relatedColumnGroups.find(columnGroup => columnGroup.id === id)
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
        flow.columnGroupIds.map(group =>
          group.flatMap(id =>
            relatedColumnGroups.find(cg => cg.id === id)
            ?? []
          ) // undefined を値からも型からも取り除くイディオム
        )
    }));
  return nestedRelatedFlows;
};

