import { 
  mysqlTable, 
  unique,
  foreignKey,
  varchar,
  int,
  json,
} from 'drizzle-orm/mysql-core';

import { relations } from 'drizzle-orm';

import { 
  v7 as uuidv7,
  v4 as uuidv4,
} from 'uuid';

import { z } from 'zod';

const UUID_LENGTH = 36 as const;
const PROJECT_ID_LENGTH = UUID_LENGTH;
const PROJECT_NAME_LENGTH = 1024 as const;

/**
 * プロジェクトは最も大きな
 * データ・カテゴリ・テンプレートのまとまりです
 *
 * 将来的にはログイン中のユーザが関連付けられた
 * プロジェクトのみを閲覧可能にする予定です
 */
export const projects = mysqlTable('Projects', {
  id:
    varchar('id', { length: PROJECT_ID_LENGTH })
      .notNull()
      .$default(() => uuidv4())  //ユーザのIDとプロジェクトのIDを混同しながら作り始めたかも
      .primaryKey(),
  name:
    varchar('name', { length: PROJECT_NAME_LENGTH })
      .notNull()
      .default('新しいプロジェクト'),
});

//const TEMPLATE_ID_LENGTH = UUID_LENGTH;
//const TEMPLATE_NAME_LENGTH = 1024 as const;

/**
 * テンプレートは、カテゴリ毎のデータ項目定義
 * もしくはその部分集合です
 *
 * NOTE: 実装が大変になるので後回し
 */
//export const templates = mysqlTable('Templates', {
//  id:
//    varchar('id', { length: TEMPLATE_ID_LENGTH })
//      .notNull()
//      //.$default(() => uuidv7()) // こうやってdefault定義するとinsert時などに手動で指定できなくなる
//      .primaryKey(),
//  projectId:
//    varchar('project_id', { length: PROJECT_ID_LENGTH })
//      .notNull()
//      .references(() => projects.id, { 
//        onDelete: 'restrict', onUpdate: 'cascade',
//      }),
//  name:
//    varchar('name', { length: TEMPLATE_NAME_LENGTH })
//      .notNull()
//      .default('新しいテンプレート')
//      .unique(), // これはインデックスサイズが制限を超えてしまうらしい
//  definitions:
//    json('definitions')
//      .notNull()
//      .$type<{ name: string, type: string }[]>(),
//});

const COLUMN_GROUP_ID_LENGTH = UUID_LENGTH;
const COLUMN_GROUP_NAME_LENGTH = 1024 as const;
export const COLUMN_GROUP_TYPES = [
  'sequence', 
  'option', 
  'measurement',
] as const;

/**
 * ユーザが自由に設定できる列グループです
 *
 * 1対1と1対多対応のデータを分割するinnterColumnGroupsとは
 * 役割が異なります
 */
export const columnGroups = mysqlTable('ColumnGroups', {
  id:
    varchar('id', { length: COLUMN_GROUP_ID_LENGTH })
      .notNull()
      .$default(() => uuidv7())
      .primaryKey(),
  projectId:
    varchar('project_id', { length: PROJECT_ID_LENGTH })
      .notNull()
      .references(() => projects.id, { 
        onDelete: 'restrict', onUpdate: 'cascade',
      }),
  name:
    varchar('name', { length: COLUMN_GROUP_NAME_LENGTH })
      .notNull()
      .default('新しいカテゴリ'),
      //.unique(), //これはインデックスサイズが制限を超えてしまうらしい
  type:
    varchar('type', { 
      length: 24, 
      enum: COLUMN_GROUP_TYPES,
    })
    .notNull(),
  sort:
    int('sort', { unsigned: true })
});

//export const templatesInCategories = mysqlTable('TemplatesInCategories', {
//  templateId:
//    varchar('id', { length: TEMPLATE_ID_LENGTH })
//      .notNull(),
//  categoryId:
//    varchar('id', { length: CATEGORY_ID_LENGTH })
//      .notNull()
//}, (table) => ({
//  primaryKey: primaryKey({
//    columns: [table.templateId, table.categoryId],
//    name: 'templatesInCategoriesPrimaryKey'
//  }),
//}));

const INNER_COLUMN_GROUP_ID_LENGTH = UUID_LENGTH;

/**
 * 1対1対応する項目とそうでない項目を分ける
 * 内部で管理する列のグループ
 */
export const innerColumnGroups = mysqlTable('InnerColumnGroups', {
  id:
    varchar('id', { length: INNER_COLUMN_GROUP_ID_LENGTH })
      .notNull()
      .$default(() => uuidv7())
      .primaryKey(),
  columnGroupId:
    varchar('column_group_id', { length: COLUMN_GROUP_ID_LENGTH })
      .notNull()
      .references(() => columnGroups.id, {
        onDelete: 'restrict', onUpdate: 'cascade',
      }),
});

const COLUMNS_ID_LENGTH = UUID_LENGTH;
const COLUMNS_NAME_LENGTH = 64 as const;
export const COLUMNS_DATA_TYPES = [
  'string',
  'float',
  'int',
  'number',
] as const;


export const columns = mysqlTable('Columns', {
  id:
    varchar('id', { length: COLUMNS_ID_LENGTH })
      .notNull()
      .$default(() => uuidv7())
      .primaryKey(),
  columnGroupId:
    varchar('column_group_id', { length: COLUMN_GROUP_ID_LENGTH })
      .notNull()
      .references(() => columnGroups.id, {
        onDelete: 'restrict', onUpdate: 'cascade' 
      }),
  innerColumnGroupId:
    varchar('inner_column_group_id', { length: INNER_COLUMN_GROUP_ID_LENGTH })
      .notNull()
      .references(() => innerColumnGroups.id, {
        onDelete: 'cascade', onUpdate: 'cascade',
      }),
  projectId:
    varchar('project_id', { length: PROJECT_ID_LENGTH })
      .notNull()
      .references(() => projects.id, { 
        onDelete: 'restrict', onUpdate: 'cascade',
      }),
  name:
    varchar('name', { length: COLUMNS_NAME_LENGTH })
      .notNull()
      .default('新しい列名'),
  type:
    varchar( 'type', { 
      length: 32,
      enum: COLUMNS_DATA_TYPES,
    })
    .notNull()
    .default('string'),
  sort:
    int('sort', { unsigned: true })
}, (table) => [
    unique().on(table.columnGroupId, table.name),
]);

export type JsonData = Record<string, string | number>;
const DATA_ID_LENGTH = UUID_LENGTH;


export const validate = ({
  type,
  v,
}: {
  type: typeof COLUMNS_DATA_TYPES[number],
  v: string | number,
}): boolean => {

  console.log('v: ', v, typeof v);

  switch (type) {
    case "string":
      return true;
    case "number":
    case "float":
      return z.coerce.number().safeParse(v).success;
    case "int":
      return z.coerce.number().int().safeParse(v).success;
  }
};


/**
 * columnDefinitionsで定義された列をJSONで保持しています
 *
 */
export const data = mysqlTable(
  'Data', 
  {
    id:
      varchar('id', { length: DATA_ID_LENGTH })
        .notNull()
        .primaryKey(),
    columnGroupId:
      varchar('column_group_id', { length: COLUMN_GROUP_ID_LENGTH })
        .notNull()
        .references(() => columnGroups.id, {
          onDelete: 'cascade', onUpdate: 'cascade',
        }),
    innerColumnGroupId:
      varchar('inner_column_group_id', { length: INNER_COLUMN_GROUP_ID_LENGTH })
        .notNull()
        .references(() => innerColumnGroups.id, {
          onDelete: 'cascade', onUpdate: 'cascade',
        }),
    projectId:
      varchar('project_id', { length: PROJECT_ID_LENGTH })
        .notNull()
        .references(() => projects.id, { 
          onDelete: 'restrict', onUpdate: 'cascade',
        }),
    data:
      json('data').$type<JsonData>().notNull(),

    parentId:
      varchar('parent_id', { length: DATA_ID_LENGTH })
  }, 
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  ]
);

export const projectRelations = 
  relations(projects, ({ many }) => ({ 
    categories: many(columnGroups),
  }));

export const columnGroupRelations =
  relations(columnGroups, ({ one, many }) => ({
    project: one(projects, {
      fields: [columnGroups.projectId],
      references: [projects.id],
    }),
    innerColumns: many(innerColumnGroups),
  }));

export const innerColumnGroupRelations =
  relations(innerColumnGroups, ({ one, many }) => ({
    columnGroup: one(columnGroups, {
      fields: [innerColumnGroups.columnGroupId],
      references: [columnGroups.id],
    }),
    columns: many(columns),
  }));

export const columnRelations =
  relations(columns, ({ one }) => ({
    category: one(innerColumnGroups, {
      fields: [columns.innerColumnGroupId],
      references: [innerColumnGroups.id],
    })
  }));

export const dataRelations =
  relations(data, ({ one, many }) => ({
    parent: one(data, {
      fields: [data.parentId],
      references: [data.id],
    }),
    children: many(data),
  }));

