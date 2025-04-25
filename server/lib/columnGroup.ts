
import { db } from 'database/db';
import { 
  columnGroups,
} from 'database/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

export type ColumnGroup = typeof columnGroups.$inferSelect;

export const columnGroupSchema = createSelectSchema(columnGroups);

export type Ids = Pick<ColumnGroup, 'projectId'|'id'>;
export type ProjectId = Pick<ColumnGroup, 'projectId'>;

const whereIds = (ids: Ids) => and(
  eq(columnGroups.id, ids.id),
  eq(columnGroups.projectId, ids.projectId)
);

const whereProjectId = (projectId: ProjectId) => 
eq(columnGroups.projectId, projectId.projectId);

export const get = async (ids: Ids) => {
  const value = await db.query.columnGroups.findFirst({
    where: whereIds(ids)
  });
  if (value == null) throw new Error(
    `cannot find columnGroup ${ids.id}`
  );
  return value;
}

export const list = async (projectId : ProjectId) =>
  await db.query.columnGroups.findMany({
    where: whereProjectId(projectId),
    orderBy: [asc(columnGroups.id)],
  });

/**
 * columnGroupを与えられた引数で更新します
 * 
 * - typeが変更された場合、Measurements <-> Data のデータ移動を行います
 *   - 以前の値からtypeが変更されているかチェック
 *   - 変更されていればデータ移動（時間が掛かる可能性あり）
 */
export const update = async (columnGroup: ColumnGroup) => {
  await db.update(columnGroups)
    .set(columnGroup)
    .where(whereIds(columnGroup));
  return await get(columnGroup);
};

export const add = async (columnGroup: Omit<ColumnGroup, 'id'>) => {
  const newId = (
    await db.insert(columnGroups).values(columnGroup)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot find added columnGroup`
  );
  return await get({ ...columnGroup, id: newId });
}

/** 
 * 指定したColumnGroupを削除します 
 * 関連付けられているColumn, Dataも全て削除されます
 * TODO 多くのデータが消える過激な処理かもしれない
 */
export const remove = async (ids: Ids) =>
await db.delete(columnGroups).where(whereIds(ids));

