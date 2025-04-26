import { 
  mysqlTable, 
  unique,
  foreignKey,
  varchar,
  int,
  bigint,
  json,
  boolean,
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

const projectIdReference = 
  varchar('project_id', { length: PROJECT_ID_LENGTH })
    .notNull()
    .references(() => projects.id, { 
      onDelete: 'restrict', onUpdate: 'cascade',
    });


const COLUMN_GROUP_NAME_LENGTH = 127 as const;

/**
 * ユーザが自由に設定できる列グループです
 *
 * 複数の列の集まりで、1つの工程や測定に相当し、
 * 関連するデータ(Data)は主に表として表示されます
 */
export const columnGroups = mysqlTable('ColumnGroups', {
  id:
    bigint('id', { mode: 'number', unsigned: true })
      .notNull()
      .autoincrement()
      .primaryKey(),
  projectId: projectIdReference,
  name:
    varchar('name', { length: COLUMN_GROUP_NAME_LENGTH })
      .notNull()
      .default('新しいカテゴリ')
      .unique(), 
  sort:
    int('sort', { unsigned: true })
});

const columnGroupIdReference = 
  bigint('column_group_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => columnGroups.id, {
      onDelete: 'restrict', onUpdate: 'cascade' 
    });

export const MEASUREMENT_VISUAL_TYPES = [
  'presence',
  'statistics',
  'full',
] as const;

/**
 * ColumnGroup毎にどの測定をどう関連付けるか記録します
 *
 * あるColumnGroupに対して、
 * - どの測定を関連付けるかmeasurementColumnGroupを指定
 * - 表示方法（有/無、全部表示、統計データ...等々）
 * を規定します
 */
export const columnGroupMeasurements = mysqlTable(
  'ColumnGroupMeasurements',
  {
    id:
      bigint('id', { mode: 'number', unsigned: true })
        .notNull()
        .autoincrement()
        .primaryKey(),
    projectId: projectIdReference,
    /** condition と measurement を結びつける、condition側のcolumnGroupIdです */
    columnGroupId: columnGroupIdReference,
    /** condition と measurement を結びつける、measurement側のcolumnGroupIdです */
    measurementColumnGroupId:
      bigint('measurement_column_group_id', { mode: 'number', unsigned: true })
      .notNull()
      //.references(() => measurementColumnGroups.id, {
      //  onDelete: 'restrict', onUpdate: 'cascade' 
      //})
      ,
    visual:
      varchar(
        'visual', 
        { length: 16, enum: MEASUREMENT_VISUAL_TYPES },
      )
      .notNull()
      .default('presence'),
  },
  (table) => [
    unique('cg_to_m_unique_key')
      .on(table.columnGroupId, table.measurementColumnGroupId),
    foreignKey({
      name: 'cg_to_m_to_mcg_fk',
      columns: [table.measurementColumnGroupId],
      foreignColumns: [measurementColumnGroups.id],
    }),
  ],
);

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
  projectId: projectIdReference,
  columnGroupId: columnGroupIdReference,
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
  isOptional:
    boolean('is_optional')
      .notNull()
      .default(false),
  sort:
    int('sort', { unsigned: true })
}, (table) => [
    unique().on(table.columnGroupId, table.name),
]);

export type JsonData = Record<string, string | number | null>;

export const validate = ({
  type,
  isOptional = false,
  v,
}: {
  type: typeof COLUMNS_DATA_TYPES[number],
  isOptional?: boolean,
  v: JsonData[number],
}): boolean => {

  // TODO 空欄も書き込むが、チェック時には検出するようにしたい
  if (v === null) {
    return true;//isOptional;
  }

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
    projectId: projectIdReference,
    columnGroupId: columnGroupIdReference,
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
export type Grouping = 
  | { type: 'parent' }
  | { type: 'column'; columnName: string; }


export const FlowStepModes = ['list', 'merge'] as const;


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
    projectId: projectIdReference,
    name:
      varchar('name', { length: FLOW_NAME_LENGTH })
        .notNull(),
  }
);

/** Flowの1段階を表します */
export const flowSteps = mysqlTable(
  'FlowSteps',
  {
    id:
      bigint('id', { mode: 'number', unsigned: true })
        .autoincrement()
        .notNull()
        .primaryKey(),
    projectId: projectIdReference,
    flowId:
      bigint('flow_id', { mode: 'number', unsigned: true })
        .notNull()
        .references(() => flows.id, {
          onUpdate: 'cascade', onDelete: 'cascade',
        }),
    mode:
      varchar('mode', { length: 8, enum: FlowStepModes })
        .notNull()
        .default('list'),
    sort:
      int('sort', { unsigned: true }),
  },
);

/** FlowStepに含まれるColumnGroupのid, 順番, グループ化方法を記録します */
export const flowStepColumnGroups = mysqlTable(
  'FlowStepColumnGroups',
  {
    id:
      bigint('id', { mode: 'number', unsigned: true })
        .autoincrement()
        .notNull()
        .primaryKey(),
    projectId: projectIdReference,
    flowStepId:
      bigint('flow_step_id', { mode: 'number', unsigned: true })
        .notNull()
        .references(() => flowSteps.id, {
          onDelete: 'cascade', onUpdate: 'cascade'
        }),
    columnGroupId: columnGroupIdReference,
    grouping:
      json('grouping')
        .$type<Grouping|null>(),
    sort:
      int('sort', { unsigned: true }),
  }
);

export const measurementColumnGroups = mysqlTable(
  'MeasurementColumnGroups',
  {
    id:
      bigint('id', { mode: 'number', unsigned: true })
        .notNull()
        .autoincrement()
        .primaryKey(),
    projectId: projectIdReference,
    name:
      varchar('name', { length: COLUMN_GROUP_NAME_LENGTH })
        .notNull()
        .default('新しいカテゴリ')
        .unique(), 
    sort:
      int('sort', { unsigned: true })
  }
);

const measurementColumnGroupIdReference = 
  bigint('column_group_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => measurementColumnGroups.id, {
      onDelete: 'restrict', onUpdate: 'cascade' 
    });

export const measurementColumns = mysqlTable(
  'MeasurementColumns',
  {
    id:
      bigint('id', { mode: 'number', unsigned: true })
        .notNull()
        .autoincrement()
        .primaryKey(),
    projectId: projectIdReference,
    columnGroupId: measurementColumnGroupIdReference,
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
    isOptional:
      boolean('is_optional')
        .notNull()
        .default(false),
    sort:
      int('sort', { unsigned: true })
  },
  (table) => [
    unique().on( table.columnGroupId, table.name),
  ],
);

export const measurements = mysqlTable(
  'Measurements', 
  { 
    id: 
      bigint('id', { mode: 'number', unsigned: true })
        .autoincrement()
        .notNull()
        .primaryKey(),
    columnGroupId: measurementColumnGroupIdReference,
    projectId: projectIdReference,
    data:
      json('data').$type<JsonData>().notNull(),
    dataId:
      bigint('data_id', { mode: 'number', unsigned: true })
        .references(() => data.id, {
          onDelete: 'set null', onUpdate: 'cascade',
        }),
  }
);

export const projectRelations = 
  relations(projects, ({ many }) => ({ 
    categories: many(columnGroups),
  }));
// NOTE
// 本当は flow 関連でもrelationsを使用したいが、
// JSON型で記録しているためにちょっと無理

export const columnGroupRelations = relations(
  columnGroups, 
  ({ one, many }) => ({
    project: one(projects, {
      fields: [columnGroups.projectId],
      references: [projects.id],
    }),
    columns: many(columns),
    data: many(data),
    measurements: many(columnGroupMeasurements), 
  })
);

export const columnGroupMeasurementRelations = relations(
  columnGroupMeasurements,
  ({ one }) => ({
    columnGroup: one(columnGroups, {
      fields: [columnGroupMeasurements.columnGroupId],
      references: [columnGroups.id],
    }),
    measurementColumnGroup: one(measurementColumnGroups, {
      fields: [columnGroupMeasurements.measurementColumnGroupId],
      references: [measurementColumnGroups.id],
    }),
  }),
);

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
    measurements: many(measurements),
  }));

export const measurementColumnGroupRelations = relations(
  measurementColumnGroups, 
  ({ one, many }) => ({
    project: one(projects, {
      fields: [measurementColumnGroups.projectId],
      references: [projects.id],
    }),
    columns: many(measurementColumns),
    data: many(measurements),
    columnGroupToMeasurements: many(columnGroupMeasurements)
  })
);

export const measurementColumnRelations =
  relations(measurementColumns, ({ one }) => ({
    columnGroup: one(measurementColumnGroups, {
      fields: [measurementColumns.columnGroupId],
      references: [measurementColumnGroups.id],
    }),
  }));

export const measurementRelations =
  relations(measurements, ({ one }) => ({
    data: one(data, {
      fields: [measurements.dataId],
      references: [data.id],
    }),
    columnGroup: one(measurementColumnGroups, {
      fields: [measurements.columnGroupId],
      references: [measurementColumnGroups.id],
    }),
  }));

