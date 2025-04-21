
import { db } from 'database/db';
import { 
  columnGroups,
  columns,
  data,
  measurements,
} from 'database/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import * as schema from 'database/db/schema';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { createSelectSchema } from 'drizzle-zod';

export type ColumnGroup = typeof columnGroups.$inferSelect;

export const columnGroupSchema = createSelectSchema(columnGroups);

export const get = async (
  { id, projectId }
  : Pick<ColumnGroup, 'id' | 'projectId'>
) => {
  const value = await db.query.columnGroups.findFirst({
    where: 
      and(
        eq(columnGroups.id, id),
        eq(columnGroups.projectId, projectId)
      ),
    }
  );
  if (value == null) throw new Error(
    `cannot find columnGroup ${id}`
  );
  return value;
}

export const getNested = async (
  { id, projectId }: Pick<ColumnGroup, 'id' | 'projectId'>
) => {
  const value = await db.query.columnGroups.findFirst({
    where: 
      and(
        eq(columnGroups.projectId, projectId),
        eq(columnGroups.id, id),
      ),
    with: {
      columns: {
        orderBy: [asc(columns.id)]
      },
      measurements: true, /*{
        with: {
          measurements: true
        }
      },*/
    }
  });
  if (value == null) throw new Error(
    `cannot find columnGroup ${id}`
  );
  return value;
}


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
      },
      measurements: true, /*{
        with: {
          measurements: true,
        }
      },*/
    }
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

// NOTE MeasurementsとDataでColumnGroupを分けたので要変更
const moveDataToMeasurement = async ({
  tx,
  projectId,
  columnGroupId,
}: {
  tx: MySql2Database<typeof schema>;
  projectId: string;
  columnGroupId: number;
}) => {
  await tx.insert(measurements)
    .select(
      tx.select({
        id: data.id,
        columnGroupId: data.columnGroupId,
        projectId: data.projectId,
        data: data.data,
        dataId: data.parentId, 
      })
      .from(data)
      .where(
        and(
          eq(data.columnGroupId, columnGroupId),
          eq(data.projectId, projectId),
        )
      ),
    );
  await tx.delete(data)
    .where(
      and(
        eq(data.columnGroupId, columnGroupId),
        eq(data.projectId, projectId),
      )
    );
};

// NOTE MeasurementsとDataでColumnGroupを分けたので要変更
const moveMeasurementToData = async ({
  tx,
  projectId,
  columnGroupId,
}: {
  tx: MySql2Database<typeof schema>;
  projectId: string;
  columnGroupId: number;
}) => {
  await tx.insert(data)
    .select(
      tx.select({
        id: measurements.id,
        columnGroupId: measurements.columnGroupId,
        projectId: measurements.projectId,
        data: measurements.data,
        parentId: measurements.dataId, 
      })
      .from(measurements)
      .where(
        and(
          eq(measurements.columnGroupId, columnGroupId),
          eq(measurements.projectId, projectId),
        )
      ),
    );
  await tx.delete(measurements)
    .where(
      and(
        eq(measurements.columnGroupId, columnGroupId),
        eq(measurements.projectId, projectId),
      )
    );
};

