
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2/promise';
import {
  projects,
  columnGroups,
  columns,
  data,
  flows,
  flowSteps,
  flowStepColumnGroups,
  measurementColumnGroups,
  measurementColumns,
  measurements,
} from 'database/db/schema';
import { 
//  v7 as uuidv7,
//  v4 as uuidv4,
} from 'uuid';

const connection = await createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const db = drizzle(connection);

export const zeroId = '00000000-0000-0000-0000-000000000000' as const;
export const testProjectId = zeroId;


await db.insert(projects).values({ id: testProjectId });

//const testTemplateId = zeroId;

//await db.insert(templates).values({
//  id: testTemplateId,
//  projectId: testProjectId,
//  definitions: [{ name: '列名1', type: 'number' }],
//});

await db.insert(columnGroups).values([{
  projectId: testProjectId,
}, {
  projectId: testProjectId,
  name: '2番目の列グループ',
}]);


await db.insert(columns).values([{
  columnGroupId: 1,
  projectId: testProjectId,
  name: 'テスト列1',
  type: 'string',
}, {
  columnGroupId: 1,
  projectId: testProjectId,
  name: '2列目',
  type: 'number',
}, {
  columnGroupId: 2,
  projectId: testProjectId,
  name: '追加列',
  type: 'string',
}]);

await db.insert(data).values([{
  columnGroupId: 1,
  projectId: testProjectId,
  data: { 
    'テスト列1': 'テストデータ',
    '2列目': 123,
  } 
}, {
  columnGroupId: 1,
  projectId: testProjectId,
  data: { 
    'テスト列1': 'テストデータ2',
    '2列目': 456,
  } 
}, {
  columnGroupId: 2,
  projectId: testProjectId,
  data: {
    '追加列': 'テスト',
  },
  parentId: 1,
}]);

await db.insert(flows).values({
  projectId: zeroId,
  name: 'テスト用フロー',
});

await db.insert(flowSteps).values([
  {
    projectId: zeroId,
    flowId: 1,
    mode: 'list',
    sort: null
  },
  {
    projectId: zeroId,
    flowId: 1,
    mode: 'list',
    sort: null,
  }
]);

await db.insert(flowStepColumnGroups).values([
  {
    flowId: 1,
    flowStepId: 1,
    columnGroupId: 1,
    projectId: zeroId,
    grouping: null,
    sort: null,
  },
  {
    flowId: 1,
    flowStepId: 2,
    columnGroupId: 2,
    projectId: zeroId,
    grouping: null,
    sort: null,
  },
]);

await db.insert(measurementColumnGroups).values(
  {
    projectId: zeroId,
    sort: null,
    name: '測定1'
  },
);
await db.insert(measurementColumns).values([
  {
    projectId: zeroId,
    columnGroupId: 1,
    sort: null,
    type: 'string',
    name: '測定名',
  },
  {
    projectId: zeroId,
    columnGroupId: 1,
    sort: null,
    type: 'number',
    name: '測定値',
  },
]);
await db.insert(measurements).values([
  {
    projectId: zeroId,
    columnGroupId: 1,
    data: {
      '測定名': '測定1',
      '測定値': 10.0,
    },
  },
  {
    projectId: zeroId,
    columnGroupId: 1,
    data: {
      '測定名': '測定2',
      '測定値': 11.0,
    },
  },
]);

await connection.end();

