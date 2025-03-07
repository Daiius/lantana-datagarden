
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2/promise';
import {
  projects,
  columnGroups,
  columns,
  data,
  flows,
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
  type: 'sequence',
}, {
  projectId: testProjectId,
  name: '2番目の列グループ',
  type: 'sequence',
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
  columnGroupIds: [[1], [2]],
});


await connection.end();

