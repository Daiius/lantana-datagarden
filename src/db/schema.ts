import { 
  mysqlTable, 
  //primaryKey,
  varchar,
  int,
} from 'drizzle-orm/mysql-core';

import { relations } from 'drizzle-orm';

import { 
  v7 as uuidv7,
  v4 as uuidv4,
} from 'uuid';

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

const CATEGORY_ID_LENGTH = UUID_LENGTH;
const CATEGORY_NAME_LENGTH = 1024 as const;
const CATEGORY_TYPES = [
  'sequence', 
  'option', 
  'measurement',
] as const;

/**
 * カテゴリはデータの項目・型情報を持ちます
 * テンプレートの集合です
 */
export const categories = mysqlTable('Categories', {
  id:
    varchar('id', { length: CATEGORY_ID_LENGTH })
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
    varchar('name', { length: CATEGORY_NAME_LENGTH })
      .notNull()
      .default('新しいカテゴリ'),
      //.unique(), //これはインデックスサイズが制限を超えてしまうらしい
  type:
    varchar('type', { 
      length: 24, 
      enum: CATEGORY_TYPES,
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

const COLUMN_DEFINITION_ID_LENGTH = UUID_LENGTH;
const COLUMN_DEFINITION_NAME_LENGTH = 1024 as const;
export const COLUMN_DEFINITION_DATA_TYPES = [
  'string',
  'float',
  'int',
  'number',
] as const;

export const columnDefinitions = mysqlTable('ColumnDefinitions', {
  id:
    varchar('id', { length: COLUMN_DEFINITION_ID_LENGTH })
      .notNull()
      .$default(() => uuidv7())
      .primaryKey(),
  categoryId:
    varchar('category_id', { length: CATEGORY_ID_LENGTH })
      .notNull()
      .references(() => categories.id, {
        onDelete: 'cascade', onUpdate: 'cascade',
      }),
  name:
    varchar('name', { length: COLUMN_DEFINITION_NAME_LENGTH })
      .notNull()
      .default('新しい列名'), 
      //.unique(), // 長すぎらしい
  type:
    varchar( 'type', { 
      length: 32,
      enum: COLUMN_DEFINITION_DATA_TYPES,
    })
    .notNull()
    .default('string'),
  sort:
    int('sort', { unsigned: true })
});


export const projectToCategoriesRelations = 
  relations(projects, ({ many }) => ({ 
    categories: many(categories),
  }));

export const categoryRelations =
  relations(categories, ({ one, many }) => ({
    project: one(projects, {
      fields: [categories.projectId],
      references: [projects.id],
    }),
    columns: many(columnDefinitions),
  }));

export const columnDefinitionRelations =
  relations(columnDefinitions, ({ one }) => ({
    category: one(categories, {
      fields: [columnDefinitions.categoryId],
      references: [categories.id],
    })
  }));


