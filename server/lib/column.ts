import { eq, and, asc, inArray } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';

import { db } from 'database/db';
import { 
  COLUMNS_DATA_TYPES,
  columns,
  JsonData,
  data,
} from 'database/db/schema';

export type Column = typeof columns.$inferSelect;
export const columnSchema = createSelectSchema(columns);

export type Ids = Pick<Column, 'projectId'|'columnGroupId'|'id'>;
export type ParentIds = {
  projectId: Column['projectId'];
  /** 
   * フロントエンドのMergedTableにおいて
   * 複数columnGroupIdに属するColumnsを一括取得する必要があり、
   * idの配列も受け入れるようにしています
   */
  columnGroupId: Column['columnGroupId'] | Column['columnGroupId'][];
}

const whereIds = (ids: Ids) => and(
  eq(columns.id, ids.id),
  eq(columns.projectId, ids.projectId),
  eq(columns.columnGroupId, ids.columnGroupId),
);

const whereParentIds = (parentIds: ParentIds) => and(
  eq(columns.projectId, parentIds.projectId),
  Array.isArray(parentIds.columnGroupId) 
    ? inArray(columns.columnGroupId, parentIds.columnGroupId)
    : eq(columns.columnGroupId, parentIds.columnGroupId),
);


export const get = async (ids: Ids) => {
  const value = await db.query.columns.findFirst({
    where: whereIds(ids),
  });
  if (value == null) throw new Error(
    `cannot find column ${ids.id}`
  );
  return value;
}
  
export const list = async (parentIds: ParentIds) =>
await db.query.columns.findMany({
  where: whereParentIds(parentIds),
  orderBy: [asc(columns.id)],
});

export const update = async (column: Column) => {

  const lastData = await get(column);

  if (lastData.name !== column.name) {
    const oldName = lastData.name;
    const newName = column.name;
    await updateName({
      id: column.id, 
      projectId: column.projectId, 
      columnGroupId: column.columnGroupId,
      oldName,
      newName,
    });
  }
  
  if (lastData.type !== column.type) {
    const oldType = lastData.type;
    const newType = column.type;
    await updateType({
      id: column.id,
      projectId: column.projectId,
      columnGroupId: column.columnGroupId,
      name: column.name,
      oldType,
      newType,
    });
  }

  return await get(column);
}

export const add = async (column: Omit<Column, 'id'>) => {
  const newId = (
    await db.insert(columns).values(column)
      .$returningId()
  )[0]?.id;
  if (newId == null) throw new Error(
    `cannot get inserted column id`
  );
  return await get({ ...column, id: newId });
};

/**
 * Columnを削除します
 *
 * Columnに属しているデータも全て削除されます
 * TODO 挙動について検討、この操作は破壊的で、元に戻すのが困難...
 */
export const remove = async (ids: Ids) => {
  await db.transaction(async tx => {
    const columnToDelete = await get(ids);
    if (columnToDelete == null) throw new Error(
      `cannot find column to delete, ${ids.id}`
    );

    // Columnsテーブルから列を削除します
    await tx.delete(columns).where(whereIds(ids));
    // TODO
    // 注意！注意！注意！
    // 更新対象のデータを全てメモリ中にロードして更新しなおす
    const dataToUpdate = await tx.select().from(data).where(whereParentIds(ids));

    const updatedData = dataToUpdate.map(d => ({
      ...d,
      data:
        Object.entries(d.data)
          .filter(([k, _]) => k !== columnToDelete.name)
          .map(([k, v]) => ({ [k]: v }))
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as JsonData
    }));

    for (const d of updatedData) {
      await tx.update(data)
        .set(d)
        .where(
          and(
            eq(data.id, d.id),
            eq(data.columnGroupId, d.columnGroupId),
            eq(data.projectId, d.projectId),
          )
        );
    }
  });
};


/** 列データのnameを変更します
 *
 * 注.
 * この列に関連付けられている全てのデータに対して
 * 列名変更処理が走るので、大規模なデータは時間が掛かります
 */
const updateName = async ({
  id,
  projectId,
  columnGroupId,
  oldName,
  newName,
}: Ids & {
  oldName: Column['name'],
  newName: Column['name'],
}) => {
    await db.transaction(async tx => {
      // 確実に名前だけ更新する
      await tx.update(columns)
        .set({ name: newName })
        .where(
          and(
            eq(columns.id, id),
            eq(columns.columnGroupId, columnGroupId),
            eq(columns.projectId, projectId),
          )
        );

      // TODO CAUTION WARNING WEIRED NASTY DIRTY
      // なんかもうリソース使いまくるのが目に見える...
      // JSONのキー名だけ変更する機能が無いので、
      // 全部手元にロードして元データを削除し、
      // 更新後のデータを記録しなおすしかないっぽい
      //
      // 1000個ずつロードして変更して書き戻して、を繰り返せば
      // メモリ使用量的にはましになるだろうか......
      const dataToUpdate = await db.select().from(data)
        .where(
          and(
            eq(data.columnGroupId, columnGroupId),
            eq(data.projectId, projectId),
          )
        );

      const updatedData = dataToUpdate.map(d => ({
        ...d, 
        data: 
          Object.entries(d.data)
            .map(([k, v]) => 
              ({ [k === oldName ? newName : k]: v })
            )
            .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as JsonData
      }));

      for (const d of updatedData) {
        await db.update(data)
          .set(d)
          .where(
            and(
              eq(data.id, d.id),
              eq(data.columnGroupId, d.columnGroupId),
              eq(data.projectId, d.projectId),
            )
          );
      }
    })
};

/**
 * データ形式の変換を担います
 * TODO 現在はstring <-> numberのみの変換です
 */
const convert = ({
  oldType,
  //newType,
  v,
}: {
  oldType: typeof COLUMNS_DATA_TYPES[number],
  newType: typeof COLUMNS_DATA_TYPES[number],
  v: any
}) => {
  if (oldType === 'string') {
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error(`エラー：文字列"${v}"を数値に変換できません`);
    }
    return n;
  } else {
    return String(v);
  }
};

/**
 * 列のデータ型を変換します
 *
 * 現在はJSONデータ型間での変換が可能なものだけ上手くいきます
 * 変換不能なデータがある場合、例外が発生します
 * column.nameが一致するもののデータ型を変換するので、
 * この処理は暗黙的にcolumn.nameが同一columnGroupId内で
 * uniqueであることを要求します
 *
 * TODO 現在は string <-> number の変換のみ実装します
 *
 */
const updateType = async ({
  id,
  projectId,
  columnGroupId,
  name,
  oldType,
  newType,
}: Pick<Column, 'id' | 'projectId' | 'columnGroupId' | 'name'> & {
  oldType: Column['type'],
  newType: Column['type'],
}) => {
  await db.transaction(async tx => {
    // 確実にtypeだけを変更
    await tx.update(columns)
      .set({ type: newType })
      .where(
        and(
          eq(columns.id, id),
          eq(columns.projectId, projectId),
          eq(columns.columnGroupId, columnGroupId),
        )
      );
    // TODO
    // 注意！注意！注意！
    // 更新対象のデータを全てメモリ中にロードして更新しなおす
    const dataToUpdate = await db.select().from(data)
      .where(
        and(
          eq(data.columnGroupId, columnGroupId),
          eq(data.projectId, projectId),
        )
      );
    const updatedData = dataToUpdate.map(d => ({
      ...d,
      data:
        Object.entries(d.data)
          .map(([k, v]) =>
            ({ [k]: k === name 
                      ? convert({ oldType, newType, v })
                      : v
            })
          )
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as JsonData
    }));

    for (const d of updatedData) {
      await db.update(data)
        .set(d)
        .where(
          and(
            eq(data.id, d.id),
            eq(data.columnGroupId, d.columnGroupId),
            eq(data.projectId, d.projectId),
          )
        );
    }
  });
};
