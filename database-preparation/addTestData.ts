
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2/promise';
import {
  projects,
  //templates,
  categories,
  columnDefinitions,
} from 'database/db/schema';
import { 
  v7 as uuidv7,
  v4 as uuidv4,
} from 'uuid';

const connection = await createConnection({
  host: process.env.DB_HOST,
  user: process.env.MYSQL_USER,
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

const testCategoryId = uuidv7();

await db.insert(categories).values({
  id: testCategoryId,
  projectId: testProjectId,
  type: 'sequence',
});

//const testColumnDefinitionId = uuidv7();

await db.insert(columnDefinitions).values([{
  id: uuidv7(),
  categoryId: testCategoryId,
  name: 'テスト列1'
}, {
  id: uuidv7(),
  categoryId: testCategoryId,
  name: '2列目',
}]);

await connection.end();

