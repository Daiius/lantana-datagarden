import { db } from 'database/db';
import { 
  COLUMN_DEFINITION_DATA_TYPES,
  columnDefinitions,
  JsonDataType,
  data,
} from 'database/db/schema';
import { eq, and } from 'drizzle-orm';



/** 列データのnameを変更します
 *
 * 注.
 * この列に関連付けられている全てのデータに対して
 * 列名変更処理が走るので、大規模なデータは時間が掛かります
 */
export const updateName = async ({
  id,
  projectId,
  categoryId,
  oldName,
  newName,
}: {
  id: string,
  projectId: string,
  categoryId: string,
  oldName: string,
  newName: string,
}) => {
    await db.transaction(async tx => {
      // 確実に名前だけ更新する
      await tx.update(columnDefinitions)
        .set({ name: newName })
        .where(
          and(
            eq(columnDefinitions.id, id),
            eq(columnDefinitions.categoryId, categoryId),
            eq(columnDefinitions.projectId, projectId),
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
            eq(data.categoryId, categoryId),
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
              eq(data.categoryId, d.categoryId),
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
  oldType: typeof COLUMN_DEFINITION_DATA_TYPES[number],
  newType: typeof COLUMN_DEFINITION_DATA_TYPES[number],
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
 * この処理は暗黙的にcolumn.nameが同一categoryId内で
 * uniqueであることを要求します
 *
 * TODO 現在は string <-> number の変換のみ実装します
 *
 */
export const updateType = async ({
  id,
  projectId,
  categoryId,
  columnName,
  oldType,
  newType,
}: {
  id: string,
  projectId: string,
  categoryId: string,
  columnName: string,
  oldType: typeof COLUMN_DEFINITION_DATA_TYPES[number],
  newType: typeof COLUMN_DEFINITION_DATA_TYPES[number],
}) => {
  await db.transaction(async tx => {
    // 確実にtypeだけを変更
    await tx.update(columnDefinitions)
      .set({ type: newType })
      .where(
        and(
          eq(columnDefinitions.id, id),
          eq(columnDefinitions.projectId, projectId),
          eq(columnDefinitions.categoryId, categoryId),
        )
      );
    // 注意！注意！注意！
    // 更新対象のデータを全てメモリ中にロードして更新しなおす
    const dataToUpdate = await db.select().from(data)
      .where(
        and(
          eq(data.categoryId, categoryId),
          eq(data.projectId, projectId),
        )
      );
    const updatedData = dataToUpdate.map(d => ({
      ...d,
      data:
        Object.entries(d.data)
          .map(([k, v]) =>
            ({ [k]: k === columnName 
                      ? convert({ oldType, newType, v })
                      : v
            })
          )
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as JsonDataType
    }));

    for (const d of updatedData) {
      await db.update(data)
        .set(d)
        .where(
          and(
            eq(data.id, d.id),
            eq(data.categoryId, d.categoryId),
            eq(data.projectId, d.projectId),
          )
        );
    }
  });
};

