import { db } from 'database/db';
import { 
  COLUMNS_DATA_TYPES,
  columns,
  JsonData,
  data,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';


type Column = typeof columns.$inferSelect;

/** 列データのnameを変更します
 *
 * 注.
 * この列に関連付けられている全てのデータに対して
 * 列名変更処理が走るので、大規模なデータは時間が掛かります
 */
export const updateName = async ({
  id,
  projectId,
  columnGroupId,
  oldName,
  newName,
}: Pick<Column, 'id' | 'projectId' | 'columnGroupId'> & {
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
            .reduce((acc, curr) => ({ ...acc, ...curr }))
      }));

      //console.log('dataToUpdate:\n%o', dataToUpdate);
      //console.log('updatedData :\n%o', updatedData);

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
export const updateType = async ({
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

/**
 * 列をDataから削除します
 */
export const deleteColumn = async ({
  projectId,
  columnGroupId,
  id,
}: Pick<Column, 'id' | 'projectId' | 'columnGroupId'>) => {
  await db.transaction(async tx => {
    const columnToDelete = await db.query.columns.findFirst({
      where: and(
        eq(columns.id, id),
        eq(columns.projectId, projectId),
        eq(columns.columnGroupId, columnGroupId),
      ),
    });
    if (columnToDelete == null) throw new Error(
      `cannot find column to delete, ${id}`
    );

    // Columnsテーブルから列を削除します
    await tx.delete(columns).where(
      and(
        eq(columns.id, id),
        eq(columns.projectId, projectId),
        eq(columns.columnGroupId, columnGroupId)
      )
    );
    // TODO
    // 注意！注意！注意！
    // 更新対象のデータを全てメモリ中にロードして更新しなおす
    const dataToUpdate = await tx.select().from(data)
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

