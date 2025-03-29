import { 
  mysqlTable, 
  unique,
  foreignKey,
  varchar,
  int,
  bigint,
  json,
  AnyMySqlColumn,
} from 'drizzle-orm/mysql-core';

import { relations } from 'drizzle-orm';

import { 
  v4 as uuidv4,
} from 'uuid';

import { z } from 'zod';

const UUID_LENGTH = 36 as const;
const PROJECT_ID_LENGTH = UUID_LENGTH;
const PROJECT_NAME_LENGTH = 64 as const;

/**
 * プロジェクトは最も大きな
 * データ・カテゴリ・テンプレートのまとまりです
 *
 * 将来的にはログイン中のユーザが関連付けられた
 * プロジェクトのみを閲覧可能にする予定です
 */
export const projects = mysqlTable(
  'Projects', 
  {
    id:
      varchar('id', { length: PROJECT_ID_LENGTH })
        .notNull()
        .$default(() => uuidv4())  //ユーザのIDとプロジェクトのIDを混同しながら作り始めたかも
        .primaryKey(),
    name:
      varchar('name', { length: PROJECT_NAME_LENGTH })
        .notNull()
        .default('新しいプロジェクト'),
    lastSelectedFlow:
      bigint(
        'last_selected_flow', 
        { mode: 'number', unsigned: true }
      ).references((): AnyMySqlColumn => flows.id, {
        onDelete: 'set null',
        onUpdate: 'cascade',
      }),
  },
);


const COLUMN_GROUP_NAME_LENGTH = 127 as const;
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
 * TODO 名前変えた方が良いかも
 */
export const columnGroups = mysqlTable('ColumnGroups', {
  id:
    bigint('id', { mode: 'number', unsigned: true })
      .notNull()
      .autoincrement()
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
      .default('新しいカテゴリ')
      .unique(), 
  type:
    varchar('type', { 
      length: 24, 
      enum: COLUMN_GROUP_TYPES,
    })
    .notNull(),
  sort:
    int('sort', { unsigned: true })
});

const COLUMNS_NAME_LENGTH = 64 as const;
export const COLUMNS_DATA_TYPES = [
  'string',
  'float',
  'int',
  'number',
] as const;


/**
 * Dataに格納される列の名前や型を記録します
 * ColumnGroupでまとめられたものがJSON型格納されることを表します
 *
 */
export const columns = mysqlTable('Columns', {
  id:
    bigint('id', { mode: 'number', unsigned: true })
      .notNull()
      .autoincrement()
      .primaryKey(),
  columnGroupId:
    bigint('column_group_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => columnGroups.id, {
        onDelete: 'restrict', onUpdate: 'cascade' 
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

export const validate = ({
  type,
  v,
}: {
  type: typeof COLUMNS_DATA_TYPES[number],
  v: string | number,
}): boolean => {

  //console.log('v: ', v, typeof v);

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
      bigint('id', { mode: 'number', unsigned: true })
        .notNull()
        .autoincrement()
        .primaryKey(),
    columnGroupId:
      bigint('column_group_id', { mode: 'number', unsigned: true })
        .notNull()
        .references(() => columnGroups.id, {
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
      bigint('parent_id', { mode: 'number', unsigned: true })
        .references((): AnyMySqlColumn => data.id, {
          onDelete: 'cascade', onUpdate: 'cascade'
        }),
  }, 
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  ]
);

const FLOW_NAME_LENGTH = 36;

/**
 * FlowはColumnGroupの繋がり・順番を規定します
 */
export const flows = mysqlTable(
  'Flows',
  {
    id:
      bigint('id', { mode: 'number', unsigned: true })
        .autoincrement()
        .notNull()
        .primaryKey(),
    projectId:
      varchar('project_id', { length: PROJECT_ID_LENGTH })
        .notNull()
        .references(() => projects.id, {
          onDelete: 'cascade', onUpdate: 'cascade',
        }),
    name:
      varchar('name', { length: FLOW_NAME_LENGTH })
        .notNull(),
    columnGroupWithGroupings:
      json('column_groups')
        .notNull()
        .$type<{ id: number, grouping: string }[][]>()
        .default([]),
  }
);

export const projectRelations = 
  relations(projects, ({ many }) => ({ 
    categories: many(columnGroups),
  }));
// TODO
// 本当は flows と columnGroups のrelationも定義したいが、
// flowの中のcolumnGroupIdsはJSON型なのでちょっと無理

export const columnGroupRelations =
  relations(columnGroups, ({ one, many }) => ({
    project: one(projects, {
      fields: [columnGroups.projectId],
      references: [projects.id],
    }),
    columns: many(columns),
    data: many(data),
  }));

export const columnRelations =
  relations(columns, ({ one }) => ({
    category: one(columnGroups, {
      fields: [columns.columnGroupId],
      references: [columnGroups.id],
    })
  }));

export const dataRelations =
  relations(data, ({ one, many }) => ({
    parent: one(data, {
      fields: [data.parentId],
      references: [data.id],
    }),
    children: many(data),
    columnGroup: one(columnGroups, {
      fields: [data.columnGroupId],
      references: [columnGroups.id],
    }),
  }));

