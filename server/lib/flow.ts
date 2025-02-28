import { db } from 'database/db';
import {
  flows,
  columnGroups,
} from 'database/db/schema';
import {
  eq, and, inArray
} from 'drizzle-orm';

export const getNested = async ({
  projectId,
  id,
}: {
  projectId: string;
  id: string;
}) => {
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

