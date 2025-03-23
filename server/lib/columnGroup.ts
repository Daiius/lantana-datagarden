
import { db } from 'database/db';
import { 
  columnGroups,
  columns,
  data,
} from 'database/db/schema';
import { eq, and, asc } from 'drizzle-orm';

type ColumnGroup = typeof columnGroups.$inferSelect;

export const get = async (
  { id, projectId }
  : Pick<ColumnGroup, 'id' | 'projectId'>
) =>
  await db.query.columnGroups.findFirst({
    where: and(
      eq(columnGroups.id, id),
      eq(columnGroups.projectId, projectId)
    ),
  });

export const getNested = async (
  { id, projectId }: Pick<ColumnGroup, 'id' | 'projectId'>
) =>
  await db.query.columnGroups.findFirst({
    where: and(
      eq(columnGroups.projectId, projectId),
      eq(columnGroups.id, id),
    ),
    with: {
      columns: {
        orderBy: [asc(columns.id)]
      }
    }
  });



export const list = async (
  { projectId } : Pick<ColumnGroup, 'projectId'>
) =>
  await db.query.columnGroups.findMany({
    where: eq(columnGroups.projectId, projectId),
    orderBy: [asc(columnGroups.id)],
  });

export const listNested = async ({
  projectId,
}: Pick<ColumnGroup, 'projectId'>) =>
  await db.query.columnGroups.findMany({
    where: eq(columnGroups.projectId, projectId),
    orderBy: [asc(columnGroups.id)],
    with: {
      columns: {
        orderBy: [asc(columns.id)],
      }
    }
  })

export const update = async (columnGroup: ColumnGroup) => {
  await db.update(columnGroups)
    .set(columnGroup)
    .where(
      and(
        eq(columnGroups.id, columnGroup.id),
        eq(columnGroups.projectId, columnGroup.projectId)
      )
    );
  const newColumnGroup = await getNested(columnGroup);
  return newColumnGroup;
};

export const add = async (columnGroup: Omit<ColumnGroup, 'id'>) => {
  const newId = (
    await db.insert(columnGroups).values(columnGroup)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot find added columnGroup`
  );
  const newColumnGroup = await getNested({ ...columnGroup, id: newId });
  if (newColumnGroup == null) throw new Error(
    `cannot get added columnGroup ${newId}`
  );
  return newColumnGroup;
}

/**
 * TODO
 * on delete cascade で自動的に関連付けられている
 * columnGroups, columns, data エンティティは削除されるかもしれない
 * ので、この処理を丁寧に行う以下の処理は不要かも
 */
export const remove = async (
  { id, projectId }: Pick<ColumnGroup, 'id'|'projectId'>
) => {
  await db.transaction(async tx => {
    await tx.delete(data).where(
      and(
        eq(data.columnGroupId, id),
        eq(data.projectId, projectId),
      ),
    );
    await tx.delete(columns).where(
      and(
        eq(columns.columnGroupId, id),
        eq(columns.projectId, projectId),
      )
    );
    await tx.delete(columnGroups).where(
      and(
        eq(columnGroups.id, id),
        eq(columnGroups.projectId, projectId),
      )
    );
  });

  return { id, projectId };
};

