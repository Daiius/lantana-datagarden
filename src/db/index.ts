import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema';
import mysql from 'mysql2/promise';

declare global {
  var _db: MySql2Database<typeof schema> | undefined;
}

export const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});


const db = 
     globalThis._db 
  || drizzle(connection, { schema, mode: 'default' });

globalThis._db = db;

export { db };

